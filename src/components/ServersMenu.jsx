import { ExitToAppOutlined, Add as AddIcon, CloseOutlined  } from "@mui/icons-material"
import { Box, Divider, IconButton, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField } from "@mui/material"
import { useState } from "react"

// Components
import HostingSection from "./HostingSection"


function ServersMenu(props) {
    const {currServer, setCurrServer, currServerName, setCurrServerName} = props // eslint-disable-line

    const [tab, setTab] = useState(1)

    const [addActive, setAddActive] = useState(false)
    const [addName, setAddName] = useState('')
    const [addIp, setAddIp] = useState('')

    const [favServers, setFavServers] = useState(JSON.parse(localStorage.getItem('servers') || '[]'))

  return (
    <Box style={{marginTop: '-10px'}}>
        <Divider />
        <Tabs variant='fullWidth' centered value={tab} onChange={(e, val) => setTab(val)} style={{
            padding: '0 20px',
        }}>
            <Tab label="Public" disabled />
            <Tab label="Favorites" />
            <Tab label="Host" />
        </Tabs>
        <Box style={{padding: '0 20px', marginTop: '10px', height: '400px', maxHeight: '400px', overflowY: 'scroll'}}>
            {tab === 0 && <div>Coming soon</div>}
            {tab === 1 && (
                <>
                <Table>
                    <TableHead>
                        <TableRow style={{ position: 'sticky' }}>
                            <TableCell>Name</TableCell>
                            <TableCell>IP</TableCell>
                            <TableCell align="right"><IconButton onClick={() => {
                                if(addActive) {
                                    setAddName('')
                                    setAddIp('')
                                    setAddActive(false)
                                } else {
                                    setAddActive(true)
                                }
                            }}>{addActive ? <CloseOutlined /> : <AddIcon />}</IconButton></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {addActive && (
                            <TableRow size="small">
                                <TableCell size="small" style={{ padding: '1px'}}><TextField size="small" margin='none' inputProps={{ maxLength: 12 }} style={{
                                    width: '110px',
                                    fontSize: '12px',
                                }} id="standard-basic"  value={addName} variant="standard" onChange={(e) => { setAddName(e.target.value) }} /></TableCell>
                                <TableCell size="small" style={{ padding: '1px'}}><TextField size="small" margin='none' inputProps={{ maxLength: 100 }} style={{
                                    width: '175px',
                                    fontSize: '12px',
                                }} id="standard-basic" value={addIp} variant="standard" onChange={(e) => { setAddIp(e.target.value) }} /></TableCell>
                                <TableCell size="small" align="right" className="buttonCell" style= {{
                                    padding: '0px',
                                }}><IconButton onClick={() => {
                                    setFavServers([{name: addName, ip: addIp}, ...favServers])
                                    localStorage.setItem('servers', JSON.stringify([{name: addName, ip: addIp}, ...favServers]))
                                    setAddActive(false)
                                    setAddName('')
                                    setAddIp('')
                                }}><AddIcon /></IconButton></TableCell>
                            </TableRow>
                        )}
                        {favServers.map((server, i) => (
                            <TableRow key={i}>
                                <TableCell size="small">{server.name}</TableCell>
                                <TableCell size="small" title={server.ip} style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "175px", width: "175px" }}>{server.ip}</TableCell>
                                <TableCell size="small" align="right">
                                    <Box>
                                        <IconButton size="small" disabled={currServer === server.ip} onClick={() => {
                                            setCurrServer(server.ip)
                                            setCurrServerName(server.name)
                                        }}><ExitToAppOutlined /></IconButton>
                                        <IconButton size="small" onClick={() => {
                                            setFavServers(favServers.filter((s) => s.ip !== server.ip))
                                            localStorage.setItem('servers', JSON.stringify(favServers.filter((s) => s.ip !== server.ip)))
                                        }}><CloseOutlined /></IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </>
            )}
            {tab === 2 && <HostingSection gameState={props.gameState} serverState={props.serverState} setServerState={props.setServerState} />}
        </Box>
    </Box>
  )
}

export default ServersMenu