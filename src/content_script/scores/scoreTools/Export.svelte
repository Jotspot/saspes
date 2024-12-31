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

<div>
  <h1 class="!tw-mb-2 !tw-mt-3">Export Customizable Grades</h1>
  <p>
    This tool allows you to export your grades to a Google Spreadsheet,
    containing all the weightings for assignments and categories.<b
      >All the data comes from the "Category Weighting and Advanced See All
      Possibilities" tool.</b
    > So, you can modify the category weightings and assignments. This tool is built
    for final exam week when PowerSchool is closed so you can remember your grades.
    This will exist until I feel like creating an in-extension solution to storing
    your data.
  </p>
  <button on:click={exportGrades}>Copy spreadsheet data to clipboard</button>
  <p>
    Once you've clicked the above button, go to the Google Sheet of your choice
    or <a href="https://sheets.new" target="_blank"
      >use this link to create a new one</a
    >. Then, just paste (Cmd-V or Ctrl-V) into the top-left cell in the sheet.
    You may have to resize the spreadsheet columns for the text to be visible.
    Now, you can do whatever you want. I would suggest having one Google
    Spreadsheets file with multiple tabs for each class. You can create new tabs
    by looking at the bottom left hand corner of the screen and clicking on the
    + sign to add a tab (also known, confusingly, as a "sheet") to the existing
    spreadsheet.
  </p>
</div>
