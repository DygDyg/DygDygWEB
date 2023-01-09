// ==UserScript==
// @noframes
// @manespace		Google extantion
// @name			Google Favicons by Пироженка
// @description		Добавляет иконки сайтов в результатах поиска Google.
// @include			https://www.google.*/search*
// @include			/^https?:\/\/.*?google.*/search*?/
// @version			1.1
// @grant			GM_addStyle
// @icon			https://i.imgur.com/ezjWmEO.png
// @author			Пироженка (Discord: Пироженка#0007)
// @updateURL		https://script.artiromiur.ru/google_favicon.user.js
// @downloadURL		https://script.artiromiur.ru/google_favicon.user.js
// ==/UserScript==

GM_addStyle(` #res img.favicon { border: none; margin-left: -20px; position: absolute; margin-top: 4px; z-index: 9; background: transparent; } `);

const FAVICON_GRABBER = '//www.google.com/s2/favicons?domain=', QUERY = 'div.srg div.g div.rc div.r > a[ping]:not(.fl)';

function add_favicons_to(links) {
	for (let i = 0; i < links.length; i++) {
		let url = new URL(links[i].href);
		if (url.origin == "null") continue;
		let img = document.createElement('IMG');
		img.src = FAVICON_GRABBER + url.hostname;
		img.width = '16';
		img.height = '16';
		img.className = 'favicon';
		console.log(links[i].firstChild);
		links[i].insertBefore(img, links[i].firstChild);
	}
}
add_favicons_to(document.querySelectorAll(QUERY));
