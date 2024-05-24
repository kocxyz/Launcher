import { Box, Stack, Typography } from '@mui/material'
import FancyButton from './fancyButton'
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

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '130px',
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
                  window.installGame()
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

                  setPopUpState('patchGameClient')
                  await window.patchGameClient()

                  if (localStorage.getItem('currServerType') === 'public') {
                    setPopUpState('authenticating')
                    if (
                      localStorage.getItem('authState') !== 'true' ||
                      !localStorage.getItem('authToken')
                    ) {
                      setPopUpState(false)
                      return alert('You must be logged in to use public servers!')
                    }

                    setPopUpState('authenticating')

                    const res = await axios
                      .post(`https://api.kocity.xyz/auth/getkey`, {
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
                  } else {
                    setPopUpState(false)
                    return window.launchGame({ setGameState })
                  }
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

          case 'deprecated':
            return (
              <FancyButton
                text="UPDATE"
                onClick={(): void => {
                  window.installGame()
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
          opacity: ['deprecated', 'notInstalled'].includes(gameState) ? 0 : 1,
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
