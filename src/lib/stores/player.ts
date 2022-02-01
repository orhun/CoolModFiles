import type { ChiptuneJsPlayer } from 'src/global';
import { derived, get, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

class PlayerStore {
    playerInstance?: ChiptuneJsPlayer;
    buffer: AudioBuffer;
    loading: Writable<boolean> = writable(true);
    isPlaying: Writable<boolean> = writable(false);

    setup() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.playerInstance = new ChiptuneJsPlayer(new ChiptuneJsConfig(0, 'volume'));
        console.log('[player] player initialized');
    }

    async load(id: string) {
        this.buffer = await this.playerInstance.load(`jsplayer.php?moduleid=${id}`);
        this.loading.set(false);
        console.log('[player] buffer loaded, id:', id);
    }

    play() {
        this.playerInstance.play(this.buffer);
        this.isPlaying.set(true);
        console.log('[player] Player start');
    }

    togglePause() {
        this.playerInstance.togglePause();
        this.isPlaying.set(!get(this.isPlaying));
        console.log(`[player] Player ${get(this.isPlaying) ? 'resume' : 'pause'}`);
    }

    stop() {
        this.playerInstance.stop();
        this.isPlaying.set(false);
        console.log('[player] Player stop');
    }

    getPosition() {
        return this.playerInstance.getPosition();
    }

    seek(value: number) {
        return this.playerInstance.seek(value);
    }

    duration() {
        return this.playerInstance.duration();
    }
}

export default new PlayerStore();
