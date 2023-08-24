// ==UserScript==
// @name            PoEAutoTrade
// @namespace       http://tampermonkey.net/
// @version         0.3
// @description     try to take over the world!
// @author          ДугДуг
// @match           https://ru.pathofexile.com/*
// @match           https://www.pathofexile.com/*
// @icon            https://www.google.com/s2/favicons?sz=128&domain=pathofexile.com
// @updateURL       https://dygdyg.github.io/DygDygWEB/user.js/PoEAutoTrade.user.js
// @downloadURL     https://dygdyg.github.io/DygDygWEB/user.js/PoEAutoTrade.user.js
// @run-at          context-menu
// @grant           none
// ==/UserScript==

var TradeTimers = TradeTimers || null

function tims() {
    // console.log("...")
    if (document.querySelector('.btn.search-btn').disabled==true) {
        if (document.querySelector('.resultset')) {
            if (document.querySelector('.resultset').querySelector('.row')) {
                if (document.querySelector('.resultset').querySelector('.row').querySelector('.load-more-btn') == null) {
                    if (document.querySelector('.resultset').querySelector('.row').querySelector('.btn-default')) {
                        document.querySelector('.resultset').querySelector('.row').querySelector('.btn-default').click()
                    }
                    document.querySelector('.resultset').querySelector('.row').remove()
                } else {
                    document.querySelector('.resultset').querySelector('.row').querySelector('.load-more-btn').click()
                }
            }
        }
    }
}
if(TradeTimers == null) {
    console.log("start")
    if(document.querySelector('.multiselect__input').value) {document.title = "🟢 "+document.querySelector('.multiselect__input').value }else{ document.title = "🟢 Торговля"}
    TradeTimers = setInterval(tims, 1000)
}else{
    console.log("stop")
	if(document.querySelector('.multiselect__input').value) {document.title = "🔴 "+document.querySelector('.multiselect__input')}else{ document.title = "🔴 Торговля"}
    clearInterval(TradeTimers)
    TradeTimers = null
}