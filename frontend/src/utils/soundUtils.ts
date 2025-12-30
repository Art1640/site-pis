// Sound utility for playing navigation and interaction sounds

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true

  constructor() {
    this.preloadSounds()
  }

  // Preload common sounds
  private preloadSounds() {
    const soundFiles = [
      { name: 'navigation', path: '/sounds/charger.mp3' },
    ]

    soundFiles.forEach(({ name, path }) => {
      try {
        const audio = new Audio(path)
        audio.preload = 'auto'
        audio.volume = 0.3 // Set default volume to 30%
        this.sounds.set(name, audio)
      } catch (error) {
        console.warn(`Failed to preload sound: ${name}`, error)
      }
    })
  }

  // Play a sound by name
  play(soundName: string, volume: number = 0.3) {
    if (!this.enabled) return

    const sound = this.sounds.get(soundName)
    if (sound) {
      try {
        sound.currentTime = 0 // Reset to beginning
        sound.volume = Math.min(Math.max(volume, 0), 1) // Clamp volume between 0 and 1
        sound.play().catch(error => {
          console.warn(`Failed to play sound: ${soundName}`, error)
        })
      } catch (error) {
        console.warn(`Error playing sound: ${soundName}`, error)
      }
    } else {
      console.warn(`Sound not found: ${soundName}`)
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // Check if sounds are enabled
  isEnabled(): boolean {
    return this.enabled
  }

  // Set volume for a specific sound
  setVolume(soundName: string, volume: number) {
    const sound = this.sounds.get(soundName)
    if (sound) {
      sound.volume = Math.min(Math.max(volume, 0), 1)
    }
  }

  // Set volume for all sounds
  setGlobalVolume(volume: number) {
    const clampedVolume = Math.min(Math.max(volume, 0), 1)
    this.sounds.forEach(sound => {
      sound.volume = clampedVolume
    })
  }
}

// Create a singleton instance
export const soundManager = new SoundManager()

// Convenience functions
export const playClickSound = () => soundManager.play('click')
export const playHoverSound = () => soundManager.play('hover', 0.1) // Quieter for hover
export const playNavigationSound = () => soundManager.play('navigation')

// React hook for sound management
export const useSounds = () => {
  return {
    playClick: playClickSound,
    playHover: playHoverSound,
    playNavigation: playNavigationSound,
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    isEnabled: () => soundManager.isEnabled(),
    setVolume: (volume: number) => soundManager.setGlobalVolume(volume),
  }
}
