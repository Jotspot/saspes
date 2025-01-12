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

import Home from "./Home.svelte";

import { gt } from "semver";


if (document.getElementById("pes-box")) {
  document.getElementById("pes-box")?.remove();


}
console.log("rendering");
const target = document.createElement("div");
document
  .querySelector("#container")
  ?.insertBefore(target, document.querySelector("#footer"));

new Home({ target: target as Element });


fetch("https://anvaymathur.com/saspes/curversion.txt").then((res) => res.text()).then((text) => {
  if (gt(text, SAS_PES_VERSION.split(" ")[0])) {
    alert(`A new version of SAS PES is available. The latest version is ${text}. Your version is ${SAS_PES_VERSION}. 
      
Update by deleting the extension and installing the latest version from the Chrome Web Store:

https://chromewebstore.google.com/detail/sas-powerschool-enhanceme/ehnkngeidilnoabcjjimkomcggndbhnk

Or, you can wait a few days for the update to be automatically installed.

If you have installed manually via ZIP, delete the extension and use these instructions to install the latest version:
https://anvaymathur.com/saspes/custom.html`);
  }
});
