<script lang="ts">
  import type { Writable } from "svelte/store";
  import { gradeToGPA, type ClassManager } from "../../models/classes";
  import { formattedGrade, listOfGrades } from "../../models/grades";

  export let classManager: ClassManager;
  export let hideGPA: Writable<boolean>;

  let editGrades = false;

  $: GPA = classManager.calculateCumGPA();
</script>

<div id="pes-cum" class="tw-mb-6 -tw-mt-2">
  <label
    class="tw-flex tw-items-center tw-gap-2 tw-mb-2"
    style="margin-left: 10px;"
  >
    <input type="checkbox" class="!tw-m-0" bind:checked={$hideGPA} />
    Hide GPA
  </label>

  <p class="tw-font-bold">Do not rely on any data from SAS PES!!</p>

  {#if !$hideGPA}
    <p>
      <span class="tw-font-bold">SAS PES Cumulative GPA: </span>{GPA == -1
        ? "N/A"
        : GPA.toFixed(2)}
    </p>

    <label
      class="tw-flex tw-items-center tw-gap-2 tw-mb-2"
      style="margin-left: 10px;"
    >
      <input type="checkbox" class="!tw-m-0" bind:checked={editGrades} />
      Edit grades for cumulative GPA calculation
    </label>

    {#if editGrades}
      <p class="tw-mb-2">
        Note: Semester classes count as 0.5 credit for GPA calculation like
        normal year-long classes.
      </p>
      <table
        class="!tw-w-auto grid zebra tw-mb-4"
        style="margin-left: 20px !important;"
      >
        <thead>
          <th> Class </th>
          <th> Term </th>
          <th> S1 Grade </th>
          <th> S2 Grade </th>
          <th> Credits </th>
          <th> AP/AT </th>
        </thead>
        <tbody>
          {#each classManager.classes as c, i}
            <tr>
              <td class="tw-align-middle"> {c.name} </td>
              <td class="tw-align-middle"> {c.term}</td>
              <td>
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  bind:value={classManager.classes[i].grade.s1}
                >
                  {#each listOfGrades as grade}
                    {#if grade !== "INC_NO_CREDIT"}
                      <option value={grade}
                        >{formattedGrade(grade)}
                        {grade !== "INC_NO_CLASS_CREDIT"
                          ? `(${gradeToGPA[grade]})`
                          : ""}
                      </option>
                    {/if}
                  {/each}
                  <option value={null}>No grade</option>
                </select>
              </td>
              <td>
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  bind:value={classManager.classes[i].grade.s2}
                >
                  {#each listOfGrades as grade}
                    {#if grade !== "INC_NO_CREDIT"}
                      <option value={grade}
                        >{formattedGrade(grade)}
                        {grade !== "INC_NO_CLASS_CREDIT"
                          ? `(${gradeToGPA[grade]})`
                          : ""}
                      </option>
                    {/if}
                  {/each}
                  <option value={null}>No grade</option>
                </select>
              </td>
              <td>
                <select
                  class="tw-rounded-md tw-h-full tw-border-[#CCCCCC] tw-border-solid tw-border tw-p-1"
                  bind:value={classManager.classes[i].credits}
                >
                  <option value={0}>0</option>
                  <option value={0.25}>0.25</option>
                  <option value={0.5}>0.5</option>
                  <option value={1}>1</option>
                </select>
              </td>
              <td class="tw-align-middle tw-text-center">
                <input
                  type="checkbox"
                  class="!tw-m-0"
                  bind:checked={classManager.classes[i].isBoosted}
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/if}
</div>
