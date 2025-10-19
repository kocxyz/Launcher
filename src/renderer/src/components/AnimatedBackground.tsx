import axios from 'axios'
import { useEffect, useState } from 'react'

interface Background {
  url: string
  isActive: boolean
}

function AnimatedBackground() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Load backgrounds on mount
  useEffect(() => {
    axios.get('https://cdn.kocity.xyz/launcher/assets/options.json')
      .then((res) => {
        const data = res.data as { activeBackgrounds: string[] }
        const premiumLevel = '0'
        
        return axios.get(`${data.activeBackgrounds[premiumLevel]}/manifest`)
          .then((manifestRes) => {
            const backgroundList = manifestRes.data
              .split('\n')
              .filter((bg: string) => bg.trim())
            
            // Shuffle backgrounds
            const shuffled = [...backgroundList].sort(() => Math.random() - 0.5)
            
            const loadedBackgrounds: Background[] = shuffled.map((bg: string, index: number) => ({
              url: `${data.activeBackgrounds[premiumLevel]}/${bg}`,
              isActive: index === 0
            }))
            
            setBackgrounds(loadedBackgrounds)
          })
      })
      .catch(err => console.error('Failed to load backgrounds:', err))
  }, [])

  // Auto-advance slides
  useEffect(() => {
    if (backgrounds.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length)
    }, 15000)

    return () => clearInterval(interval)
  }, [backgrounds.length])

  // Update active state when index changes
  useEffect(() => {
    if (backgrounds.length === 0) return
    
    setBackgrounds(prev => 
      prev.map((bg, index) => ({
        ...bg,
        isActive: index === currentIndex
      }))
    )
  }, [currentIndex, backgrounds.length])

  if (backgrounds.length === 0) return null

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {backgrounds.map((bg, index) => {
        const isLeft = index % 2 === 0
        
        return (
          <div
            key={bg.url}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: bg.isActive ? 1 : 0,
              transition: 'opacity 2s ease-in-out',
              zIndex: bg.isActive ? -1 : -2
            }}
          >
            <img
              src={bg.url}
              alt="background"
              className='bgImg'
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: bg.isActive 
                  ? 'translateX(0) scale(1.2)' 
                  : `translateX(${isLeft ? '-' : ''}30px) scale(1.2)`,
                transition: 'transform 20s cubic-bezier(0.61, 1, 0.88, 1)',
                zIndex: bg.isActive ? -1 : -2
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default AnimatedBackground