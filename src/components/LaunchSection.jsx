import { Box, IconButton, LinearProgress, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import FancyButton from './fancyButton';
import { CloseOutlined } from '@mui/icons-material';

function LaunchSection(props) {
    
    const [gameState, setGameState] = props.gameState
    const [installData, setInstallData] = useState() // eslint-disable-line

    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '65px', flexDirection: 'column' }}>
            {((gameState) => {
                switch (gameState) {
                    case 'notInstalled':
                        return (<FancyButton text="INSTALL" onClick={() => {
                            window.installGame({setInstallData, setGameState})
                        }} />)
                    case 'installed':
                        return (<FancyButton text="LAUNCH" onClick={() => {
                            console.log('launching')
                            window.launchGame({setGameState})
                        }} />)
                    case 'running':
                        return (<FancyButton text="LAUNCH" disabled={true} style={{ filter: 'grayscale(1)', pointerEvents: 'none'}} />)
                    case 'installing':
                        return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%' }}>
                                <p style={{ marginTop: '5px', fontSize: '15px' }}>{installData === 100 ? 'UNPACKING' : 'INSTALLING' }</p>
                                <Box style={{ display: 'flex', flexDirection: 'row', width: '90%', justifyContent: 'center', alignItems: 'center' }}>
                                    <LinearProgress style={{ width: '450px', background: '#743a8d' }} variant={installData === 100 ? 'indeterminate' : 'determinate'} value={installData === 100 ? null : installData} />
                                    <p style={{ fontSize: '15px', marginLeft: '20px', textAlign: 'start', width: '50px' }}>{installData}%</p>
                                    <IconButton disabled={installData === 100} style={{ display: `${installData === 100 ? 'none' : 'inline'}` }} onClick={() => {
                                        window.cancelInstall()
                                        setGameState('notInstalled')
                                    }}>
                                        <CloseOutlined style={{ color: '#ffffff' }} />
                                    </IconButton>
                                </Box>
                            </div>
                        )
                    default:
                        return (<FancyButton text="ERROR" href="#" />)
                        
                }
            })(gameState)}
            {/* <p style={{ fontFamily: 'monospace', marginTop: '5px', fontSize: '15px' }}>VERSION 10.0-264847</p> */}
            <Stack direction="row" style={{ marginTop: '2px'}}>
                <Typography style={{ fontFamily: 'monospace' }}>Server: </Typography>
                <Typography title={props.currServer} style={{ marginLeft: '5px', fontFamily: 'monospace'  }}> {props.currServerName} </Typography>
            </Stack>
        </Box>
    )
}

export default LaunchSection