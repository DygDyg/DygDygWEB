// ==UserScript==
// @name          YouTube No AutoPlay
// @author        Пироженка
// @version       14.04.19 v1
// @icon		  https://s.ytimg.com/yts/img/favicon-vfl8qSV2F.ico
// @include       /^https?://(.*)youtube\.com/.*$/
// @require       https://code.jquery.com/jquery-3.3.1.min.js
// @grant         none
// @run-at		  document-start
// ==/UserScript==

"use strict";
let $ = window.$;

function a (ytPlayer) {
	ytPlayer.stopVideo();
}

async function main() {
	while (!$('#movie_player').length) {
		await new Promise(r => setTimeout(r, 200));
	}

	let ytPlayer = document.getElementById('movie_player') || document.getElementsByClassName("html5-video-player")[0];
	if (ytPlayer) {
		ytPlayer.stopVideo();
		a(ytPlayer);
		console.log('first load');
	}
	window.removeEventListener("yt-navigate-finish", main, true);
};
//main();
window.addEventListener("yt-navigate-finish", main, true);
