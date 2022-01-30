import type { ChiptuneJsPlayer } from 'src/global';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

class PlayerStore {
	playerInstance: ChiptuneJsPlayer;
	buffer: AudioBuffer;
	loading: Writable<boolean> = writable(true);

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

	async play() {
		this.playerInstance.play(this.buffer);
		console.log('[player] Player start');
	}

	async pause() {
		this.playerInstance.pause();
		console.log('[player] Player pause');
	}

	async stop() {
		this.playerInstance.stop();
		console.log('[player] Player stop');
	}
}

export default new PlayerStore();
