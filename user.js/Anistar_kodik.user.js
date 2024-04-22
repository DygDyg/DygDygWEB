// ==UserScript==
// @name         Anistar kodik pleer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       ДугДуг
// @include       /^https?://(.*).astar.bz/.*$/
// @include       /^https?://(.*).online-star(.*)\.org/.*$/
// @include       /^https?://(.*)anistar(.*)\.org/.*$/
// @updateURL       https://dygdyg.github.io/DygDygWEB/user.js/Anistar_kodik.user.js
// @downloadURL     https://dygdyg.github.io/DygDygWEB/user.js/Anistar_kodik.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://v3.astar.bz/
// @grant        GM_addStyle
// ==/UserScript==


spavn()

function spavn(title1) {
    if (!document.body.querySelector('[itemprop="name"]')) return
    _switch = true
    title1 = document.body.querySelector('[itemprop="name"]').textContent.split('/')

    document.body.querySelector('[itemprop="name"]').addEventListener("click", (event) => {
        _switch = !_switch

        title = _switch ? title1[1] : title1[0]

        link = encodeURI(`//dygdyg.github.io/DygDygWEB/kodik.htm?title=${title}`)
        console.log(link)
        console.log("fdfdf", _switch)
        kodik_url.href = link
        kodik_url.title = title
        document.body.querySelector('#kodik').src = link
    });


    kodik_url = document.createElement("a");
    kodik = document.createElement("div");
    // title1 = title1 || document.body.querySelector('[itemprop="name"]').textContent.split('/')[1]
    // if(_switch) title = title1[1] || title1[0]

    title = title1[1]
    console.log("fdfdf", _switch)
    console.log(title)

    // var link = `//kodik.info/find-player?title=${title}&camrip=false`
    link = encodeURI(`//dygdyg.github.io/DygDygWEB/kodik.htm?title=${title}`)
    console.log(link)
    kodik.innerHTML = `<iframe id="kodik" src="${link}" frameborder="0" allow="fullscreen"></iframe>`;
    kodik_url.textContent = "Открыть на сервере"
    kodik_url.href = link
    kodik_url.title = title
    document.body.querySelector('.vide_be').prepend(kodik);
    document.body.querySelector('.vide_be').prepend(kodik_url);

};

GM_addStyle(`
.news_header h1 {
	cursor: pointer;
}
.news_header h1:hover {
	color: #4a0074;
}
.news a {
	font-size: 22px;
	color: #1368d1
	}
.news a:hover {
	color: #4a0074;
	}

#kodik {
    width: 100%;
    aspect-ratio: 16/9;
}
`);

