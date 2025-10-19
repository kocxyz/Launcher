import { Box, Tab, Tabs } from '@mui/material'
import './App.css'
import { JSX, useEffect, useState } from 'react'

// Fonts
import '@fontsource/roboto/500.css'

// Components
import LaunchSection from './components/LaunchSection'
import PopUp from './components/popUp'
import NewsMenu from './components/NewsMenu'
import ServersMenu from './components/ServersMenu'
import SettingsMenu from './components/SettingsMenu'
import Playtime from './components/Playtime'

// states
import { useGameState } from './states/gameState'
import { useSelectedServerState } from './states/selectedServerState'

// Images
import LogoImage from './images/logo.png'
import AnimatedBackground from './components/AnimatedBackground'

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

function App(): JSX.Element {
  const [tab, setTab] = useState(0)

  const { fetchPublicServers } = useGameState()
  const { currServer, currServerName, currServerType } = useSelectedServerState()

  useEffect(() => {
    if (!currServer || !currServerName || !currServerType) return
    localStorage.setItem('currServer', currServer)
    localStorage.setItem('currServerName', currServerName)
    localStorage.setItem('currServerType', currServerType)
  }, [currServer]) // eslint-disable-line

  useEffect(() => {
    setInterval(fetchPublicServers, 1000 * 60 * 3)
    fetchPublicServers()
  }, [])

  return (
    <div className="App">
      <Playtime />
      <Box style={{ position: 'absolute' }}>
        <PopUp />
      </Box>

      <AnimatedBackground />

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
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://kocity.xyz')
            }}
          >
            XYZ WEBSITE
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://github.com/Ipmake/kocitylauncher')
            }}
          >
            GITHUB
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://discord.gg/4kNPb4cRxN')
            }}
          >
            DISCORD
          </a>{' '}
          {/* eslint-disable-line */}
          <a
            style={links}
            className="hoverLink"
            onClick={(): void => {
              window.launchURL('https://www.patreon.com/kocxyz')
            }}
          >
            PATREON
          </a>
        </Box>

        <LaunchSection />
      </Box>

      <Box
        style={{
          background: 'linear-gradient(135deg, rgba(55, 12, 88, 0.7), rgba(50, 8, 83, 0.75), rgba(45, 10, 75, 0.75))',
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
