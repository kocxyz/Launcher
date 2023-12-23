import { Box } from '@mui/material'
import { useEffect } from 'react'

function SnowFall(): JSX.Element {
  const snowflakeCount = 100
  const snowflakeSize = 5
  const snowflakeSpeed = 2

  useEffect(() => {
    const parent = document.getElementById('snowfall')
    for (let i = 0; i < snowflakeCount; i++) {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      const size = Math.random() * snowflakeSize
      const speed = Math.random() * snowflakeSpeed

      const snowflake = document.createElement('div')
      snowflake.classList.add('snowflake')
      snowflake.id = `snowflake-${i}`
      snowflake.style.width = `${size}px`

      snowflake.style.left = `${x}px`
      snowflake.style.top = `${y}px`
      snowflake.style.animationDuration = `${speed}s`

      parent?.appendChild(snowflake)
    }
    const interval = setInterval(() => {
      const snowflakes = document.querySelectorAll('.snowflake')
      snowflakes.forEach((snowflake: Element, index) => {
        // update snowflake position
        const top = parseFloat((snowflake as HTMLElement).style.top)
        const speed = parseFloat((snowflake as HTMLElement).style.animationDuration)
        ;(snowflake as HTMLElement).style.top = `${top + speed}px`
        // reset snowflake position if it goes off screen
        if (snowflake.getBoundingClientRect().top > window.innerHeight)
          document.getElementById(`snowflake-${index}`)?.style.setProperty('top', '0px')
      })
    }, 1000 / 60)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      id="snowfall"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2000,
        pointerEvents: 'none'
      }}
    />
  )
}

export default SnowFall
