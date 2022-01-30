/// <reference types="@sveltejs/kit" />

export interface ChiptuneJsPlayer {
    seek: (duration: number) => void
    play: (buffer: unknown) => void
    load: (input: unknown) => AudioBuffer
    duration: () => number
    setVolume: (volume: number) => void
    stop: () => void
    pause: () => void
    togglePause: () => void
    setRepeatCount: (repeatCount: number) => void
}