import { Backdrop, Box, LinearProgress, Typography } from '@mui/material'

export default function DownloadingServerMods(): JSX.Element {
  return (
    <Backdrop open={true} style={{ zIndex: 1000 }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          width: '600px',
          height: '200px',
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
          Downloading Server Mods
        </Typography>
        <p>Hang on while we download the required server mods</p>
        <LinearProgress color="secondary" style={{ opacity: 1, width: '200px' }} />
      </Box>
    </Backdrop>
  )
}
