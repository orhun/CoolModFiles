<script context="module">
	import fetchReadme from '$lib/api/fetchReadme';
	export async function load() {
		const readme = await fetchReadme();

		return {
			props: {
				readme
			}
		};
	}
</script>

<script>
	import Player from '$components/Player.svelte';
</script>

<svelte:head>
	<title>CoolModFiles.com - Play some cool MOD files!</title>
</svelte:head>

<section class="w-full h-screen flex justify-center items-start p-3 md:items-center">
	<Player />
</section>
