// ==UserScript==
// @name         hamsterkombatgame clicker
// @namespace    http://tampermonkey.net/
// @version      2024-08-13
// @description  try to take over the world!
// @author       ДугДуг
// @match        https://hamsterkombatgame.io/ru/clicker*
// @match        https://hamsterkombatgame.io/clicker*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hamsterkombatgame.io
// @grant        GM_registerMenuCommand
// ==/UserScript==

function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

(function () {

	var clk_tm = 10
	var click_active = false
	var click_event

	setCookie("i18n_redirected", "ru", "2026-08-02T23:42:25.000Z")

	GM_registerMenuCommand("Кикать хомяка", function () {
		console.log("click_active", true)
		click_active = true
	});

	console.log("start")
	var check_timer = setInterval(() => {
		if (typeof click_event != "function" && document.querySelector("#__nuxt > div > main > div.content.is-main.has-glow > div.user-tap.has-gap > div.user-tap-row > div")) {
			console.log("button ok")
			click_event = document.querySelector("#__nuxt > div > main > div.content.is-main.has-glow > div.user-tap.has-gap > div.user-tap-row > div").onclick = () => {
				console.log("click_active", true)
				click_active = true
			}
		}

		if (document.querySelector("#__nuxt > div > div.bottom-sheet.open > div.bottom-sheet-inner > div.bottom-sheet-scroll > div > button > div")) {
			document.querySelector("#__nuxt > div > div.bottom-sheet.open > div.bottom-sheet-inner > div.bottom-sheet-scroll > div > button").click();
		}

		if (document.querySelector("#__nuxt > div > div.bottom-sheet.open > div.bottom-sheet-inner > div.bottom-sheet-scroll > div > button")) {
			if (document.querySelector("#__nuxt > div > div.bottom-sheet.open > div.bottom-sheet-inner > div.bottom-sheet-scroll > div > button").disabled == false) {
				document.querySelector("#__nuxt > div > div.bottom-sheet.open > div.bottom-sheet-inner > div.bottom-sheet-scroll > div > button").click();
			}
		}
		if (!document.querySelector("#__nuxt > div > main > div.content.is-main.has-glow > div.user-tap.has-gap > div.user-tap-row > div > p")) return

		var coins = document.querySelector("#__nuxt > div > main > div.content.is-main.has-glow > div.user-tap.has-gap > div.user-tap-row > div > p").textContent.split("/")
		if (Number(coins[0]) == Number(coins[1]) || click_active) {
			click_active = false
			var click_timer = setInterval(() => {
				coins = document.querySelector("#__nuxt > div > main > div.content.is-main.has-glow > div.user-tap.has-gap > div.user-tap-row > div > p").textContent.split("/")
				if (Number(coins[0]) >= 100) {
					document.querySelector("#__nuxt > div > main > div.content.is-main.has-glow > div.user-tap.has-gap > button").dispatchEvent(new PointerEvent('pointerup'));
				} else {
					clearInterval(click_timer)
				}
			}, clk_tm);
		}
	}, 1000);
})();