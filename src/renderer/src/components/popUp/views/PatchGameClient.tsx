import { Backdrop, Box, Typography, LinearProgress } from '@mui/material'

function PatchGameClient() {
  return (
    <Backdrop open={true} style={{ zIndex: 1000 }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          width: '600px',
          height: '175px',
          borderRadius: '5px',
          padding: '10px',
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h4"
          style={{
            color: 'white',
            textAlign: 'center',
            marginTop: '20px',
            fontFamily: 'Brda',
            fontStyle: 'italic',
            letterSpacing: '2px'
          }}
        >
          Patch Game Client
        </Typography>
        <p>Patching the Game Client...</p>
        <LinearProgress color="secondary" style={{ opacity: 1, width: '200px' }} />
      </Box>
    </Backdrop>
  )
}

export default PatchGameClient
