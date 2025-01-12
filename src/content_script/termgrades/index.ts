/**
 *
 * @copyright Copyright (c) 2023-2025 Anvay Mathur <contact@anvaymathur.com>
 *
 * @author Anvay Mathur <contact@anvaymathur.com>
 *
 * @license GNU AGPL-3.0-only
 *
 * SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { writable } from "svelte/store";
import { Class, ClassManager } from "../../models/classes";
import { listOfGrades, type Grade } from "../../models/grades";
import Cumulative from "./Cumulative.svelte";
import TermGPAs from "./TermGPAs.svelte";

if (document.getElementById("pes-cum") || document.getElementById("pes-gpa")) {
  document.getElementById("pes-cum")?.remove();
  document.getElementById("pes-gpa")?.remove();
}



let txt = (document.querySelector(".tabs > .selected > a > span")?.textContent ?? "").split(" ")[0];



let curSem = "";

let justSet = false;

console.log("Hello!");

function getClasses(doc: Document, term: string): Record<string, Class> {
  let classes: Record<string, Class> = {};

  let rows = doc.querySelectorAll("table.grid tr");

  for (let row of rows) {
    console.log(row, curSem);
    if (justSet) {
      justSet = false;
      continue;
    }
    if (["S1", "S2"].includes(row.textContent?.trim() ?? "")) {
      curSem = row.textContent?.trim().toLowerCase() ?? "";
      justSet = true;
      continue;
    }

    let name = row.children[0].textContent?.trim();

    if (name == null) continue;

    let grade = row.children[1].textContent?.trim();

    if (grade == "INC") grade = "INC_NO_CLASS_CREDIT";
    if (grade == null) continue;
    if (!listOfGrades.includes(grade as Grade)) continue;

    let credits = parseFloat(row.children[4].textContent?.trim() ?? "0");
    console.log(credits);

    if (!classes[name]) {
      let obj: { s1: Grade | null, s2: Grade | null } = { s1: null, s2: null };
      obj[curSem as "s1" | "s2"] = grade as Grade;
      classes[name] = new Class(name, obj, credits, term);
    } else {
      classes[name].grade[curSem as "s1" | "s2"] = grade as Grade;
    }
  }

  return classes;
}

let hideGPA = writable(true);

let classes = getClasses(document, txt);

let termManager = new ClassManager(Object.values(classes));

console.log(termManager);

const target = document.createElement("div");
document
  .querySelector(".box-round")
  ?.insertBefore(target, document.querySelector(".box-round > table"));

new TermGPAs({ target: target as Element, props: { term: txt, classManager: termManager, hideGPA } });

let otherDocs = document.querySelectorAll("ul.tabs > li:not(.selected) > a");

let fetches: Promise<string>[] = [];

for (let doc of otherDocs) {
  fetches.push(fetch((doc as HTMLAnchorElement).href).then(res => res.text()));
}


let arr: Class[] = Object.values(classes);

let homeFetch = fetch("https://powerschool.sas.edu.sg/guardian/home.html");

Promise.allSettled(fetches).then(async (res) => {
  let home = await (await homeFetch).text();
  let homeDoc = new DOMParser().parseFromString(home, "text/html");


  for (let r of res) {
    if (r.status !== "fulfilled") {
      alert("An error occurred while fetching the grades for calculating cumulative GPA. Please reload. More details in console.");
      console.error(r.reason);
      return;
    };
    let doc = new DOMParser().parseFromString(r.value, "text/html");
    let classes = getClasses(doc, doc.querySelector(".tabs > .selected > a > span")?.textContent?.split(" ")[0] ?? "");

    arr.push(...Object.values(classes));
  }

  // get from home doc, if someone is midway thru semester 1 they can check here

  const rows = homeDoc.querySelectorAll(".linkDescList.grid > tbody > tr.center:not(.th2)");


  console.log("Found rows", rows);
  let homeClasses: Class[] = [];
  for (const row of rows) {
    const nameEle = row.querySelector("td:nth-child(2)");
    const s1GradeEle = row.querySelector("td:nth-child(3) > a") as HTMLAnchorElement;
    const s2GradeEle = row.querySelector("td:nth-child(4) > a") as HTMLAnchorElement;

    console.log("cur", row, nameEle, s1GradeEle, s2GradeEle);

    if (!nameEle || !(s1GradeEle || s2GradeEle)) {
      continue;
    }

    const name = nameEle.firstChild?.textContent?.trim();
    if (!name) {
      continue;
    };

    let s1Grade: string | null = s1GradeEle?.textContent?.trim()!;

    if (s1Grade?.endsWith(")")) continue;

    if (s1Grade == "INC") s1Grade = "INC_NO_CLASS_CREDIT";
    if (!listOfGrades.includes(s1Grade as Grade)) s1Grade = null;

    let s2Grade: string | null = s2GradeEle?.textContent?.trim()!;

    if (s2Grade?.endsWith(")")) continue;

    if (s2Grade == "INC") s2Grade = "INC_NO_CLASS_CREDIT";
    if (!listOfGrades.includes(s2Grade as Grade)) s2Grade = null;

    if (!s1Grade && !s2Grade) {
      continue;
    };

    homeClasses.push(new Class(name, { s1: s1Grade as Grade, s2: s2Grade as Grade }, null, "Now"));
  }

  let allSame = true;
  for (let homeClass of homeClasses) {
    if (!arr.find(c => c.name === homeClass.name)) {
      allSame = false;
    }
  }

  if (!allSame) {
    arr.push(...homeClasses);
  } else {
    for (let homeClass of homeClasses) {
      let cor = arr.findIndex(c => c.name === homeClass.name);
      arr[cor].grade = homeClass.grade;
    }
  }

  let cumManager = new ClassManager(arr);

  const target = document.createElement("div");
  document
    .querySelector("#content-main")
    ?.insertBefore(target, document.querySelector("ul.tabs"));

  new Cumulative({ target: target as Element, props: { classManager: cumManager, hideGPA } });

});

