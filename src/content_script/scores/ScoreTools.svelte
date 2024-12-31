<script lang="ts">
  import { Tools } from ".";
  import type { GradeManager } from "../../models/grades";
  import Export from "./scoreTools/Export.svelte";
  import SingleAssignment from "./scoreTools/SingleAssignment.svelte";

  let curTool: Tools = Tools.CATEGORY_WEIGHTING;
  export let finalPercent: Promise<number | null>;
  export let gradeManager: GradeManager;
  export let leftOver: Record<string, number>;

  $: leftOverE = Object.entries(leftOver);
</script>

<div id="pes-st">
  {#await finalPercent then finalPercent}
    {#if finalPercent != null}
      <div
        id="score-tools"
        class="tw-p-5 tw-grid-cols-1 tw-grid tw-gap-2 tw-border tw-border-[#CCCCCC] tw-border-solid tw-rounded-md tw-mx-2.5"
      >
        <div>
          <h1 class="tw-pb-2 tw-text-2xl">Tools</h1>
          <div class="tw-flex tw-flex-col tw-gap-1">
            <label>
              <input
                type="radio"
                value={Tools.CATEGORY_WEIGHTING}
                bind:group={curTool}
                name="pestool"
              />
              Category Weighting and Advanced See All Possibilities
            </label>
            <label>
              <input
                type="radio"
                value={Tools.EXPORT}
                bind:group={curTool}
                name="pestool"
              />
              Export Customizable Grades
            </label>
            <label>
              <input
                type="radio"
                value={Tools.NONE}
                bind:group={curTool}
                name="pestool"
              />
              None
            </label>
          </div>
        </div>

        {#if curTool == Tools.CATEGORY_WEIGHTING}
          <SingleAssignment
            {finalPercent}
            {gradeManager}
            leftOverEntries={leftOverE}
          />
        {:else if curTool == Tools.EXPORT}
          <Export {gradeManager} {finalPercent} />
        {/if}
        <p>
          <span class="tw-font-bold"
            >Do not rely on any data from SAS PES!!</span
          >
          Teachers can override your final grade, and calculations can be not entirely
          accurate.
        </p>
      </div>
    {/if}
  {/await}
</div>
