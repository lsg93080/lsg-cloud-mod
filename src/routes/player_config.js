const express = require('express');
const player_config = express.Router();
const mysqlConnection = require('../database');
import { testEnvironmentVariable } from '../settings';


player_config.get("/", (req,res) =>{
    res.status(200).json({ message: testEnvironmentVariable})
});

// SSO: Return current player record (used by website-v2 frontend)
player_config.get("/user", (req,res) =>{
    if (!req.cloudPlayer) {
        return res.status(404).json({ error: 'Player not found' });
    }
    res.status(200).json(req.cloudPlayer);
});

/*
Input: Nothing
Output: List of all the players of Blended Games
Description: Simple MYSQL query
*/
player_config.get('/players/',(req,res)=>{
    var aux = undefined;
    mysqlConnection.query('SELECT*FROM playerss',(err,rows,fields)=>{
        try{
            aux = JSON.parse(JSON.stringify(rows))[0]
        }catch{
            res.json("Error in parse Json, please retry");
        }
        if (undefined == aux){
            res.json("Error on obtain resume");
        }else{
            if(!err){
                res.json(rows);
            } else {
                console.log(err);
            }
        }
    })
})
player_config.get('/players/id',(req,res)=>{
    var aux = undefined;
    mysqlConnection.query('SELECT id_players FROM playerss',(err,rows,fields)=>{
        try{
            aux = JSON.parse(JSON.stringify(rows))[0]
        }catch{
            res.json("Error in parse Json, please retry");
        }
        if (undefined == aux){
            res.json("Error on obtain resume");
        }else{
            if(!err){
                res.json(rows);
            } else {
                console.log(err);
            }
        }
    })
})

player_config.get('/player_by_email/:email',(req,res)=>{
    var email = req.params.email;
    var select = 'SELECT * '
    var from = 'FROM `playerss` '
    var where = 'WHERE `playerss`.`email` = ? '

    var query = select+from+where
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err;
        }
        connection.query(query,[email], function(err,rows,fields){
            if (!err){
                let id = rows[0]
                console.log(rows);
                res.status(200).json(id)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
})
/*
Input: Id of a player (range 0 to positive int)
Output: Name, pass and age of that player
Description: Simple MYSQL query
*/
player_config.get('/players/:id', (req,res) =>{
    const {id} = req.params;
    console.log("entro en el GET");
    var aux = undefined;
    mysqlConnection.query('SELECT*FROM playerss WHERE id_players = ?',[id],(err,rows,fields) =>{
        try{
            aux = JSON.parse(JSON.stringify(rows))[0]
        }catch{
            res.json("Error in parse Json, please retry");
        }
        if (undefined == aux){
            res.json("Error on GET player information.");
        }else{
            if(!err){
                console.log("Entro a Configuración");
                res.json(rows); 
            } else {
                console.log(err);
            }
        }
    })
})
/*
Input: Id of a player (range 0 to positive int)
Output: Void (authentication of the player in the system)
Description: Simple MYSQL query
*/
player_config.get('/player/:name/:pass', (req,res) =>{
    var aux = undefined;
    const name = req.params.name
    const pass = req.params.pass
    console.log(name+","+pass);
    mysqlConnection.query('SELECT* FROM playerss WHERE name = ? AND password = ?',[name, pass],(err,rows,fields) =>{
        try{
            aux = JSON.parse(JSON.stringify(rows))[0]
        }catch{
            res.json("Error in parse Json, please retry");
        }
        if (undefined == aux){
            res.status(400).json("Error on GET player information.");
        }else{
            if(!err){
                console.log("Entro a Configuración");
                res.json(rows[0].id_players);
            } else {
                res.status(404).json("Player doesnt exist or incorrect password");
                console.log(err);
            }
        }
    })
    
})


player_config.post('/player',(req,res)=>{
    let {name,email,password,age,external_type,external_id} = req.body;
    console.log(req.body);
    var insertInto = 'INSERT INTO `playerss` '
    var columnValues = '(`name`,`email`,`password`,`age`,`external_type`,`external_id`) '
    console.log(age)
    if(password === undefined){
        password = ''
    }
    if(age === undefined){
        age = 1
    }
    console.log(age)
    var newValues = 'VALUES (?,?,?,?,?,?)'
    var query = insertInto+columnValues+newValues
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[name,email,password,age,external_type,external_id], function(err,rows,fields){
            if (!err){
                console.log(rows);
                res.status(200).json(rows)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
    })
   
})

player_config.post('/create_desktop_key/:id_player',(req,res)=>{
    var key = req.body.key
    var id_player = req.params.id_player
    console.log(key, id_player)
    var update = 'UPDATE `playerss`'
    var set = ' SET `desktop_key` = ? '
    var where = ' WHERE `playerss`.`id_players` = ?'

    var query = update+set+where
    mysqlConnection.getConnection(function(err, connection) {
        if (err){
            res.status(400).json({message:'No se pudo obtener una conexion para realizar la consulta en la base de datos, consulte nuevamente', error: err})
            throw err
        } 
        connection.query(query,[key, id_player], function(err,rows,fields){
            if (!err){
                console.log(rows);
                const data = {
                    "key": key
                }
                res.status(200).json(data)
            } else {
                console.log(err);
                res.status(400).json({message:'No se pudo consultar a la base de datos', error: err})
            }
            connection.release();

        });
      })

   
})

// add or eddit player, hay que probarlo!!!!! parece que esta malo un Not o un True del 1er if
/*
Input: Name, pass and age of that player
Output: Void (Creates a new player with the input information)
Description: Simple MYSQL query
*/
player_config.post('/players/',(req,res)=>{
    const {name,pass,age} = req.body;
    console.log(req.body);
    const id = 0;
    const query = `
        SET @id = ?;
        SET @name = ?;
        SET @pass = ?;
        SET @age = ?;
        CALL playerAddOrEdit(@id,@name,@pass,@age);
    `;
    // Mirar este select!!!
    mysqlConnection.query('SELECT*FROM playerss WHERE id_players = ?',[id],(err,rows,fields)=>{
        console.log("El selec entrega: "+!err);
        if(!err){
            if(!!rows){
                mysqlConnection.query(query,[id,name,pass,age],(err,rows,fields) =>{
                    if(!err){
                        res.json({Status:'Player Saved'});
                    } else {
                        console.log(err);
                    }
                })
            }
        } else {
            console.log(err);
            res.json({Status:'ERROR: Player Saved'});
        }
    })
})

/*
Input: Name, pass and age of that player
Output: Void (Edits an existing player in the db)
Description: Simple MYSQL query
*/
//Con id en 0 se ingresa un nuevo jugador, con cualquier otro id se edita el existente
player_config.put('/players/:id',(req,res)=>{
    console.log("entro en el PUT");
    const {name,pass,age} = req.body;
    const {id} = req.params;
    const query = `
            SET @id = ?;
            SET @name = ?;
            SET @pass = ?;
            SET @age = ?;
            CALL playerAddOrEdit(@id,@name,@pass,@age);
    `;
    mysqlConnection.query('SELECT*FROM playerss WHERE id_players = ?',[id],(err,rows,fields)=>{
        console.log("El selec entrega: "+rows);try{
            aux = JSON.parse(JSON.stringify(rows))[0]
        }catch{
            res.json("Error in parse Json, please retry");
        }
        if (undefined != aux){
            mysqlConnection.query(query,[id,name,pass,age],(err,rows,fields) =>{
                if(!err){
                    res.json({Status:'Player Update'});
                    console.log("Lo logró");
                } else {
                    res.json({Status:'ERROR: Player Update'});
                    console.log(err);
                }
            })
        }else{
            res.json({Status:'ERROR: Player not exists'});
        }
    })

})
/*
Input: Id of a player (range 0 to positive int)
Output: Void (Deletes the player of the database)
Description: Simple MYSQL query
*/
player_config.delete('/players/:id',(req,res)=>{
    const {id} = req.params;
    mysqlConnection.query('DELETE FROM playerss WHERE id_players =?',[id],(err,rows,fields)=>{
        if(!err){
            res.json({Status:`Player ${id} Deleted`});
        } else {
            console.log(err);
        }
    })
})

export default player_config;