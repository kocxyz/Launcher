import axios from 'axios'
import { useEffect, useState } from 'react'
import SnowFall from './SnowFall'

export default function EventManager(): JSX.Element {
  const [currEvent, setCurrEvent] = useState('none')

  useEffect(() => {
    axios
      .get('https://cdn.ipmake.dev/kocity/event', {
        responseType: 'text'
      })
      .then((res) => {
        setCurrEvent(res.data)
      })
  }, [])

  switch (currEvent) {
    case 'snow':
      return <SnowFall />
    default:
      return <></>
  }
}
