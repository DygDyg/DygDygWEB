// ==UserScript==
// @name         Yandex ADB test
// @description	 Яндекс антиреклама
// @namespace    http://tampermonkey.net
// @author       DygDyg
// @match        *yandex.ru/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant 		 GM_info
// ==/UserScript==

GM_addStyle(`
.container.container__banner.container__line,
.direct.direct_type_between.i-bem.direct_js_inited,
.incut.incut_type_direct.incut_position_page-fixed.i-bem.incut_js_inited.incut_inserted_yes,
.feed__item-wrap._size_big,
div#u-main-10
{
display: none !important;
}
`);