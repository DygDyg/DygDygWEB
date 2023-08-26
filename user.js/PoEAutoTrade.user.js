// ==UserScript==
// @name            PoEAutoTrade
// @namespace       http://tampermonkey.net/
// @version         0.6
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
document.datalists = document.datalists || []
document.col = 0



/* document.querySelector('.results').setAttribute('id', 'test')
let observer = new MutationObserver(mutationRecords => {



    document.datalists[document.datalists.length] = document.querySelector('.resultset').querySelector('.row.tft-enhanced.showName')
});



observer.observe(test, {
    childList: true,
    subtree: false,
    characterDataOldValue: true
}); */


/* 
function tims1() {
    // console.log("...")
    if (document.querySelector('.btn.search-btn').disabled == true) {
        let res = document.querySelectorAll('.resultset')
        if (document.querySelectorAll('.resultset').length > 0) {
            if (document.querySelectorAll('.resultset').length > 1) {
                // document.querySelector('.resultset').remove()
            }
            if (document.querySelector('.resultset').querySelector('.row.tft-enhanced.showName')) {
                if (document.querySelector('.resultset').querySelector('.row.tft-enhanced.showName').querySelector('.load-more-btn') == null) {
                    if (document.querySelector('.resultset').querySelector('.row.tft-enhanced.showName').querySelector('.btn-default')) {
                        document.querySelector('.resultset').querySelector('.row.tft-enhanced.showName').querySelector('.btn-default').click()
                    }
                    document.querySelector('.resultset').querySelector('.row.tft-enhanced.showName').remove()
                    // document.querySelector('.resultset').remove()
                    document.col += 1
                    console.log(document.col)
                } else {
                    // document.querySelector('.resultset').querySelector('.row').querySelector('.load-more-btn').click()t
                }
            }
        }
    }
} */

function tims() {
    if (document.querySelectorAll('.btn.btn-xs.btn-default.direct-btn:not(.sold)').length > 0) {

        document.querySelector('.btn.btn-xs.btn-default.direct-btn:not(.sold)').click()
        // document.querySelector('.btn.btn-xs.btn-default.direct-btn:not(.sold)').parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove()
        document.querySelector('.btn.btn-xs.btn-default.direct-btn:not(.sold)').parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.backgroundColor = '#3f00ff42';
        document.querySelector('.btn.btn-xs.btn-default.direct-btn:not(.sold)').classList.add("sold");
    }
    if (document.querySelectorAll('.btn.btn-xs.btn-default.dropdown-toggle.dropdown-toggle-split:not(.sold)').length > 0) {
        document.querySelector('.btn.btn-xs.btn-default.dropdown-toggle.dropdown-toggle-split:not(.sold)').parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.backgroundColor = 'rgb(255 0 224 / 26%)';
        document.querySelector('.btn.btn-xs.btn-default.dropdown-toggle.dropdown-toggle-split:not(.sold)').classList.add("sold");
        // document.querySelector('.btn.btn-xs.btn-default.direct-btn:not(.sold)').parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove()
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