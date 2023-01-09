// ==UserScript==
// @noframes
// @connect      *
// @name         Aliexpress
// @version      2.2.2
// @description  Подсчёт времени с дня заказа
// @author       Пироженка
// @include      /^https?://(.*)aliexpress\.com/.*$/
// @exclude      *feedback.aliexpress.com*
// @exclude      *gcx.aliexpress.com*
// @icon         https://ae01.alicdn.com/images/eng/wholesale/icon/aliexpress.ico
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://raw.githubusercontent.com/js-cookie/js-cookie/master/src/js.cookie.js
// @require      https://momentjs.com/downloads/moment-with-locales.js
// @require      https://momentjs.com/downloads/moment-timezone-with-data-1970-2030.js
// @updateURL    https://script.artiromiur.ru/aliexpress.user.js
// @downloadURL  https://script.artiromiur.ru/aliexpress.user.js
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_log
// ==/UserScript==

var $ = window.jQuery;
var Cookies = window.Cookies;
var moment = window.moment;

let st = [
	[" год", " года", " лет"],
	[" месяц", " месяца", " месяцев"],
	[" день", " дня", " дней"],
	[" час", " часа ", " часов "],
	[" минута", " минуты", " минут"]
];

GM_addStyle('.gallery-mode .list-item:hover .item h3{height:0} .gallery-mode .list-item:hover .info-more{display:none}');

function pl(a, c) {
	var b = c[0],
		d = c[1],
		e = c[2];
	return a + (1 == a % 10 && 11 != a % 100 ? b : 2 <= a % 10 && 4 >= a % 10 && (10 > a % 100 || 20 <= a % 100) ? d : e) + " "
};

function passed(a, c, b, d, e) {
	let f = new Date(a, c - 1, b, d, e, 0, 0),
		g = new Date;

	for (c = 0; ; c++) {
		a = new Date(f.getFullYear(), f.getMonth() + 2, 0, d, e, 0, 0);
		a.getDate() > b && a.setDate(b);
		if (a > g) break;
		f = a
	}
	b = g - f;
	d = b % 864E5 / 36E5 | 0;
	e = (b % 864E5 / 6E4 | 0) % 60;
	b = Math.floor(b / 864E5);
	a = Math.floor(c / 12);
	return "<span class='info-subtitle'>Прошло: </span>" + [a, c % 12, b, d, e].reduce(function (a, b, c) {
		return b ? a + pl(b, st[c]) : a
	}, "");
};

function param(o) {
	return Object.keys(o).map(function (k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(o[k])
	}).join('&');
};

function reloadPage() {
	setTimeout(function () {
		location.reload();
	}, 5 * 60 * 1000);
};

function proshlo_vremeni() {
	setTimeout(proshlo_vremeni, 60 * 1000);
	$('button[button_action="logisticsTracking"]').text('Отслеживание');
	$('button[button_action="confirmOrderReceived"]').text('Подтвердить получение');

	let chto = $('.order-item-wraper');
	// $('p[id^="time-"]').remove();
	for (let i = 0; i < chto.length; i++) {
		let a = $(chto[i]).find('.order-info .second-row .info-body');
		let b = $(chto[i]).find('.order-info');
		let as = new Date(a.text());
		let c = as.getFullYear() + '-' + ('0' + (as.getMonth() + 1)).slice(-2) + '-' + ('0' + as.getDate()).slice(-2) + ' ' + ('0' + as.getHours()).slice(-2) + ':' + ('0' + as.getMinutes()).slice(-2);

		let buyTime = moment(a.text(), "HH:mm MMM DD YYYY").utcOffset(moment.tz("Asia/Hong_Kong").utcOffset()).format("DD.MM.YYYY HH:mm");
		let myTime = moment(buyTime, "DD.MM.YYYY HH:mm").utcOffset(120)

		if ($(`#time-${i}`).length) {
			$(`#time-${i}`).html(passed(myTime.year(), (myTime.month() + 1), myTime.date(), myTime.hour(), myTime.minute()));
		}
		else {
			b.append(`<p id='time-${i}' class='second-row'>` + passed(myTime.year(), (myTime.month() + 1), myTime.date(), myTime.hour(), myTime.minute()) + "</p>");
		}
	}
};

function get_res(track, block, callback) {
	GM_xmlhttpRequest({
		method: "GET",
		url: 'https://ilogisticsaddress.aliexpress.com/ajax_logistics_track.htm?' + param({
			orderId: track,
			callback: 'callback'
		}),
		onload: function (res) {
			let out = 'Не могу получить номер';
			if (res.readyState === 4 && res.status === 200) {
				if (typeof res.responseText == 'string') {
					let result = res.responseText.trim();
					result = JSON.parse(result.substring(9, result.length - 1));
					out = "<a href='//track24.ru/?code=" + result.tracking[0].mailNo + "' target='_blank'>" + result.tracking[0].mailNo + "</a>"
				}
				callback(out, track);
			}
		},
		onerror: function (res) {
			GM_log('GM_xmlhttpRequest error');
		}
	});
};

function get_track_number() {
	let chto = $('.order-item-wraper');
	for (let i = 0; i < chto.length; i++) {
		let block = $(chto[i]).find('.order-info'); // куда вставить
		let track = $(chto[i]).find('.order-info .first-row .info-body').text(); // номер
		get_res(track, block, function (callback, trackNR) {
			block.append("<p class='second-row'><span class='info-subtitle'>Номер отслеживания: </span>" + callback + "</p>");
		});
	}
};

setInterval(function () {
	let a = document.querySelector('.ui-window a.close-layer');
	if (a !== null && a !== undefined) a.click();
}, 1000);

function updateCookie() {
	return;
	let a = Cookies.get();
	Object.keys(a).map((o, i) => {
		let k = Cookies.get(o)
		if (k) Cookies.set(o, k, { expires: 365, path: '/' });
	});
	setTimeout(updateCookie, 5000);
};

$(document).ready(function () {
	//reloadPage();
	updateCookie();
	proshlo_vremeni();
	get_track_number();
}, true);




