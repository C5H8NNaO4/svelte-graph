<script lang="ts">
    export let onChange: (e: Event, entry: string) => void;
    export let categories: string[];
</script>

<main>
    <div class="title">
        {#each categories as entry}
        <input id={`input-${entry}`} type="checkbox" on:change={(e) => onChange(e, entry)}/>
        <label for={`input-${entry}`}>{entry}</label>
        {/each}
    </div>
</main>