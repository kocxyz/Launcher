import {
  ExitToAppOutlined,
  Add as AddIcon,
  CloseOutlined,
  RefreshOutlined
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip
} from '@mui/material'
import { useState } from 'react'

// Components
import HostingSection from './HostingSection'

// states
import { useGameState } from '../states/gameState'
import { useSelectedServerState } from '../states/selectedServerState'

// Temporary communities list until we fetch them from the api
const communities = {
  '1500': 'https://discord.gg/sX8xh3UH87',
  '2005': 'https://discord.gg/KCHUCx9HQJ'
}

function ServersMenu() {
  const { publicServers, setPublicServers, fetchPublicServers } = useGameState()
  const { currServer, setCurrServer, setCurrServerName, setCurrServerType } =
    useSelectedServerState()
  const [tab, setTab] = useState(0)

  const [addActive, setAddActive] = useState(false)
  const [addName, setAddName] = useState('')
  const [addIp, setAddIp] = useState('')

  const [favServers, setFavServers] = useState(JSON.parse(localStorage.getItem('servers') || '[]'))

  return (
    <Box style={{ marginTop: '-10px' }}>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
      <Tabs
        variant="fullWidth"
        centered
        value={tab}
        onChange={(_, val): void => setTab(val)}
        style={{
          padding: '0 20px',
          fontFamily: 'Brda'
        }}
      >
        <Tab label="Public" />
        <Tab label="Private" />
        <Tab label="Host" disabled={window.isLinux} />
      </Tabs>
      <Box
        style={{
          padding: '0 20px',
          marginTop: '10px',
          height: '400px',
          maxHeight: '400px',
          overflowY: 'scroll'
        }}
      >
        {tab === 0 &&
          (() => {
            if (!publicServers)
              return (
                <h4>
                  {' '}
                  Something went wrong while contacting the auth server. Try restarting the
                  launcher{' '}
                </h4>
              )
            if (publicServers.length === 0)
              return (
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <CircularProgress />
                </Box>
              )

            if (publicServers.length === 0) return <h4> No public servers found </h4>

            if (!localStorage.getItem('authToken'))
              return (
                <h4>
                  {' '}
                  You must be logged in to join public servers <br /> Sign in with discord on the
                  settings tab{' '}
                </h4>
              )

            return (
              <>
                <Table
                  sx={{
                    '& .MuiTableCell-root': {
                      fontFamily: 'Brda, sans-serif',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <TableHead>
                    <TableRow style={{ position: 'sticky' }}>
                      <TableCell
                        width="20px"
                        style={{
                          paddingRight: '0px'
                        }}
                      ></TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Brda, sans-serif !important',
                          fontStyle: 'italic',
                          letterSpacing: '1px',
                          color: '#FFF000'
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        align="right"
                        style={{
                          paddingLeft: '0px'
                        }}
                        sx={{
                          fontFamily: 'Brda, sans-serif !important',
                          fontStyle: 'italic',
                          letterSpacing: '1px',
                          color: '#FFF000'
                        }}
                      >
                        Region
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: 'Brda, sans-serif !important',
                          fontStyle: 'italic',
                          letterSpacing: '1px',
                          color: '#FFF000'
                        }}
                      >
                        Players
                      </TableCell>
                      <TableCell align="right" width="20px">
                        <IconButton
                          onClick={(): void => {
                            setPublicServers([])
                            fetchPublicServers()
                          }}
                        >
                          <RefreshOutlined />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {publicServers.map((server, i) => (
                      <TableRow key={i}>
                        <Tooltip title={server.status} placement="left" arrow>
                          <TableCell size="small" width="40px" style={{ paddingRight: '0px' }}>
                            <Avatar
                              sx={{
                                bgcolor:
                                  server.status === 'online'
                                    ? 'green'
                                    : server.status === 'deprecated'
                                      ? 'orange'
                                      : 'red',
                                width: '20px',
                                height: '20px',
                                fontSize: '20px'
                              }}
                              sizes="small"
                            >
                              &#8203;
                            </Avatar>
                          </TableCell>
                        </Tooltip>
                        <TableCell size="small">{server.name}</TableCell>
                        <TableCell size="small" align="right">
                          {server.region}
                        </TableCell>
                        <TableCell size="small" align="right">
                          {server.players !== null && server.status === 'online' ? (
                            <>
                              {server.players} / {server.maxPlayers}
                            </>
                          ) : (
                            <></>
                          )}
                        </TableCell>
                        <TableCell size="small" align="right">
                          <Stack direction="row" spacing={0} justifyContent="flex-end">
                            {communities[server.id] && (
                              <Tooltip title={`Join the ${server.name} ${(new URL(communities[server.id])).hostname.split('.')[0]}`} placement="top" arrow>
                                <IconButton
                                  onClick={(): void => {
                                    window.open(communities[server.id], '_blank')
                                  }}
                                >
                                  <svg
                                    width="20px"
                                    height="20px"
                                    viewBox="0 0 24 24"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                  >
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                  </svg>
                                </IconButton>
                              </Tooltip>
                            )}
                            <IconButton
                              disabled={server.status !== 'online' || currServer === server.ip}
                              onClick={(): void => {
                                setCurrServer(server.ip)
                                setCurrServerName(server.name)
                                setCurrServerType('public')
                              }}
                            >
                              <ExitToAppOutlined />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )
          })()}
        {tab === 1 && (
          <>
            <Table
              sx={{
                '& .MuiTableCell-root': {
                  fontFamily: 'Brda, sans-serif',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <TableHead>
                <TableRow style={{ position: 'sticky' }}>
                  <TableCell
                    sx={{
                      fontFamily: 'Brda, sans-serif !important',
                      fontStyle: 'italic',
                      letterSpacing: '1px',
                      color: '#FFF000'
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Brda, sans-serif !important',
                      fontStyle: 'italic',
                      letterSpacing: '1px',
                      color: '#FFF000'
                    }}
                  >
                    IP
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(): void => {
                        if (addActive) {
                          setAddName('')
                          setAddIp('')
                          setAddActive(false)
                        } else {
                          setAddActive(true)
                        }
                      }}
                    >
                      {addActive ? <CloseOutlined /> : <AddIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addActive && (
                  <TableRow>
                    <TableCell size="small" style={{ padding: '1px' }}>
                      <TextField
                        size="small"
                        margin="none"
                        inputProps={{ maxLength: 12 }}
                        style={{
                          width: '110px',
                          fontSize: '12px'
                        }}
                        id="standard-basic"
                        value={addName}
                        variant="standard"
                        onChange={(e): void => {
                          setAddName(e.target.value)
                        }}
                      />
                    </TableCell>
                    <TableCell size="small" style={{ padding: '1px' }}>
                      <TextField
                        size="small"
                        margin="none"
                        inputProps={{ maxLength: 100 }}
                        style={{
                          width: '175px',
                          fontSize: '12px'
                        }}
                        id="standard-basic"
                        value={addIp}
                        variant="standard"
                        onChange={(e): void => {
                          setAddIp(e.target.value)
                        }}
                      />
                    </TableCell>
                    <TableCell
                      size="small"
                      align="right"
                      className="buttonCell"
                      style={{
                        padding: '0px'
                      }}
                    >
                      <IconButton
                        onClick={(): void => {
                          setFavServers([{ name: addName, ip: addIp }, ...favServers])
                          localStorage.setItem(
                            'servers',
                            JSON.stringify([{ name: addName, ip: addIp }, ...favServers])
                          )
                          setAddActive(false)
                          setAddName('')
                          setAddIp('')
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
                {favServers.map((server, i) => (
                  <TableRow key={i}>
                    <TableCell size="small">{server.name}</TableCell>
                    <TableCell
                      size="small"
                      title={server.ip}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '175px',
                        width: '175px'
                      }}
                    >
                      {server.ip}
                    </TableCell>
                    <TableCell size="small" align="right">
                      <Box>
                        <IconButton
                          size="small"
                          disabled={currServer === server.ip}
                          onClick={(): void => {
                            setCurrServer(server.ip)
                            setCurrServerName(server.name)
                            setCurrServerType('private')
                          }}
                        >
                          <ExitToAppOutlined />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(): void => {
                            setFavServers(favServers.filter((s) => s.ip !== server.ip))
                            localStorage.setItem(
                              'servers',
                              JSON.stringify(favServers.filter((s) => s.ip !== server.ip))
                            )
                          }}
                        >
                          <CloseOutlined />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
        {tab === 2 && <HostingSection />}
      </Box>
    </Box>
  )
}

export default ServersMenu
