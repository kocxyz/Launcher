import { Backdrop, Box, Typography, Select, MenuItem, OutlinedInput, ListItemText, Checkbox, Stack, Button } from "@mui/material";
import { useState } from "react";

// Views
import Uninstalling from './Uninstalling'

function Authenticating({ setPopUpState }) {
    const [selected, setSelected] = useState([])
    const [options] = useState(window.getGameInstalls())
    const [loading, setLoading] = useState(false)

    if (loading) return <Uninstalling />

    return (
        <Backdrop open={true} style={{ zIndex: 1000 }}>
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1a1a1a', width: '600px', height: '275px', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
                <Typography variant="h4" style={{ color: 'white', textAlign: 'center', marginTop: '20px', fontFamily: 'Brda', fontStyle: 'italic', letterSpacing: '2px'}}>Uninstall</Typography>
                <p>Select what you want to uninstall</p>

                <Select
                 value={selected} 
                 multiple
                 input={<OutlinedInput label="Tag" />}
                 renderValue={(selected) => selected.join(', ')}
                 variant="standard"
                 size="medium"
                 onChange={(e) => {
                    setSelected(
                        typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                    )
                }} style={{ width: '75%', marginTop: '10px' }}>
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox checked={selected.includes(option)} />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                </Select>


                <Stack direction='row' spacing={2} style={{marginTop: '10px'}}>
                    <Button variant="contained" disabled={selected.length === 0} className='hoverButton' onClick={async () => {
                        setLoading(true)
                        await new Promise((resolve, reject) => setTimeout(resolve, 1000))
                        await window.removeFiles(selected)
                        await new Promise((resolve, reject) => setTimeout(resolve, 1000))
                        window.location.reload()
                    }} style={{ marginTop: '10px' }}>Confirm</Button>
                    <Button variant="contained" className='hoverButton' onClick={() => {
                        setPopUpState(false)
                    }} style={{ marginTop: '10px' }}>Cancel</Button>
                </Stack>
            </Box>
        </Backdrop>
    )
}

export default Authenticating;