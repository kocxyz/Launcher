import { Box, Button, Divider, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material'
import React from 'react'

function SettingsMenu({ gameState, setGameState }) {

    const [gameDirectory, setGameDirectory] = React.useState(localStorage.getItem('gameDirectory'))
    const [username, setUsername] = React.useState(localStorage.getItem('username'))


    return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 10px', height: '450px', maxHeight: '450px', overflowY: 'scroll' }}>
            <Stack spacing={1}>
                <label>Username</label>
                <TextField variant="outlined" defaultValue={username} onChange={(e) => {
                    setUsername(e.target.value)
                    localStorage.setItem('username', e.target.value)
                }} />
            </Stack>

            <Stack spacing={1}>
                <label>Language</label>
                <Select variant="outlined" defaultValue={localStorage.getItem('language') || 'en'} onChange={(e) => {
                    localStorage.setItem('language', e.target.value)
                }}>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="it">Italian</MenuItem>
                    <MenuItem value="pt">Portuguese</MenuItem>
                    <MenuItem value="ru">Russian</MenuItem>
                    <MenuItem value="pl">Polish</MenuItem>
                    <MenuItem value="ja">Japanese</MenuItem>
                    <MenuItem value="ko">Korean</MenuItem>
                    <MenuItem value="zh">Chinese</MenuItem>
                </Select>
            </Stack>

            <Divider />

            <Stack spacing={1}>
                <label>Game Directory</label>
                <TextField variant="outlined" disabled={true} value={gameDirectory} />
                <Button variant="contained" className='hoverButton' disabled={!['installed', 'notInstalled', 'deprecated', 'installing'].includes(gameState)} onClick={async () => {
                    const result = await window.selectGameDir()
                    if (result) {
                        setGameDirectory(result)
                        localStorage.setItem('gameDirectory', result)
                        setGameState(await window.getGameState())
                    }
                }}>Change</Button>
            </Stack>

            <Divider />

            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Discord RPC</label>

                <Stack direction="row" spacing={1} style={{ display: 'flex', alignItems: 'center'}}>
                    <Switch color='secondary' defaultChecked={localStorage.getItem('discordRPC:enabled') === 'true'} onChange={(e) => {
                        localStorage.setItem('discordRPC:enabled', e.target.checked)
                    }} />
                    
                    <Typography fontWeight='light'>Enabled</Typography>
                </Stack>

                <Stack direction="row" spacing={1} style={{ display: 'flex', alignItems: 'center'}}>
                    <Switch color='secondary' defaultChecked={localStorage.getItem('discordRPC:displayName') === 'true'} onChange={(e) => {
                        localStorage.setItem('discordRPC:displayName', e.target.checked)
                    }} />
                    
                    <Typography fontWeight='light'>Show Server Name</Typography>
                </Stack>

                <Stack direction="row" spacing={1} style={{ display: 'flex', alignItems: 'center'}}>
                    <Switch color='secondary' defaultChecked={false} disabled onChange={(e) => {
                        // localStorage.setItem('discordRPC', e.target.checked)
                    }} />
                    
                    <Typography fontWeight='light'>Allow Joining</Typography>
                </Stack>

                <Button variant="contained" className='hoverButton' disabled={!['installed', 'notInstalled', 'deprecated', 'installing'].includes(gameState)} onClick={() => {
                    window.updateRPC()
                }}>Update RPC</Button>
            </Box>


            <Typography style={{ color: 'grey', position: 'absolute', bottom: '5px', right: '10px', fontFamily: 'monospace', fontSize: '12px'}}> Launcher Version: {window.version}  </Typography>
        </Box>
    )
}

export default SettingsMenu