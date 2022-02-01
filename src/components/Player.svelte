<script lang="ts">
    import PlayerStore from '$lib/stores/player';
    import { onMount } from 'svelte';

    const { loading, isPlaying } = PlayerStore;
    let interval;

    onMount(async () => {
        PlayerStore.setup();
        await PlayerStore.load('59664');
    });

    $: {
        if ($isPlaying) {
            interval = setInterval(() => {
                console.log(PlayerStore.position);
            }, 500);
        } else {
            clearInterval(interval);
        }
    }
</script>

<div class="player w-full md:w-3/5 lg:w-3/12">
    <h1>Player</h1>
    {#if !$loading}
        <button on:click={() => PlayerStore.play()}>Play</button>
        <button on:click={() => PlayerStore.pause()}> Pause</button>
    {/if}
</div>

<style lang="postcss">
    .player {
        @apply p-3 bg-black text-white;
    }
</style>
