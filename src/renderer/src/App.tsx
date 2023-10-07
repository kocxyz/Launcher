import { Box, MenuItem, Select, Tab, Tabs } from '@mui/material'
import './App.css'
import { useEffect, useState } from 'react'

// Fonts
import '@fontsource/roboto/500.css'

// Components
import LaunchSection from './components/LaunchSection'
import PopUp from './components/popUp'
import NewsMenu from './components/NewsMenu'
import ServersMenu from './components/ServersMenu'
import SettingsMenu from './components/SettingsMenu'

// states
import { useGameState } from './states/gameState'
import { useSelectedServerState } from './states/selectedServerState'

// Images
import LogoImage from './images/logo.png'
import Background1 from './images/backgrounds/1.jpg'
import Background2 from './images/backgrounds/2.jpg'
import Background3 from './images/backgrounds/3.jpg'
import Background4 from './images/backgrounds/4.png'
import Background5 from './images/backgrounds/5.jpg'
import Background6 from './images/backgrounds/6.jpg'
import Background7 from './images/backgrounds/7.jpg'
import Background8 from './images/backgrounds/8.jpg'

const boxes = { height: '97vh' }
const links = {
  fontSize: '20px',
  color: 'white',
  textDecoration: 'none',
  width: 'fit-content',
  fontFamily: 'Azbuka',
  fontWeight: 'bold',
  cursor: 'pointer'
}

let backgrounds: string[] = [
  Background1,
  Background2,
  Background3,
  Background4,
  Background5,
  Background6,
  Background7,
  Background8
]

function App(): JSX.Element {
  const [tab, setTab] = useState(0)
  const [background, setBackground] = useState(Math.floor(Math.random() * backgrounds.length))

  const { fetchPublicServers, gameState, setGameState, gameVersion, setGameVersion } =
    useGameState()
  const { currServer, currServerName, currServerType } = useSelectedServerState()

  useEffect(() => {
    backgrounds = ((): string[] => {
      const array: string[] = []
      // randomize backgrounds array
      while (backgrounds.length > 0) {
        const index = Math.floor(Math.random() * backgrounds.length)
        array.push(backgrounds[index])
        backgrounds.splice(index, 1)
      }

      return array
    })()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBackground((background + 1) % backgrounds.length)
    }, 15000)
    return () => clearInterval(interval)
  })

  useEffect(() => {
    if (!currServer || !currServerName || !currServerType) return
    localStorage.setItem('currServer', currServer)
    localStorage.setItem('currServerName', currServerName)
    localStorage.setItem('currServerType', currServerType)
  }, [currServer]) // eslint-disable-line

  useEffect(() => {
    console.log('Getting game states')
    setGameState(window.getGameState())
  }, [gameVersion])

  useEffect(() => {
    setInterval(fetchPublicServers, 1000 * 60 * 3)
    fetchPublicServers()
  }, [])

  return (
    <div className="App">
      <Box style={{ position: 'absolute' }}>
        <PopUp />
      </Box>
      {backgrounds.map((img, index) => (
        <img
          key={index}
          src={img}
          alt="bgImg"
          className="bgImg"
          style={{
            opacity: index === background ? 1 : 0,
            zIndex: index === background ? -2 : -1,
            transition: 'opacity ease-in-out 2s',
            animation:
              index === background ||
              index === background - 1 ||
              (background === 0 && index === backgrounds.length - 1)
                ? index % 2 === 0
                  ? 'slideL 25s ease-out infinite'
                  : 'slideR 25s ease-out infinite'
                : 'none'
          }}
        />
      ))}

      <Box style={boxes}>
        <Box>
          <img src={LogoImage} alt="logo" style={{ width: '300px', marginLeft: '35px' }} />
        </Box>
        <Box
          style={{
            marginTop: '20px',
            marginLeft: '50px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Select
            disabled={!['installed', 'notInstalled', 'deprecated'].includes(gameState as string)}
            defaultValue={gameVersion}
            variant="outlined"
            style={{
              width: '350px',
              height: '35px',
              marginBottom: '20px',
              marginLeft: '-50px',
              paddingLeft: '35px',
              background: 'rgba(75, 0, 110, 0.3)',
              borderLeft: '4px solid #743a8d',
              borderRadius: '0'
            }}
            onChange={(e): void => {
              setGameVersion(e.target.value as 'highRes' | 'lowRes')
              localStorage.setItem('gameVersion', e.target.value as string)
            }}
          >
            <MenuItem value="1">High Res</MenuItem>
            <MenuItem value="2">Low Res</MenuItem>
          </Select>
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://www.knockoutcity.com/')
            }}
          >
            OFFICIAL SITE
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://www.knockoutcity.com/private-server-edition')
            }}
          >
            ABOUT
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://discord.gg/knockoutcity')
            }}
          >
            DISCORD
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://thekoyostore.com/collections/knockout-city')
            }}
          >
            STORE
          </a>
        </Box>

        <LaunchSection />
      </Box>

      <Box
        style={{
          background: 'rgba(50, 8, 83, 0.75)',
          padding: '20px',
          marginTop: '-3vh',
          paddingBottom: '0px'
        }}
      >
        <Tabs variant="fullWidth" centered value={tab} onChange={(_e, val): void => setTab(val)}>
          <Tab label="News" />
          <Tab label="Servers" />
          <Tab label="Settings" />
        </Tabs>
        <Box style={{ marginTop: '10px' }}>
          {tab === 0 && <NewsMenu />}
          {tab === 1 && <ServersMenu />}
          {tab === 2 && <SettingsMenu />}
        </Box>
      </Box>
    </div>
  )
}

export default App
