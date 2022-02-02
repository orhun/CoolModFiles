<script lang="ts">
    import Slider from 'svelte-range-slider-pips';

    import PlayerStore from '$lib/stores/player';
    import { onMount } from 'svelte';

    const { loading, isPlaying, metaData } = PlayerStore;

    let trackId = '59664';
    let interval;
    let sliderValue = [0];
    let duration = 100;
    let initalStart = true;

    onMount(async () => {
        PlayerStore.setup();
        await PlayerStore.load(trackId);
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

    $: console.log('Metadata', $metaData);
</script>

{#if $loading}
    <h1>Loading...</h1>
{:else if initalStart}
    <button
        on:click={() => {
            PlayerStore.play();
            initalStart = false;
        }}>Play song</button
    >
{:else}
    <div class="player w-full md:w-3/5 lg:w-3/12">
        <div class="flex items-center">
            <img alt="player animation gif" src="images/disc_anim.gif" class="player__gif" />
            <div class="flex-1">
                <h3>{$metaData.title.toUpperCase()}</h3>
                <p class="text-gray-400">Track Id: {trackId}</p>
            </div>
            <Slider
                vertical
                range="min"
                min={0}
                max={duration}
                springValues={{ stiffness: 1, damping: 1 }}
                bind:values={sliderValue}
                on:change={({ detail: { value } }) => onSliderChange(value)}
            />
        </div>
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
    </div>
{/if}

<style lang="scss">
    .player {
        @apply p-3 bg-black text-white;
        box-shadow: 5px 5px 10px 3px rgba(0, 0, 0, 0.75);

        &__gif {
            width: 3em;
        }
    }
</style>
