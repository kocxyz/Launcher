import { Box, Select, Tab, Tabs } from '@mui/material';
import './App.css';
import { useEffect, useState } from 'react';

// Fonts
import '@fontsource/roboto/500.css';

// Components
import NewsMenu from './components/NewsMenu';
import ServersMenu from './components/ServersMenu';
import SettingsMenu from './components/SettingsMenu';
import LaunchSection from './components/LaunchSection';

// Images
import logoImg from './images/logo.png';
import bg1 from './images/backgrounds/1.jpg';
import bg2 from './images/backgrounds/2.jpg';
import bg3 from './images/backgrounds/3.jpg';
import bg4 from './images/backgrounds/4.jpg';
import bg5 from './images/backgrounds/5.jpg';
import bg6 from './images/backgrounds/6.jpg';
import bg7 from './images/backgrounds/7.jpg';
import bg8 from './images/backgrounds/8.jpg';

const boxes = { height: '97vh' }
const links = { fontSize: '20px', color: 'white', textDecoration: 'none', width: 'fit-content' }

const backgrounds = [
  bg1,
  bg2,
  bg3,
  bg4,
  bg5,
  bg6,
  bg7,
  bg8,
]

function App() {
  const [tab, setTab] = useState(0)
  const [version, setVersion] = useState(localStorage.getItem("gameVersion"))

  const [gameState, setGameState] = useState()

  const [background, setBackground] = useState(Math.floor(Math.random() * backgrounds.length))

  const [currServer, setCurrServer] = useState(localStorage.getItem("currServer"))
  const [currServerName, setCurrServerName] = useState(localStorage.getItem("currServerName"))

  useEffect(() => {
    const interval = setInterval(() => {
      setBackground((background + 1) % backgrounds.length)
    }, 15000)
    return () => clearInterval(interval)
  })

  useEffect(() => {
    localStorage.setItem("currServer", currServer)
    localStorage.setItem("currServerName", currServerName)
  }, [currServer]) // eslint-disable-line 

  useEffect(() => {
      console.log('Getting game states')
      window.getGameState().then((state) => {
          console.log('Got game state', state)
          setGameState(state)
      })
  }, [version])

  return (
    <div className="App">
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
        }}
      />
    ))}
      <Box style={boxes}>
        <Box>
          <img src={logoImg} alt="logo" style={{ width: '250px', marginLeft: '40px' }}/>
        </Box>
        <Box style={{ marginTop: '20px', marginLeft: '50px', display: 'flex', flexDirection: 'column' }}>
          <Select disabled={!['installed', 'notInstalled'].includes(gameState)} defaultValue={version} native style={{ 
            width: '350px', 
            height: '35px', 
            marginBottom: '20px', 
            marginLeft: '-50px', 
            paddingLeft: '35px',
            background: 'rgba(53, 13, 72, 0.3)',
            borderLeft: '4px solid #743a8d',
            borderRadius: '0',
          }} onChange={(e) => {
            setVersion(e.target.value)
            localStorage.setItem("gameVersion", e.target.value)
          }}> 
            <option value="1">High Res</option>
            <option value="2">Low Res</option>
          </Select>
          
          <a style={links} href='https://www.knockoutcity.com/' target='_blank'>Official Site</a> {/* eslint-disable-line */}
          <a style={links} href='https://discord.gg/knockoutcity' target='_blank'>Discord</a> {/* eslint-disable-line */}
          <a style={links} href='https://thekoyostore.com/collections/knockout-city' target='_blank'>Store</a> {/* eslint-disable-line */}
        </Box>

        <LaunchSection version={version} gameState={[gameState, setGameState]} currServer={currServer} currServerName={currServerName} />
      </Box>
      
      <Box style={boxes && { background: 'rgba(53, 13, 100, 0.75)', padding: '20px', marginTop:'-3vh', paddingBottom: '0px'}}>
        <Tabs variant='fullWidth' centered value={tab} onChange={(e, val) => setTab(val)}>
          <Tab label="News" />
          <Tab label="Servers" />
          <Tab label="Settings" />
        </Tabs>
        <Box style={{ marginTop: '10px' }}>
          {tab === 0 && <NewsMenu />}
          {tab === 1 && <ServersMenu currServer={currServer} setCurrServer={setCurrServer} currServerName={currServerName} setCurrServerName={setCurrServerName} />}
          {tab === 2 && <SettingsMenu />}
        </Box>
      </Box>
    </div>
  );
}

export default App;