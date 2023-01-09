// ==UserScript==
// @name         Дополнение VRChat
// @version      6.5
// @description  Дополнение VRChat
// @manespace    VRChat extantion
// @author       Пироженка (Discord: Пироженка#0007)
// @include      /^https?:\/\/.*?vrchat.*?\..*?(home|launch).*?/
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js
// @require      https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js
// @require      https://raw.githubusercontent.com/Romzik85/humane-js/master/humane.min.js

// @require      https://cdnjs.cloudflare.com/ajax/libs/q.js/1.4.1/q.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/spark-md5/2.0.2/spark-md5.min.js

// @resource     private_image https://assets.vrchat.com/www/images/default_private_image.png
// @resource     nocover_image https://i.ytimg.com/vi/SYMsUCDBfVE/maxresdefault.jpg
// @require      https://momentjs.com/downloads/moment-with-locales.js
// @require      https://momentjs.com/downloads/moment-timezone-with-data.js
// @icon         https://assets.vrchat.com/www/images/loading.gif
// @updateURL    http://script.artiromiur.ru/vrchat.user.js
// @downloadURL  http://script.artiromiur.ru/vrchat.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @connect      *
// ==/UserScript==


//#region
GM_addStyle(`.btn[name='favorite-user'] {
	white-space: unset
}

.friend-group {
	display: flex;
	flex-wrap: wrap
}

.friend-group>:first-child, .friend-group>div:last-of-type {
	width: 100%
}

.friend-group>div:not(:last-of-type) {
	min-width: 50%
}

.friend-row a {
	display: flex
}

.friend-row a .friend-img {
	margin-right: unset
}

.humane {
	font-family: Helvetica Neue, Helvetica, san-serif;
	letter-spacing: 2px;
	top: 20px;
	left: 30%;
	right: 30%;
	color: #000;
	padding: 20px;
	text-align: center;
	transform: translateY(-1000px);
	background: linear-gradient(top, rgba(255, 255, 255, 0.3) 0%, #1fd1ed 100%) no-repeat;
	background: -webkit-linear-gradient(top, rgba(255, 255, 255, 0.3) 0%, #1fd1ed 100%) no-repeat;
	filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);
	background-color: #1fd1ed;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgb(0, 0, 0);
	position: fixed;
	z-index: 100000;
	transition: all 0.6s ease-in-out;
	font-size: 16px
}

.humane ul {
	list-style: none;
	margin: 0;
	padding: 0
}

.humane-animate {
	opacity: 1;
	transform: translateY(0)
}

.noselect {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none
}

.pointer {
	cursor: pointer
}

div.WorldsWithFriends .friend-row li {
	list-style-type: none!important
}

div.WorldsWithFriends .friend-row a {
	display: unset
}

div.WorldsWithFriends h3 {
	text-transform: unset
}

h2, h3 {
	text-transform: unset!important
}

div.WorldsWithFriends div.template_world div.col-md-4 {
	flex: unset!important;
	max-width: unset!important
}

div.WorldsWithFriends div.template_world div.friend-caption.text-success {
	min-width: max-content;
	padding: .5rem!important;
	font-size: 20px!important
}

.Lone_wrld_badge {
	float: right;
	color: lightgreen;
	font-weight: bold
}

a.Lone_room_people_counter {
	position: absolute;
	right: 170px;
	top: 126px
}

a.Lone_room_private_counter {
	right: 268px;
	top: 198px
}

a.Lone_room_createdBy {
	vertical-align: top;
	font-size: 15px;
	top: 44px;
	position: absolute;
	right: 208px
}

a.Lone_room_createdBy_btn {
	vertical-align: top;
	font-size: 10px;
	background: #1a2026 linear-gradient(180deg, #1a2026, #1a2026) repeat-x
}

div.Lone_private_room a.Lone_room_createdBy, div.Lone_private_room a.Lone_room_createdBy_btn, a.Lone_room_createdBy[CreatedBy='NoOwner'], a.Lone_room_createdBy_btn[CreatedBy='NoOwner'] {
	display: none
}

img.blur {
	-webkit-filter: blur(5px);
	filter: blur(5px)
}

img.Lone_wrld_img {
	width: 150px;
	height: 115px;
	opacity: 0.3
}

.Lone_world_room_people:hover {
	color: white!important;
	-webkit-filter: blur(1px);
	filter: blur(1px)
}

div.container-fluid div.bg-gradient-secondary.leftbar:first-child {
	width: fit-content;
	width: -moz-fit-content
}

.legend {
	color: #FF0000
}

.trust_legend {
	color: yellow
}

.trust_veteran {
	color: #8143E6
}

.trust_trusted {
	color: #FF7B42
}

.trust_known {
	color: #2BCF5C
}

.trust_intermediate {
	color: #1778FF
}

.trust_basic {
	color: #1778FF
}

.troll, .probable_troll {
	color: #808080
}

img.offline {
	border: 1.25rem #404c58 solid;
	border-radius: .25rem;
}

img.online {
	border: 1.25rem #1fd1ed solid;
	border-radius: .25rem;
}

img.profile-thumbnail {
	padding: 0;
	border-radius: 0.25rem;
	border: 1.25rem #1fd1ed solid
}

.tooltip-inner {
	font: 17px monospace;
	padding: 10px
}

.longer-w {
	max-width: 250px!important;
	width: 250px;
}

.tooltip.show {
	opacity: 1
}

#Lone_BlockLoad_Data, #Lone_BlockLoad_DataYou {
	font: 16px monospace;
}

.close-users-btn {
	cursor: pointer;
	position: absolute;
	top: 10px;
	right: 10px;
	width: 20px;
	height: 20px;
	line-height: 20px;
	color: #404c58;
	text-shadow: 0px 1px 3px #758492;
	font-weight: 900;
}
.close-users-btn:hover {
	top: 11px;
}

.my-class-test1 {
	display: inline-block;
	font-size: 12px;
	width: 19%;
	letter-spacing: 0;
	text-align: center;
	padding: 5px;
	height: auto;
	white-space: nowrap;
	margin-bottom: 5px
}

.my-class-test1>img {
	display: block;
	width: 100%;
	height: 100%!important;
	margin: auto;
	/* border-radius: 50% 100% 50% 100%;*/
	transition: all .2s;
	padding: 2px;
	background: black;
	box-shadow: 0 0 3px 1px black, inset 0 0 0px 2px black
}

.my-class-test1>img:hover {
	transform: scale(2);
	border-radius: 50%
}

.my-friend1 {
	color: #00ff00
}

.my-friend1>img {
	background: #00ff00;
	box-shadow: 0 0 3px 1px #00ff00, inset 0 0 0px 2px #00ff00
}
.my-friend1-txt {
	color: black;
}
.green_btn {
	color: green;
}
.red_btn {
	color: red;
}
.css-1o8x0bc .friend-container {
	width: 100%!important;
}
.css-1o8x0bc {
	height: 98%!important;
	padding-right: 15px;
	padding-left: 15px;
}
.form-check-input {
	position: relative;
	margin-top: .25rem;
	margin-left: 0;
}
label {
	margin-bottom:0;
}
.css-13ar6hp .btn-group.col.mb-2 > * {
	width: 100%!important;
}

.card-box {
	position: fixed;
	bottom: 5px;
	right: 5px;
	width: 18rem;
	z-index: 9;
	transition: all 0.4s ease-in-out;
	transform: translateX(20rem);
	box-shadow: 0 0 1rem rgb(33, 33, 33);
}
.card-animate {
	transform: translateX(0)!important;
}
.close {
	outline: none!important;
}

.user-img-hover {
	transition: all .2s;
}

.user-img-hover:hover {
	transform: scale(1.1);
	border-radius: 2%;
	box-shadow: 0 0 10px 2px #577a9c;
}
.my-border {
	border-color: #1fc6e0 !important;
	border: 2px solid;
}
`);
//#endregion

var DEBUG = false;
var userDetails, favorites;
var ctrlDown = false, shiftDown = false, ctrlKey = 17, shiftKey = 16, zKey = 90;

var $ = window.jQuery;
var MSG = window.humane;
MSG.timeout = 5000;
var usersInInstances = {};
var instances = [];

const StatusColor = { "join me": "#1fd1ed", "active": "lightgreen", "busy": "darkred" };

const defVal = ['friendsMenu'];
for (let i = 0; i < defVal.length; i++) { const val = GM_getValue(defVal[i], null); if (val == null) { GM_setValue(defVal[i], false) } }
const FAVORITE_TYPES = ['friend', 'world', 'avatar'];
const DEFAULT_FAVORITE_TAG_NAMES = { friend: { group_0: 'Группа 1:', group_1: 'Группа 2:', group_2: 'Группа 3:' }, world: { worlds0: 'Список 1', worlds2: 'Список 2', worlds3: 'Список 3', worlds4: 'Список 4' }, avatar: { avatars1: 'Аватар' } };
const MAX_FAVORITES_COUNT_PER_GROUP = 32, MAX_ITEMS_COUNT = 100;
const limitAwait = 5; // в секундах

function log() {
	if (DEBUG) {
		let args = Array.prototype.slice.call(arguments);
		args.unshift(`${GM_info.script.name} |`);
		console.log.apply(console, args);
	}
};

function CookieExtend() {
	var url = window.location.href;
	if (url.match("\/login")) return;
	var auth = window.Cookies.get('auth');
	var apiKey = window.Cookies.get('apiKey');
	if (auth) window.Cookies.set('auth', auth, { expires: 7 });
	if (apiKey) window.Cookies.set('apiKey', apiKey, { expires: 7 });
};
window.onbeforeunload = CookieExtend;

function RunOnce(element, className, callback) {
	if (!$(element).length || $(element).hasClass(className) || $(element).hasClass("ignore_element")) return;
	$(element).addClass(className);
	callback.apply(this, [element, className]);
};

function delay(t) {
	return new Promise(r => setTimeout(r, t));
};

$(document).on('click', function () {
	$('[title]').tooltip('hide');
});
$(document).mousemove(function () {
	clearTimeout($.data(this, 'mouseMoveTimer'));
	$.data(this, 'mouseMoveTimer', setTimeout(function () {
		$('[title]').tooltip('update');
	}, 50));
});
$(document).on('click', '.close-users-btn', () => {
	MSG.remove();
});
$(document).on('click', `button div.visible:contains('Load More Avatars')`, async function () {
	await delay(2000);
	myAvatars();
});

function HomePage() {
	getSocket();
	CookieExtend();
	friendsSkcrollEvent();
	setInterval(() => {
		RunOnce("div.leftbar:eq(0)", "isDone", HomePageFunc);
		RunOnce("div.home-content h3:contains('My Avatars'):eq(0)", "my-avatars", myAvatars);
		RunOnce("h3.subheader:contains('steam_'):eq(0)", "SteamIDLinkToPage", SteamIDLinkToPage);
		RunOnce("div.home-content > .row > .col-12 > .css-bj8sxz > .search-container:eq(0)", "avatarPage", avatarPage);
		RunOnce("div.home-content .SocialMediaShareButton--twitter:eq(0)", "UsersInWolrlds", UsersInWolrlds);
		RunOnce("div.home-content div.center-block.text-center > h2:contains('Hello there,'):eq(0)", "MainHome", MainHome);
		RunOnce("div.animated.fadeIn.card > h3.card-header:contains('Password')", "UpdateStatus", UpdateStatus);
		RunOnce("div.leftbar nav", "navCol", navCol);
		RunOnce("div.card.card-body.bg-primary:hidden", "UserStatus", UserStatus);
		RunOnce("a.API_sdk_url", "sdkVersion", sdkVersion);
		RunOnce("div.friend-container .css-5dd2dx > div.usercard > div:nth-child(2)", 'pechal', function (e) { /* $(e).remove(); */ });
	}, 250);
};

function HomePageFunc() {

	waitForElement('body', function (el) {
		el.append($('<div>', { class: 'card-box' }));
	});

	waitForElement('.leftbar > nav > div', function (el) {
		$('.leftbar').addClass('w-100');
		if (GM_getValue('friendsMenu', null)) {
			el.append($('<a>', { title: 'only for DygDyg', text: ' Friends', class: 'btn btn-secondary text-left', href: '/home/friends' }).prepend($('<span>', { 'aria-hidden': true, class: "fa fa-user-friends" })));
		}
	});

	waitForElement('.friend-container h3', function (el) {
		el.contents().filter(function () { return this.nodeType == 3; }).first().replaceWith('Friends [CTRL+Z] ');
	});

	waitForElement('div.container-fluid div.bg-gradient-secondary.leftbar', function (el) {
		el.find('nav a').tooltip({ placement: 'left' });
	});

	waitForElement('.rightbar', function (el) {
		el.prepend($('<a>', { target: '_blank', href: GM_info.script.updateURL, text: `Ext. by Пироженка v${GM_info.script.version}`, style: 'color:#1fd1ed;margin-top:-25px;position:absolute;right:60px' }));
	});

	waitForElement('.friend-container input', function (el) {
		el.attr('placeholder', 'Введи ник друга/подруги').addClass('form-control');
		el.on('click', function (e) { $(e.target).select(); });
	});
};

function navCol(el) {
	$(el).addClass('col');
	$(el).find('div.w-100.btn-group-vertical').removeClass('btn-group-lg').addClass('btn-group-md');
	$('.css-13ar6hp .btn-group').addClass('col mb-2');
};

function SteamIDLinkToPage(element) {
	$(element).html("<a target='_blank' style='color:white;' href='//steamcommunity.com/profiles/" + $(element).html().substring(6) + "'>" + $(element).html() + "</a>");
};

async function MainHome() {
	log('MainHome()');
	let el = $("div.home-content > div");
	el.html('');
	el.append(`<div class="row"> <div class="col"> <h3>Меня Заблокировали/Замутили/Скрыли/Показали.</h3> <button type="button" class="btn btn-primary" id="Lone_BlockLoad"> <div class="visible">Посмотреть</div> <div class="invisible" style="margin-top: -1.25em;"><span aria-hidden="true" class="fa fa-spinner fa-spin"></span></div> </button> <div id="Lone_BlockLoad_Data" class="mt-2 card-group"></div> </div> </div>`)
	el.append(`<div class="row"> <div class="col"> <h3>Я Заблокировал(а)/Замутил(а)/Скрыл(а)/Показал(а).</h3> <button type="button" class="btn btn-primary" id="Lone_BlockLoadYou"> <div class="visible">Посмотреть</div> <div class="invisible" style="margin-top: -1.25em;"><span aria-hidden="true" class="fa fa-spinner fa-spin"></span></div> </button> <div id="Lone_BlockLoad_DataYou" class="mt-2 card-group"></div> </div> </div>`);
	//el.append(`<div class="row"> <div class="col"> <h3>Мои фавориты.</h3> <div id="fav_data" class="mt-2 card-group"></div> </div> </div>`); //<button type="button" class="btn btn-primary" id="favorites">Показать</button>

	$("#Lone_BlockLoad").click(async function () {

		$(this).prop('disabled', true);
		$("#Lone_BlockLoad_Data").html("загрузка...");
		$(this).find('div').toggleClass('visible').toggleClass('invisible');

		const req = await fetch("/api/1/auth/user/playermoderated");

		if (!req.ok) {
			$("#Lone_BlockLoad_Data").html("fetch error");
			$(this).prop('disabled', false);
			$(this).find('div').toggleClass('visible').toggleClass('invisible');
			return;
		}

		const json = await req.json();
		if (json.error) {
			MSG.log(json.error.message);
			return;
		}

		let tab = ['tab-mute-me-piu-piu', 'tab-block-me-piu-piu', 'tab-hide-me-piu-piu', 'tab-show-me-piu-piu'];
		let m = $('<div>', { class: 'tab-pane active', id: tab[0].slice(4), role: "tabpanel", 'aria-labelledby': tab[0] });
		let b = $('<div>', { class: 'tab-pane', id: tab[1].slice(4), role: "tabpanel", 'aria-labelledby': tab[1] });
		let h = $('<div>', { class: 'tab-pane', id: tab[2].slice(4), role: "tabpanel", 'aria-labelledby': tab[2] });
		let s = $('<div>', { class: 'tab-pane', id: tab[3].slice(4), role: "tabpanel", 'aria-labelledby': tab[3] });

		$("#Lone_BlockLoad_Data").html("");

		const users = {}, usersSorted = [];
		for (let i = 0; i < json.length; i++) {
			const tmp = json[i];
			const id = tmp.sourceUserId;
			if (users[id] === undefined) {
				users[id] = { mute: false, block: false, hideAvatar: false, showAvatar: false, timestamp: tmp.created, name: tmp.sourceDisplayName }
			}
			switch (tmp.type) {
				case 'block': users[id].block = true; break;
				case 'mute': users[id].mute = true; break;
				case 'hideAvatar': users[id].hideAvatar = true; break;
				case 'showAvatar': users[id].showAvatar = true; break;
			}
		}
		for (let key in users) {
			if (users.hasOwnProperty(key)) {
				const usr = users[key];
				if (!(usr.mute === false && usr.block === false && usr.hideAvatar === false && usr.showAvatar === false)) {
					usersSorted.push({ id: key, name: usr.name, mute: usr.mute, block: usr.block, hideAvatar: usr.hideAvatar, showAvatar: usr.showAvatar, timestamp: moment(usr.timestamp).utc().format('DD.MM.YY HH:mm') })
				}
			}
		}
		usersSorted.reverse();
		var blockCount = 0, muteCount = 0, hideCount = 0, showCount = 0;
		for (let j = 0; j < usersSorted.length; j++) {
			const user = usersSorted[j];
			if (user.mute) {
				muteCount++;
				m.append(`<div class='w-100'>${user.timestamp} <a target='_blank' style='color:#1fd1ed;' href='/home/user/${user.id}'>${user.name}</a></div>`)
			}
			else if (user.block) {
				blockCount++;
				b.append(`<div class='w-100'>${user.timestamp} <a target='_blank' style='color:#1fd1ed;' href='/home/user/${user.id}'>${user.name}</a></div>`)
			}
			else if (user.hideAvatar) {
				hideCount++;
				h.append(`<div class='w-100'>${user.timestamp} <a target='_blank' style='color:#1fd1ed;' href='/home/user/${user.id}'>${user.name}</a></div>`);
			}
			else if (user.showAvatar) {
				showCount++;
				s.append(`<div class='w-100'>${user.timestamp} <a target='_blank' style='color:#1fd1ed;' href='/home/user/${user.id}'>${user.name}</a></div>`)
			}
		};

		$("#Lone_BlockLoad_Data").html($('<div>', {
			class: 'card', html: [
				$('<div>', { class: "card-header" }).append($('<ul>', {
					class: "nav nav-tabs card-header-tabs", role: "tablist", html: [
						$('<li>', { class: 'nav-item active', html: [$('<a>', { text: `Mute (${muteCount})`, 'data-toggle': "tab", class: 'nav-link active', id: tab[0], href: `#${tab[0].slice(4)}`, role: 'tab', 'aria-controls': tab[0].slice(4), 'aria-selected': true })] }),
						$('<li>', { class: 'nav-item', html: [$('<a>', { text: `Block (${blockCount})`, 'data-toggle': "tab", class: 'nav-link', id: tab[1], href: `#${tab[1].slice(4)}`, role: 'tab', 'aria-controls': tab[1].slice(4), 'aria-selected': false })] }),
						$('<li>', { class: 'nav-item', html: [$('<a>', { text: `Hide (${hideCount})`, 'data-toggle': "tab", class: 'nav-link', id: tab[2], href: `#${tab[2].slice(4)}`, role: 'tab', 'aria-controls': tab[2].slice(4), 'aria-selected': false })] }),
						$('<li>', { class: 'nav-item', html: [$('<a>', { text: `Show (${showCount})`, 'data-toggle': "tab", class: 'nav-link', id: tab[3], href: `#${tab[3].slice(4)}`, role: 'tab', 'aria-controls': tab[3].slice(4), 'aria-selected': false })] })
					]
				})),
				$('<div>', { class: "card-body" }).append($('<div>', { class: 'tab-content w-100', html: [m, b, h, s] }))
			]
		}));

		$(this).prop('disabled', false);
		$(this).find('div').toggleClass('visible').toggleClass('invisible');
	});

	$("#Lone_BlockLoadYou").click(async function () {

		$(this).prop('disabled', true);
		$("#Lone_BlockLoad_DataYou").html("загрузка...");
		$(this).find('div').toggleClass('visible').toggleClass('invisible');

		const req = await fetch("/api/1/auth/user/playermoderations");

		if (!req.ok) {
			$("#Lone_BlockLoad_DataYou").html("fetch error");
			$(this).prop('disabled', false);
			$(this).find('div').toggleClass('visible').toggleClass('invisible');
			return;
		}

		const json = await req.json();
		if (json.error) {
			MSG.log(json.error.message);
			return;
		}

		let tab = ['tab-mute-to-me-piu-piu', 'tab-block-to-me-piu-piu', 'tab-hide-to-me-piu-piu', 'tab-show-to-me-piu-piu'];
		let m = $('<div>', { class: 'tab-pane active', id: tab[0].slice(4), role: "tabpanel", 'aria-labelledby': tab[0] });
		let b = $('<div>', { class: 'tab-pane', id: tab[1].slice(4), role: "tabpanel", 'aria-labelledby': tab[1] });
		let h = $('<div>', { class: 'tab-pane', id: tab[2].slice(4), role: "tabpanel", 'aria-labelledby': tab[2] });
		let s = $('<div>', { class: 'tab-pane', id: tab[3].slice(4), role: "tabpanel", 'aria-labelledby': tab[3] });

		$("#Lone_BlockLoad_DataYou").html("");

		const users = {}, usersSorted = [];
		for (let i = 0; i < json.length; i++) {
			const tmp = json[i];
			const id = tmp.targetUserId;
			if (users[id] === undefined) {
				users[id] = { mute: false, block: false, hideAvatar: false, showAvatar: false, timestamp: tmp.created, name: tmp.targetDisplayName }
			}
			switch (tmp.type) {
				case 'block': users[id].block = true; break;
				case 'mute': users[id].mute = true; break;
				case 'hideAvatar': users[id].hideAvatar = true; break;
				case 'showAvatar': users[id].showAvatar = true; break;
			}
		}
		for (let key in users) {
			if (users.hasOwnProperty(key)) {
				const usr = users[key];
				if (!(usr.mute === false && usr.block === false && usr.hideAvatar === false && usr.showAvatar === false)) {
					usersSorted.push({ id: key, name: usr.name, mute: usr.mute, block: usr.block, hideAvatar: usr.hideAvatar, showAvatar: usr.showAvatar, timestamp: moment(usr.timestamp).utc().format('DD.MM.YY HH:mm') })
				}
			}
		}
		usersSorted.reverse();
		var blockCount = 0, muteCount = 0, hideCount = 0, showCount = 0;

		for (let j = 0; j < usersSorted.length; j++) {
			const user = usersSorted[j];
			if (user.mute) {
				muteCount++;
				m.append($('<div>', {
					class: 'w-100', id: `mute-${j}`, html: [
						$('<span>', { text: user.timestamp }),
						$('<button>', { type: 'button', class: 'mx-2 my-1 btn btn-primary btn-sm moderationsBtn', text: 'Удалить' }).on('click', () => { unplayermoderate(user.id, j, 'mute', tab[0]) }),
						$('<a>', { target: '_blank', style: 'color:#1fd1ed;', href: `/home/user/${user.id}`, text: user.name })
					]
				}));
			}
			else if (user.block) {
				blockCount++;
				b.append($('<div>', {
					class: 'w-100', id: `block-${j}`, html: [
						$('<span>', { text: user.timestamp }),
						$('<button>', { type: 'button', class: 'mx-2 my-1 btn btn-primary btn-sm moderationsBtn', text: 'Удалить' }).on('click', () => { unplayermoderate(user.id, j, 'block', tab[1]) }),
						$('<a>', { target: '_blank', style: 'color:#1fd1ed;', href: `/home/user/${user.id}`, text: user.name }),
					]
				}));
			}
			else if (user.hideAvatar) {
				hideCount++;
				h.append($('<div>', {
					class: 'w-100', id: `hideAvatar-${j}`, html: [
						$('<span>', { text: user.timestamp }),
						$('<button>', { type: 'button', class: 'mx-2 my-1 btn btn-primary btn-sm moderationsBtn', text: 'Удалить' }).on('click', () => { unplayermoderate(user.id, j, 'hideAvatar', tab[2]) }),
						$('<a>', { target: '_blank', style: 'color:#1fd1ed;', href: `/home/user/${user.id}`, text: user.name })
					]
				}));
			}
			else if (user.showAvatar) {
				showCount++;
				s.append($('<div>', {
					class: 'w-100', id: `showAvatar-${j}`, html: [
						$('<span>', { text: user.timestamp }),
						$('<button>', { type: 'button', class: 'mx-2 my-1 btn btn-primary btn-sm moderationsBtn', text: 'Удалить' }).on('click', () => { unplayermoderate(user.id, j, 'showAvatar', tab[3]) }),
						$('<a>', { target: '_blank', style: 'color:#1fd1ed;', href: `/home/user/${user.id}`, text: user.name })
					]
				}));
			}
		};

		$("#Lone_BlockLoad_DataYou").html($('<div>', {
			class: 'card', html: [
				$('<div>', { class: "card-header" }).append($('<ul>', {
					class: "nav nav-tabs card-header-tabs", role: "tablist", html: [
						$('<li>', { class: 'nav-item active', html: [$('<a>', { text: `Mute (${muteCount})`, 'data-toggle': "tab", class: 'nav-link active', id: tab[0], href: `#${tab[0].slice(4)}`, role: 'tab', 'aria-controls': tab[0].slice(4), 'aria-selected': true })] }),
						$('<li>', { class: 'nav-item', html: [$('<a>', { text: `Block (${blockCount})`, 'data-toggle': "tab", class: 'nav-link', id: tab[1], href: `#${tab[1].slice(4)}`, role: 'tab', 'aria-controls': tab[1].slice(4), 'aria-selected': false })] }),
						$('<li>', { class: 'nav-item', html: [$('<a>', { text: `Hide (${hideCount})`, 'data-toggle': "tab", class: 'nav-link', id: tab[2], href: `#${tab[2].slice(4)}`, role: 'tab', 'aria-controls': tab[2].slice(4), 'aria-selected': false })] }),
						$('<li>', { class: 'nav-item', html: [$('<a>', { text: `Show (${showCount})`, 'data-toggle': "tab", class: 'nav-link', id: tab[3], href: `#${tab[3].slice(4)}`, role: 'tab', 'aria-controls': tab[3].slice(4), 'aria-selected': false })] })
					]
				})),
				$('<div>', { class: "card-body" }).append($('<div>', { class: 'tab-content w-100', html: [m, b, h, s] }))
			]
		}));

		$(this).prop('disabled', false);
		$(this).find('div').toggleClass('visible').toggleClass('invisible');
	});

	//#region
	/* await getFavorites().then(async res => {
		log(res);
		if (res.error) { $("#fav_data").html("Что-то пошло не так..."); return; }
		let tab = ['tab-world-piu-piu', 'tab-avatar-piu-piu', 'tab-friend-piu-piu'];
		let ul = $('<ul>', {
			class: "nav nav-tabs w-100 nav-justified", id: "myTab", role: "tablist", html: [
				$('<li>', { class: 'nav-item active', html: [$('<a>', { text: "World's ", 'data-toggle': "tab", class: 'nav-link active', id: tab[0], href: `#${tab[0].slice(4)}`, role: 'tab', 'aria-controls': tab[0].slice(4), 'aria-selected': true })] }),
				$('<li>', { class: 'nav-item', html: [$('<a>', { text: "Avatar's", 'data-toggle': "tab", class: 'nav-link', id: tab[1], href: `#${tab[1].slice(4)}`, role: 'tab', 'aria-controls': tab[1].slice(4), 'aria-selected': false })] }),
				$('<li>', { class: 'nav-item', html: [$('<a>', { text: "Friend's", 'data-toggle': "tab", class: 'nav-link', id: tab[2], href: `#${tab[2].slice(4)}`, role: 'tab', 'aria-controls': tab[2].slice(4), 'aria-selected': false })] })
			]
		});

		let w = $('<div>', { class: 'tab-pane active', id: tab[0].slice(4), role: "tabpanel", 'aria-labelledby': tab[0] });
		let a = $('<div>', { class: 'tab-pane', id: tab[1].slice(4), role: "tabpanel", 'aria-labelledby': tab[1] });
		let f = $('<div>', { class: 'tab-pane', id: tab[2].slice(4), role: "tabpanel", 'aria-labelledby': tab[2] });

		for (let type of Object.keys(res)) {
			res[type].map(async qwe => {
				switch (qwe.type) {
					case "world": {
						w.append($('<div>', { class: 'w-100 p-0 m-0', text: `${qwe.favoriteId}, ${qwe.data.name}` }));
						break;
					}
					case "avatar": {
						a.append($('<div>', { class: 'w-100 p-0 m-0', text: `${qwe.favoriteId}, ${qwe.data.name}` }));
						break;
					}
					case "friend": {
						f.append($('<div>', { class: 'w-100 p-0 m-0', html: [ $('<a>', { href: `/home/user/${qwe.data.id}`, text: qwe.data.displayName }) ] }));
						break;
					}
				}
			})
		}

		$("#fav_data").html(ul).append($('<div>', { class: 'tab-content w-100', html: [w, a, f] }));
	}); */
	//#endregion
}

async function UpdateStatus(element) {
	let authUser = await getUserDetails();
	//#region
	var styleElement = `<hr><div class="animated fadeIn card">
			<h3 class="card-header">Обновить статус</h3>
			<div class="card-body">
				<div>
					<div class="center-panel">
						<form>
							<div class="row">
								<div class="col-1" style="text-align: right;">
									<span class="fa fa-info fa-2x" ></span>
								</div>
								<div class="col-10">
									<div class="row">
										<input type="text" class="form-control" id="updateStatusInput" placeholder="${authUser.statusDescription}"></input>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-4 offset-8">
									<button class="btn btn-primary w-100" type="submit" id="updateStatus">Обновить</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>`;
	//#endregion
	$(styleElement).insertAfter($(element).parent());

	$("#updateStatus").on('click', (e) => {
		e.preventDefault();
		let inpt = $("#updateStatusInput").val();
		if (inpt == '' || !confirm("Обновить статус?")) return;

		fetch(`/api/1/users/${authUser.id}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ statusDescription: inpt })
		}).then(r => r.json()).then(json => {
			if (json.error)
				MSG.log(json.error.message);
			else {
				MSG.log([`Статус успешно обновлён`, ' ', inpt])
				authUser.statusDescription = inpt;
			}
		}).catch(err => {
			MSG.log(err.message);
		});
	});
};

async function getUserTagsName(tags) {
	let level = tags.indexOf("admin_moderator") > -1 ? 8 : tags.indexOf("system_troll") > -1 ? 7 : tags.indexOf("system_legend") > -1 ? 6 : tags.indexOf("system_trust_legend") > -1 ? 5 : tags.indexOf("system_trust_veteran") > -1 ? 4 : tags.indexOf("system_trust_trusted") > -1 ? 3 : tags.indexOf("system_trust_known") > -1 ? 2 : tags.indexOf("system_trust_basic") > -1 ? 1 : 0;
	switch (level) {
		case 0: return ['white', 'Visitor', level];
		case 1: return ['blue', 'New User', level];
		case 2: return ['green', 'User', level];
		case 3: return ['orange', 'Known User', level];
		case 4: return ['violet', 'Trusted User', level];
		case 5: return ['gold', 'Veteran', level];
		case 6: return ['darkred', 'Legend', level];
		case 7: return ['red', 'Troll', level];
		case 8: return ['red', 'Moderator', level];
	}
};

async function UserStatus(element) {
	var UserID = regexUnityID("usr", location.href);
	if (!UserID) return;

	var Status = ' <span id="LO_status" class="fa fa-circle"></span> <span id="LO_pastName"></span>';

	$("div.col-md-12 > h2:eq(0)").append(Status);

	fav('friend');

	let tab = ['tab-avt-piu-piu', 'tab-wrld-piu-piu'];
	let a = $('<div>', { class: 'tab-pane active', id: tab[0].slice(4), role: "tabpanel", 'aria-labelledby': tab[0] });

	_avt = {};
	let get_avt = await getAllAvatarsByUserID(UserID).then(async avatars => {
		let cardColA = $('<div>', { class: 'card-columns' });
		const fvID = [].concat(...(await getFavorites())['avatar'].map(favorite => favorite.favoriteId));
		avatars.map(avt => {
			let txt = fvID.includes(avt.id) ? ['Удалить', 'btn-primary', false] : ['В фавориты', 'btn-secondary', true];
			cardColA.append($('<div>', {
				class: 'card border-primary', html: [
					$('<img>', { class: 'card-img-top', src: avt.thumbnailImageUrl ? avt.thumbnailImageUrl : GM_getResourceURL("nocover_image") }).on('click', () => { window.open(avt.imageUrl); }),
					$('<div>', { class: 'card-body', html: [$('<p>', { class: "card-text", text: `Название: ${avt.name}` })] }),
					$('<div>', {
						class: 'card-footer', html: [
							$('<div>', {
								class: 'btn-group btn-block', role: 'group', html: [
									$('<button>', { type: 'button', class: `btn ${txt[1]} w-50`, text: txt[0], 'avt-id': avt.id }).on('click', () => { changeFavorites(avt.id, 'avatar'); }),
									$('<button>', { type: 'button', class: `btn ${txt[1]} w-50`, text: 'Одеть' }).on('click', () => { selectAvatar(avt.id); })
								]
							})
						]
					})
				]
			}));
		});
		_avt.count = avatars.length;
		_avt.data = cardColA;
		return _avt;
	});
	a.append(get_avt.data);

	let elementToAppend = $('.css-bh845z');
	if (_avt.count) {
		elementToAppend.append($('<div>', { id: 'uplBlk' }).append($('<div>', {
			class: 'card', html: [
				$('<div>', { class: "card-header" }).append($('<ul>', {
					class: "nav nav-tabs card-header-tabs", role: "tablist", html: [
						$('<li>', { class: 'nav-item active', html: [$('<a>', { text: `Аватары (${_avt.count})`, 'data-toggle': "tab", class: 'nav-link active', id: tab[0], href: `#${tab[0].slice(4)}`, role: 'tab', 'aria-controls': tab[0].slice(4), 'aria-selected': true })] }),
					]
				})),
				$('<div>', { class: "card-body" }).append($('<div>', { class: 'tab-content w-100', html: [a] }))
			]
		})));
	}

	fetch(`/api/1/users/${UserID}`).then(r => r.json()).then(async json => {
		$("#LO_status").css("color", StatusColor[json.status]);

		let trusted = await getUserTagsName(json.tags);
		let Tags = $.map(json.tags, function (a, i) {
			switch (a) {
				case 'system_avatar_access': return "<div class='d-flex'><span class='ml-auto'>Заливка аватаров</span></div>";
				case 'system_world_access': return "<div class='d-flex'><span class='ml-auto'>Заливка миров</span></div>";
				case 'system_feedback_access': return "<div class='d-flex'><span class='ml-auto'>Обратная связь</span></div>";
			}
		}).join('');
		Tags += $.map(json.tags, function (a, i) {
			switch (a) {
				case 'system_legend': return "<div class='d-flex'><span>(6/6)</span> <span class='legend ml-auto'>Легенда</span></div>";
				case 'system_trust_legend': return "<div class='d-flex' <span>(5/6)</span> <span class='trust_legend ml-auto'>Ветеран</span></div>";
				case 'system_trust_veteran': return "<div class='d-flex'><span>(4/6)</span> <span class='trust_veteran ml-auto'>Выдающийся</span></div>";
				case 'system_trust_trusted': return "<div class='d-flex'><span>(3/6)</span> <span class='trust_trusted ml-auto'>Знающий</span></div>";
				case 'system_trust_known': return "<div class='d-flex'><span>(2/6)</span> <span class='trust_known ml-auto'>Пользователь</span></div>";
				case 'system_trust_intermediate': return "<div class='d-flex'><span>(1/6)</span> <span class='trust_intermediate ml-auto'>Новичёк+</span></div>";
				case 'system_trust_basic': return "<div class='d-flex'><span>(1/6)</span> <span class='trust_basic ml-auto'>Новичёк</span></div>";
				case 'system_troll': return "<div class='d-flex'><span class='troll ml-auto'>Троль</span></div>";
				case 'system_probable_troll': return "<div class='d-flex'><span class='probable_troll ml-auto'>Троль???</span></div>";
			}
		}).join('');

		let conf = {
			clone: json.allowAvatarCopying == true ? ["green", "разрешено"] : ["red", "отклонено"],
			stl: json.tags.indexOf("show_social_rank") != -1 ? 'none' : trusted[2] > 2 ? 'line-through' : 'none'
		};

		let a = $("div.home-content div.col-md-12 > h3.subheader:eq(0)");
		a.append($('<span>', { class: 'fa fa-clone', title: `Клонирование аватара: ${conf.clone[1]}`, style: `color: ${conf.clone[0]}` }).tooltip({ placement: 'bottom' }));
		a.append($('<a>', { title: Tags, style: `color: ${trusted[0]}; text-decoration: ${conf.stl}; margin-left:5px;`, text: trusted[1] }).tooltip({ html: true, placement: 'bottom', template: '<div class="tooltip TTW" role="tooltip"><div class="arrow"></div><div class="tooltip-inner longer-w"></div></div>' }));

		let userCard = $('.home-content .usercard').eq(0);
		if (userCard.length) {
			userCard.prepend(`
			<div class='row'>
				<div class='mx-2 w-100'>
					<div class="form-group form-inline mb-0">
						<button class='btn btn-primary btn-sm' type="button" id="CheckAvatarOwner" title="Посмотреть создателя аватара.">Создатель?</button>
						<span class='mx-2 control-label' id="ShowAvatarOwner" style="display:none;"></span>
					</div>
				</div>
			</div>`);
			userCard.append();
		}

		$("#CheckAvatarOwner").tooltip().click(function (e) {
			let btn = e.target;
			$(btn).attr('disabled', true);
			$("#ShowAvatarOwner").css('display', 'block').html("Проверка...");
			let file = regexUnityID("file", json.currentAvatarImageUrl);
			if (file != null) {
				fetch(`/api/1/file/${file}`).then(r => r.json()).then(json => {
					if (json.error) {
						log(json.error.message);
						$("#ShowAvatarOwner").css("display", "block").html('Ошибка')
						return;
					}
					let rip = json.name.includes('Release');
					let isOwner = regexUnityID("usr", window.location.href) == json.ownerId ? (rip ? `<font style='color:green'>Является создателем аватара</font>` : `<font style='color:red'>Украден с помощью VRCheat</font>`) : (rip ? `<font style='color:red'>Не является создателем</font>. <a target='_blank' href='/home/user/${json.ownerId}'>Создатель.</a>` : `<font style='color:red'>Украден с помощью VRCheat </font><a target='_blank' href='/home/user/${json.ownerId}'>игроком</a>`);
					$("#ShowAvatarOwner").attr("title", rip ? json.name.split(' - ')[1] : '').tooltip().html(isOwner);
				}).catch(err => {
					log('ошибка проверки автора', err.message);
					$("#ShowAvatarOwner").css('display', 'block').html('Ошибка')
				});
			}
			else {
				$("#ShowAvatarOwner").attr("title", '').tooltip().html("Не могу определить...");
			}
		});

		if (json.last_login.length > 0) {
			window.moment.locale('ru');
			var last_login = window.moment.tz(json.last_login, 'UTC').format("DD.MM.YYYY, HH:mm:ss");
			var last_login_fromNow = window.moment.tz(json.last_login, 'UTC').fromNow();
			$("#LO_status").after("<span style='float:right;'>" + last_login + "</span>");
			$("div.home-content div.mb-4.row div.col-md-12 h3.subheader:eq(0)").append("<span style='float:right;' data-placement='left' title='Последний вход на сайт'>" + last_login_fromNow + "</span>");
		}

		let num = 777;
		if (json.location !== 'private' && json.location !== 'offline' && json.location !== '' && json.isFriend) {
			makeUserCardBlock(json, num);
		}

		if (json.location == "private" && json.location !== '' && json.isFriend) {
			makeUserCardBlock(json, num, true);
		}

	}).catch(err => {
		log(err);
		$(element).html("<a style='color:darkred;'><b>ERROR</b></a>");
		$("#LO_status").css("color", "black");
	});
};

function GetHrefParam(url, param) {
	var res = null;
	try {
		var qs = decodeURIComponent(url.split('?')[1]);
		var ar = qs.split('&');
		$.each(ar, function (a, b) {
			var kv = b.split('=');
			if (param === kv[0]) {
				res = kv[1];
				return false;
			}
		});
	} catch (e) { }
	return res;
};

async function selectAvatar(id) {
	const req = await fetch(`/api/1/avatars/${id}/select`, { method: 'PUT' });
	if (!req.ok) {
		MSG.log(req, 'Не удалось изменить аватар.<br>Неправильный ID аватара?<br>Приватные аватары недоступны!');
		return false;
	}
	const json = await req.json();

	if (json.currentAvatar == id) {
		$("img.img-thumbnail.rounded-circle:eq(0)").removeAttr("src").attr("src", json.currentAvatarThumbnailImageUrl);
		MSG.log('Аватар успешно изменён');
		return true;
	}
	return false;
};

function myAvatars() {
	let avatars = $('.home-content .col-12 > div:eq(0) .css-bj8sxz .search-container .col-12.col-md-8 a');
	for (let i = 0; i < avatars.length; i++) {
		const av = avatars[i];
		let ID = av.href.match(/\/([^/]*)$/)[1];
		let cls = $(av).parents('.search-container');

		if ($(cls).find('button.buttonIsComplette').length) continue;

		let BTN = $('<button>', { type: 'button', class: 'btn btn-primary w-50 avtrBtnSave buttonIsComplette', text: cls.hasClass('private') ? 'Сделать публичным' : 'Сделать приватным' });
		let BTN2 = $('<button>', { type: 'button', class: 'btn btn-primary mt-2 w-50', text: 'Одеть' }).on('click', () => { selectAvatar(ID) });
		$(av).parents('.col-12.col-md-8').append(BTN.on('click', async (e) => {
			let status;
			$('.avtrBtnSave').prop('disabled', true);
			if ($(e.target).parents('.search-container').hasClass('private')) {
				$(e.target).parent().find('span').remove();
				status = 'public';
			} else {
				$(e.target).parent().find('h4 a').append($('<span>', { text: ' ' }).append($('<span>', { class: 'fa fa-lock' })));
				status = 'private';
			}
			await fetch(`/api/1/avatars/${ID}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ releaseStatus: status })
			}).then(r => r.json()).then(json => {
				if (json.error) {
					MSG.log(json.error.message);
					return;
				}
				MSG.log('Статус успешно изменён!, на сайте обновится не сразу!!!');
				$(e.target).parents('.search-container').toggleClass('private').toggleClass('public');
				$(e.target).text($(e.target).parents('.search-container').hasClass('private') ? 'Сделать публичным' : 'Сделать приватным')
			}).catch(err => {
				MSG.log(err.message);
			});
			setTimeout(() => { $('.avtrBtnSave').prop('disabled', false); }, 500);
		})).append($('<br>')).append(BTN2);
	}
};

async function avatarPage(elem) {
	let ID = window.location.pathname.match(/\/([^/]*)$/)[1];
	const fvID = [].concat(...(await getFavorites())['avatar'].filter(favorite => favorite.favoriteId === ID).map(favorite => favorite.favoriteId));
	let txt = fvID.includes(ID) ? ['Удалить', 'btn-primary', false] : ['В фавориты', 'btn-secondary', true];
	let BTN = $('<button>', { type: 'button', class: `btn ${txt[1]} w-50`, text: txt[0], 'avt-id': ID }).on('click', () => { changeFavorites(ID, 'avatar') });
	let BTN2 = $('<button>', { type: 'button', class: 'btn btn-secondary mt-2 w-50', text: 'Одеть' }).on('click', () => { selectAvatar(ID) });
	$(elem).find('.col-12.col-md-8').append(BTN).append($('<br>')).append(BTN2);
};

async function getUserDetails() {
	const details = await userDetails;
	if (details) {
		return details;
	}

	const response = await fetch('/api/1/auth/user');

	if (!response.ok) {
		log('error getUserDetails()');
		return null;
	}

	userDetails = Object.assign({}, await response.json());
	return userDetails;
};

function getFavorites() {
	return favorites || (favorites = async function () {
		const allFavorites = {};
		for (const type of FAVORITE_TYPES) {
			allFavorites[type] = [];
		}
		let offset = 0;
		while (true) {
			const favorites = await fetch(`/api/1/favorites?n=${MAX_ITEMS_COUNT}&offset=${offset}`);
			if (!favorites.ok) break;
			const json = await favorites.json();
			if (json.error) { log(json.error.message); break; }
			for (const favorite of json) {
				if (!FAVORITE_TYPES.includes(favorite.type)) { continue; }
				allFavorites[favorite.type].push(favorite);
			}
			if (json.length < MAX_ITEMS_COUNT) { break; }
			offset += json.length;
		}
		if (false) {
			let f = await fav_fr();
			let a = await fav_avt();
			let w = await fav_wrl();
			log('ok');
			for (let type of Object.keys(allFavorites)) {
				allFavorites[type].map(async (qwe, i) => {
					switch (qwe.type) {
						case "world": {
							if (w.hasOwnProperty(qwe.favoriteId)) {
								allFavorites[qwe.type][i].data = w[qwe.favoriteId];
							}
							break;
						}
						case "avatar": {
							if (a.hasOwnProperty(qwe.favoriteId)) {
								allFavorites[qwe.type][i].data = a[qwe.favoriteId];
							}
							break;
						}
						case "friend": {
							if (f.hasOwnProperty(qwe.favoriteId)) {
								allFavorites[qwe.type][i].data = f[qwe.favoriteId];
							}
							break;
						}
					}
				})
			}
		}
		return allFavorites;
	}());
};

async function fav_fr() {
	let offset = 0;
	const result = {};
	while (true) {
		const req = await fetch(`/api/1/auth/user/friends/favorite?n=${MAX_ITEMS_COUNT}&offset=${offset}`);
		if (!req.ok) break;
		const json = await req.json();
		if (json.error) { log(json.error.message); break; }
		for (let i = 0; i < json.length; i++) { result[json[i].id] = json[i]; }
		if (json.length < MAX_ITEMS_COUNT) { break; }
		offset += json.length;
	}
	return result;
};

async function fav_avt() {
	let offset = 0;
	const result = {};
	while (true) {
		const req = await fetch(`/api/1/avatars/favorites?n=${MAX_ITEMS_COUNT}&offset=${offset}`);
		if (!req.ok) break;
		const json = await req.json();
		if (json.error) { log(json.error.message); break; }
		for (let i = 0; i < json.length; i++) { result[json[i].id] = json[i]; }
		if (json.length < MAX_ITEMS_COUNT) { break; }
		offset += json.length;
	}
	return result;
};

async function fav_wrl() {
	let offset = 0;
	const result = {};
	while (true) {
		const req = await fetch(`/api/1/worlds/favorites?n=${MAX_ITEMS_COUNT}&offset=${offset}`);
		if (!req.ok) break;
		const json = await req.json();
		if (json.error) { log(json.error.message); break; }
		for (let i = 0; i < json.length; i++) { result[json[i].id] = json[i]; }
		if (json.length < MAX_ITEMS_COUNT) { break; }
		offset += json.length;
	}
	return result;
};

function regexUnityID(typeID, text) {
	if (typeID == null || typeID == "") return null;
	var regexUID = new RegExp("(" + typeID + "_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})");
	var result = regexUID.exec(text, "gm");
	if (result) return result[1];
	return null;
};

async function sendMeInvite(el, num) {
	let frID = $(`#sendMyFriendInvite-${num}`).val(), wrld = {};
	let userID = regexUnityID("usr", (await getUserDetails()).id);
	if (userID) {
		let name = $('.home-content .css-1wjbkkf .location-title a').data('original-title') || $('.home-content .row .col-md-12 h3:not(.subheader)').contents().get(0).nodeValue;
		let id = regexUnityID("wrld", el);
		if (!name && id) {
			wrld = await fetch(`/api/1/worlds/${id}`).then(r => r.json()).then(r => { return r }).catch(log);
			name = wrld.error ? 'Ой, а у нас ошибочка, срочно доложи разработчику!' : wrld.name;
		}
		let nvt = JSON.stringify({ type: 'invite', message: '', details: { worldId: el, worldName: name } });
		if (frID != "" && frID != undefined) {
			if (regexUnityID("usr", frID)) {
				userID = frID;
				localStorage.setItem('frID', frID);
			} else {
				MSG.log('Не верный ID друга');
				$(`#sendMyFriendInvite-${num}`).val('');
				localStorage.removeItem('frID');
				return;
			}
		}

		fetch(`/api/1/user/${userID}/notification`, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: nvt }).then(r => r.json()).then(res => {
			if (res.error)
				MSG.log(res.error.message)
			else {
				MSG.log('[OK] Успешно доставлено адресату');
			}
		}).catch(err => log(err));
	} else {
		let out = $('button[title="leave"][type="button"]');
		if (out.length) out.click();
	}
};

function getSavedUserID() {
	try { return localStorage.getItem('frID') || ''; } catch (err) { return; }
};

async function changeFavorites(id, type) {
	const favorites = (await getFavorites())[type];
	const tags = [].concat(...favorites.filter(favorite => favorite.favoriteId === id))[0] || [];

	let btn = $("button.btn[avt-id='" + id + "']");
	let tag = Object.keys(DEFAULT_FAVORITE_TAG_NAMES[type]).join('');

	if (!tags.id && !ctrlDown && !shiftDown) {
		await fetch('/api/1/favorites', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ type: type, favoriteId: id, tags: tag }),
		})
			.then(response => response.json())
			.then(favorite => {
				if (favorite.error) {
					if (favorite.error.message.replace(/\"/g, '') == "You already have 16 favorite avatars in group 'avatars1'")
						MSG.log('Фавориты переполнены, нужно что-то удалить');
					else
						MSG.log(favorite.error.message.replace(/\"/g, ''));
					return;
				}
				favorites.push(favorite);
				btn.removeClass('btn-secondary');
				btn.addClass('btn-primary');
				btn.text('Удалить');
			}).catch(err => log(err));
	} else if (tags.id && !ctrlDown && !shiftDown) {
		for (let i = favorites.length - 1; i >= 0; i--) {
			if (favorites[i].favoriteId === id) {
				await fetch('/api/1/favorites/' + favorites[i].id, { method: 'DELETE' });
				favorites.splice(i, 1);
				btn.addClass('btn-secondary');
				btn.removeClass('btn-primary');
				btn.text('В фавориты');
			}
		}
	}

	if (ctrlDown && shiftDown) {
		await fetch(`/api/1/avatars/${id}`).then(q => q.json()).then(json => {
			if (json.error) {
				MSG.log(json.error.message);
				return;
			}
			GM_setClipboard(json.id);
			window.open(json.assetUrl, '_blank');
			ctrlDown = false;
			shiftDown = false;
		}).catch(err => log(err));
	}
};

async function fav(type) {
	// log('фавориты: ' + type);

	let emptySpan = $('.home-content .btn-group-vertical > span');
	if (emptySpan.contents().length == 0) {
		emptySpan.remove();
	}

	const homeContent = document.getElementsByClassName('home-content')[0];
	const sibling = type === 'friend' ? homeContent.getElementsByClassName('btn-group-vertical')[0] : homeContent.querySelector('[href*="/home/launch"]');

	if (!sibling) {
		return;
	}

	const parent = sibling.closest('[class*="col-"]');
	const result = /[a-z]+_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.exec(location.pathname);
	if (!result) {
		return;
	}
	const id = result[0];
	const buttons = document.getElementsByName('favorite-' + type);
	if (type === 'friend' && !(await getUserDetails()).friends.includes(id) || buttons[0]) {
		return;
	}

	parent.insertAdjacentHTML('beforeend', '<div role="group" class="w-100 btn-group-lg btn-group-vertical mt-4">'
		+ Object.keys(DEFAULT_FAVORITE_TAG_NAMES[type]).sort().map(tag => `<button type="button"
				class="btn btn-secondary" name="favorite-${type}" value="${tag}" disabled="">
				<span aria-hidden="true" class="fa fa-star"></span>
				&#xA0;<span class="name">${DEFAULT_FAVORITE_TAG_NAMES[type][tag]}</span>
				&#xA0;<span class="count">‒</span>⁄${MAX_FAVORITES_COUNT_PER_GROUP}
			</button>`).join('')
		+ '</div>');

	await updateFavoriteCounts(type);

	const tags = [].concat(...(await getFavorites())[type].filter(favorite => favorite.favoriteId === id).map(favorite => favorite.tags));

	for (const button of buttons) {
		button.dataset.id = id;
		if (tags.includes(button.value)) {
			button.classList.remove('btn-secondary');
			button.classList.add('btn-primary');
		}
		if (button.getElementsByClassName('count')[0].textContent < MAX_FAVORITES_COUNT_PER_GROUP) {
			button.disabled = false;
		}
	}

	parent.lastElementChild.addEventListener('click', async function (event) {
		const buttons = document.getElementsByName('favorite-' + type);
		for (const button of buttons) { button.disabled = true; }

		let id, newTags;

		if (event.target.nodeName == 'BUTTON') {
			id = event.target.dataset.id;
			newTags = event.target.classList.contains('btn-secondary') ? [event.target.value] : [];
		}
		else {
			id = event.target.parentElement.dataset.id;
			newTags = event.target.parentElement.classList.contains('btn-secondary') ? [event.target.parentElement.value] : [];
		}

		const favorites = (await getFavorites())[type];

		for (let i = favorites.length - 1; i >= 0; i--) {
			if (favorites[i].favoriteId === id) {
				await fetch('/api/1/favorites/' + favorites[i].id, { method: 'DELETE' });

				for (const button of buttons) {
					if (favorites[i].tags.includes(button.value)) {
						button.classList.remove('btn-primary');
						button.classList.add('btn-secondary');
					}
				}
				favorites.splice(i, 1);
			}
		}

		if (newTags.length > 0) {
			await fetch('/api/1/favorites', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ type: type, favoriteId: id, tags: newTags }),
			})
				.then(response => response.json())
				.then(function (favorite) {
					favorites.push(favorite);
					for (const button of buttons) {
						if (favorite.tags.includes(button.value)) {
							button.classList.remove('btn-secondary');
							button.classList.add('btn-primary');
						}
					}
				})
				.catch(err => log(err));
		}

		await updateFavoriteCounts(type);

		for (const button of buttons) {
			if (button.getElementsByClassName('count')[0].textContent < MAX_FAVORITES_COUNT_PER_GROUP) {
				button.disabled = false;
			}
		}
	});

};

async function updateFavoriteCounts(type) {
	const counts = {};
	for (const favorite of (await getFavorites())[type]) {
		for (const tag of favorite.tags) {
			if (!(tag in counts)) {
				counts[tag] = 0;
			}
			counts[tag]++;
		}
	}

	for (const button of document.getElementsByName('favorite-' + type)) {
		button.getElementsByClassName('count')[0].textContent = counts[button.value] || 0;
	}
};

async function getAllAvatarsByUserID(UserID) {
	const allAvatars = [];
	let offset = 0;

	while (true) {
		const req = await fetch(`/api/1/avatars?userId=${UserID}&sort=updated&order=descending&releaseStatus=public&n=${MAX_ITEMS_COUNT}&offset=${offset}`).then(r => r.json()).then(res => { return res }).catch(err => log(err));

		for (const avt of req) {
			allAvatars.push(avt);
		}

		if (req.length < MAX_ITEMS_COUNT) {
			break;
		}

		offset += req.length;
	}
	return allAvatars;
};

function waitForElement(elementPath, callBack) {
	setTimeout(() => {
		if ($(elementPath).length) {
			callBack($(elementPath));
		} else {
			waitForElement(elementPath, callBack);
		}
	}, 250);
};

async function UsersInWolrlds(elem) {
	fav('world');

	let launchBTN = $("div.home-content .card-body form.p-2");
	if (launchBTN.length) {
		let num = 999;
		let btn = $('<button>', { type: 'button', class: 'btn btn-primary', title: 'Отпавить приглашение в игру', html: [$('<i>', { class: "far fa-envelope-open" })] }).on('click', () => { let params = new URLSearchParams(launchBTN.find('a').attr('href')); if (params.has('id')) { sendMeInvite(params.get('id'), num); } }).tooltip();
		launchBTN.append($('<div>', {
			class: 'input-group mt-2', html: [
				$('<div>', { class: 'input-group-prepend' }).append(btn),
				$('<input>', { type: 'text', id: `sendMyFriendInvite-${num}`, class: 'form-control', placeholder: 'ID друга: usr_(буковки-циферки)', value: getSavedUserID(), autocomplete: "off" }).focus(function () { removeSaveUserID(this) })
			]
		}));
	}

	$('form.p-2 a:contains(Launch), form.p-2 button:contains(Copy Launch Link), form.p-2 button:contains(Copy Pretty Link)').removeClass('mr-2').addClass('w-100').wrapAll('<div class="btn-group d-flex" role="group">');

	try { $(elem).parent().siblings().text($(elem).parent().siblings().text().split('‚').join(', ')); } catch (e) { console.error(e) };
	let ID = regexUnityID('wrld', location.pathname.match(/\/([^/]*)$/)[1]);
	if (!ID) return;

	fetch(`/api/1/worlds/${ID}`).then(r => r.json()).then(async res => {
		if (res.hasOwnProperty("instances")) {
			res.instances.map((item, i) => {
				let el = $(`.col-md-12 a[href="vrchat://launch?ref=vrchat.com&id=${res.id}:${item[0]}"]`);
				if (el.length) {
					el.attr('title', 'Присоединиться').removeClass('mb-2').addClass('text-left');
					let w_data = $('<div>', { id: `world-data-${i}`, class: 'card-columns' });
					let input = $('<input>', { type: 'text', id: `sendMyFriendInvite-${i}`, class: 'form-control', placeholder: 'ID друга: usr_(буковки-циферки)', value: getSavedUserID(), autocomplete: "off" }).focus(function () { removeSaveUserID(this) })
					let btn = $('<div>', {
						class: 'input-group-prepend', html: [
							$('<button>', { type: 'button', class: 'btn btn-secondary', title: 'Кто ещё на карте?', html: [$('<i>', { class: "fas fa-users" })] }).on('click', (e) => {
								$(e.currentTarget).attr("disabled", true);
								w_data.html($('<div>', { class: 'm-3', html: [$('<span>', { 'aria-hidden': true, class: "fas fa-spinner fa-pulse" })] }));
								query(`//vrchat.miinc.tk/api/1/worlds/${res.id}/${item[0]}`).then(async r => {
									let friendsArr = (await getUserDetails()).friends;
									if (r.hasOwnProperty("users")) {
										await r.users.map((item, i) => {
											if (i == 0) w_data.html('');
											let className = $.inArray(item.id, friendsArr) >= 0 ? ['border-success', 'text-success'] : ['border-secondary', ''];

											w_data.append($('<div>', {
												class: `card text-center ${className[0]}`, html: [
													$('<a>', { href: `/home/user/${item.id}`, target: "_blank", class: `btn shadow-none ${className[1]}`, text: item.displayName }),
													$('<img>', { class: "card-img-bottom user-img-hover", src: item.currentAvatarImageUrl })
												]
											}))
										});
									}
									setTimeout(() => { $(e.currentTarget).attr("disabled", false); }, 2000);
								});
							}),
							$('<button>', { type: 'button', class: 'btn btn-secondary', title: 'Отпавить приглашение в игру', html: [$('<i>', { class: "far fa-envelope-open" })] }).on('click', () => { sendMeInvite(`${res.id}:${item[0]}`, i) })
						]
					})
					el.wrap($('<div>', { class: 'prikol' })).after(w_data).wrap($('<div>', { class: 'input-group mb-2 w-100' })).before(btn).before(input).wrap($('<div>', { class: 'input-group-append w-25' }));
				}
			});
		}
	}).catch(err => log(err));

};

async function query(url) {
	let authUser = await getUserDetails();
	return new Promise(async (ok, fail) => {
		const req = await fetch(url, { method: 'GET', headers: { VTAuth: 'CFA3FA5820360E593D1013A1CFE954396FCABCBB22B090C54541D788A5F279EA', VTUser: authUser.id } });
		if (!req.ok) return fail({});
		const json = await req.json();
		return ok(json);
	});
};

function AllUsersInWorld(wrld, inst) {
	let results = $("<div>").append($('<div>', { text: 'X', class: 'close-users-btn' }));
	query(`//vrchat.miinc.tk/api/1/worlds/${wrld}/${inst}`).then(async res => {

		let friendsArr = (await getUserDetails()).friends;
		if (res.hasOwnProperty("users")) {
			await res.users.map(item => {
				let className = $.inArray(item.id, friendsArr) >= 0 ? 'my-class-test1 my-friend1' : 'my-class-test1';
				results.append($('<a>', { href: `/home/user/${item.id}`, target: "_blank", class: className, text: item.displayName, html: [$('<div>', { class: 'my-friend1-txt', text: item.displayName }), $('<img>', { src: item.currentAvatarImageUrl })] }));
			});
		}

		MSG.log(results[0].outerHTML, { timeout: 0, clickToClose: false }, () => { $("#getMoreusersOnWorld").attr("disabled", false) });
	}).catch(err => {
		$("#getMoreusersOnWorld").attr("disabled", false);
	});
};

async function unplayermoderate(id, i, type, tab) {
	$('.moderationsBtn').prop('disabled', true);
	await fetch(`/api/1/auth/user/unplayermoderate`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ moderated: id, type: type })
	}).then(r => r.json()).then(json => {
		if (json.error) {
			MSG.log(json.error.message);
			return;
		}
		$(`#${type}-${i}`).remove();
		let num = $(`#${tab}`).text();
		let getint = parseInt(num.replace(/[^\d]/g, ''));
		$(`#${tab}`).text(num.replace(getint, getint - 1));
		log(json);
	}).catch(err => {
		MSG.log(err.message);
	});
	setTimeout(() => {
		$('.moderationsBtn').prop('disabled', false);
	}, 500)
};

$(function () {
	$(document).keydown(function (e) {
		if (e.keyCode == ctrlKey) ctrlDown = true;
	}).keyup(function (e) {
		if (e.keyCode == ctrlKey) ctrlDown = false;
	});

	$(document).keydown(function (e) {
		if (e.keyCode == shiftKey) shiftDown = true;
	}).keyup(function (e) {
		if (e.keyCode == shiftKey) shiftDown = false;
	});

	$(document).keydown(function (e) {
		if (ctrlDown && shiftDown && (e.keyCode == zKey)) {
			let path = location.pathname.split('/') || [];
			if ((typeof path[2] !== undefined) && (path[2] == 'world')) {
				if ((typeof path[3] !== undefined)) {
					let ID = regexUnityID("wld", path[3]) || regexUnityID("wrld", path[3]);
					if (ID == null || ID == undefined) return;
					copyToClipboard(`/api/1/worlds/${ID}`, 'assetUrl');
					return;
				}
			}
			copyToClipboard(`/api/1/auth/user`, 'currentAvatarAssetUrl');
			return;
		}
	});

	let friendID;
	$(document).on('mousemove', '.friend-container a', function (e) {
		friendID = $(this).attr('href');
	}).on('mouseout', function () {
		friendID = undefined;
	});

	$(document).keydown(function (e) {
		if (e.keyCode === zKey && friendID) {
			let ID = regexUnityID('usr', friendID.match(/\/([^/]*)$/)[1]);
			if (ID) GM_setClipboard(ID);
		}
	});
});

async function copyToClipboard(link, ret) {
	const req = await fetch(link);
	const json = await req.json();
	GM_setClipboard(json[ret]);
};

function removeSaveUserID(el) {
	$(el).val('');
	try { localStorage.removeItem('frID'); } catch (err) { }
};

async function sdkVersion(el) {
	fetch('/api/1/config').then(r => r.json()).then(res => {
		if (res.error) {
			log(res.error.message);
			return;
		}
		$(`${el}:contains(Download Unity)`).attr('title', res.sdkUnityVersion).tooltip('update');
		$(`${el}:contains(Download VRChat SDK)`).attr('title', res.releaseSdkVersion.replace('_Public', '').replace('VRCSDK-', '')).tooltip('update');
	}).catch(err => log(err));
};

async function sendRequetsInvite() {
	let user = regexUnityID("usr", (location.href));
	if (!user) return MSG.log('Пользователь не найден, обновите страницу');
	return fetch(`/api/1/user/${user}/notification`, {
		method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({ type: 'requestInvite', details: { "platform": "standalonewindows" }, message: '' }),
	}).then(r => r.json()).then(json => {
		return json;
	}).catch(err => log(err));
};

// Меню
/* var _tm = 2000;
GM_registerMenuCommand("Ск./Отобр. рандомный мир", () => {
	let val = GM_getValue('removeRandomWorld', null);
	if (val == null) {
		GM_setValue('removeRandomWorld', false)
	} else {
		val = !val;
		GM_setValue('removeRandomWorld', val);
		MSG.log(`Отображение рандомного мира ${val ? '<span class="green_btn">вкл.</span>' : '<span class="red_btn">выкл.<span>'}`, { timeout: _tm });
	}
}); */

function makeUserCardBlock(json, num, req) {
	let usercard = $('.home-content .usercard.card');
	if (req) {
		usercard.append($('<div>', {
			id: 'user_card_lctn', html: [
				$('<button>', { type: 'button', class: 'w-100 mt-2 btn btn-secondary', text: `Запросить инвайт` }).on('click', (e) => {
					e.target.setAttribute("disabled", "disabled");
					sendRequetsInvite().then(r => {
						setTimeout(() => { e.target.removeAttribute("disabled"); }, 2000);
						if (r.error) {
							return MSG.log(r.error.message);
						}
						MSG.log('[ОК] Запрос успешно доставлен адресату :)')
					});
				})
			]
		}));
	} else {
		usercard.append($("<div>", {
			id: "user_card_lctn",
			html: [
				$("<div>", {
					class: "input-group mt-2", html: [
						$("<div>", {
							class: "input-group-prepend", html: [
								$("<button>", { type: "button", id: 'getMoreusersOnWorld', class: "btn btn-secondary shadow-none", title: "Кто ещё на карте?", html: [$("<i>", { class: "fas fa-users" })] }).on("click", (e) => {
									$(e.currentTarget).attr('disabled', true);
									AllUsersInWorld(json.worldId, json.instanceId);
								}).tooltip(),
								$("<button>", { type: "button", class: "btn btn-secondary shadow-none", title: "Отпавить приглашение в игру", html: [$("<i>", { class: "fas fa-envelope-open" })] }).on("click", () => {
									sendMeInvite(json.location, num);
								}).tooltip()
							]
						}),
						$("<input>", { type: "text", id: `sendMyFriendInvite-${num}`, class: "form-control shadow-none", placeholder: "ID друга: usr_(буковки-циферки)", value: getSavedUserID(), autocomplete: "off" }).focus(function () {
							removeSaveUserID(this);
						}),
						$("<div>", { class: "input-group-append", html: [$("<a>", { href: `vrchat://launch?id=${json.location}`, class: "btn btn-secondary shadow-none", title: "Присоединиться", html: [$("<i>", { class: "fas fa-sign-in-alt" })] })] })
					]
				})
			]
		}));
	}
};

function generateColor() {
	return parseInt(`0x${Math.floor(Math.random() * 16777215).toString(16)}`);
};

// $('.leftbar').prepend($('<button>', { class: 'btn btn-primary shadow-none', text: 'test box' }).on('click', () => { }));
let getWrldInfo;
async function onWebsocketReceived(ws) {
	let msg = $.parseJSON(ws.data);
	let user = regexUnityID("usr", (location.href)), json = $.parseJSON(msg.content);
	let usercard = $('.home-content .usercard.card');
	log('content all', json);
	switch (msg.type) {
		case 'notification':
			{
				switch (json.type) {
					case 'invite':
						{
							let box = $("<div>", {
								class: "card text-white bg-secondary",
								html: [
									$("<div>", { class: "card-header", text: json.senderUsername }).append($("<button>", {
										class: "close shadow-none", type: "button", id: "close-invite", html: [
											$("<i>", { class: "fas fa-times" })
										]
									}).on("click", () => { $('.card-box').removeClass('card-animate') })),
									$("<div>", {
										class: "card-body py-2", html: [
											$('<div>', {
												class: 'row', html: [
													// $("<img>", { class: "rounded w-25 my-border user-img-hover", src: getWrldInfo.imageUrl }),
													$("<p>", { class: "px-2", text: `Погнали в: ${json.details.worldName}` })
												]
											})
										]
									}),
									$("<div>", {
										class: "card-footer p-1", html: [
											$("<div>", {
												class: "btn-group d-flex", html: [
													$("<a>", { href: `vrchat://launch?id=${json.details.worldId}`, class: "btn btn-primary w-100 shadow-none", title: "Принять", html: [$("<i>", { class: "fas fa-sign-in-alt" })] }),
													$("<button>", { class: "btn btn-primary w-100 shadow-none", title: "Скопировать для дискорда", html: [$("<i>", { class: "far fa-copy" })] }).on('click', () => { GM_setClipboard(`<vrchat://launch?id=${json.details.worldId}>`) })
												]
											})
										]
									})
								]
							});
							if ($('.card-box.card-animate').length) {
								$('.card-box.card-animate').removeClass('card-animate').delay(400).queue(function (next) {
									$('.card-box').html(box).addClass('card-animate');
									next();
								});
							} else {
								$('.card-box').html(box).addClass('card-animate');
							}
							if (localStorage.getItem('lastID') == json.id) {
								break;
							}
							localStorage.setItem('lastID', json.id);

							let wrdId = regexUnityID('wrld', json.details.worldId);
							if (wrdId) {
								getWrldInfo = await fetch(`/api/1/worlds/${wrdId}`).then(r => r.json()).then(r => { return r }).catch(log);
							}

							let DH = GM_getValue('discordHook', null);
							if (DH == null || DH == "") break;
							let msg = {
								username: "VRChat",
								avatar_url: "https://d348imysud55la.cloudfront.net/thumbnails/4211375269.thumbnail-500.png",
								content: `<vrchat://launch?id=${json.details.worldId}>`,
								embeds: [
									{
										color: generateColor(),
										title: `Приглашение от: ***${json.senderUsername}***\nПрисоединяйся в: ***${json.details.worldName}***`,
										description: `\n\n\n`,
										thumbnail: { url: getWrldInfo.imageUrl },
										footer: {
											text: "\nС любовью VRChat"
										},
										fields: [
											{
												name: 'Автор мира:',
												value: '```' + getWrldInfo.authorName + '```'
											}, {
												name: 'Статус мира:',
												value: '```' + getWrldInfo.releaseStatus + '```'
											}
										],
										timestamp: new Date()
									}
								]
							};
							var params = { method: "POST", cache: "no-cache", mode: 'cors', muteHttpExceptions: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) };
							fetch(GM_getValue('discordHook'), params);
						}
						break;
					case 'message': log('mes', json.details, json.message); break;
					case 'friendRequest': log('fr req', json); break;
				}
			}
			break;

		case 'friend-add':
		case 'friend-update':
			{
				log(`${msg.type}, [ID: ${json.userId}], [ник: ${json.user.displayName}], [аккаунт: ${json.user.username}]`);
			}
			break;

		case 'friend-delete':
			{
				log('друг удалён', json.userId);
			}
			break;

		case 'friend-active':
		case 'friend-offline':
			{
				if (user) {
					log('offline', json);
					if (json.userId === user) {
						$('#user_card_lctn').remove();
					}
				}
			}
			break;

		case 'friend-online':
		case 'user-location':
		case 'friend-location':
			{
				if (user) {
					if (json.userId === user) {
						$('#user_card_lctn').remove();
						if (json.location == 'private') {
							usercard.append($('<div>', {
								id: 'user_card_lctn', html: [
									$('<button>', { type: 'button', class: 'w-100 mt-2 btn btn-secondary', text: `Запросить инвайт` }).on('click', (e) => {
										e.target.setAttribute("disabled", "disabled");
										sendRequetsInvite().then(r => {
											setTimeout(() => { e.target.removeAttribute("disabled"); }, 2000);
											if (r.error) {
												return MSG.log(r.error.message);
											}
											MSG.log('[ОК] Запрос успешно доставлен адресату :)')
										});
									})
								]
							}));
						} else {
							makeUserCardBlock(json, 777, false);
						}
					}
				}
			}
			break;

		default: log('type:', msg.type, '; content:', $.parseJSON(msg.content)); break;
	}
};

function visibleY(el) {
	if ($(el).length == 0) return;
	var rect = el.getBoundingClientRect(), top = rect.top, height = rect.height, el = el.parentNode;
	do {
		rect = el.getBoundingClientRect();
		if (top <= rect.bottom === false || (top + height) <= rect.top) {
			return false;
		}
		el = el.parentNode;
	} while (el != el);
	return top <= document.documentElement.clientHeight;
};

function attachEvent(element, event, callbackFunction) {
	if (element.addEventListener) {
		element.addEventListener(event, callbackFunction, false);
	} else if (element.attachEvent) {
		element.attachEvent('on' + event, callbackFunction);
	}
};

function update() {
	clearTimeout($.data(this, 'scrollTimer'));
	$.data(this, 'scrollTimer', setTimeout(function () {
		let btn = $('.rightbar .friend-container > button');
		if (visibleY(btn.get(0))) {
			btn.click();
		}
	}, 100));
};

async function friendsSkcrollEvent() {
	let count = 0, maxCounter = 10;
	do {
		count++;
		await delay(500);
		log('friendsSkcrollEvent(), count:', count);
	} while (!$(".css-1o8x0bc").length && count != maxCounter);

	if (count < maxCounter) {
		attachEvent($('.css-1o8x0bc').get(0), "scroll", update);
		attachEvent(window, "resize", update);
		update();
	}
};

async function loadFunc() {
	var url = window.location.href;
	if (url.match("\/launch") || url.match("\/login")) {
		await delay(1000);
		log('loadFunc');
		loadFunc();
	} else {
		HomePage();
		log('HomePage');
	}
};
loadFunc();

async function getSocket() {
	unsafeWindow.socket = undefined;
	let count = 0, maxCounter = 30;
	do {
		count++;
		await delay(500);
		log('getSocket(), count:', count);
	} while (!unsafeWindow.socket && count != maxCounter);

	if (count < maxCounter) {
		let ws = unsafeWindow.socket;
		ws.onmessage = onWebsocketReceived;
		ws.onclose = loadFunc;
		ws.onerror = loadFunc;
	} else {
		MSG.log('Не смог соединиться с сокетом, страница будет обновлена', { timeout: 5000 }, () => {
			location.reload();
		});
	}
};

async function getAllFriends() {
	let offset = 0, req, json, result = {};
	while (true) {
		req = await fetch(`/api/1/auth/user/friends?n=${MAX_ITEMS_COUNT}&offset=${offset}&offline=true`);
		if (!req.ok) break;
		json = await req.json();
		if (json.error) { log(json.error.message); break; }
		for (let i = 0; i < json.length; i++) { result[json[i].id] = json[i]; }
		if (json.length < MAX_ITEMS_COUNT) { break; }
		offset += json.length;
	}
	offset = 0;
	while (true) {
		req = await fetch(`/api/1/auth/user/friends?n=${MAX_ITEMS_COUNT}&offset=${offset}&offline=false`);
		if (!req.ok) break;
		json = await req.json();
		if (json.error) { log(json.error.message); break; }
		for (let i = 0; i < json.length; i++) { result[json[i].id] = json[i]; }
		if (json.length < MAX_ITEMS_COUNT) { break; }
		offset += json.length;
	}
	return result;
};
// setTimeout(async () => { let r = await getAllFriends(), i = 0; console.log(r); for (let s in r) { console.log(i, s, r[s]); i++; } }, 5000);