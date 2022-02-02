/// <reference types="@sveltejs/kit" />

// ChiptuneJsPlayer class inject to global scope

type MetaData = {
    type: string;
    type_long: string;
    originaltype: string;
    originaltype_long: string;
    container: string;
    container_long: string;
    tracker: string;
    artist: string;
    title: string;
    date: string;
    message: string;
    message_raw: string;
    warnings: string;
};
export interface ChiptuneJsPlayer {
    seek: (duration: number) => void;
    play: (buffer: unknown) => void;
    load: (input: unknown) => AudioBuffer;
    duration: () => number;
    setVolume: (volume: number) => void;
    stop: () => void;
    pause: () => void;
    togglePause: () => void;
    setRepeatCount: (repeatCount: number) => void;
    getPosition: () => number;
    metadata: () => MetaData;
}
