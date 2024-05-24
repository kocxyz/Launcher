import axios from 'axios'
import { create } from 'zustand'

type GameStates = 'notInstalled' | 'installed' | 'running' | 'deprecated'

interface GameState {
  gameState: GameStates
  serverState: string
  setGameState: (gameState: GameStates) => void
  setServerState: (serverState: string) => void

  publicServers: Types.Server[]
  setPublicServers: (publicServers: Types.Server[]) => void
  fetchPublicServers: () => void

  playtime: number | null
  fetchPlaytime: () => Promise<void>
}

export const useGameState = create<GameState>((set) => ({
  gameState: 'notInstalled',
  setGameState: (gameState): void => {
    set(() => ({ gameState: gameState }))
  },
  serverState: 'stopped',
  setServerState: (serverState): void => {
    set(() => ({ serverState: serverState }))
  },

  publicServers: [],
  setPublicServers: (publicServers): void => {
    set(() => ({ publicServers: publicServers }))
  },
  fetchPublicServers: async (): Promise<void> => {
    const response = await axios.get(`https://api.kocity.xyz/stats/servers`).catch((err) => {
      console.log(err)
      return {
        data: [
          {
            status: 'offline',
            name: 'Something went wrong',
            ip: '127.0.0.1',
            region: '',
            connections: 100000,
            maxConnections: 100000000
          }
        ]
      }
    })
    set(() => ({
      publicServers: [
        ...(process.env.NODE_ENV === 'development'
          ? [
              {
                id: -1,
                name: 'Localhost',
                ip: '127.0.0.1:23600',
                maxPlayers: 10,
                players: 0,
                region: 'LOCAL',
                status: 'online'
              }
            ]
          : []),
        ...response.data
      ]
    }))
  },

  playtime: null,
  fetchPlaytime: async (): Promise<void> => {
    const response = await axios
      .get(`https://api.kocity.xyz/stats/user/username/${localStorage.getItem('username')}`)
      .catch((err) => {
        console.log(err)
        return {
          data: {
            user: {
              playtime: 0
            }
          }
        }
      })
    set(() => ({ playtime: response.data.user.playtime }))
  }
}))
