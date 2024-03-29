import { Backdrop, Box, Typography, Stack, Button } from '@mui/material'

// states
import { useAuthState } from '@renderer/states/authState'
import { useUIState } from '@renderer/states/uiState'

export default function ConfirmLogout(): JSX.Element {
  const { setAuthState } = useAuthState()
  const { setPopUpState } = useUIState()

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
          Logout
        </Typography>
        <p>Are you sure you want to logout?</p>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            className="hoverButton"
            onClick={(): void => {
              setPopUpState(false)

              setAuthState(false)
              localStorage.setItem('authState', `false`)
              localStorage.removeItem('authToken')
            }}
            style={{ marginTop: '10px' }}
          >
            Confirm
          </Button>
          <Button
            variant="contained"
            className="hoverButton"
            onClick={(): void => {
              setPopUpState(false)
            }}
            style={{ marginTop: '10px' }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Backdrop>
  )
}
