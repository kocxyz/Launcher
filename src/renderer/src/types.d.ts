/* eslint-disable prettier/prettier */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Types {
  interface Server {
    id: number
    status: 'online' | 'offline' | 'deprecated'
    name: string
    ip: string
    region: string
    players: number
    maxPlayers: number
  }

  interface NewsArticle {
    title: string
    time: string
    description: string
  }
}

declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.jpg";