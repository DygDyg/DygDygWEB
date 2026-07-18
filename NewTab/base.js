let ver = 1.28
let clock_en = true
var loading = false
var gets_ = {}
var SiteURL = document.location.href.replace(/\/+$/, '');
var Calc = false;
var volume = newTabSettings?.volume ?? localStorage.getItem("volume") ?? 100
var dygdyg_test;
var scrollP = [0, 0];
var timezonePreviewPreviousShowCard = null;
var currentSearchEngineId = searchSettings?.default || 'google';
// var timezones = ["", "Asia/Vladivostok"]
var timezones = newTabSettings?.timezones || [
	TZSearch("moscow"),
	TZSearch("Vladivostok")
]

const SEARCH_ENGINES = {
	google: { label: 'Google', url: 'https://www.google.com/search?q=' },
	yandex: { label: 'Яндекс', url: 'https://yandex.ru/search/?text=' },
	youtube: { label: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
	animego: { label: 'AnimeGO', url: 'https://animego.org/search/all?q=' },
	trackAnime: { label: 'Track Anime', url: 'https://track-anime.dygdyg.ru/search?q=' },
	yandexTranslate: { label: 'Яндекс Переводчик', url: 'https://translate.yandex.ru/?text=' }
}

function search_engine_options_html() {
	return Object.entries(SEARCH_ENGINES)
		.map(([id, engine]) => '<option value="' + htmlEscape(id) + '">' + htmlEscape(engine.label) + '</option>')
		.join('')
}

function build_search_url(engineId, query) {
	const engine = SEARCH_ENGINES[engineId] || SEARCH_ENGINES.google
	return engine.url + encodeURIComponent(query)
}

function search_hint_text() {
	const settings = searchSettings || {}
	const defaultEngine = SEARCH_ENGINES[currentSearchEngineId] || SEARCH_ENGINES[settings.default] || SEARCH_ENGINES.google
	const shiftEngine = SEARCH_ENGINES[settings.shift]
	const ctrlEngine = SEARCH_ENGINES[settings.ctrl]
	const altEngine = SEARCH_ENGINES[settings.alt]
	return [
		'Enter - ' + defaultEngine.label,
		'Shift - ' + (shiftEngine?.label || 'выкл.'),
		'Ctrl - ' + (ctrlEngine?.label || 'выкл.'),
		'Alt - ' + (altEngine?.label || 'выкл.')
	].join(', ')
}

function update_search_placeholder() {
	$('#search').attr('placeholder', 'Искать: ' + search_hint_text())
}

function selected_search_engine(event) {
	if (event.shiftKey) return searchSettings?.shift || 'yandex'
	if (event.ctrlKey) return searchSettings?.ctrl || 'youtube'
	if (event.altKey) return searchSettings?.alt || 'animego'
	return currentSearchEngineId || searchSettings?.default || 'google'
}

scrollP = [window.pageXOffset, window.pageYOffset];
let SoundClick = new Audio();
SoundClick.src = 'click_key.ogg'
SoundClick.volume = volume / 100

moment.locale('ru')

if (getUrlParameter('tz1') != '') timezones[0] = TZSearch(getUrlParameter('tz1'))
if (getUrlParameter('tz2') != '') timezones[1] = TZSearch(getUrlParameter('tz2'))

function stringToBool(val) {
	return (val + '').toLowerCase() === 'true'
}

if (localStorage.getItem('background')) {
	$('body').css('background-image', 'url(' + localStorage.getItem('background') + ')')
}
function GetBackground() {
	let result = prompt('Введи ссылку на обои', background)

	if (result != null && result != '') {
		console.log(result)
		const settings = getNewTabSettings()
		settings.background = result
		saveNewTabSettings(settings)
		window.location.reload()
	}
}

jQuery(document).ready(function ($) {
	$(window).resize(function () {
		resize_info()
		update_settings_panel_space()
	})
})
// get_api()
function get_api() {
	fetch('//ipwho.is/')
		.then(response => {
			if (!response.ok) {
				throw new Error('Сеть ответила с ошибкой: ' + response.status);
			}
			return response.json();  // Парсим ответ как JSON
		})
		.then(data => {
			console.log('Ваш IP адрес:', data.ip);  // Выводим IP адрес в консоль
		})
		.catch(error => {
			console.error('Произошла ошибка:', error);  // Обработка ошибок
		});

}

function resize_info() {
	; (function ($) {
		//const windowInnerWidth = window.innerWidth
		//const windowInnerHeight = window.innerHeight
		//$('.card').css('height', window.innerWidth / 15);
		//alert(windowInnerWidth)
	})(jQuery)
}

num = 1
$('body').append('<div id="searchs"></div>')
$('#searchs').append('<select id="search_engine_select" title="Поисковик для текущего поиска">' + search_engine_options_html() + '</select>')
$('#searchs').append('<input id="search" type="text">')
$('#search_engine_select').val(currentSearchEngineId)
update_search_placeholder()
$('#search_engine_select').on('change', function () {
	currentSearchEngineId = this.value
	update_search_placeholder()
	$('#search').focus()
})
$('#search').on("input", function () {
	soundClick('click_key.ogg')
})
$('#searchs').append('<div id="calc_result"></div>')
if (getUrlParameter('search') == "false") $('#search, #search_engine_select').css('display', "none")

function copyToClipboard(text) {
	// Воспроизведение звука
	const audio = new Audio('copy.mp3');
	audio.play();

	// Создаём временный элемент textarea
	const tempInput = document.createElement("textarea");
	tempInput.value = text;
	document.body.appendChild(tempInput);

	// Выделяем текст
	tempInput.select();
	tempInput.setSelectionRange(0, 99999); // Для мобильных устройств

	// Копируем текст в буфер обмена
	document.execCommand("copy");

	// Удаляем временный элемент
	document.body.removeChild(tempInput);

	console.log("Текст скопирован: " + text);
	return text
}

$(document).ready(function () {
	$('#search').focus()
	$('#search').keydown(function (e) {

		if (e.keyCode === 13) {
			// if(Calc)
			// {
			// 	// console.log("Результат: "+eval($(this).val()))
			// 	alert("Результат: "+eval($(this).val()))
			// 	return
			// }

			if ($(this).val().startsWith('http://') || $(this).val().startsWith('https://') || $(this).val().startsWith('file://') || $(this).val().startsWith('ftp://') || $(this).val().startsWith('steam://') || $(this).val().startsWith('magnet:?')) {
				SiteURL = $(this).val()
				console.log("AAA")
			} else {

				SiteURL = build_search_url(selected_search_engine(e), $(this).val())
			}
			window.location = SiteURL;
			//alert($(this).val());
			//
		}


	})
	$('#calc_result').click((e) => {
		// location.href = "calculator:///"
		if ($('#calc_result').text().includes("Результат: ")) {
			copyToClipboard($('#calc_result').text().replace('Результат: ', ''))

		}
	})

	$('#search').on("input", function () {
		// console.log($(this).val())
		// console.log(/[0-9%\/*\-+\(\)=]+$/.test($(this).val()))
		if (/[0-9%\/*\-+\(\)=]+$/.test($(this).val())) {
			try {
				eval($(this).val());
			} catch (e) {
				if (e instanceof SyntaxError) {
					$('title').text("Новая вкладка")
					$('#calc_result').text("")

					Calc = false
					return
				}
			}
			$('title').text(eval($(this).val()))
			$('#calc_result').text("Результат: " + eval($(this).val()))

			// console.log("Результат: "+eval($(this).val()))
			Calc = true
		}
		if (!$(this).val()) {
			Calc = false
			$('title').text("Новая вкладка")
			$('#calc_result').text("")
		}
	})
})
$('body').append('<div id="SpoilerGroup"><div id="Spoiler"></div></div>')
$('#SpoilerGroup').click(ShowCardF)
$('body').append('<div id="cards"></div>')


render_cards()

$('body').prepend('<div id="Button_Settings_Cover"><div id="Button_Settings" title = "Нажми с шифтом, чтобы сменить фон"></div></div>')
$('body').prepend('<div id="ver">' + "VER: " + ver + '</div>')
$('body').prepend('<img id="ip_flag"></img>')
$('#ver').attr('title', 'Shift+Click чтобы открыть подробную информацию');
$('#ip_flag').click(function () {
	window.open('https://server.dygdyg.ru/my_ip.htm').focus();
})


$('body').append('<div id="clockG">' +
	'<div class="date" id="date1">Понедельник</div>' +
	'<div class="clock" id="clock1">12:34:56</div>' +
	'<div class="clockscroll" id="clock1scroll"></div>' +
	'<div class="separator"></div>' +
	'<div class="clockscroll"id="clock2scroll"></div>' +
	'<div class="clock" id="clock2">12:34:56</div>' +
	'<div class="date" id="date2">Понедельник</div>' +

	'</div>')


/* 	'<div class="date" id="date1">Понедельник</div>' +
	'<div class="clock" id="clock1">12:34:56</div>' +
	'<div class="clockscroll" id="clock1scroll"></div>' +
	'<div class="date" id="date2">Понедельник</div>' +
	'<div class="clock" id="clock2">12:34:56</div>' +
	'<div class="clockscroll"id="clock2scroll"></div>' +
	'</div>')
 */

// https://api.ipify.org?format=jsonp&callback=?

$.ajax({
	url: "https://ipwho.is/",
	jsonp: "callback",
	dataType: "json",
	data: {
		q: "select title,abstract,url from search.news where query=\"cat\"",
		format: "json"
	},
	success: function (json) {
		console.log(111, json)
		// $('body').prepend('<div id="ver">'+ "VER: "+ ver + " IP: " + json.ip + '</div>')
		$("#ver").text("VER: " + ver + " IP: " + json.ip)
		$("#ip_flag").attr("src",json.flag.img)
		// $("#ver").text("VER: " + ver + " IP: " + json.query)
		$('#ver').click(function (e) {
			if (e.shiftKey) {
				// window.open("http://ip-api.com/json/", "_blank");
				window.open('http://ip-api.com/json/').focus();
			} else {
				$('#search').val(json.ip)
				// $('#search').val(json.query)
				$('#search').focus();
				$('#search').select();
				document.execCommand('copy');
			}

		})
	},
	error: function (data) {

		$("#ver").text("VER: " + ver + " IP: ОТКЛЮЧИ АДБЛОК!!!")
		$('#ver').click(function (e) {
			if (e.shiftKey) {
				window.open('http://ip-api.com/json/', '_blank').focus();
			} else {
				console.log("click")
				$('#search').val("Адблок мешает запросам к сторонним сервисам, возможно что то может работать не правильно!!!")
				$('#search').focus();
				$('#search').select();
				document.execCommand('copy');
			}
		})
	}
})

function changeColor(time) {
	//rgb
	let colors = [0, 0, 0];

	function colorTemperature2rgb(kelvin) {
		var temperature = kelvin / 100.0;
		var red, green, blue;

		if (temperature < 66.0) {
			red = 255;
		} else {
			red = temperature - 55.0;
			red =
				351.97690566805693 +
				0.114206453784165 * red -
				40.25366309332127 * Math.log(red);
			// red = Math.max(0, Math.min(255, red));

		}

		if (temperature < 66.0) {
			green = temperature - 2;
			green =
				-155.25485562709179 -
				0.44596950469579133 * green +
				104.49216199393888 * Math.log(green);
			if (green < 0) green = 0;
			if (green > 255) green = 255;
		} else {
			green = temperature - 50.0;
			green =
				325.4494125711974 +
				0.07943456536662342 * green -
				28.0852963507957 * Math.log(green);

			green = Math.max(0, Math.min(255, green));
		}

		if (temperature >= 66.0) {
			blue = 255;
		} else {
			if (temperature <= 20.0) {
				blue = 0;
			} else {
				blue = temperature - 10;
				blue =
					-254.76935184120902 +
					0.8274096064007395 * blue +
					115.67994401066147 * Math.log(blue);
				blue = Math.max(0, Math.min(255, blue));
			}
		}

		return {
			red: Math.round(red),
			blue: Math.round(blue),
			green: Math.round(green)
		};
	};

	const { red, green, blue } = colorTemperature2rgb(3500);
	let color = "rgba(" + red + "," + green + "," + blue + ",1)"
	// document.body.style.backgroundColor = color
	return colors

}

$('#Button_Settings_Cover').click(settings)
resize_info()

if (ShowCard == false) {
	$('#cards').css({
		display: 'none'
	})

	$('#clockG').css({
		display: 'flex'
	})

	$('#Spoiler').css({
		width: '2%',
		'border-top-left-radius': '5px',
		'border-top-right-radius': '5px',
		'border-bottom-right-radius': '5px',
		'border-bottom-left-radius': '5px'
	})
} else {
	$('#cards').css({
		display: 'flex'
	})

	$('#clockG').css({
		display: 'none'
	})

	$('#Spoiler').css({
		width: '97%',
		'border-top-left-radius': '5px',
		'border-top-right-radius': '5px',
		'border-bottom-right-radius': '0px',
		'border-bottom-left-radius': '0px'
	})
}

function ShowCardF(nil, ShowCardN) {
	// console.log("ShowCardTest")
	timezonePreviewPreviousShowCard = null
	$('body').removeClass('timezone_preview')
	const nextShowCard = ShowCardN !== undefined ? ShowCardN : !ShowCard
	set_show_cards(nextShowCard, true)
}

function set_show_cards(showCards, persist) {
	ShowCard = Boolean(showCards)
	clock_en = ShowCard
	if (persist !== false) {
		const settings = getNewTabSettings()
		settings.showCards = ShowCard
		saveNewTabSettings(settings)
	}

	if (!ShowCard) {
		scrollP = [window.pageXOffset, window.pageYOffset];
	} else {
		window.scroll(scrollP[0], scrollP[1])
	}
	apply_cards_clock_view(ShowCard)
}

function apply_cards_clock_view(showCards) {
	if (!showCards) {
		$('#cards').css({
			display: 'none'
		})
		$('#clockG').css({
			display: 'flex'
		})

		$('#Spoiler').css({
			width: '2%',
			'border-top-left-radius': '5px',
			'border-top-right-radius': '5px',
			'border-bottom-right-radius': '5px',
			'border-bottom-left-radius': '5px'
		})
	} else {
		$('#cards').css({
			display: 'flex'
		})

		$('#clockG').css({
			display: 'none'
		})

		$('#Spoiler').css({
			width: '97%',
			'border-top-left-radius': '5px',
			'border-top-right-radius': '5px',
			'border-bottom-right-radius': '0px',
			'border-bottom-left-radius': '0px'
		})
	}
}

function start_timezone_preview() {
	if (timezonePreviewPreviousShowCard !== null) return
	timezonePreviewPreviousShowCard = ShowCard
	clock_en = false
	$('body').addClass('timezone_preview')
	apply_cards_clock_view(false)
}

function stop_timezone_preview() {
	if (timezonePreviewPreviousShowCard === null) return
	const previousShowCard = timezonePreviewPreviousShowCard
	timezonePreviewPreviousShowCard = null
	$('body').removeClass('timezone_preview')
	clock_en = previousShowCard
	apply_cards_clock_view(previousShowCard)
}

function stop_timezone_preview_if_outside(event) {
	const controls = document.getElementById('timezone_controls')
	if (!controls) {
		stop_timezone_preview()
		return
	}
	if (event?.relatedTarget && controls.contains(event.relatedTarget)) return
	setTimeout(function () {
		if (controls.matches(':hover') || controls.contains(document.activeElement)) return
		stop_timezone_preview()
	}, 0)
}

function htmlEscape(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;')
}

const PROJECT_MAP_PATHS = ['../DataList.json', 'DataList.json', '/DygDygWEB/DataList.json', 'https://dygdyg.github.io/DygDygWEB/DataList.json']
const LOGO_FILE_PATTERN = /\.(png|jpe?g|webp|gif|svg|avif)$/i
let projectLogoPathsPromise = null
let logoSuggestionsRequestId = 0

function collect_project_file_paths(node, parentPath = '') {
	if (!node) return []

	if (Array.isArray(node)) {
		return node.flatMap(item => collect_project_file_paths(item, parentPath))
	}

	if (typeof node === 'string') return [node.replaceAll('\\', '/')]

	const name = node.name && node.name !== '.' ? node.name : ''
	const currentPath = name ? [parentPath, name].filter(Boolean).join('/') : parentPath

	if (node.type === 'file') return [currentPath]
	if (Array.isArray(node.children)) {
		return node.children.flatMap(child => collect_project_file_paths(child, currentPath))
	}
	if (Array.isArray(node.files)) {
		return node.files.flatMap(child => collect_project_file_paths(child, currentPath))
	}

	return []
}

function logo_path_to_url(path) {
	const normalizedPath = String(path || '').replaceAll('\\', '/').replace(/^\.\//, '')
	if (normalizedPath.startsWith('NewTab/')) {
		return normalizedPath.replace(/^NewTab\//, '')
	}
	return '../' + normalizedPath
}

async function load_project_logo_paths() {
	if (projectLogoPathsPromise) return projectLogoPathsPromise

	projectLogoPathsPromise = (async function () {
		for (const mapPath of PROJECT_MAP_PATHS) {
			try {
				const response = await fetch(mapPath, { cache: 'no-cache' })
				if (!response.ok) continue
				const data = await response.json()
				const paths = collect_project_file_paths(data)
					.filter(path => /(^|\/)logos\//i.test(path) && LOGO_FILE_PATTERN.test(path))
					.sort((left, right) => {
						const leftIsNewTab = /^NewTab\/logos\//i.test(left) ? 0 : 1
						const rightIsNewTab = /^NewTab\/logos\//i.test(right) ? 0 : 1
						return leftIsNewTab - rightIsNewTab || left.localeCompare(right)
					})
				const newTabPaths = paths.filter(path => /^NewTab\/logos\//i.test(path))

				return [...new Set(newTabPaths.length ? newTabPaths : paths)]
			} catch (error) {
				console.warn('NewTab logos map skipped:', mapPath, error)
			}
		}

		return []
	})()

	return projectLogoPathsPromise
}

function service_tokens_from_card(url, name) {
	const tokens = new Set()
	let host = ''

	try {
		host = new URL(url).hostname
	} catch (error) {
		host = String(url || '').split('/')[2] || String(url || '')
	}

	host = host.toLowerCase().replace(/^www\./, '')
	if (host) {
		tokens.add(host)
		host.split('.').forEach(part => {
			if (part.length > 2 && !['com', 'net', 'org', 'ru', 'io', 'gg'].includes(part)) tokens.add(part)
		})
	}

	String(name || '').toLowerCase().split(/[^a-zа-я0-9]+/i).forEach(part => {
		if (part.length > 2) tokens.add(part)
	})

	return [...tokens]
}

function score_logo_path(path, tokens) {
	const normalizedPath = String(path).toLowerCase()
	const filename = normalizedPath.split('/').pop().replace(LOGO_FILE_PATTERN, '')
	let score = 0

	for (const token of tokens) {
		if (!token) continue
		if (filename === token) score += 100
		else if (filename.includes(token)) score += 45
		else if (normalizedPath.includes('/' + token + '/')) score += 30
		else if (normalizedPath.includes(token)) score += 15
	}

	if (/^NewTab\/logos\//i.test(path)) score += 5
	return score
}

async function find_logo_suggestions(url, name) {
	const tokens = service_tokens_from_card(url, name)
	if (!tokens.length) return []

	const paths = await load_project_logo_paths()
	return paths
		.map(path => ({ path, score: score_logo_path(path, tokens) }))
		.filter(item => item.score > 0)
		.sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
		.slice(0, 8)
		.map(item => ({
			path: item.path,
			url: logo_path_to_url(item.path),
			label: item.path.split('/').pop()
		}))
}

function render_logo_suggestions(logos) {
	const container = $('#logo_suggestions')
	container.empty()
	if (!logos.length) {
		container.removeClass('visible')
		clamp_card_popup_to_view()
		return
	}

	container.addClass('visible')
	container.append('<div class="logo_suggestions_title">Подходящие обложки из logos</div>')
	const list = $('<div class="logo_suggestions_list"></div>')
	container.append(list)

	logos.forEach(logo => {
		const button = $('<button type="button" class="logo_suggestion"></button>')
		button.attr('title', logo.path)
		button.data('logo-url', logo.url)
		button.append($('<img alt="">').attr('src', logo.url))
		button.append($('<span></span>').text(logo.label))
		list.append(button)
	})
	clamp_card_popup_to_view()
}

function clamp_card_popup_to_view() {
	const popup = $('#card_settings_popup')
	if (!popup.length) return

	popup.css({
		left: Math.min(window.innerWidth - popup.outerWidth() - 12, Math.max(12, parseFloat(popup.css('left')) || 12)),
		top: Math.min(window.innerHeight - popup.outerHeight() - 12, Math.max(60, parseFloat(popup.css('top')) || 60))
	})
}

async function update_logo_suggestions() {
	const requestId = ++logoSuggestionsRequestId
	const url = $('#popup_card_url').val()
	const name = $('#popup_card_name').val()
	const logos = await find_logo_suggestions(url, name)
	if (requestId !== logoSuggestionsRequestId || !$('#card_settings_popup').length) return
	render_logo_suggestions(logos)
}

function update_settings_panel_space() {
	const panelHeight = $('#settings_panel.open').outerHeight() || 0
	document.documentElement.style.setProperty('--settings-panel-space', panelHeight ? (panelHeight + 18) + 'px' : '0px')
}

function timezoneOffsetLabel(timezone) {
	const offset = moment.tz(timezone).format('Z')
	return 'UTC' + offset
}

function timezoneOptionLabel(timezone) {
	return timezone + ' (' + timezoneOffsetLabel(timezone) + ')'
}

function timezoneInputValue(timezone) {
	if (!timezone) return ''
	const match = String(timezone).match(/^(.+?)\s+\(UTC[+-]\d\d:\d\d\)$/)
	return match ? match[1] : timezone
}

function ensure_timezone_options() {
	if ($('#timezone_options').length) return ''
	const options = moment.tz.names().map(timezone =>
		'<option value="' + htmlEscape(timezoneOptionLabel(timezone)) + '"></option>'
	).join('')
	return '<datalist id="timezone_options">' + options + '</datalist>'
}

function save_timezones_from_settings() {
	const nextTimezones = [
		TZSearch(timezoneInputValue($('#timezone_1').val()) || timezones[0]),
		TZSearch(timezoneInputValue($('#timezone_2').val()) || timezones[1])
	]
	timezones = nextTimezones
	const settings = getNewTabSettings()
	settings.timezones = nextTimezones
	saveNewTabSettings(settings)
	$('#timezone_1').val(timezoneOptionLabel(nextTimezones[0]))
	$('#timezone_2').val(timezoneOptionLabel(nextTimezones[1]))
}

function save_clock_display_settings() {
	const nextBehavior = $('#clock_behavior').val() || 'hover'
	const nextShowCards = $('#clock_default_view').val() !== 'clock'
	const settings = getNewTabSettings()
	settings.clockBehavior = nextBehavior
	settings.showCards = nextShowCards
	clockBehavior = nextBehavior
	saveNewTabSettings(settings)
	set_show_cards(nextShowCards, false)
	setup_clock_behavior()
}

function save_search_settings_from_panel() {
	const settings = getNewTabSettings()
	settings.search = {
		default: $('#search_default_engine').val() || 'google',
		shift: $('#search_shift_engine').val() || 'yandex',
		ctrl: $('#search_ctrl_engine').val() || 'youtube',
		alt: $('#search_alt_engine').val() || 'animego'
	}
	saveNewTabSettings(settings)
	searchSettings = settings.search
	currentSearchEngineId = searchSettings.default
	$('#search_engine_select').val(currentSearchEngineId)
	update_search_placeholder()
}

function setup_clock_behavior() {
	$('body').off('.clockBehavior')
	switch (getUrlParameter('ShowCardF')) {
		case 'true':
			console.log('ShowCardF', 'true')
			set_show_cards(true, false)
			return
		case 'false':
			console.log('ShowCardF', 'false')
			set_show_cards(false, false)
			return
		default:
			break
	}

	if ((clockBehavior || 'hover') === 'hover') {
		$('body').on('mouseover.clockBehavior', function () {
			if (clock_en == false) set_show_cards(true, false)
		})
		$('body').on('mouseleave.clockBehavior', function () {
			if (clock_en == true) set_show_cards(false, false)
		})
	}
}

function ensure_settings_panel() {
	if ($('#settings_panel').length) return

	$('body').prepend(
		'<div id="settings_panel">' +
		ensure_timezone_options() +
		'<div id="settings_bar">' +
		'<div class="settings_group settings_group_main">' +
		'<div class="settings_group_title">Страница</div>' +
		'<div class="settings_group_controls">' +
		'<label id="volume_label">Громкость <input id="volume1" type="range" min="0" max="100" value="20"></label>' +
		'<button id="background_button" class="settings_button" title="Сменить фон">Фон</button>' +
		'</div>' +
		'</div>' +
		'<div class="settings_group" id="timezone_settings_group">' +
		'<div class="settings_group_title">Часы</div>' +
		'<div class="settings_group_controls" id="timezone_controls">' +
		'<label class="settings_field">Первый пояс<input id="timezone_1" class="settings_text_input" list="timezone_options" value="' + htmlEscape(timezoneOptionLabel(timezones[0])) + '" placeholder="Europe/Moscow"></label>' +
		'<label class="settings_field">Второй пояс<input id="timezone_2" class="settings_text_input" list="timezone_options" value="' + htmlEscape(timezoneOptionLabel(timezones[1])) + '" placeholder="Asia/Vladivostok"></label>' +
		'</div>' +
		'<div class="settings_group_controls">' +
		'<label class="settings_field">По умолчанию<select id="clock_default_view" class="settings_select"><option value="cards">Карточки</option><option value="clock">Часы</option></select></label>' +
		'<label class="settings_field">Появление часов<select id="clock_behavior" class="settings_select"><option value="fixed">Только выбранный режим</option><option value="hover">Когда мышь вне страницы</option></select></label>' +
		'</div>' +
		'</div>' +
		'<div class="settings_group" id="search_settings_group">' +
		'<div class="settings_group_title">Поиск</div>' +
		'<div class="settings_group_controls">' +
		'<label class="settings_field">Enter<select id="search_default_engine" class="settings_select">' + search_engine_options_html() + '</select></label>' +
		'<label class="settings_field">Shift<select id="search_shift_engine" class="settings_select">' + search_engine_options_html() + '</select></label>' +
		'<label class="settings_field">Ctrl<select id="search_ctrl_engine" class="settings_select">' + search_engine_options_html() + '</select></label>' +
		'<label class="settings_field">Alt<select id="search_alt_engine" class="settings_select">' + search_engine_options_html() + '</select></label>' +
		'</div>' +
		'</div>' +
		'<div class="settings_group" id="google_settings_group">' +
		'<div class="settings_group_title">Google Drive</div>' +
		'<div class="settings_group_controls">' +
		'<button id="google_login" class="settings_button primary">Войти в Google</button>' +
		'<div id="drive_actions">' +
		'<button id="drive_load" class="settings_button" title="Загрузить настройки из Google Drive">Загрузить</button>' +
		'<button id="drive_save" class="settings_button" title="Сохранить настройки в Google Drive">Сохранить</button>' +
		'</div>' +
		'<label id="auto_sync_label" title="При открытии вкладки сверять локальные настройки и Google Drive"><input id="auto_sync_toggle" type="checkbox"> Авто</label>' +
		'</div>' +
		'</div>' +
		'<div class="settings_group" id="local_backup_group">' +
		'<div class="settings_group_title">Локальный бэкап</div>' +
		'<div class="settings_group_controls">' +
		'<button id="json_load" class="settings_button" title="Импортировать настройки из JSON">Импорт</button>' +
		'<button id="json_save" class="settings_button" title="Скачать настройки JSON">Экспорт</button>' +
		'</div>' +
		'</div>' +
		'<button id="exit" class="settings_button danger" title="Закрыть настройки">×</button>' +
		'</div>' +
		'</div>'
	)

	$('#drive_load').click(cloud_load)
	$('#drive_save').click(cloud_save)
	$('#google_login').click(google_login)
	$('#json_load').click(import_settings_file)
	$('#json_save').click(export_settings_file)
	$('#background_button').click(GetBackground)
	$('#exit').click(exit_settings)
	$('#timezone_controls, #timezone_1, #timezone_2').on('mouseenter pointerenter focusin mousedown click input', start_timezone_preview)
	$('#timezone_controls, #timezone_1, #timezone_2').on('mouseleave pointerleave focusout blur', stop_timezone_preview_if_outside)
	$('#timezone_1, #timezone_2').on('change', save_timezones_from_settings)
	$('#clock_default_view').val(ShowCard ? 'cards' : 'clock')
	$('#clock_behavior').val(clockBehavior || 'hover')
	$('#clock_default_view, #clock_behavior').on('change', save_clock_display_settings)
	$('#search_default_engine').val(searchSettings?.default || 'google')
	$('#search_shift_engine').val(searchSettings?.shift || 'yandex')
	$('#search_ctrl_engine').val(searchSettings?.ctrl || 'youtube')
	$('#search_alt_engine').val(searchSettings?.alt || 'animego')
	$('#search_default_engine, #search_shift_engine, #search_ctrl_engine, #search_alt_engine').on('change', save_search_settings_from_panel)
	$('#timezone_1, #timezone_2').on('keydown', function (event) {
		if (event.key === 'Enter') {
			event.preventDefault()
			save_timezones_from_settings()
			this.blur()
		}
	})
	$("#volume1").val(volume)
	$("#auto_sync_toggle").prop('checked', isGoogleAutoSyncEnabled())

	$("#volume1").on("input change", function () {
		SoundClick.volume = $(this).val() / 100
		volume = $(this).val()
		const settings = getNewTabSettings()
		settings.volume = Number(volume)
		saveNewTabSettings(settings)
	})

	$("#auto_sync_toggle").on("change", function () {
		setGoogleAutoSyncEnabled(this.checked)
		if (this.checked && isGoogleDriveSignedIn()) {
			auto_sync_settings()
		}
	})

	update_google_sync_ui()
	update_settings_panel_space()
}

function open_settings_panel() {
	ensure_settings_panel()
	$('body').addClass('settings_open')
	$('#settings_panel').addClass('open')
	$('.card:not(.add_card_tile)').attr('draggable', 'true')
	update_settings_panel_space()
}

function close_settings_panel() {
	stop_timezone_preview()
	$('body').removeClass('settings_open')
	$('body').removeClass('card_popup_open')
	$('#settings_panel').removeClass('open')
	$('#card_settings_popup').remove()
	$(document).off('mousedown.cardSettings')
	$('.card').removeAttr('draggable')
	update_settings_panel_space()
}

function close_card_settings_popup() {
	$('body').removeClass('card_popup_open')
	$('#card_settings_popup').remove()
	$(document).off('mousedown.cardSettings')
	update_settings_panel_space()
}

function toggle_settings_panel() {
	if ($('body').hasClass('settings_open')) {
		close_settings_panel()
	} else {
		open_settings_panel()
	}
}

function open_card_settings(index, anchor) {
	const settings = getNewTabSettings()
	const card = settings.cards[index]
	if (!card) return

	$('#card_settings_popup').remove()
	$('body').addClass('card_popup_open')
	update_settings_panel_space()
	$('body').append(
		'<div id="card_settings_popup">' +
		'<button id="popup_card_close" class="popup_close_button" title="Закрыть">×</button>' +
		'<div class="popup_title">Карточка</div>' +
		'<label>Название<input id="popup_card_name" maxlength="32" value="' + htmlEscape(card.name) + '"></label>' +
		'<label>URL<input id="popup_card_url" value="' + htmlEscape(card.url) + '"></label>' +
		'<label>Обложка<input id="popup_card_image" value="' + htmlEscape(card.image) + '"></label>' +
		'<div id="logo_suggestions" class="logo_suggestions"></div>' +
		'<div class="popup_actions">' +
		'<button id="popup_card_save">Сохранить</button>' +
		'<button id="popup_card_delete" class="danger">Удалить</button>' +
		'</div>' +
		'</div>'
	)

	const rect = anchor.getBoundingClientRect()
	const popup = $('#card_settings_popup')
	popup.css({
		left: Math.min(window.innerWidth - popup.outerWidth() - 12, Math.max(12, rect.left + rect.width / 2 - 160)),
		top: Math.min(window.innerHeight - popup.outerHeight() - 12, Math.max(60, rect.bottom + 8))
	})

	$('#popup_card_url, #popup_card_name').on('input change', update_logo_suggestions)
	$('#logo_suggestions').on('click', '.logo_suggestion', function () {
		$('#popup_card_image').val($(this).data('logo-url')).trigger('input')
	})
	update_logo_suggestions()

	$('#popup_card_save').click(function () {
		const nextSettings = getNewTabSettings()
		nextSettings.cards[index] = {
			name: $('#popup_card_name').val(),
			url: $('#popup_card_url').val().trim(),
			image: $('#popup_card_image').val().trim()
		}
		if (!nextSettings.cards[index].url) return
		saveNewTabSettings(nextSettings)
		close_card_settings_popup()
		render_cards()
	})
	$('#popup_card_delete').click(function () {
		delete_button(index)
	})
	$('#popup_card_close').click(function () {
		close_card_settings_popup()
	})
	setTimeout(function () {
		$(document).off('mousedown.cardSettings').on('mousedown.cardSettings', function (event) {
			if (!$(event.target).closest('#card_settings_popup, .card').length) {
				close_card_settings_popup()
			}
		})
	}, 0)
}

function save_card_order_from_dom() {
	const settings = getNewTabSettings()
	const order = $('.card:not(.add_card_tile)').map(function () {
		return Number($(this).attr('data-card-index'))
	}).get()
	if (order.every((value, index) => value === index)) return
	const nextCards = order.map(index => settings.cards[index]).filter(Boolean)
	if (nextCards.length !== settings.cards.length) return
	settings.cards = nextCards
	saveNewTabSettings(settings)
	$('.card:not(.add_card_tile)').each(function (index) {
		$(this).attr('data-card-index', index)
		$(this).attr('id', 'card_' + (index + 1))
	})
	$('.add_card_tile').appendTo('#cards')
}

function setup_card_drag(cardElement) {
	cardElement.addEventListener('dragstart', function (event) {
		if (!$('body').hasClass('settings_open')) {
			event.preventDefault()
			return
		}
		this.classList.add('dragging')
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('text/plain', this.dataset.cardIndex)
	})

	cardElement.addEventListener('dragend', function () {
		this.classList.remove('dragging')
		save_card_order_from_dom()
	})

	cardElement.addEventListener('dragover', function (event) {
		if (!$('body').hasClass('settings_open')) return
		event.preventDefault()
		const dragging = document.querySelector('.card.dragging')
		if (!dragging || dragging === this) return
		const rect = this.getBoundingClientRect()
		const after = event.clientX > rect.left + rect.width / 2
		if (after) {
			this.after(dragging)
		} else {
			this.before(dragging)
		}
	})
}

function settings(th) {
	if (th?.shiftKey == true) {
		GetBackground()
	} else {
		GetDelParam("options")
		toggle_settings_panel()
	}
}

function add_button() {
	const settings = getNewTabSettings()
	settings.cards.push({ name: '', url: 'https://', image: '' })
	saveNewTabSettings(settings)
	render_cards()
	open_card_settings(settings.cards.length - 1, $('#card_' + settings.cards.length)[0])
}

function delete_button(index) {
	const settings = getNewTabSettings()
	if (!settings.cards[index]) return
	if (!confirm('Удалить карточку?')) return
	settings.cards.splice(index, 1)
	saveNewTabSettings(settings)
	close_card_settings_popup()
	render_cards()
}

function get_settings_snapshot() {
	let settings = getNewTabSettings()
	settings.volume = Number(volume)
	return settings
}

function exit_settings() {
	close_settings_panel()
}


function getCardDomain(url) {
	try {
		return new URL(url).hostname || url
	} catch (error) {
		return String(url).split('/')[2] || String(url)
	}
}

function render_cards() {
	$('#cards').empty()
	num = 1
	for (let i = 0; i < urls.length; i++) {
		add_card(urls[i], i)
	}
	add_add_card_tile()
	if ($('body').hasClass('settings_open')) {
		$('.card:not(.add_card_tile)').attr('draggable', 'true')
	}
}

function add_add_card_tile() {
	$('#cards').append(
		'<button id="add_card_tile" class="card add_card_tile" type="button" title="Добавить карточку">' +
		'<span class="add_card_plus">+</span>' +
		'<span class="add_card_text">Карточка</span>' +
		'</button>'
	)
	$('#add_card_tile').click(function () {
		add_button()
	})
}

function add_card(url, cardIndex) {
	const index = cardIndex ?? (num - 1)
	const cardName = names[index] || getCardDomain(url)
	const manualImage = images[index + 1]?.includes(".s-shot.ru/?") ? "" : (images[index + 1] || "")
	let scr_url = `//server.dygdyg.ru/shot.php?url=${url}`
	scr_url = getUrlParameter('screenshotmachine') ? `//api.screenshotmachine.com/?key=e51b85&dimension=480x270&url=${url}` : scr_url
	const imageUrl = manualImage || scr_url

	$('#cards').append('<a class="card" id="card_' + num + '" data-card-index="' + index + '" style="background-image: url(' + htmlEscape(imageUrl) + ')" href="' + htmlEscape(url) + '"></a>')
	const card = $('#card_' + num)
	card.append('<span class="card_edit_badge" title="Настройки карточки">⚙</span>')

	card.on('click', function (event) {
		if ($('body').hasClass('settings_open')) {
			event.preventDefault()
			open_card_settings(Number($(this).attr('data-card-index')), this)
		}
	})
	card.on('contextmenu', function (event) {
		event.preventDefault()
		open_settings_panel()
		open_card_settings(Number($(this).attr('data-card-index')), this)
	})
	card.find('.card_edit_badge').on('click', function (event) {
		event.preventDefault()
		event.stopPropagation()
		open_card_settings(Number(card.attr('data-card-index')), card[0])
	})
	setup_card_drag(card[0])

	if (cardName != '*') {
		card.append('<div class="favicon" style="background-image: url(https://www.google.com/s2/favicons?sz=128&domain=' + htmlEscape(getCardDomain(url)) + ');"></div>')
		card.append('<div class="name_tag">' + htmlEscape(cardName) + '</div>')

	}
	num++
}

function timezoneTitle(timezone) {
	const parts = String(timezone || '').replaceAll("_", " ").split("/")
	return parts[1] || parts[0] || timezone
}

setInterval(() => {
	$('#date1').text(`${moment().tz(timezones[0]).format('LL dddd')} "${timezoneTitle(timezones[0])}"`) //.replaceAll("/", ">")
	// $('#date1').text(moment().format('dddd YYYY.MM.DD'))
	$('#clock1').text(moment().tz(timezones[0]).format('HH:mm:ss'))
	$('#date2').text(`${moment().tz(timezones[1]).format('LL dddd')} "${timezoneTitle(timezones[1])}"`) //.replaceAll("/", ">")
	// $('#date2').text(moment().tz(timezones[1]).format('dddd YYYY.MM.DD'))
	$('#clock2').text(moment().tz(timezones[1]).format('HH:mm:ss'))

	time_rotator(moment().tz(timezones[0]).format('HH'), '#clock1scroll')
	time_rotator(moment().tz(timezones[1]).format('HH'), '#clock2scroll')
}, 1000)

function TZSearch(text) {
	let tz_name = moment.tz.names();
	let a
	tz_name.findIndex(e => {
		// console.log(e)
		if (e.toLowerCase().includes(text.replaceAll(" ", "_").toLowerCase())) a = e
	})
	// if(a==undefined) a = moment.tz.guess()
	return a || moment.tz.guess();
}


function serchtimezone(serch) {
	let i
	moment.tz.names().forEach(e => {
		if (e.toLowerCase().indexOf(serch.toLowerCase()) != -1) {
			console.log(e)
			i = e
			return
		}
	});
	return i
}
function soundClick(file) {
	// console.log("aaa")
	// audio.duration = 0
	SoundClick.src = file
	SoundClick.play()
}

function time_rotator(m, z) {
	// parseInt(moment().format('HH'), 10)
	$(z).empty()
	let mas = []
	let text111 = ""
	let t = (24 - parseInt(m, 10)) + 12
	// if(t>12)t=t-(24-t)
	// if(t<12)t=12-t

	for (i = 0; i < 24; i++) mas.push(i)
	for (i = 0; i < t; i++) mas.unshift(mas.pop())
	// console.log(mas)
	// console.log(t,z)
	mas.forEach(e => {
		if (e == m) {
			$(z).append("<th style='color: #000000f2;background-color: #ffffffad;border-radius: 20px;'>" + e + "</th>")
		} else {
			$(z).append("<th>" + e + "</th>")
		}
	});


	//$("#test").text(text111)
	// return text111
}

//console.log(moment.tz.names())

// if (getUrlParameter('ShowCardF') == "") {

// console.log(getUrlParameter('ShowCardF'))

$(window).on('load', function () {
	setup_clock_behavior()
})


document.addEventListener('keydown', function (event) {
	if (event.code == 'KeyB' && (event.ctrlKey || event.metaKey)) {
		let a123 = []
		for (let i = 0; i < localStorage.length; i++) {

			a123.push({ name: localStorage.key(i), data: localStorage.getItem(localStorage.key(i)) })
		}

		a321 = prompt("Скопировать настройки", JSON.stringify(a123));
		a321 = JSON.parse(a321)

		for (let i = 0; i < a321.length; i++) {
			localStorage.setItem(a321[i]["name"], a321[i]["data"])
		}
		location.reload();
	}

});

if (getUrlParameter("options") == "true") {
	setTimeout(() => settings({ shiftKey: false }), 0)
}


const GOOGLE_DRIVE_CLIENT_ID_KEY = 'newtab.googleDriveClientId';
const GOOGLE_DRIVE_DEFAULT_CLIENT_ID = '60585228937-tfkt18ldo6pptqem3qik8vhtsoc0bqri.apps.googleusercontent.com';
const GOOGLE_DRIVE_CONSENT_KEY = 'newtab.googleDriveConsentGranted';
const GOOGLE_DRIVE_TOKEN_KEY = 'newtab.googleDriveAccessToken';
const GOOGLE_DRIVE_AUTO_SYNC_KEY = 'newtab.googleDriveAutoSync';
const GOOGLE_DRIVE_FILE_NAME = 'newtab-settings.json';
const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GOOGLE_DRIVE_FIELDS = 'id,name,modifiedTime,size';
let googleDriveAccessToken = '';

const jsonDataSave = document.createElement("input");
jsonDataSave.type = "file";
jsonDataSave.accept = ".json";
jsonDataSave.addEventListener("change", function () {
	const file = jsonDataSave.files[0];
	if (!file) return;

	const reader = new FileReader();

	reader.addEventListener("load", function () {
		const jsonData = JSON.parse(reader?.result);
		applyNewTabSettings(jsonData);
		location.reload()
	});

	reader.readAsText(file);
});

function import_settings_file() {
	jsonDataSave.click();
}

function export_settings_file() {
	const settings = get_settings_snapshot();
	const downloadLink = document.createElement("a");
	downloadLink.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(settings, null, 2))}`;
	downloadLink.download = `NewTab_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
	downloadLink.click();
}

function getGoogleDriveClientId() {
	let clientId = localStorage.getItem(GOOGLE_DRIVE_CLIENT_ID_KEY) || GOOGLE_DRIVE_DEFAULT_CLIENT_ID;
	if (!clientId) {
		clientId = prompt('Google OAuth Client ID для NewTab. Можно отменить и пользоваться JSON импортом/экспортом.', '') || '';
		clientId = clientId.trim();
		if (clientId) localStorage.setItem(GOOGLE_DRIVE_CLIENT_ID_KEY, clientId);
	}
	return clientId;
}

function getCachedGoogleDriveToken() {
	try {
		const cached = JSON.parse(localStorage.getItem(GOOGLE_DRIVE_TOKEN_KEY) || 'null');
		if (!cached?.accessToken || !cached?.expiresAt) return '';
		if (Date.now() > cached.expiresAt - 60000) {
			localStorage.removeItem(GOOGLE_DRIVE_TOKEN_KEY);
			return '';
		}
		return cached.accessToken;
	} catch (error) {
		localStorage.removeItem(GOOGLE_DRIVE_TOKEN_KEY);
		return '';
	}
}

function cacheGoogleDriveToken(response) {
	const expiresIn = Number(response.expires_in || 3600);
	localStorage.setItem(GOOGLE_DRIVE_TOKEN_KEY, JSON.stringify({
		accessToken: response.access_token,
		expiresAt: Date.now() + expiresIn * 1000
	}));
	update_google_sync_ui();
}

function clearGoogleDriveToken() {
	googleDriveAccessToken = '';
	localStorage.removeItem(GOOGLE_DRIVE_TOKEN_KEY);
	update_google_sync_ui();
}

function isGoogleDriveSignedIn() {
	if (googleDriveAccessToken) return true;
	googleDriveAccessToken = getCachedGoogleDriveToken();
	return Boolean(googleDriveAccessToken);
}

function isGoogleAutoSyncEnabled() {
	return localStorage.getItem(GOOGLE_DRIVE_AUTO_SYNC_KEY) !== 'false';
}

function setGoogleAutoSyncEnabled(enabled) {
	localStorage.setItem(GOOGLE_DRIVE_AUTO_SYNC_KEY, enabled ? 'true' : 'false');
}

function update_google_sync_ui() {
	if (!$('#google_settings_group').length) return;
	const signedIn = isGoogleDriveSignedIn();
	$('#google_login').toggle(!signedIn);
	$('#drive_actions').toggle(signedIn);
	$('#google_settings_group').toggleClass('signed_in', signedIn);
}

async function google_login() {
	try {
		await getGoogleDriveToken();
		update_google_sync_ui();
		if (isGoogleAutoSyncEnabled()) {
			await auto_sync_settings();
		}
	} catch (error) {
		console.error(error);
		alert('Не удалось войти в Google: ' + error.message);
	}
}

function requestGoogleDriveToken(forceConsent) {
	return new Promise((resolve, reject) => {
		const clientId = getGoogleDriveClientId();
		if (!clientId) {
			reject(new Error('Google OAuth Client ID не указан'));
			return;
		}

		if (!window.google?.accounts?.oauth2) {
			reject(new Error('Google Identity Services не загрузился'));
			return;
		}

		const tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: clientId,
			scope: GOOGLE_DRIVE_SCOPE,
			callback: response => {
				if (response.error) {
					const hint = response.error === 'origin_mismatch'
						? `origin_mismatch. Добавь ${window.location.origin} в Authorized JavaScript origins для этого OAuth Client ID.`
						: response.error;
					reject(new Error(hint));
					return;
				}
				googleDriveAccessToken = response.access_token;
				cacheGoogleDriveToken(response);
				localStorage.setItem(GOOGLE_DRIVE_CONSENT_KEY, 'true');
				resolve(googleDriveAccessToken);
			}
		});

		const consentGranted = localStorage.getItem(GOOGLE_DRIVE_CONSENT_KEY) === 'true';
		tokenClient.requestAccessToken({ prompt: forceConsent || !consentGranted ? 'consent' : '' });
	});
}

async function getGoogleDriveToken() {
	if (googleDriveAccessToken) return googleDriveAccessToken;
	googleDriveAccessToken = getCachedGoogleDriveToken();
	if (googleDriveAccessToken) return googleDriveAccessToken;

	try {
		return await requestGoogleDriveToken(false);
	} catch (error) {
		if (['consent_required', 'interaction_required'].includes(error.message)) {
			return requestGoogleDriveToken(true);
		}
		throw error;
	}
}

async function driveRequest(url, options = {}) {
	const token = googleDriveAccessToken || await getGoogleDriveToken();
	const response = await fetch(url, {
		...options,
		headers: {
			...(options.headers || {}),
			Authorization: `Bearer ${token}`
		}
	});

	if (response.status === 401) {
		clearGoogleDriveToken();
		const freshToken = await getGoogleDriveToken();
		const retry = await fetch(url, {
			...options,
			headers: {
				...(options.headers || {}),
				Authorization: `Bearer ${freshToken}`
			}
		});

		if (!retry.ok) {
			const text = await retry.text();
			throw new Error(`Google Drive API ${retry.status}: ${text}`);
		}

		return retry;
	}

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Google Drive API ${response.status}: ${text}`);
	}

	return response;
}

async function findDriveSettingsFile() {
	const params = new URLSearchParams({
		spaces: 'appDataFolder',
		fields: `files(${GOOGLE_DRIVE_FIELDS})`,
		q: `name='${GOOGLE_DRIVE_FILE_NAME}' and 'appDataFolder' in parents and trashed=false`
	});
	const response = await driveRequest(`https://www.googleapis.com/drive/v3/files?${params}`);
	const data = await response.json();
	return data.files?.[0] || null;
}

async function createDriveSettingsFile(settings) {
	const metadata = {
		name: GOOGLE_DRIVE_FILE_NAME,
		mimeType: 'application/json',
		parents: ['appDataFolder']
	};
	const form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' }));

	const response = await driveRequest('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime', {
		method: 'POST',
		body: form
	});
	return response.json();
}

async function updateDriveSettingsFile(fileId, settings) {
	const response = await driveRequest(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,name,modifiedTime`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(settings, null, 2)
	});
	return response.json();
}

async function cloud_load() {
	if (!confirm('Загрузить настройки из Google Drive? Текущие локальные настройки будут заменены.')) return;

	try {
		loading = true;
		await getGoogleDriveToken();
		update_google_sync_ui();
		const file = await findDriveSettingsFile();
		if (!file) {
			alert('В Google Drive пока нет файла настроек NewTab.');
			return;
		}

		const response = await driveRequest(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`);
		const settings = await response.json();
		applyNewTabSettings(settings);
		alert('Настройки загружены из Google Drive.');
		location.reload();
	} catch (error) {
		console.error(error);
		alert('Не удалось загрузить настройки из Google Drive: ' + error.message);
	} finally {
		loading = false;
	}
}

async function cloud_save() {
	try {
		loading = true;
		await getGoogleDriveToken();
		update_google_sync_ui();
		const settings = saveNewTabSettings(get_settings_snapshot());
		const file = await findDriveSettingsFile();
		const savedFile = file
			? await updateDriveSettingsFile(file.id, settings)
			: await createDriveSettingsFile(settings);

		alert(`Настройки сохранены в Google Drive: ${savedFile.name}`);
	} catch (error) {
		console.error(error);
		alert('Не удалось сохранить настройки в Google Drive: ' + error.message);
	} finally {
		loading = false;
	}
}

function settingsTime(settings, fallbackTime) {
	const time = Date.parse(settings?.updatedAt || fallbackTime || '');
	return Number.isFinite(time) ? time : 0;
}

async function readDriveSettingsFile(file) {
	const response = await driveRequest(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`);
	return response.json();
}

async function auto_sync_settings() {
	if (!isGoogleAutoSyncEnabled()) return;
	if (localStorage.getItem(GOOGLE_DRIVE_CONSENT_KEY) !== 'true') return;
	if (!isGoogleDriveSignedIn()) return;

	try {
		loading = true;
		const localSettings = getNewTabSettings();
		const file = await findDriveSettingsFile();

		if (!file) {
			await createDriveSettingsFile(localSettings);
			console.log('NewTab auto-sync: Drive file created from local settings');
			return;
		}

		const remoteSettings = await readDriveSettingsFile(file);
		const localTime = settingsTime(localSettings);
		const remoteTime = settingsTime(remoteSettings, file.modifiedTime);
		const delta = localTime - remoteTime;

		if (Math.abs(delta) < 1000) {
			console.log('NewTab auto-sync: settings are already in sync');
			return;
		}

		if (remoteTime > localTime) {
			applyNewTabSettings(remoteSettings);
			console.log('NewTab auto-sync: remote settings applied');
			location.reload();
			return;
		}

		await updateDriveSettingsFile(file.id, localSettings);
		console.log('NewTab auto-sync: local settings uploaded');
	} catch (error) {
		console.warn('NewTab auto-sync skipped:', error);
	} finally {
		loading = false;
	}
}

$(window).on('load', function () {
	setTimeout(auto_sync_settings, 1500);
});

function GetDelParam(param) {
	const url = new URL(document.location);
	const searchParams = url.searchParams;
	searchParams.delete(param); // удалить параметр "test"
	window.history.pushState({}, '', url.toString());
	SiteURL = document.location.href.replace(/\/+$/, '');
}

function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};



