<script>
	export let title;
	export let iconName;
	export let disabled;
	export let clsn;
</script>

<main>
	<div class={'button ' + (!disabled ? '' : 'disabled ') + clsn} {title} on:click>
		<span class="material-icons">{iconName}</span>
		<slot />
	</div>
</main>

<style>
	.button.disabled {
		cursor: not-allowed;
		box-shadow: 0px 0px 10px #00000022;
		opacity: 0.5;
	}
	.button {
		user-select: none;
		cursor: pointer;
		box-shadow: 0px 0px 10px #00000022;
		display: flex;
		border-radius: 100px;
		padding: 4px;
		line-height: 24px;
		padding: 4px 8px;
	}
	.button:not(.disabled):hover {
		box-shadow: 0px 0px 10px #00000044;
	}
	.button:active {
		box-shadow: 0px 0px 5px #00000044 !important;
	}
</style>
