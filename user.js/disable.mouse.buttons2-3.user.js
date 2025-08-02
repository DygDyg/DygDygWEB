// ==UserScript==
// @name         Отключить вперёд-назад
// @namespace    http://tampermonkey.net/
// @version      2025-05-05
// @description  try to take over the world!
// @author       ДугДуг
// @run-at       document-start
// @match        ://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.io
// @grant        none
// ==/UserScript==


document.addEventListener('mouseup', e => {
  if (typeof e === 'object' && [3, 4].includes(e.button)) {
    e.preventDefault();
  }
});

document.addEventListener('mousedown', e => {
  if (typeof e === 'object' && [3, 4].includes(e.button)) {
    e.preventDefault();
  }
});