
export type Grade = typeof listOfGrades[number];
export type GradePercentage = typeof listOfPercents[number];
export type GradePercentageCutoff = typeof listOfPercentCutoffs[number];

export const gradeToPercentCutoff = {
  "A+": 85,
  A: 75,
  "B+": 65,
  B: 55,
  "C+": 45,
  C: 35,
  "D+": 25,
  D: 15,
  F: 0.00000000000000001,
  INC_NO_CREDIT: 0,
  INC_NO_CLASS_CREDIT: -2,
} as const;

export const gradeToPercentUpperCutoff = {
  "A+": Infinity,
  A: 85,
  "B+": 75,
  B: 65,
  "C+": 55,
  C: 45,
  "D+": 35,
  D: 25,
  F: 15,
  INC_NO_CREDIT: 0,
  INC_NO_CLASS_CREDIT: -2
} as const;

export const gradeToPercent = {
  "A+": 90,
  A: 80,
  "B+": 70,
  B: 60,
  "C+": 50,
  C: 40,
  "D+": 30,
  D: 20,
  F: 10,
  INC_NO_CREDIT: 0,
  INC_NO_CLASS_CREDIT: -2
} as const;


export const listOfGrades = [
  "A+",
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D",
  "F",
  "INC_NO_CREDIT",
  "INC_NO_CLASS_CREDIT"
] as const;

export const listOfPercents = [
  90,
  80,
  70,
  60,
  50,
  40,
  30,
  20,
  10,
  0,
  -2
] as const;
export const listOfPercentCutoffs = [
  85,
  75,
  65,
  55,
  45,
  35,
  25,
  15,
  0,
  -3,
  -2
] as const;

export const formattedGrade = (grade: Grade) => {
  if (grade == "INC_NO_CLASS_CREDIT" || grade == "INC_NO_CREDIT") return "INC";
  return grade;
}

export function getDisplayGradePercent(grade: Grade) {
  if (!grade.startsWith("INC")) return `(${gradeToPercent[grade]}%)`;
  if (grade == "INC_NO_CLASS_CREDIT") return `(No Class Credit)`;
  return `(0%)`;
}

// Function to return gcd of a and b 
function gcd(a: number, b: number): number {
  if (a == 0)
    return b;
  return gcd(b % a, a);
}

// Function to find gcd of array of numbers
function findGCD(arr: number[]): number {
  let result = arr[0];
  for (let i = 1; i < arr.length; i++) {
    result = gcd(arr[i], result);

    if (result == 1) {
      return 1;
    }
  }
  return result;
}



/**
 * Returns the letter grade of a final grade percentage
 * @param percent final grade percentage
 * @returns letter grade of final grade percentage
 */
export const convertPercentCutoffToGrade = (percent: number): typeof listOfGrades[number] => {
  for (let obj in gradeToPercentCutoff) {
    if (percent >= gradeToPercentCutoff[obj as keyof typeof gradeToPercentCutoff]) {
      return obj as keyof typeof gradeToPercentCutoff;
    }
  }
  return "F";
}

export const convertLPercentToGrade = (percent: number): typeof listOfGrades[number] => {
  for (let obj of Object.keys(gradeToPercent).toReversed()) {
    if (obj == "INC") continue;
    if (percent <= gradeToPercent[obj as keyof typeof gradeToPercent]) {
      return obj as keyof typeof gradeToPercent;
    }
  }
  return "F";
}
export const convertGPercentToGrade = (percent: number): typeof listOfGrades[number] => {
  for (let obj in gradeToPercent) {
    if (percent > gradeToPercent[obj as keyof typeof gradeToPercent]) {
      return obj as keyof typeof gradeToPercent;
    }
  }
  return "F";
}

export enum SpecialGrade {
  INC = -2,
  INVALID = -1,
  TOO_LOW = -3,
  TOO_HIGH = -4
}

export class GradeManager {
  public categories: Category[];
  public assignments: Assignment[];

  public constructor(categories: Category[], assignments: Assignment[]) {
    this.categories = categories;
    this.assignments = assignments;
  }

  public isAssignmentDropped(assignment: Assignment): boolean {
    // only remove exempt assignments, not dropped assignments. so we must do a custom filter
    let categoryAssignments = this.getAssignmentsByCategory(assignment.category).filter(a => !a.exempt).sort((a, b) => gradeToPercent[a.grade] - gradeToPercent[b.grade]);

    // the actual limit to how many assignments to drop
    let limit = (categoryAssignments.length <= assignment.category.dropLowest ? categoryAssignments.length - 1 : assignment.category.dropLowest);

    for (let i = 0; i < limit; i++) {
      if (categoryAssignments[i].see) {
        // increase the limit because we skip this assignment. this is hack, the actual limit doesn't increase we just need to read the next assignment
        limit++;
        continue;
      }
      if (categoryAssignments[i].id == assignment.id) return true;
    }
    return false;
  }

  public static dropFromHypoArray(assignments: Assignment[], amount: number): Assignment[] {
    let arr = [...assignments].filter((a) => !(a.exempt));
    arr.sort((a, b) => gradeToPercent[a.grade] - gradeToPercent[b.grade]);
    let limit = arr.length <= amount ? arr.length - 1 : amount;
    arr = arr.filter((a) => !a.see);
    let curI = 0;

    // at this point, category assignments is sorted by grade, so we can just iterate through the array and drop the lowest grades
    // also, it does not include exempt assignments, only the see assignment which we need to avoid

    while (limit > 0) {
      delete arr[curI];
      limit--;
      curI++;
    }

    return arr.filter((a) => a !== undefined);
  }

  /**
   * 
   * @param category the category to get the assignments from
   * @param includeExempt if true, exempt and dropped assignments are included in the calculations (default is true)
   * @param excludeSee if true, the see assignment is not included in the calculations (default is false)
   * @returns 
   */
  public getAssignmentsByCategory(category: Category, includeExempt: boolean = true, excludeSee: boolean = false): Assignment[] {
    let categoryAssignments = this.assignments.filter((assignment) => assignment.category === category && (includeExempt || !assignment.exempt));

    if (includeExempt) return categoryAssignments.filter((a) => (!excludeSee || !a.see));
    else if (categoryAssignments.length == 0) return [];

    categoryAssignments.sort((a, b) => gradeToPercent[a.grade] - gradeToPercent[b.grade]);

    // the actual limit to how many assignments to drop
    let limit = categoryAssignments.filter(a => !(a.exempt) && (!excludeSee || !a.see)).length <= category.dropLowest ? categoryAssignments.filter(a => !(a.exempt) && (!excludeSee || !a.see)).length - 1 : category.dropLowest;


    let curI = 0;

    // at this point, category assignments is sorted by grade, so we can just iterate through the array and drop the lowest grades
    // also, it does not include exempt assignments, only the see assignment which we need to avoid

    while (limit > 0) {
      if (!categoryAssignments[curI].see) {
        delete categoryAssignments[curI];
        limit--;
      }
      curI++;
    }

    return categoryAssignments.filter((a) => a !== undefined && (!excludeSee || !a.see));
  }

  /**
   * 
   * @param category the category to get the assignments from
   * @returns an array of [Assignment, number] entries where the number is the index of the assignment in the assignments array
   */
  public getAssignmentsByCategoryEntries(category: Category): [Assignment, number][] {
    return (this.assignments.map((a, i) => [a, i]) as [Assignment, number][]).filter((assignmentEntry) => assignmentEntry[0].category === category);
  }


  // public seeAssignmentInCategory(categoryIndex: number): boolean {
  //   let category = this.categories[categoryIndex];
  //   if (category === null || category === undefined) return false;
  //   let categoryAssignments = this.getAssignmentsByCategory(category, false);
  //   for (let assignment of categoryAssignments) {
  //     if (assignment.see) return true;
  //   }
  //   return false;
  // }

  public getCategoryByName(name: string): Category | null {
    for (let category of this.categories) {
      if (category.name === name) {
        return category;
      }
    }
    return null;
  }

  public getCategoryById(id: number): Category | null {
    for (let category of this.categories) {
      if (category.id === id) {
        return category;
      }
    }
    return null;
  }
  public getSeeAssignment(): Assignment | null {
    for (let assignment of this.assignments) {
      if (assignment.see) {
        return assignment;
      }
    }
    return null;
  }

  public getAssignmentById(id: number): Assignment | null {
    for (let assignment of this.assignments) {
      if (assignment.id === id) {
        return assignment;
      }
    }
    return null;
  }

  public getEffectiveRelativeWeight(assignmentIndex: number): string {
    let assignment = this.assignments[assignmentIndex];
    if (assignment === undefined) return "";
    if (this.isAssignmentDropped(assignment)) return "Dropped";

    let categoryAssignments = this.getAssignmentsByCategory(assignment.category, false);

    let weights = categoryAssignments.map((a) => a.weight)

    if (weights.includes(0)) return "";

    let sum = weights.reduce((a, b) => a + b, 0);

    let gcd = findGCD(weights);

    if (assignment.weight / gcd > 300 || sum / gcd > 300) return `${Math.round((assignment.weight / sum) * 10 * 100) / 10}%`;

    return `${assignment.weight / gcd}/${sum / gcd} (${Math.round((assignment.weight / sum) * 10 * 100) / 10}%)`;
  }

  public getEffectiveWeightInTotal(assignmentIndex: number): string {
    let assignment = this.assignments[assignmentIndex];
    if (this.isAssignmentDropped(assignment)) return "Dropped";

    let sumOfWeights = this.sumOfWeightsInCategory(assignment.category, false);

    if (this.getTotalWeight() == 0) return "";

    return String(Math.round((assignment.weight / sumOfWeights) * (assignment.category.weight / this.getTotalWeight()) * 100 * 10) / 10) + "%";
  }

  /**
   * 
   * @param useCalced if true, the see assignment is not included in the calculations
   * @returns true if the weights are valid, false otherwise. 
   */
  public validWeights(useCalced: boolean = false): boolean {
    let curTotalWeight = 0;

    let seeAssignment = this.getSeeAssignment();
    for (let category of this.categories) {
      if (useCalced && category.id == seeAssignment?.category.id && this.getAssignmentsByCategory(seeAssignment.category, false).length == 1) continue;
      curTotalWeight += category.weight;
      if (category.weight < 0 || category.weight > 100) {
        return false;
      }
    }

    if (curTotalWeight <= 0 || curTotalWeight > 100) {
      return false;
    }

    return true;
  }


  /**
   * @param category the category to calculate the sum of the weights of all assignments in the category
   * @param excludeSee if true, the see assignment is not included in the calculations (default is true)
   * @returns the sum of the weights of all assignments in the category, excluding the exempt assignments
   */
  public sumOfWeightsInCategory(category: Category, excludeSee: boolean = true): number {
    let categoryAssignments = this.getAssignmentsByCategory(category, false, excludeSee);
    let categoryAssignmentWeight = 0;

    for (let i = 0; i < categoryAssignments.length; i++) {
      let assignment = categoryAssignments[i];
      categoryAssignmentWeight += assignment.weight;
    }
    return categoryAssignmentWeight;
  }

  /**
   * Final grade percentage without see assignment
   * @returns the final grade percentage of the class, or SpecialGrade.INC if the class has an INC grade, or SpecialGrade.INVALID if the weights are invalid
   */
  public calculateGradePercentage(): number | SpecialGrade.INC | SpecialGrade.INVALID {
    if (!this.validWeights()) return SpecialGrade.INVALID;
    let totalGrade = 0;

    let calcedTotalWeight = this.getCalcedTotalWeight();

    for (let category of this.categories) {
      if (this.getAssignmentsByCategory(category).find((a) => !a.exempt && !a.see && a.grade == "INC_NO_CLASS_CREDIT")) return SpecialGrade.INC;

      let categoryAssignments = this.getAssignmentsByCategory(category, false, true);
      console.log(categoryAssignments, category);

      // if the category has no effective assignments (e.g., filled with only see and exempt assignments), skip it 
      if (categoryAssignments.length == 0) continue;

      let categoryGrade = 0;
      let categorySumOfWeights = 0;
      for (let i = 0; i < categoryAssignments.length; i++) {
        let assignment = categoryAssignments[i];

        categorySumOfWeights += assignment.weight;
        categoryGrade += gradeToPercent[assignment.grade] * (assignment.weight);
      }
      if (categoryGrade != 0 && calcedTotalWeight != 0) {
        totalGrade += (categoryGrade / categorySumOfWeights) * (category.weight / calcedTotalWeight)
      };
    }
    return totalGrade;
  }

  /**
   * @returns the total weight of all categories, excluding the weight of the see assignment's category if it is the only assignment in the category as the see assignment is not included in calculations (which is why the word calced is used)
   */
  public getCalcedTotalWeight(): number {
    let totalWeight = this.getTotalWeight();

    let seeAssignment = this.getSeeAssignment();
    if (seeAssignment && this.getAssignmentsByCategory(seeAssignment.category, false, true).length < 1) return totalWeight - seeAssignment.category.weight;
    return totalWeight;
  }

  public getTotalWeight() {
    let totalWeight = 0;
    for (let category of this.categories) {
      if (this.getAssignmentsByCategory(category, false).length == 0) continue;
      totalWeight += category.weight;
    }
    return totalWeight;
  }

  public static calculateHypoGradePercentage(assignments: Assignment[], drop: number): number | SpecialGrade.INC | SpecialGrade.INVALID {
    let arr = [...assignments].filter((a) => !(a.exempt || a.see));
    let categoryGrade = 0;
    if (arr.find((a) => a.grade == "INC_NO_CLASS_CREDIT")) return SpecialGrade.INC;
    arr = GradeManager.dropFromHypoArray(arr, drop);

    let categorySumOfWeights = 0;
    for (let i = 0; i < arr.length; i++) {
      let assignment = arr[i];
      categorySumOfWeights += assignment.weight;
      categoryGrade += gradeToPercent[assignment.grade] * assignment.weight;
    }
    if (categorySumOfWeights != 0) return categoryGrade / categorySumOfWeights;
    return 0;
  }

  public calculateCategoryGradePercentage(categoryId: number): number | SpecialGrade.INC | SpecialGrade.INVALID {
    let category = this.getCategoryById(categoryId);
    if (category === null) return SpecialGrade.INVALID;
    let categoryGrade = 0;
    if (this.getAssignmentsByCategory(category).find((a) => !a.see && !a.exempt && a.grade == "INC_NO_CLASS_CREDIT")) return SpecialGrade.INC;
    let categoryAssignments = this.getAssignmentsByCategory(category, false, true);

    let categorySumOfWeights = 0;
    for (let i = 0; i < categoryAssignments.length; i++) {
      let assignment = categoryAssignments[i];
      categorySumOfWeights += assignment.weight;
      categoryGrade += gradeToPercent[assignment.grade] * assignment.weight;
    }
    if (categorySumOfWeights != 0) return categoryGrade / categorySumOfWeights;
    return 0;
  }

  public addAssignment(assignment: Assignment): void {
    this.assignments.push(assignment);
  }

  public removeAssignment(assignment: Assignment): void {
    this.assignments = this.assignments.filter((a) => a !== assignment);
  }

  public addCategory(category: Category): void {
    this.categories.push(category);
  }

  public removeCategory(category: Category): void {
    this.categories = this.categories.filter((c) => c !== category);
  }

}
export class Category {
  public name: string;
  public weight: number;
  public id: number;
  public dropLowest: number;
  public static nextId = 0;

  public constructor(name: string, weight: number, dropLowest: number = 0) {
    this.name = name;
    this.weight = weight;
    this.id = Category.nextId++;
    this.dropLowest = dropLowest;
  }
}
export class Assignment {
  public name: string;
  private _grade: Grade;
  private _percent: GradePercentage;
  public category: Category;
  public weight: number
  public id: number;
  public see: boolean = false;
  public exempt: boolean;
  public static nextId = 0;

  public constructor(name: string, grade: Grade, category: Category, weight: number, exempt: boolean = false) {
    this.name = name;
    this._grade = grade;
    this._percent = gradeToPercent[grade];
    this.category = category;
    this.weight = weight;
    this.id = Category.nextId++;
    this.exempt = exempt;
  }

  set grade(grade: Grade) {
    this._grade = grade;
    this._percent = gradeToPercent[grade];
  }

  get grade(): Grade {
    return this._grade;
  }

  set percent(percent: GradePercentage) {
    this._percent = percent;
    this._grade = convertPercentCutoffToGrade(percent);
  }

  get percent(): GradePercentage {
    return this._percent;
  }
}