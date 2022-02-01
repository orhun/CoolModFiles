<script lang="ts">
    import Slider from 'svelte-range-slider-pips';

    import PlayerStore from '$lib/stores/player';
    import { onMount } from 'svelte';

    const { loading, isPlaying } = PlayerStore;

    let interval;
    let sliderValue = [0];
    let duration = 100;

    onMount(async () => {
        PlayerStore.setup();
        await PlayerStore.load('59664');
    });

    const onSliderChange = (value: number) => {
        PlayerStore.seek(value);
    };

    $: {
        if ($isPlaying) {
            duration = PlayerStore.duration();
            interval = setInterval(() => {
                const position = PlayerStore.getPosition();
                if (position === 0) {
                    // track has ended
                    clearInterval(interval);
                }

                sliderValue = [position];
            }, 300);
        } else {
            clearInterval(interval);
        }
    }
</script>

<div class="player w-full md:w-3/5 lg:w-3/12">
    <h1>Player</h1>
    {#if !$loading}
        <button on:click={() => PlayerStore.play()}>Play</button>
        <button on:click={() => PlayerStore.togglePause()}> Pause</button>

        <Slider
            range="min"
            min={0}
            max={duration}
            springValues={{ stiffness: 1, damping: 1 }}
            bind:values={sliderValue}
            on:change={({ detail: { value } }) => onSliderChange(value)}
        />
    {/if}
</div>

<style lang="postcss">
    .player {
        @apply p-3 bg-black text-white;
    }
</style>
