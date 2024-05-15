// ==UserScript==
// @name         Кинопоиск kodik online
// @namespace    Кинопоиск kodik online
// @version      1.0
// @description  Плагин добавляет плеер для просмотра фильмов на кинопоиск
// @author       ДугДуг
// @match        https://www.kinopoisk.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @require 	 https://dygdyg.github.io/DygDygWEB/user.js/DygDyg.libs.js
// @updateURL 	https://dygdyg.github.io/DygDygWEB/user.js/kinopoisk_online.user.js
// @downloadURL https://dygdyg.github.io/DygDygWEB/user.js/kinopoisk_online.user.js
// @grant        window.onurlchange
// @grant        GM_addStyle
// @grant        GM_addElement
// ==/UserScript==

var url;
var kodik = false;
// var dev = true;
GM_addStyle(`

#banner-kino-kodik {
	width: 32px;
	height: 128px;
	position: fixed;
	top: -60px;
	left: 6px;
	z-index: 1;
	cursor: pointer;
	transition: all 0.2s;
}

#banner-kino-kodik:hover{
	top: -50px;
}

#player_ {
    z-index: 9999999;
    width: 850px;
    aspect-ratio: 16/9;
	border-radius: 15px;
}



#player_btn_click {
    width: 850px;
    z-index: 10;
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: nowrap;
}

.player_btn {
z-index: 13;
    width: 82px;
    height: 32px;
    background-color: #dddddd;
    margin: 3px;
    text-align: center;
    cursor: pointer;
    padding: 5px;
    border-radius: 30px;
	text-decoration: none;
	transition: scale 0.2s ease-in-out;
	font-family: Graphik Kinopoisk LC Web, Tahoma, Arial, Verdana, sans-serif;
    font-weight: 700;
    line-height: 30px;
    letter-spacing: -.5px;
}

.player_btn:hover {
    background-color: #4f4f4f;
	transition: scale 0.2s ease-in-out;
    scale: 110%;
}

#exit_btn
{
	 width: 32px;
	background-color: #5b3333;;
}

#exit_btn:hover {
    background-color: #715252;
}

#new_tab_btn
{
	 width: 32px;
	// background-color: #5b3333;
}
.active_btn {
    border: solid;
	padding: 2px;
}

	`);
let old_url = ""
if (!window.onurlchange) {
	// player_button()
	// "urlchange"
	window.addEventListener('urlchange', function (e) {
		debug.log("url ", old_url, e.url)
		if (old_url != e.url) {
			setTimeout(video_player("kinobox"), 0);
			debug.log(e.url)
			old_url = e.url
		}
	})
}

function video_player(n) {
	if (document.querySelector('[data-test-id="encyclopedic-table"]') == null) return
	let link = location.pathname.split('/').filter(Boolean)
	let url = `//dygdyg.github.io/DygDygWEB/svetacdn.htm?menu_default=menu_button&kinopoiskID=${link[1]}&TitleTab=${document.title}`
	// `//dygdyg.github.io/DygDygWEB/svetacdn.htm?menu_default=menu_button`
	let localurl = url;
	localurl = `${url}&loadserv=` + n

	document.querySelector("#player_body")?.remove()
	const elp = document.createElement('div')
	elp.id = "player_body"
	// document.body.prepend(elp)
	document.querySelector('[data-test-id="encyclopedic-table"]').parentNode.parentNode.before(elp)


	var player_btn_click = GM_addElement(elp, 'div', {
		id: 'player_btn_click'
	})

	GM_addElement(elp, 'iframe', {
		src: localurl,
		id: "player_",
		allow: "fullscreen",
		frameBorder: 0
	});

	var new_tab_btn = GM_addElement(player_btn_click, 'a', {
		id: 'new_tab_btn',
		class: 'player_btn',
		textContent: '📑',
		title: 'Открыть видео в новой вкладке',
		href: localurl,
		target: "_blank",
	})

	var kodik_btn = GM_addElement(player_btn_click, 'div', {
		id: 'kodik_btn',
		class: 'player_btn',
		textContent: 'kodik',
		title: 'kodik',
	})
	kodik_btn.onclick = function () {
		debug.log("kodik")
		video_player('kodik')
	};

	var kinobox_btn = GM_addElement(player_btn_click, 'div', {
		id: 'kinobox_btn',
		class: 'player_btn',
		textContent: 'kinobox',
		title: 'kinobox',
	})
	kinobox_btn.onclick = function () {
		debug.log("kinobox")
		video_player('kinobox')
	};

	var svetacdn_btn = GM_addElement(player_btn_click, 'div', {
		id: 'svetacdn_btn',
		class: 'player_btn',
		textContent: 'svetacdn',
		title: 'svetacdn',
	})
	svetacdn_btn.onclick = function () {
		video_player('svetacdn')
		debug.log("svetacdn")
	};

	var linktodo_btn = GM_addElement(player_btn_click, 'div', {
		id: 'linktodo_btn',
		class: 'player_btn',
		textContent: 'linktodo',
		title: 'linktodo',
	})
	linktodo_btn.onclick = function () {
		video_player('linktodo')
		debug.log("linktodo")
	};
	switch (n) {
		case "kodik":
			kodik_btn.classList.add("active_btn");
			break;
		case "svetacdn":
			svetacdn_btn.classList.add("active_btn");
			break;
		case "linktodo":
			linktodo_btn.classList.add("active_btn");
			break;
		case "kinobox":
			kinobox_btn.classList.add("active_btn");
			break;

		default:
			break;
	}

}

///////////////////////////////////////////////////////////////////////////////////////////////////////

