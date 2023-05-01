import { Box, Button, FormControlLabel, LinearProgress, Stack, Switch, TextField } from '@mui/material'
import { useState } from 'react'

function HostingSection(props) {

    const { gameState, serverState, setServerState } = props

    const [serverSettings, setServerSettings] = useState({
        port: localStorage.getItem('server:port') || '23600',
        secret: localStorage.getItem('server:secret') || '',
        maxUsers: parseInt(localStorage.getItem('server:maxUsers')) || 0,
        showTerminal: localStorage.getItem('server:showTerminal') || false
    })

    const installed = ["installed", "running"].includes(gameState)
    const running = ["running", "starting", "stopping"].includes(serverState)

  return (
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
        <Stack spacing={1}>
            <label>Port</label>
            <TextField disabled={running} variant="outlined" defaultValue={serverSettings.port} type='number' onChange={(e) => {
                setServerSettings({
                    ...serverSettings,
                    port: e.target.value
                })
                localStorage.setItem('server:port', e.target.value)
            }} />
        </Stack>

        <Stack spacing={1}>
            <label>Secret</label>
            <TextField disabled={running} variant="outlined" defaultValue={serverSettings.secret} onChange={(e) => {
                setServerSettings({
                    ...serverSettings,
                    secret: e.target.value
                })
                localStorage.setItem('server:secret', e.target.value)
            }} />
        </Stack>

        <Stack spacing={1}>
            <label>Max Users</label>
            <TextField disabled={running} variant="outlined" defaultValue={serverSettings.maxUsers} type='number' onChange={(e) => {
                setServerSettings({
                    ...serverSettings,
                    maxUsers: e.target.value
                })
                localStorage.setItem('server:maxUsers', e.target.value)
            }} />
        </Stack>

        <FormControlLabel control={<Switch disabled={running} color='secondary' defaultChecked={serverSettings.showTerminal === "true"} onChange={(e) => {
            setServerSettings({
                ...serverSettings,
                showTerminal: e.target.checked
            })
            localStorage.setItem('server:showTerminal', e.target.checked)
        }}/>} label="Show Terminal" />

        {/* Start Button */}
        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: '20px' }}>
            {(() => {
                switch (serverState) {
                    case 'starting':
                        return (
                            <>
                                <Button variant="contained" className='hoverButton' disabled={true} style={{
                                    width: '100%',
                                }}>Starting</Button>
                                <LinearProgress color='secondary' style={{ width: '402px', marginTop: '41px', position: 'absolute', paddingLeft: '5px', paddingRight: '5px', borderRadius: '20px' }} />
                            </>

                        )
                    case 'running':
                        return (
                            <Button variant="contained" style={{
                                backgroundColor: 'red',
                                color: '#ffffff',
                                width: '100%',
                            }} onClick={async () => {
                                window.stopServer({
                                    serverState,
                                    setServerState
                                })
                            }
                            }>Stop</Button>
                        )
                    case 'stopping':
                        return (
                            <>
                                <Button variant="contained" className='hoverButton' disabled={true} style={{
                                    width: '100%',
                                }}>Stopping</Button>
                                <LinearProgress color='secondary' style={{ width: '402px', marginTop: '41px', position: 'absolute', paddingLeft: '5px', paddingRight: '5px', borderRadius: '20px' }} />
                            </>
                        )
                    default:
                        return (
                            <Button variant="contained" className='hoverButton' disabled={!installed} style={{
                                width: '100%',
                            }} onClick={async () => {
                                window.startServer({
                                    port: serverSettings.port,
                                    secret: serverSettings.secret,
                                    maxUsers: serverSettings.maxUsers,
                                    showTerminal: serverSettings.showTerminal,
                                    serverState,
                                    setServerState
                                })
                            }
                            }>{installed ? 'Start' : 'Not Installed'}</Button>
                        )
                }
            })()}
        </Box>

    </Box>
  )
}

export default HostingSection