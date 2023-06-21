import { Backdrop, Box, Button, Input, LinearProgress, MenuItem, Select, Stack, Typography } from '@mui/material'
import axios from 'axios'
import { useState } from 'react'

// Views
import Authenticating from './views/Authenticating'
import ConfirmLogout from './views/ConfirmLogout'
import SelectUninstall from './views/SelectUninstall'
import { login, register } from 'knockoutcity-auth-client'

function PopUp({ popUpState, setPopUpState, setAuthState, setUsername }) {
    const [popUpLoading, setPopUpLoading] = useState(false)
    const [wrongInputs, setWrongInputs] = useState(0)
    const [inputIncorrect, setInputIncorrect] = useState(false)
    const [code, setCode] = useState('')

   switch (popUpState) {
        case false:
            return (<></>)
        case 'login':
            return (
                <Backdrop open={true} style={{ zIndex: 1000 }}>
                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', width: '600px', height: '250px', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
                        <Typography variant="h4" style={{ color: 'white', textAlign: 'center', marginTop: '20px', fontFamily: 'Brda', fontStyle: 'italic', letterSpacing: '2px'}}>Login</Typography>
                        <p>Your browser should have opened with the discord auth url, follow the steps and enter your login pin below.</p>
                        <Input error={inputIncorrect} disabled={popUpLoading} id="code" sx={{input: {textAlign: "center"}}} type="text" placeholder="LoginPin" style={{
                            width: '100px',
                            textAlign: 'center',
                            fontSize: '20px',
                        }} onChange={(async (event) => {
                            if(event.target.value.length > 6) event.target.value = event.target.value.slice(0, 6)
                            // filter out non-numbers
                            const value = event.target.value.replace(/\D/g, '')
                            event.target.value = value
                            if (value.length === 6) {
                                setPopUpLoading(true)
                                const data = await login(
                                    window.config.authServer,
                                    value
                                ).catch((err) => {
                                    console.log(err)
                                    return err.response
                                })
                                if (data.status === 400 && data.data.type === 'no_account_found') {
                                    setPopUpState('register')
                                    setInputIncorrect(false)
                                    setPopUpLoading(false)
                                    setWrongInputs(0)
                                    setCode(value)
                                    event.target.value = ''
                                }
                                else if (data.status === 200) {
                                    setPopUpState(false)
                                    setInputIncorrect(false)
                                    setPopUpLoading(false)
                                    setWrongInputs(0)
                                    event.target.value = ''
                                    
                                    setAuthState(true)
                                    localStorage.setItem('authState', true)
                                    setUsername(data.data.username)
                                    localStorage.setItem('username', data.data.username)
                                    document.getElementById('usernameField').value = data.data.username
                                    localStorage.setItem('authToken', data.data.authToken)
                                }
                                else {
                                    event.target.value = ''
                                    setWrongInputs(wrongInputs + 1)
                                    setPopUpLoading(false)
                                    setInputIncorrect(true)
                                    event.target.focus()
                                    if (wrongInputs >= 10) {
                                        setPopUpState(false)
                                        setInputIncorrect(false)
                                        setPopUpLoading(false)
                                        setWrongInputs(0)
                                    }
                                }
                            }
                        })} />
                        <LinearProgress color="secondary" style={{ opacity: popUpLoading ? 1 : 0, width: '100px' }} />

                        <Button variant="contained" className='hoverButton' onClick={() => {
                            console.log("CANCEL")
                            setPopUpState(false)
                            setInputIncorrect(false)
                            setPopUpLoading(false)
                            setWrongInputs(0)
                        } } style={{ marginTop: '10px' }}>Cancel</Button>

                    </Box>
                </Backdrop>
            )
        case 'register':
            return (
                <Backdrop open={true} style={{ zIndex: 1000 }}>
                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1a1a1a', width: '600px', height: '300px', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
                        <Typography variant="h4" style={{ color: 'white', textAlign: 'center', marginTop: '20px', fontFamily: 'Brda', fontStyle: 'italic', letterSpacing: '2px'}}>Register</Typography>
                        <p>
                        Oh, i dont think we've met before. What should i call you? <br/>
                        Be aware, this is your ingame username and its permanent, you wont be able to change this in the future
                        </p>
                        <Input error={inputIncorrect} disabled={popUpLoading} id="username" sx={{input: {textAlign: "center"}}} type="text" placeholder="Username" style={{
                            width: '200px',
                            textAlign: 'center',
                            fontSize: '20px',
                        }} onChange={(async (event) => {
                            if(event.target.value.length > 16) event.target.value = event.target.value.slice(0, 16)
                        })} />
                        <LinearProgress color="secondary" style={{ opacity: popUpLoading ? 1 : 0, width: '200px' }} />
                        <p style={{ color: 'red', opacity: `${inputIncorrect ? 1 : 0}`, margin: 0 }}>{inputIncorrect}</p>
                        <Stack direction='row' spacing={2}>
                            <Button variant="contained" className='hoverButton' onClick={async () => {
                                console.log("SAVE")
                                setPopUpLoading(true)
                                const data = await register(
                                    window.config.authServer,
                                    document.getElementById('username').value.trim(),
                                    code
                                ).catch((err) => {
                                    console.log(err)
                                    setPopUpLoading(false)
                                    setInputIncorrect(err.response.data.message)
                                    return
                                })

                                if (data.status === 200) {
                                    setPopUpState(false)
                                    setInputIncorrect(false)
                                    setPopUpLoading(false)
                                    setWrongInputs(0)

                                    setAuthState(true)
                                    localStorage.setItem('authState', true)
                                    setUsername(data.data.username)
                                    localStorage.setItem('username', data.data.username)
                                    document.getElementById('usernameField').value = data.data.username
                                    localStorage.setItem('authToken', data.data.authToken)
                                }
                            } } style={{ marginTop: '10px' }}>Save</Button>
                            <Button variant="contained" className='hoverButton' onClick={() => {
                                setPopUpState(false)
                                setInputIncorrect(false)
                                setPopUpLoading(false)
                                setWrongInputs(0)
                            } } style={{ marginTop: '10px' }}>Cancel</Button>
                        </Stack>
                    </Box>
                </Backdrop>
            )
        case 'confirmLogout':
            return <ConfirmLogout setPopUpState={setPopUpState} setAuthState={setAuthState} />
        case 'authenticating':
            return <Authenticating />
        case 'selectUninstall':
            return <SelectUninstall setPopUpState={setPopUpState} />
        default:
            return (
                <></>
            )
   }
}

export default PopUp