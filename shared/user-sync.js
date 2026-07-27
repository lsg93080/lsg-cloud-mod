/**
 * User sync module for LSG SSO bridge.
 * Maps LSG platform users (from JWT) to cloud module players in MySQL.
 *
 * Strategy: Dual lookup
 *   1. First try by lsg_user_id (fast, immutable UUID from JWT sub)
 *   2. Fallback to email (for existing players created before SSO)
 *   3. If found by email but missing lsg_user_id, persist the mapping
 *   4. If not found at all, create a new player
 */

/**
 * Find or create a player in MySQL for the given LSG user.
 * @param {Object} lsgUser - { userId: string, email: string, roles: string[] }
 * @param {Object} dbConnection - MySQL connection pool (from database.js)
 * @returns {Promise<Object>} The player row from MySQL
 */
function findOrCreatePlayer(lsgUser, dbConnection) {
  return new Promise((resolve, reject) => {
    // Step 1: Try by lsg_user_id (fast path for returning users)
    dbConnection.query(
      'SELECT * FROM playerss WHERE lsg_user_id = ? LIMIT 1',
      [lsgUser.userId],
      function (err, rows) {
        if (err) return reject(err);

        if (rows && rows.length > 0) {
          return resolve(rows[0]);
        }

        // Step 2: Fallback, try by email (existing players before SSO)
        dbConnection.query(
          'SELECT * FROM playerss WHERE email = ? LIMIT 1',
          [lsgUser.email],
          function (err, rows) {
            if (err) return reject(err);

            if (rows && rows.length > 0) {
              var player = rows[0];

              // Step 3: Persist the lsg_user_id mapping for future fast lookups
              if (!player.lsg_user_id) {
                dbConnection.query(
                  'UPDATE playerss SET lsg_user_id = ? WHERE id_players = ?',
                  [lsgUser.userId, player.id_players],
                  function (err) {
                    if (err) {
                      console.error('Warning: could not persist lsg_user_id mapping:', err.message);
                    }
                    player.lsg_user_id = lsgUser.userId;
                    return resolve(player);
                  }
                );
              } else {
                return resolve(player);
              }
            } else {
              // Step 4: Create new player (first time this LSG user accesses cloud module)
              var name = lsgUser.email.split('@')[0];
              dbConnection.query(
                'INSERT INTO playerss (name, password, email, age, external_type, external_id, lsg_user_id) VALUES (?, ?, ?, 0, ?, 0, ?)',
                [name, '', lsgUser.email, 'lsg', lsgUser.userId],
                function (err, result) {
                  if (err) return reject(err);

                  var newPlayer = {
                    id_players: result.insertId,
                    name: name,
                    password: '',
                    email: lsgUser.email,
                    age: 0,
                    external_type: 'lsg',
                    external_id: 0,
                    lsg_user_id: lsgUser.userId,
                  };
                  return resolve(newPlayer);
                }
              );
            }
          }
        );
      }
    );
  });
}

module.exports = { findOrCreatePlayer };
