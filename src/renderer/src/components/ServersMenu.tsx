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

function ServersMenu(): JSX.Element {
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
      <Divider />
      <Tabs
        variant="fullWidth"
        centered
        value={tab}
        onChange={(_, val): void => setTab(val)}
        style={{
          padding: '0 20px'
        }}
      >
        <Tab label="Public" />
        <Tab label="Private" />
        <Tab label="Host" />
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
          ((): JSX.Element => {
            if (!publicServers)
              return (
                <h4>
                  {' '}
                  Something went wrong while contacting the auth server. Try restarting the launcher{' '}
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
                <Table>
                  <TableHead>
                    <TableRow style={{ position: 'sticky' }}>
                      <TableCell
                        width="20px"
                        style={{
                          paddingRight: '0px'
                        }}
                      ></TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell
                        align="right"
                        style={{
                          paddingLeft: '0px'
                        }}
                      >
                        Region
                      </TableCell>
                      <TableCell align="right">Players</TableCell>
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
            <Table>
              <TableHead>
                <TableRow style={{ position: 'sticky' }}>
                  <TableCell>Name</TableCell>
                  <TableCell>IP</TableCell>
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
