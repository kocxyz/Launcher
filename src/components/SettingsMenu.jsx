import { ExitToApp, Person } from '@mui/icons-material'
import { Box, Button, Divider, MenuItem, Popover, Select, Stack, Switch, TextField, Typography } from '@mui/material'
import React from 'react'

function SettingsMenu({ gameState, setGameState, setPopUpState, authState, username, setUsername }) {

    const [gameDirectory, setGameDirectory] = React.useState(localStorage.getItem('gameDirectory'))

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handlePopoverClose = () => {
      setAnchorEl(null);
    };
    
    const open = Boolean(anchorEl);

    return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 10px', height: '450px', maxHeight: '450px', overflowY: 'scroll' }}>
            <Stack spacing={1}>
                <label>Username</label>
                <Stack direction="row" spacing={1}>
                <TextField disabled={authState} variant="outlined" id="usernameField" defaultValue={username} style={{ width: '100%', }} onChange={(e) => {
                    setUsername(e.target.value)
                    localStorage.setItem('username', e.target.value)
                }} />
                      <Popover
                        id="mouse-over-popover"
                        sx={{
                        pointerEvents: 'none',
                        }}
                        open={open}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                        }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                        }}
                        onClose={handlePopoverClose}
                        disableRestoreFocus
                    >
                        <Typography sx={{ p: 1 }}>{authState ? 'Logout' : 'Login'}</Typography>
                    </Popover>
                <Button variant="contained" className='hoverButton' aria-owns={open ? 'mouse-over-popover' : undefined} aria-haspopup="true" onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose} disabled={!['installed', 'notInstalled', 'deprecated', 'installing'].includes(gameState)} onClick={() => {
                    if(authState) setPopUpState('confirmLogout')
                    else {
                        setPopUpState('login')
                        window.launchURL(`${window.config.authServer}/web/discord`)
                    }
                }}>{authState ? <ExitToApp /> : <Person /> }</Button>
                </Stack>
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
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" className='hoverButton' disabled={!['installed', 'notInstalled', 'deprecated', 'installing'].includes(gameState)} style={{width: '100%'}} onClick={async () => {
                        const result = await window.selectGameDir()
                        if (result) {
                            setGameDirectory(result)
                            localStorage.setItem('gameDirectory', result)
                            setGameState(await window.getGameState())
                        }
                    }}>Change</Button>
                    <Button variant="contained" className='hoverButton' style={{width: '100%'}} onClick={() => {
                        window.launchURL(`"" "${gameDirectory}"`)
                    }}>Open</Button>
                    <Button variant="contained" className='hoverButton' disabled={!['installed', 'notInstalled', 'deprecated', 'installing'].includes(gameState)} style={{width: '100%'}} onClick={() => {
                        setPopUpState('selectUninstall')
                    }}>Uninstall</Button>
                </Stack>
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
                    <Switch color='secondary' defaultChecked={localStorage.getItem('discordRPC:allowJoining') === 'true'} onChange={(e) => {
                        localStorage.setItem('discordRPC:allowJoining', e.target.checked)
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