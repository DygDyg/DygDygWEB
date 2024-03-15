// ==UserScript==
// @name         Кинопоиск kodik online
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  try to take over the world!
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
// setTimeout(player(null, "svetacdn"), 500);
if (!window.onurlchange) {
    // window.addEventListener('urlchange', _ => setTimeout(updateBanner, 250))
	window.addEventListener('urlchange', _ => setTimeout(player(null, "svetacdn"), 500))
}

function removeBanner() {
    document.getElementById('banner-kino-kodik')?.remove()
	// document.getElementById('player_body')?.remove()
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function createBanner(id, type) {
    removeBanner()

    const el = document.createElement('a')
    const nextData = document.querySelector('#__next script')?.textContent
    const link = location.pathname.split('/').filter(Boolean)
    el.id = 'banner-kino-kodik'
    el.innerHTML = '<svg viewBox="0 0 128 512" xmlns="http://www.w3.org/2000/svg"><path fill="blue" d="M128,0L0,0L0,512L64,480L128,512L128,0Z" /><path fill="white" transform="matrix(1,0,0,1,-64,0)" d="M168,382C168,360.057 149.943,342 128,342C106.057,342 88,360.057 88,382C88,403.943 106.057,422 128,422L165,422L168,410L162,410L160,414L152,414C162.065,406.452 168,394.581 168,382ZM96,382C96,364.445 110.445,350 128,350C145.555,350 160,364.445 160,382C160,399.555 145.555,414 128,414C110.445,414 96,399.555 96,382ZM128,393C132.415,393 136,396.585 136,401C136,405.415 132.415,409 128,409C123.585,409 120,405.415 120,401C120,396.585 123.585,393 128,393ZM144,383C148.415,383 152,386.585 152,391C152,395.415 148.415,399 144,399C139.585,399 136,395.415 136,391C136,386.585 139.585,383 144,383ZM112,383C116.415,383 120,386.585 120,391C120,395.415 116.415,399 112,399C107.585,399 104,395.415 104,391C104,386.585 107.585,383 112,383ZM144,365C148.415,365 152,368.585 152,373C152,377.415 148.415,381 144,381C139.585,381 136,377.415 136,373C136,368.585 139.585,365 144,365ZM112,365C116.415,365 120,368.585 120,373C120,377.415 116.415,381 112,381C107.585,381 104,377.415 104,373C104,368.585 107.585,365 112,365ZM128,355C132.415,355 136,358.585 136,363C136,367.415 132.415,371 128,371C123.585,371 120,367.415 120,363C120,358.585 123.585,355 128,355Z" /></svg>';
    // el.href = `//dygdyg.github.io/DygDygWEB/svetacdn.htm?kinopoiskID=${link[1]}`
	// el.href = `//dygdyg.github.io/DygDygWEB/svetacdn.htm?kinopoiskID=${link[1]}`
    document.body.appendChild(el)
	// player()
	url = `//dygdyg.github.io/DygDygWEB/svetacdn.htm?kinopoiskID=${link[1]}&TitleTab=${document.title}`
	el.addEventListener("click", player);
}

function updateBanner() {
    const link = location.pathname.split('/').filter(Boolean)
	console.log(link[0], link[1])

    if (!['film', 'series'].includes(link[0]) || !link[1]) {
        removeBanner()
    } else {
        createBanner(link[1], link[0])
    }
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
	})

	var new_tab_btn = GM_addElement(player_btn_click, 'a', {
		id:'new_tab_btn',
		class: 'player_btn',
		textContent: '📑',
		href: localurl,
		target: "_blank",
	})
	/*.onclick = function() {
		window.open(localurl, '_blank');
		console.log("remove")
	};*/

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