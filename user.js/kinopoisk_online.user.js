// ==UserScript==
// @name         Кинопоиск kodik online
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Добавляет плеер на кинопоиск
// @author       ДугДуг
// @run-at       document-end
// @match        https://www.kinopoisk.ru/series/*
// @match        https://www.kinopoisk.ru/film/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kinopoisk.ru
// @grant        window.onurlchange
// @grant        GM_addStyle
// @grant        GM_addElement
// ==/UserScript==

var url;
var kodik = false;
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

	`);

if (!window.onurlchange) {
	window.addEventListener('urlchange', _ => setTimeout(player(null, "svetacdn"), 500))
}


function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}


function player(e, n)
{
	let link = location.pathname.split('/').filter(Boolean)
	let url = `//dygdyg.github.io/DygDygWEB/svetacdn.htm?kinopoiskID=${link[1]}&TitleTab=${document.title}`
	let localurl = url;
	if(!n){

		//if(kodik) localurl = `${url}&loadserv=kodik`
		//kodik = !kodik
	}else{
		localurl = `${url}&loadserv=` + n
	}
	if(e){
		if(e.ctrlKey || e.shiftKey){
			//window.open(localurl, '_blank');
			return
		}
	}
	document.body.querySelector("#player_body")?.remove()
	const elp = document.createElement('div')
	elp.id = "player_body"
	// document.body.prepend(elp)
	document.querySelector('[data-test-id="encyclopedic-table"]').parentNode.parentNode.before(elp)

	var player_btn_click = GM_addElement(elp, 'div', {
		id:'player_btn_click'
	});

	var new_tab_btn = GM_addElement(player_btn_click, 'a', {
		id:'new_tab_btn',
		class: 'player_btn',
		textContent: '📑',
		href: localurl,
		target: "_blank",
	});

	var kodik_btn = GM_addElement(player_btn_click, 'div', {
		id:'kodik_btn',
		class: 'player_btn',
		textContent: 'kodik'
	}).onclick = function() {
		console.log("kodik")
		player(null, 'kodik')
	};

	var svetacdn_btn = GM_addElement(player_btn_click, 'div', {
		id:'svetacdn_btn',
		class: 'player_btn',
		textContent: 'svetacdn'
	}).onclick = function() {
		player(null, 'svetacdn')
		console.log("svetacdn")
	};

	var linktodo_btn = GM_addElement(player_btn_click, 'div', {
		id:'linktodo_btn',
		class: 'player_btn',
		textContent: 'linktodo'
	}).onclick = function() {
		player(null, 'linktodo')
		console.log("linktodo")
	};

	GM_addElement(elp, 'iframe', {
  		src: localurl,
		id: "player_",
		allow: "fullscreen",
		frameBorder: 0
	});
}

// <iframe src="//kodik.info/seria/1232576/170dcd1341b517c464cfdc345ba71432/720p" width="607" height="360" frameborder="0" AllowFullScreen allow="autoplay *; fullscreen *"></iframe>