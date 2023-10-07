import { Box, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import FancyButton from './fancyButton'
import { CloseOutlined, PauseOutlined } from '@mui/icons-material'
import axios from 'axios'

// states
import { useGameState } from '../states/gameState'
import { useSelectedServerState } from '../states/selectedServerState'
import { useUIState } from '../states/uiState'

function LaunchSection(): JSX.Element {
  const { gameState, setGameState } = useGameState()
  const { currServer, currServerName, setCurrServer, setCurrServerName, setCurrServerType } =
    useSelectedServerState()
  const { setPopUpState } = useUIState()

  const [installData, setInstallData] = useState<number>(0)

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '75px',
        flexDirection: 'column'
      }}
    >
      {((gameState): JSX.Element => {
        switch (gameState) {
          case 'notInstalled':
            return (
              <FancyButton
                text="INSTALL"
                onClick={(): void => {
                  window.installGame({ setInstallData, setGameState })
                }}
              />
            )
          case 'installed':
            return (
              <FancyButton
                id="LaunchButton"
                text="LAUNCH"
                onClick={async (): Promise<void> => {
                  console.log('launching')

                  setCurrServer(localStorage.getItem('currServer') || '127.0.0.1')
                  setCurrServerName(localStorage.getItem('currServerName') || 'localhost')
                  setCurrServerType(localStorage.getItem('currServerType') || 'private')

                  if (localStorage.getItem('currServerType') === 'public') {
                    setPopUpState('authenticating')
                    if (
                      localStorage.getItem('authState') !== 'true' ||
                      !localStorage.getItem('authToken')
                    ) {
                      setPopUpState(false)
                      return alert('You must be logged in to use public servers!')
                    }

                    const res = await axios
                      .post(`http://localhost:23501/auth/getkey`, {
                        username: localStorage.getItem('username'),
                        authToken: localStorage.getItem('authToken'),
                        server: localStorage.getItem('currServer')
                      })
                      .catch((err) => {
                        setPopUpState(false)
                        alert(err.response.data.message)
                        return null
                      })
                    if (!res) return

                    if (res.status !== 200) {
                      setPopUpState(false)
                      return alert(res.data.message)
                    }

                    const authkey = res.data.authkey

                    setPopUpState(false)
                    return window.launchGame({ setGameState, authkey })
                  } else return window.launchGame({ setGameState })
                }}
              />
            )
          case 'running':
            return (
              <FancyButton
                text="LAUNCH"
                disabled={true}
                style={{ filter: 'grayscale(1)', pointerEvents: 'none' }}
              />
            )
          case 'installing':
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  width: '100%'
                }}
              >
                <p style={{ marginTop: '5px', fontSize: '15px' }}>
                  {installData === 100 ? 'UNPACKING' : 'DOWNLOADING'}
                </p>
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '90%',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <LinearProgress
                    style={{ width: '450px', background: '#320853' }}
                    color="secondary"
                    variant={installData === 100 ? 'indeterminate' : 'determinate'}
                    value={installData === 100 ? undefined : installData}
                  />
                  <p
                    style={{
                      fontSize: '15px',
                      marginLeft: '20px',
                      textAlign: 'start',
                      width: '50px'
                    }}
                  >
                    {installData.toFixed(2)}%
                  </p>

                  <Stack direction={'row'} style={{ marginLeft: 'auto', marginRight: '10px' }}>
                    <IconButton
                      disabled={installData === 100}
                      style={{ display: `${installData === 100 ? 'none' : 'inline'}` }}
                      onClick={(): void => {
                        window.pauseInstall()
                        setGameState('notInstalled')
                      }}
                    >
                      <PauseOutlined style={{ color: '#ffffff' }} />
                    </IconButton>

                    <IconButton
                      disabled={installData === 100}
                      style={{ display: `${installData === 100 ? 'none' : 'inline'}` }}
                      onClick={(): void => {
                        window.cancelInstall()
                        setGameState('notInstalled')
                      }}
                    >
                      <CloseOutlined style={{ color: '#ffffff' }} />
                    </IconButton>
                  </Stack>
                </Box>
              </div>
            )

          case 'deprecated':
            return (
              <FancyButton
                text="UPDATE"
                onClick={(): void => {
                  window.installGame({ setInstallData, setGameState })
                }}
              />
            )
          default:
            return <FancyButton text="ERROR" href="#" />
        }
      })(gameState)}
      {/* <p style={{ fontFamily: 'monospace', marginTop: '5px', fontSize: '15px' }}>VERSION 10.0-264847</p> */}
      <Stack
        direction="row"
        sx={{
          opacity: ['installing', 'deprecated', 'notInstalled'].includes(gameState) ? 0 : 1,
          transition: 'all 0.25s ease-in-out',
          zIndex: -1,

          ...(gameState === 'installed' && {
            position: 'absolute',
            bottom: '40px',
            '#LaunchButton:hover ~ &': {
              bottom: '15px'
            }
          })
        }}
      >
        <Typography sx={{ fontFamily: 'Loew' }}>Server: </Typography>
        <Typography
          title={currServer}
          sx={{ marginLeft: '5px', fontFamily: 'Azbuka', fontWeight: '400' }}
        >
          {currServerName}
        </Typography>
      </Stack>
    </Box>
  )
}

export default LaunchSection
