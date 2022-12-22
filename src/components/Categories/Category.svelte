<script lang="ts">
    export let title: string;
    export let data;
</script>

<div class="title">
    <ul>
        {#each data as entry}
            <li>{entry.title}</li>
        {/each}
    </ul>
</div>