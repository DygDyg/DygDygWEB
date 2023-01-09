//alert($('a[href^="//wowhead.com/item="]').length);
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://raider.io/*
// @grant        none
// @require       https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require       https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js
// @require		  file:///D:/Users/dygdy/Desktop/malina/user.js/ru.raider.io.user.js
// ==/UserScript==
//alert($('a[href^="//wowhead.com/item="]').attr("href", "http://www.google.com/"));

var linkRewriter = function (a, b) {
    $('a[href*="' + a + '"]').each(function () {
        $(this).attr('href', $(this).attr('href').replace(a, b));
    });
};

linkRewriter('//wowhead.com/', '//ru.wowhead.com/');
linkRewriter('https://worldofwarcraft.com/en-gb/', 'https://worldofwarcraft.com/ru-ru/');
