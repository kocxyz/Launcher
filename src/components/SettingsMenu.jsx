import { Box, Button, Divider, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import React from 'react'

function SettingsMenu() {

    const [gameDirectory, setGameDirectory] = React.useState(localStorage.getItem('gameDirectory'))
    const [username, setUsername] = React.useState(localStorage.getItem('username'))


    return (
        <Box>
            <Stack spacing={1}>
                <label>Username</label>
                <TextField variant="outlined" defaultValue={username} onChange={(e) => {
                    setUsername(e.target.value)
                    localStorage.setItem('username', e.target.value)
                }} />
            </Stack>

            <br />
            <Divider />
            <br />

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

            <br />
            <Divider />
            <br />

            <Stack spacing={1}>
                <label>Game Directory</label>
                <TextField variant="outlined" disabled={true} value={gameDirectory} />
                <Button variant="contained" style={{backgroundColor: '#6225e6', color: '#ffffff'}} onClick={async () => {
                    const result = await window.selectGameDir()
                    if (result) {
                        setGameDirectory(result)
                        localStorage.setItem('gameDirectory', result)
                    }
                }}>Change</Button>
            </Stack>

            <Typography style={{ color: 'grey', position: 'absolute', bottom: '10px', fontFamily: 'monospace', fontSize: '12px'}}> Launcher Version: {window.version}  </Typography>
        </Box>
    )
}

export default SettingsMenu