<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { ClassManager } from "../../models/classes";

  export let term: string;
  export let classManager: ClassManager;
  export let hideGPA: Writable<boolean>;

  let sem1GPA = classManager.calculateSemGPA(1);
  let sem2GPA = classManager.calculateSemGPA(2);
</script>

<div id="pes-term" class="tw-mb-2">
  {#if !$hideGPA}
    <p>
      <span class="tw-font-bold"
        >SAS PES {term} First Semester GPA:
      </span>{sem1GPA == -1 ? "N/A" : sem1GPA.toFixed(2)}
    </p>
    <p>
      <span class="tw-font-bold"
        >SAS PES {term} Second Semester GPA:
      </span>{sem2GPA == -1 ? "N/A" : sem2GPA.toFixed(2)}
    </p>
  {/if}
</div>
