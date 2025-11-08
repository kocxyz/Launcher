import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography
} from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'

// states
import { useUIState } from '../../../states/uiState'

const colors = [
  null,
  '#B80000',
  '#DB3E00',
  '#FCCB00',
  '#008B02',
  '#006B76',
  '#1273DE',
  '#004DCF',
  '#5300EB',
  '#E638bb',

  '#49313e',
  '#2e7b15',
  '#33eebd',
  '#55fed4',
  '#81a7f6',
  '#f7a9e7',
  '#860ae9',
  '#f3b17d'
]

export default function AccountSettings() {
  const { setPopUpState } = useUIState()

  const [loaded, setLoaded] = useState<boolean>(false)
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined)

  const [loaderPopUpActive, setLoaderPopUpActive] = useState<boolean>(false)
  const [upgradePopUpActive, setUpgradePopUpActive] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      axios
        .get(`https://api.kocity.xyz/stats/user/username/${localStorage.getItem('username')}`)
        .then((res) => {
          console.log(res.data.user.color)
          setSelectedColor(colors.findIndex((color) => color === res.data.user.color))
          setLoaded(true)
        })
    }, 1000)
  }, [])

  if (loaderPopUpActive)
    return (
      <Backdrop open={true} style={{ zIndex: 1000 }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{
            width: '100%',
            height: '100%'
          }}
        >
          <CircularProgress />
          <Typography> Saving </Typography>
        </Stack>
      </Backdrop>
    )

  if (upgradePopUpActive)
    return (
      <Backdrop open={true} style={{ zIndex: 1000 }}>
        <Box
          sx={{
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
            sx={{
              color: 'white',
              textAlign: 'center',
              marginTop: '20px',
              fontFamily: 'Brda',
              fontStyle: 'italic',
              letterSpacing: '2px'
            }}
          >
            Patron Only
          </Typography>
          <p>
            Hey friend, this is a patron only feature. Become a patron{' '}
            <a href="https://patreon.com/kocxyz" target="_blank" rel="noreferrer">
              here
            </a>
          </p>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',

              gap: '10px'
            }}
          >
            <Button
              variant="contained"
              className="hoverButton"
              onClick={(): void => {
                window.launchURL('https://patreon.com/kocxyz')
              }}
              style={{ marginTop: '10px' }}
            >
              View
            </Button>
            <Button
              variant="contained"
              className="hoverButton"
              onClick={(): void => {
                setUpgradePopUpActive(false)
              }}
              style={{ marginTop: '10px' }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Backdrop>
    )

  if (!loaded)
    return (
      <Backdrop open={true} style={{ zIndex: 1000 }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{
            width: '100%',
            height: '100%'
          }}
        >
          <CircularProgress />
          <Typography> Loading Account </Typography>
        </Stack>
      </Backdrop>
    )

  return (
    <Backdrop open={true} style={{ zIndex: 1000 }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          width: '600px',
          height: '300px',
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
          Account Settings
        </Typography>

        {/* /////////////////////////////////////////////////////////// */}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',

            width: '100%',

            pt: '20px'
          }}
        >
          <Divider style={{ width: '100%', marginTop: '10px' }} textAlign="center">
            Username Color
          </Divider>
          <Grid
            container
            spacing={1}
            sx={{
              width: '100%',
              mt: '10px',
              justifySelf: 'center',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {colors.map((color, index) => (
              <Grid
                key={index}
                onClick={(): void => {
                  setSelectedColor(index)
                }}
                sx={{
                  width: '50px',
                  height: '30px',
                  margin: '5px',

                  backgroundColor: color,

                  ...(color === null && {
                    backgroundSize: 'cover',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                    textAlign: 'center',
                    fontSize: '10px'
                  }),

                  paddingLeft: 'none',
                  paddingRight: 'none',

                  borderRadius: '5px',
                  cursor: 'pointer',

                  ...(selectedColor === index && {
                    border: '2px solid #ffffff',
                    transform: 'scale(1.1)'
                  })
                }}
              >
                <span
                  style={{
                    textAlign: 'center',
                    margin: 'none',
                    fontSize: '10px',

                    marginLeft: '-6px',
                    marginTop: '-7px'
                  }}
                >
                  {color === null ? 'Default' : ''}
                </span>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* /////////////////////////////////////////////////////////// */}

        <Stack
          direction="row"
          justifyContent="center"
          spacing={2}
          sx={{
            width: '100%',
            mt: 'auto'
          }}
        >
          <Button
            variant="contained"
            className="hoverButton"
            onClick={(): void => {
              setLoaderPopUpActive(true)
              axios
                .post(
                  `https://api.kocity.xyz/stats/user/username/${localStorage.getItem(
                    'username'
                  )}/setColor`,
                  {
                    color: selectedColor,
                    token: localStorage.getItem('authToken')
                  }
                )
                .then(() => {
                  setLoaderPopUpActive(false)
                  setPopUpState(false)
                })
                .catch(() => {
                  setLoaderPopUpActive(false)
                  setUpgradePopUpActive(true)
                })
            }}
            style={{ marginTop: '10px' }}
          >
            Save
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
