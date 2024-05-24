import { ExitToApp, Login, Settings, Star } from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'

// states
import { useGameState } from '../states/gameState'
import { useUIState } from '../states/uiState'
import { useAuthState } from '../states/authState'
import axios from 'axios'

function SettingsMenu(): JSX.Element {
  const [gameDirectory, setGameDirectory] = React.useState(localStorage.getItem('gameDirectory'))

  const { gameState, setGameState } = useGameState()
  const { setPopUpState } = useUIState()
  const { authState, username, setUsername } = useAuthState()

  const [premium, setPremium] = useState<number>(parseInt(localStorage.getItem('premium') ?? '0'))

  useEffect(() => {
    axios
      .get(`https://api.kocity.xyz/stats/user/username/${localStorage.getItem('username')}`)
      .then((res) => {
        if (!res.data?.user) return

        setPremium(res.data.user.premium)
        localStorage.setItem('premium', `${res.data.user.premium}`)
        localStorage.setItem('username', res.data.user.username)
      })
  }, [])

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '0 10px',
        height: '450px',
        maxHeight: '450px',
        overflowY: 'scroll'
      }}
    >
      <Stack spacing={1}>
        <label>Username</label>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            disabled={authState}
            variant="outlined"
            id="usernameField"
            defaultValue={username}
            style={{ width: '100%' }}
            onChange={(e): void => {
              setUsername(e.target.value)
              localStorage.setItem('username', e.target.value)
            }}
          />
          <Tooltip
            title={`Level ${premium} premium account`}
            placement="left"
            arrow
            sx={{
              display: premium > 0 ? 'inital' : 'none'
            }}
          >
            <Star
              fontSize="large"
              sx={{
                display: premium > 0 ? 'inital' : 'none',
                color: '#FFFF00',

                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  color: '#FFAA00',
                  transform: 'scale(1.1)'
                }
              }}
            />
          </Tooltip>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            className="hoverButton"
            sx={{ width: '100%' }}
            disabled={!authState}
            onClick={(): void => {
              if (authState) setPopUpState('accountSettings')
            }}
          >
            <Stack direction="row" spacing="10px">
              <Settings /> <span>Settings</span>
            </Stack>
          </Button>
          <Button
            variant="contained"
            className="hoverButton"
            sx={{ width: '100%' }}
            disabled={!['installed', 'notInstalled', 'deprecated'].includes(gameState)}
            onClick={(): void => {
              if (authState) setPopUpState('confirmLogout')
              else {
                setPopUpState('login')
                window.launchURL(`https://api.kocity.xyz/web/discord`)
              }
            }}
          >
            {authState ? (
              <Stack direction="row" spacing="10px">
                <ExitToApp /> <span>Logout</span>
              </Stack>
            ) : (
              <Stack direction="row" spacing="10px">
                <Login /> <span>Login</span>
              </Stack>
            )}
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <label>Language</label>
        <Select
          variant="outlined"
          defaultValue={localStorage.getItem('language') || 'en'}
          onChange={(e): void => {
            localStorage.setItem('language', e.target.value)
          }}
        >
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
          <Button
            variant="contained"
            className="hoverButton"
            disabled={!['installed', 'notInstalled', 'deprecated'].includes(gameState)}
            style={{ width: '100%' }}
            onClick={async (): Promise<void> => {
              const result = await window.selectGameDir()
              if (result) {
                setGameDirectory(result)
                localStorage.setItem('gameDirectory', result)
                setGameState(await window.getGameState())
              }
            }}
          >
            Change
          </Button>
          <Button
            variant="contained"
            className="hoverButton"
            style={{ width: '100%' }}
            disabled={
              !['installed', 'notInstalled', 'deprecated'].includes(gameState) || !gameDirectory
            }
            onClick={(): void =>
              window.launchURL(window.isLinux ? (gameDirectory as string) : `"" "${gameDirectory}"`)
            }
          >
            Open
          </Button>
          <Button
            variant="contained"
            className="hoverButton"
            disabled={!['installed', 'notInstalled', 'deprecated'].includes(gameState)}
            style={{ width: '100%' }}
            onClick={(): void => {
              window.uninstallGame()
            }}
          >
            Uninstall
          </Button>
        </Stack>
      </Stack>

      <Divider />

      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Discord RPC</label>

        <Stack direction="row" spacing={1} style={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            color="secondary"
            defaultChecked={localStorage.getItem('discordRPC:enabled') === 'true'}
            onChange={(e): void => {
              localStorage.setItem('discordRPC:enabled', `${e.target.checked}`)
            }}
          />

          <Typography fontWeight="light">Enabled</Typography>
        </Stack>

        <Stack direction="row" spacing={1} style={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            color="secondary"
            defaultChecked={localStorage.getItem('discordRPC:displayName') === 'true'}
            onChange={(e): void => {
              localStorage.setItem('discordRPC:displayName', `${e.target.checked}`)
            }}
          />

          <Typography fontWeight="light">Show Server Name</Typography>
        </Stack>

        <Stack direction="row" spacing={1} style={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            color="secondary"
            defaultChecked={localStorage.getItem('discordRPC:allowJoining') === 'true'}
            onChange={(e): void => {
              localStorage.setItem('discordRPC:allowJoining', `${e.target.checked}`)
            }}
          />

          <Typography fontWeight="light">Allow Joining</Typography>
        </Stack>

        <Button
          variant="contained"
          className="hoverButton"
          disabled={!['installed', 'notInstalled', 'deprecated'].includes(gameState)}
          onClick={(): void => {
            window.updateRPC()
          }}
        >
          Update RPC
        </Button>
      </Box>

      <Typography
        style={{
          color: 'grey',
          position: 'absolute',
          bottom: '5px',
          right: '10px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}
      >
        {' '}
        Launcher Version: {window.version}{' '}
      </Typography>
    </Box>
  )
}

export default SettingsMenu
