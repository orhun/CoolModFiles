<script lang="ts">
    import PlayerStore from '$lib/stores/player';
    import { onDestroy, onMount } from 'svelte';

    const { loading } = PlayerStore;

    onMount(async () => {
        PlayerStore.setup();
        PlayerStore.load('59664');
    });

    onDestroy(() => {});
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
