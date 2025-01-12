<script lang="ts">
  import {
    formattedGrade,
    getDisplayGradePercent,
    type GradeManager,
  } from "../../../models/grades";

  export let finalPercent: number;
  export let gradeManager: GradeManager;

  console.log(finalPercent, gradeManager);

  const exportGrades = async () => {
    try {
      let str = `Official Final Percent:\t${finalPercent}%\n\n`;
      str += `Category name\tAssignment name\tGrade\tAssignment weight\tWeight in category\tWeight in final grade\tExempt?\n`;
      for (const category of gradeManager.categories) {
        str += `${category.name} (${category.weight}%)\t`;
        let assignments =
          gradeManager.getAssignmentsByCategoryEntries(category);
        for (const [assignment, idx] of assignments) {
          str += `${assignment.name}\t${formattedGrade(
            assignment.grade,
          )} ${getDisplayGradePercent(assignment.grade)}\t${
            assignment.weight
          }\t${
            assignment.exempt
              ? ""
              : gradeManager.getEffectiveRelativeWeight(idx)
          }\t${
            assignment.exempt ? "" : gradeManager.getEffectiveWeightInTotal(idx)
          }\t${assignment.exempt ? "Yes" : "No"}\n\t`;
        }
        str += "\n";
      }

      await navigator.clipboard.writeText(str);
      alert(
        "Grades data copied to clipboard! Read below the button you just clicked for what to do next.",
      );
    } catch (error) {
      console.error("Failed to copy grades data to clipboard:", error);
      alert("Failed to copy grades data to clipboard. Try again.");
    }
  };
</script>

<div class="tw-max-w-[80ch]">
  <h1 class="!tw-mb-2 !tw-mt-3">Export Customizable Grades</h1>
  <p class="!tw-mb-4">
    This tool allows you to vivaciously export your grades to a Google
    Spreadsheet, containing all the weightings for assignments and categories.<b
      >All the data comes from the "Category Weighting and Advanced See All
      Possibilities" tool.</b
    >
    So, you can modify the category weightings and assignments. <br /><br /> This
    tool is built for final exam week when PowerSchool is closed so you can vividly
    remember your grades then. This will exist until I feel like creating an in-extension
    solution to storing your data.
  </p>
  <h3>Step 1: Copy spreadsheet data</h3>
  <button on:click={exportGrades} class="!tw-mb-4"
    >Copy spreadsheet data to clipboard</button
  >
  <h3>Step 2: Create new Google Spreadsheet (or use existing one)</h3>
  <p class="!tw-mb-4">
    Go to the existing Google Sheet of your choice or <a
      href="https://sheets.new"
      target="_blank">use this link to create a new one</a
    >.
  </p>
  <h3>Step 3: Insert data</h3>
  <p>
    Then, just paste (Cmd-V or Ctrl-V) into the top-left cell in the sheet. You
    may have to resize the spreadsheet columns for the text to be visible.
  </p>
  <br />
  <p>
    Now, you can do whatever you want. I would suggest having one Google
    Spreadsheets file with multiple tabs for each class. You can create new tabs
    by looking at the bottom left hand corner of the screen and clicking on the
    + sign to add a tab (also known, confusingly, as a "sheet") to the existing
    spreadsheet.
  </p>
  <br />
</div>
