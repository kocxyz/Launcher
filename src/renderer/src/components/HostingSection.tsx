import {
  Box,
  Button,
  FormControlLabel,
  LinearProgress,
  Stack,
  Switch,
  TextField
} from '@mui/material'
import { useState } from 'react'

// states
import { useGameState } from '../states/gameState'

function HostingSection(): JSX.Element {
  const [serverSettings, setServerSettings] = useState({
    port: localStorage.getItem('server:port') || '23600',
    secret: localStorage.getItem('server:secret') || '',
    maxUsers: parseInt(localStorage.getItem('server:maxUsers') as string) || 0,
    showTerminal: (localStorage.getItem('server:showTerminal') === 'true' ? true : false) || false
  })

  const { gameState, serverState, setServerState } = useGameState()

  const installed = ['installed', 'running'].includes(gameState)
  const running = ['running', 'starting', 'stopping'].includes(serverState)

  return (
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}
    >
      <Stack spacing={1}>
        <label>Port</label>
        <TextField
          disabled={running}
          variant="outlined"
          defaultValue={serverSettings.port}
          type="number"
          onChange={(e): void => {
            setServerSettings({
              ...serverSettings,
              port: e.target.value
            })
            localStorage.setItem('server:port', e.target.value)
          }}
        />
      </Stack>

      <Stack spacing={1}>
        <label>Secret</label>
        <TextField
          disabled={true}
          variant="outlined"
          defaultValue={'disabled'}
          onChange={(e): void => {
            setServerSettings({
              ...serverSettings,
              secret: e.target.value
            })
            localStorage.setItem('server:secret', e.target.value)
          }}
        />
      </Stack>

      <Stack spacing={1}>
        <label>Max Users</label>
        <TextField
          disabled={running}
          variant="outlined"
          defaultValue={serverSettings.maxUsers}
          type="number"
          onChange={(e): void => {
            setServerSettings({
              ...serverSettings,
              maxUsers: parseInt(e.target.value)
            })
            localStorage.setItem('server:maxUsers', e.target.value)
          }}
        />
      </Stack>

      <FormControlLabel
        control={
          <Switch
            disabled={running}
            color="secondary"
            defaultChecked={serverSettings.showTerminal}
            onChange={(e): void => {
              setServerSettings({
                ...serverSettings,
                showTerminal: e.target.checked
              })
              localStorage.setItem('server:showTerminal', `${e.target.checked}`)
            }}
          />
        }
        label="Show Terminal"
      />

      {/* Start Button */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: '20px'
        }}
      >
        {((): JSX.Element => {
          switch (serverState) {
            case 'starting':
              return (
                <>
                  <Button
                    variant="contained"
                    className="hoverButton"
                    disabled={true}
                    style={{
                      width: '100%'
                    }}
                  >
                    Starting
                  </Button>
                  <LinearProgress
                    color="secondary"
                    style={{
                      width: '402px',
                      marginTop: '41px',
                      position: 'absolute',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      borderRadius: '20px'
                    }}
                  />
                </>
              )
            case 'running':
              return (
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: 'red',
                    color: '#ffffff',
                    width: '100%'
                  }}
                  onClick={(): void => {
                    window.stopServer({
                      setServerState
                    })
                  }}
                >
                  Stop
                </Button>
              )
            case 'stopping':
              return (
                <>
                  <Button
                    variant="contained"
                    className="hoverButton"
                    disabled={true}
                    style={{
                      width: '100%'
                    }}
                  >
                    Stopping
                  </Button>
                  <LinearProgress
                    color="secondary"
                    style={{
                      width: '402px',
                      marginTop: '41px',
                      position: 'absolute',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      borderRadius: '20px'
                    }}
                  />
                </>
              )
            default:
              return (
                <Button
                  variant="contained"
                  className="hoverButton"
                  disabled={!installed}
                  style={{
                    width: '100%'
                  }}
                  onClick={(): void => {
                    window.startServer({
                      port: parseInt(serverSettings.port),
                      secret: '', //serverSettings.secret
                      maxUsers: serverSettings.maxUsers,
                      showTerminal: serverSettings.showTerminal,
                      setServerState
                    })
                  }}
                >
                  {installed ? 'Start' : 'Not Installed'}
                </Button>
              )
          }
        })()}
      </Box>
    </Box>
  )
}

export default HostingSection
