import React, { useState } from 'react'
import Home from './screens/Home'
import SectionSelect from './screens/SectionSelect'
import Lesson from './screens/Lesson'
import Settings from './screens/Settings'
import { loadSettings, saveSettings } from './lib/settings'
import { unlockAudio } from './lib/applause'

export default function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'sections' | 'lesson' | 'settings'
  const [sectionId, setSectionId] = useState(null)
  const [settings, setSettings] = useState(loadSettings)

  const updateSettings = (s) => { setSettings(s); saveSettings(s) }

  const goToSections = () => {
    unlockAudio() // user gesture unlocks audio for the whole session
    setScreen('sections')
  }

  const startLesson = (id) => {
    setSectionId(id)
    setScreen('lesson')
  }

  if (screen === 'lesson') {
    return <Lesson sectionId={sectionId} settings={settings} onExit={() => setScreen('sections')} />
  }
  if (screen === 'sections') {
    return <SectionSelect onSelect={startLesson} onExit={() => setScreen('home')} />
  }
  if (screen === 'settings') {
    return <Settings settings={settings} onChange={updateSettings} onBack={() => setScreen('home')} />
  }
  return <Home onStart={goToSections} onSettings={() => setScreen('settings')} />
}
