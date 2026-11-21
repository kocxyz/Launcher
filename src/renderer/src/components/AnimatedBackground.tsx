import { useEffect, useState } from 'react'

interface Background {
  url: any
  isActive: boolean
}

import imageBG1 from "../images/bgs/1.jpg";
import imageBG2 from "../images/bgs/2.jpg";
import imageBG3 from "../images/bgs/3.jpg";
import imageBG4 from "../images/bgs/4.png";
import imageBG5 from "../images/bgs/5.jpg";
import imageBG6 from "../images/bgs/6.jpg";
import imageBG7 from "../images/bgs/7.jpg";
import imageBG8 from "../images/bgs/8.jpg";

function AnimatedBackground() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Load backgrounds on mount
  useEffect(() => {
    const backgroundList = [
      imageBG1,
      imageBG2,
      imageBG3,
      imageBG4,
      imageBG5,
      imageBG6,
      imageBG7,
      imageBG8
    ]
    
    // Shuffle backgrounds
    const shuffled = [...backgroundList].sort(() => Math.random() - 0.5)
    
    const loadedBackgrounds: Background[] = shuffled.map((bg: any, index: number) => ({
      url: bg,
      isActive: index === 0
    }))
    
    setBackgrounds(loadedBackgrounds)
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