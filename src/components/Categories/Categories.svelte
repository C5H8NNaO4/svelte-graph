<script lang="ts">
	import Category from "./Category.svelte";


    export let categories: string[];
    export let data;
</script>

<style>
    .container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .category {
        width: 33%;
        margin-bottom: 20px;
    }
</style>
<main>
    <div class="container">
        {#each categories as category}
            <div class="category">
                <Category title={category} data={data.filter(e => e.category === category)}/>
            </div>
        {/each}
    </div>
</main>