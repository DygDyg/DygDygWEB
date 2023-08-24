// ==UserScript==
// @name            PoEAutoTrade
// @namespace       http://tampermonkey.net/
// @version         0.3
// @description     Производит автопокупку товара в "живом поиске" на PoE Trade
// @author          ДугДуг
// @match           https://ru.pathofexile.com/*
// @match           https://www.pathofexile.com/*
// @icon            https://www.google.com/s2/favicons?sz=128&domain=pathofexile.com
// @updateURL       https://dygdyg.github.io/DygDygWEB/user.js/PoEAutoTrade.user.js
// @downloadURL     https://dygdyg.github.io/DygDygWEB/user.js/PoEAutoTrade.user.js
// @run-at          context-menu
// @grant           none
// ==/UserScript==

document.TradeTimers = document.TradeTimers || null


function tims() {
    // console.log("...")
    if (document.querySelector('.btn.search-btn').disabled == true) {
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
if (document.TradeTimers == null) {
    console.log("start")
    if (document.querySelector('.multiselect__input').value) {
        document.querySelector("title").text = "🟢 " + document.querySelector('.multiselect__input').value
    } else {
       document.querySelector("title").text = "🟢 Торговля"
    }
    document.TradeTimers = setInterval(tims, 1000)
} else {
    console.log("stop")
    if (document.querySelector('.multiselect__input').value) {
        // document.querySelector("title").text = "ss"
        document.querySelector("title").text = "🔴 " + document.querySelector('.multiselect__input')
    } else {
        document.querySelector("title").text = "🔴 Торговля"
    }
    clearInterval(document.TradeTimers)
    document.TradeTimers = null
}