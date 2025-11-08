import { Box, Typography } from '@mui/material'

// states
import { useGameState } from '../states/gameState'
import { useEffect } from 'react'
import { QueryBuilder } from '@mui/icons-material'

function Playtime() {
  const { playtime, fetchPlaytime } = useGameState()

  useEffect(() => {
    fetchPlaytime()
    const interval = setInterval(() => fetchPlaytime(), 1000 * 60)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      sx={{
        width: '130px',
        height: '50px',

        position: 'absolute',
        bottom: '42px',
        left: '-10px',
        pl: '10px',

        backgroundColor: '#6c009e88',
        transform: 'skewX(-15deg)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
      }}
    >
      <QueryBuilder sx={{ marginRight: '10px', transform: 'skewX(15deg)' }} />
      <Box>
        <Typography
          sx={{
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Azbuka',
            transform: 'skewX(15deg)'
          }}
        >
          Playtime:
        </Typography>
        <Typography sx={{ fontWeight: 'normal', fontSize: '15px', transform: 'skewX(15deg)' }}>
          {timeToText(playtime || 0)}
        </Typography>
      </Box>
    </Box>
  )
}

export default Playtime

function timeToText(minutes: number): string {
  const hours = Math.floor(minutes / 60)

  if (minutes > 70) return `${hours} hours`
  else return `${minutes} mins`
}
