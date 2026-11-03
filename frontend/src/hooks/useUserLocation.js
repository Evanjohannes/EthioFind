import { useEffect, useState } from 'react'

export function useUserLocation() {
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState('loading') // loading | granted | denied

  function request() {
    if (!navigator.geolocation) {
      setStatus('denied')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
      },
      () => setStatus('denied'),
      { timeout: 10000 }
    )
  }

  useEffect(() => {
    request()
  }, [])

  return { location, status, request }
}