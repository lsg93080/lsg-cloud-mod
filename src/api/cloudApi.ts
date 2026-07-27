import axios from 'axios'
import store from '@/store'

export interface Player {
  id_players: number
  email: string
  firebase_uid: string
  name?: string
  [key: string]: unknown
}

export interface DimensionTotal {
  id_players_attributes: number
  players_id_players: number
  attributes_id_attributes: number
  total_count: number
  attributes: {
    id_attributes: number
    name: string
  }
}

export interface Dimension {
  id_attributes: number
  name: string
}

export interface SensorContribution {
  id_online_sensor: number
  name_online_sensor: string
  total: number
}

export interface EndpointContributionSeries {
  name: string
  data: { x: string; y: number }[]
}

export interface TimeEvolutionResponse {
  series: { name: string; data: number[] }[]
  categories: string[]
}

export interface AcquiredSubattribute {
  id_attributes: number
  name_dimension: string
  id_subattributes: number
  name_subattributes: string
  id_online_sensor: number
  name_online_sensor: string
  id_sensor_endpoint: number
  name_sensor_endpoint: string
  description: string
  data: number
  created_time: string
}

export interface ExpendedAttribute {
  id_attributes: number
  name_dimension: string
  id_videogame: number
  name_videogame: string
  id_modifiable_mechanic: number
  name_modifiable_mechanic: string
  description: string
  data: number
  created_time: string
}

// JWT interceptor factory

let isRefreshing = false

function createInstance(baseURL: string) {
  const instance = axios.create({ baseURL, timeout: 15000 })

  instance.interceptors.request.use((config) => {
    const jwt: string | null = store.state.jwt ?? localStorage.getItem('vitrina_jwt')
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`
    }
    return config
  })

  // On 401, try refreshing the platform JWT via Firebase before giving up.
  // Never call full logout: it destroys the Firebase cached session.
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !isRefreshing) {
        isRefreshing = true
        try {
          const refreshed = (await store.dispatch('refreshPlatformJwt')) as boolean
          if (!refreshed) {
            await store.dispatch('clearPlatformSession')
          }
        } finally {
          isRefreshing = false
        }
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Fallbacks are the gateway-relative paths (same-origin behind nginx), not localhost:
// the deployed build has no VITE_S*_URL set, and a visitor's browser can't reach localhost.
// Local dev gets the explicit URLs from .env, so these defaults only apply in production.
const s01 = createInstance(import.meta.env.VITE_S01_URL ?? '/cloud/api/get')
const s11 = createInstance(import.meta.env.VITE_S11_URL ?? '/cloud/api/users')

// S11: User Management

// Returns the current player record (id_players, email, firebase_uid, ...) based on the JWT
export const getCurrentPlayer = (): Promise<Player> => s11.get<Player>('/user').then((r) => r.data)

// S01: Player dimension totals
// The old S12 website fetched this from S01 GET /player_all_attributes/:id_player
// which queries the `playerss_attributes` table joined with `attributes`.
// S01 returns [{id_attributes, name, data}, ...]; we map it to the DimensionTotal shape.

// Returns dimension totals for a player
export const getPlayerDimensionTotals = (playerId: number): Promise<DimensionTotal[]> =>
  s01
    .get<
      { id_attributes: number; name: string; data: number }[]
    >(`/player_all_attributes/${playerId}`)
    .then((r) =>
      r.data.map((row) => ({
        id_players_attributes: 0,
        players_id_players: playerId,
        attributes_id_attributes: row.id_attributes,
        total_count: row.data,
        attributes: {
          id_attributes: row.id_attributes,
          name: row.name
        }
      }))
    )

// S01: API GET Service

// Returns all dimensions/attributes
export const getAllDimensions = (): Promise<Dimension[]> =>
  s01.get<Dimension[]>('/attributes_all').then((r) => r.data)

// Returns which sensors contributed to a given dimension for a player
export const getSensorContributionForDimension = (
  playerId: number,
  attrId: number
): Promise<SensorContribution[]> =>
  s01
    .get<SensorContribution[]>(`/player/${playerId}/attributes/${attrId}/sensor_contribution`)
    .then((r) => r.data)

// Returns endpoint-level contribution (ApexCharts TreeMap format)
export const getEndpointContributionForDimension = (
  playerId: number,
  attrId: number
): Promise<EndpointContributionSeries[]> =>
  s01
    .get<
      EndpointContributionSeries[]
    >(`/player/${playerId}/attributes/${attrId}/sensor_endpoint_contribution`)
    .then((r) => r.data)

// Returns time-series evolution for all dimensions
export const getDimensionsTimeEvolution = (
  playerId: number,
  fromTime: string,
  toTime: string
): Promise<TimeEvolutionResponse> =>
  s01
    .post<TimeEvolutionResponse>(`/id_player/${playerId}/attributes_time_evolution`, {
      from_time: fromTime,
      to_time: toTime
    })
    .then((r) => r.data)

// Returns list of acquired subattributes for a player
export const getAcquiredSubattributesList = (playerId: number): Promise<AcquiredSubattribute[]> =>
  s01
    .get<AcquiredSubattribute[]>(`/id_player/${playerId}/adquired_subattributes_list`)
    .then((r) => r.data)

// Returns list of expended attributes (from games) for a player
export const getExpendedAttributesList = (playerId: number): Promise<ExpendedAttribute[]> =>
  s01
    .get<ExpendedAttribute[]>(`/id_player/${playerId}/expended_attributes_list`)
    .then((r) => r.data)
