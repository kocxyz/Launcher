import axios from 'axios'
import { create } from 'zustand'

type GameStates = 'notInstalled' | 'installed' | 'running' | 'installing' | 'deprecated'
type GameVersions = 'highRes' | 'lowRes'

interface GameState {
  gameVersion: GameVersions
  gameState: GameStates
  serverState: string
  setGameVersion: (gameVersion: GameVersions) => void
  setGameState: (gameState: GameStates) => void
  setServerState: (serverState: string) => void

  publicServers: Types.Server[]
  setPublicServers: (publicServers: Types.Server[]) => void
  fetchPublicServers: () => void
}

export const useGameState = create<GameState>((set) => ({
  gameVersion: (localStorage.getItem('gameVersion') as GameVersions) || ('highRes' as GameVersions),
  setGameVersion: (gameVersion): void => {
    set(() => ({ gameVersion: gameVersion }))
  },
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
    const response = await axios.get(`http://localhost:23501/stats/servers`).catch((err) => {
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
    set(() => ({ publicServers: response.data }))
  }
}))
