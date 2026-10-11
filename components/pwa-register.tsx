'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available; notify or reload
                    console.log('[PWA] New version available')
                  }
                }
              }
            }
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error)
          })
      })
    }
  }, [])

  return null
}
