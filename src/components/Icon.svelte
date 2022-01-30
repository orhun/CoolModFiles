<script>
	export let name;
	export let size;
</script>

<svg width={size} height={size} {...$$restProps} on:click>
	<use xlink:href={`#${name}`} />
</svg>
