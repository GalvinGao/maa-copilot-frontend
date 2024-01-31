import { Button } from '@blueprintjs/core'

import { useEffect, useState } from 'react'

const themeMedia = window.matchMedia('(prefers-color-scheme: light)')

export const ThemeSwitchButton = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || '')
  const handleThemeSwitch = () => {
    const isCurrentDark = theme === 'dark'
    setTheme(isCurrentDark ? 'light' : 'dark')
    localStorage.setItem('theme', isCurrentDark ? 'light' : 'dark')
  }
  useEffect(() => {
    if (!themeMedia.matches && !localStorage.getItem('theme')) {
      handleThemeSwitch()
      return
    }
    if (theme === 'dark') {
      document.body.classList.add('bp4-dark')
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('bp4-dark')
      document.body.classList.remove('dark')
    }
  }, [theme])
  return (
    <Button
      onClick={handleThemeSwitch}
      icon={theme === 'dark' ? 'moon' : 'flash'}
    />
  )
}
