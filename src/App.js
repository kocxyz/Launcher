import { Box, MenuItem, Select, Tab, Tabs } from '@mui/material';
import './App.css';
import { useEffect, useState } from 'react';

// Fonts
import '@fontsource/roboto/500.css';

// Components
import NewsMenu from './components/NewsMenu';
import ServersMenu from './components/ServersMenu';
import SettingsMenu from './components/SettingsMenu';
import LaunchSection from './components/LaunchSection';
import PopUp from './components/popUp';

// Images
import logoImg from './images/logo.png';
import bg1 from './images/backgrounds/1.jpg';
import bg2 from './images/backgrounds/2.jpg';
import bg3 from './images/backgrounds/3.jpg';
import bg4 from './images/backgrounds/4.png';
import bg5 from './images/backgrounds/5.jpg';
import bg6 from './images/backgrounds/6.jpg';
import bg7 from './images/backgrounds/7.jpg';
import bg8 from './images/backgrounds/8.jpg';
import axios from 'axios';

const boxes = { height: '97vh' }
const links = { 
  fontSize: '20px',
  color: 'white', 
  textDecoration: 'none', 
  width: 'fit-content',
  fontFamily: 'Azbuka',
  fontWeight: 'bold',
}

let backgrounds = [
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
  const [serverState, setServerState] = useState()

  const [background, setBackground] = useState(Math.floor(Math.random() * backgrounds.length))

  const [currServer, setCurrServer] = useState(localStorage.getItem("currServer"))
  const [currServerName, setCurrServerName] = useState(localStorage.getItem("currServerName"))
  const [currServerType, setCurrServerType] = useState(localStorage.getItem("currServerType") || 'private')

  const [authState, setAuthState] = useState(localStorage.getItem("authState") === "true" ? true : false)

  const [popUpState, setPopUpState] = useState(false)
  const [username, setUsername] = useState(localStorage.getItem('username'))

  const [publicServers, setPublicServers] = useState()

  useEffect(() => {
    backgrounds = backgrounds.scrable()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBackground((background + 1) % backgrounds.length)
    }, 15000)
    return () => clearInterval(interval)
  })

  useEffect(() => {
    localStorage.setItem("currServer", currServer)
    localStorage.setItem("currServerName", currServerName)
    localStorage.setItem("currServerType", currServerType)
  }, [currServer]) // eslint-disable-line 

  useEffect(() => {
      console.log('Getting game states')
      window.getGameState().then((state) => {
          console.log('Got game state', state)
          setGameState(state)
      })
  }, [version])

  const fetchservers = async () => {
    const response = await axios.get('https://api.kocity.xyz/stats/servers')
    setPublicServers(response.data)
  }
  useEffect(() => {
    setInterval(fetchservers, 1000 * 60 * 3)
    fetchservers()
  }, [])

  return (
    <div className="App">
      <Box style={{ position: 'absolute' }}>
        <PopUp popUpState={popUpState} setPopUpState={setPopUpState} setAuthState={setAuthState} setUsername={setUsername} />
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
          animation: index === background || (index === background-1 || (background === 0 && index === backgrounds.length-1)) ? (index % 2 === 0 ? 'slideL 25s ease-out infinite' : 'slideR 25s ease-out infinite') : 'none',
        }}
      />
    ))}

      <Box style={boxes}>
        <Box>
          <img src={logoImg} alt="logo" style={{ width: '300px', marginLeft: '35px' }}/>
        </Box>
        <Box style={{ marginTop: '20px', marginLeft: '50px', display: 'flex', flexDirection: 'column' }}>
          <Select disabled={!['installed', 'notInstalled', 'deprecated'].includes(gameState)} defaultValue={version} variant="outlined" style={{ 
            width: '350px', 
            height: '35px', 
            marginBottom: '20px', 
            marginLeft: '-50px', 
            paddingLeft: '35px',
            background: 'rgba(75, 0, 110, 0.3)',
            borderLeft: '4px solid #743a8d',
            borderRadius: '0',
          }} onChange={(e) => {
            setVersion(e.target.value)
            localStorage.setItem("gameVersion", e.target.value)
          }}> 
            <MenuItem value="1">High Res</MenuItem>
            <MenuItem value="2">Low Res</MenuItem>
          </Select>
          
          <a style={links} className="hoverLink" href='https://www.knockoutcity.com/' target='_blank'>OFFICIAL SITE</a> {/* eslint-disable-line */}
          <a style={links} className="hoverLink" href='https://www.knockoutcity.com/private-server-edition' target='_blank'>ABOUT</a> {/* eslint-disable-line */}
          <a style={links} className="hoverLink" href='https://discord.gg/knockoutcity' target='_blank'>DISCORD</a> {/* eslint-disable-line */}
          <a style={links} className="hoverLink" href='https://thekoyostore.com/collections/knockout-city' target='_blank'>STORE</a> {/* eslint-disable-line */}
        </Box>

        <LaunchSection version={version} gameState={[gameState, setGameState]} currServer={currServer} currServerName={currServerName} />
      </Box>
      
      <Box style={{ background: 'rgba(50, 8, 83, 0.75)', padding: '20px', marginTop:'-3vh', paddingBottom: '0px'}}>
        <Tabs variant='fullWidth' centered value={tab} onChange={(e, val) => setTab(val)}>
          <Tab label="News" />
          <Tab label="Servers" />
          <Tab label="Settings" />
        </Tabs>
        <Box style={{ marginTop: '10px' }}>
          {tab === 0 && <NewsMenu />}
          {tab === 1 && <ServersMenu currServer={currServer} setCurrServer={setCurrServer} currServerName={currServerName} setCurrServerName={setCurrServerName} gameState={gameState} serverState={serverState} setServerState={setServerState} currServerType={currServerType} setCurrServerType={setCurrServerType} authState={authState} publicServers={publicServers} setPublicServers={setPublicServers} fetchservers={fetchservers} />}
          {tab === 2 && <SettingsMenu gameState={gameState} setGameState={setGameState} setPopUpState={setPopUpState} authState={authState} username={username} setUsername={setUsername} />}
        </Box>
      </Box>
    </div>
  );
}

export default App;