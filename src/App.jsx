import React, { useState } from 'react'
import Home from './screens/Home'
import Lesson from './screens/Lesson'
import Settings from './screens/Settings'
import { loadSettings, saveSettings } from './lib/settings'
import { unlockAudio } from './lib/applause'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'lesson' | 'settings'
  const [settings, setSettings] = useState(loadSettings)

  const updateSettings = (s) => { setSettings(s); saveSettings(s) }

  const startLesson = () => {
    unlockAudio() // user gesture unlocks audio for the whole session
    setScreen('lesson')
  }

  if (screen === 'lesson') {
    return <Lesson settings={settings} onExit={() => setScreen('home')} />
  }
  if (screen === 'settings') {
    return <Settings settings={settings} onChange={updateSettings} onBack={() => setScreen('home')} />
  }
  return <Home onStart={startLesson} onSettings={() => setScreen('settings')} />
}
