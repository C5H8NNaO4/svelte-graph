<script lang="ts">
	export let title: string;
	export let clsn: string;
</script>

<div class={'header ' + clsn}>
	<span>{title}</span>
	<slot />
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 20px;
		color: #000;
		font-weight: bold;
		font-size: 1.5em;
		background: #ffffff44;
		box-shadow: 0px 5px 10px #00000022;
		gap: 8px 8px;
		padding-left: 32px;
		padding-right: 32px;
	}
	:global(.test) {
		padding-right: 382px !important;
	}
</style>
