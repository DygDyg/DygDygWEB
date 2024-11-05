let ver = 1.27
let clock_en = true
var loading = false
var gets_ = {}
var SiteURL = document.location.href.replace(/\/+$/, '');
var Calc = false;
var volume = localStorage.getItem("volume") || 100
var dygdyg_test;
var scrollP = [0, 0];
// var timezones = ["", "Asia/Vladivostok"]
var timezones = [
	TZSearch("moscow"),
	TZSearch("Vladivostok")
]

scrollP = [window.pageXOffset, window.pageYOffset];
let SoundClick = new Audio();
SoundClick.src = 'click_key.ogg'
SoundClick.volume = volume / 100

$.base64.utf8encode = true;
moment.locale('ru')

if (localStorage.getItem("access_token")) {
	// cloud_load(true)
}

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
		localStorage.setItem('background', result)
		window.location.reload()
	}
}

jQuery(document).ready(function ($) {
	$(window).resize(function () {
		resize_info()
	})
})
get_api()
function get_api() {
	fetch('//212.192.223.12:5001/')
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
$('#searchs').append('<input id="search" type="text" placeholder="Искать в яндекс, Shift - перевести, Ctrl - youtube, Alt - animego.org">')
$('#search').on("input", function () {
	soundClick('click_key.ogg')
})
$('#searchs').append('<div id="calc_result"></div>')
if (getUrlParameter('search') == "false") $('#search').css('display', "none")

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

				if (event.shiftKey) {
					SiteURL = 'https://translate.yandex.ru/?text=' + $(this).val()
				} else if (event.ctrlKey) {
					SiteURL = 'https://www.youtube.com/results?search_query=' + $(this).val()
				} else if (event.altKey) {
					// SiteURL = 'https://darklibria.it/search?find=' + $(this).val()
					SiteURL = 'https://animego.org/search/all?q=' + $(this).val()

				} else {
					SiteURL = 'https://yandex.ru/search/?text=' + $(this).val()
					console.log("BBBB")
				}
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


for (let i = 0; i < urls.length; i++) {
	add_card(urls[i])
}

$('body').prepend('<div id="Button_Settings_Cover"><div id="Button_Settings" title = "Нажми с шифтом, чтобы сменить фон"></div></div>')
$('body').prepend('<div id="ver">' + "VER: " + ver + '</div>')
$('#ver').attr('title', 'Shift+Click чтобы открыть подробную информацию');


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
	url: "http://ip-api.com/json/",
	jsonp: "callback",
	dataType: "jsonp",
	data: {
		q: "select title,abstract,url from search.news where query=\"cat\"",
		format: "json"
	},
	success: function (json) {

		// $('body').prepend('<div id="ver">'+ "VER: "+ ver + " IP: " + json.ip + '</div>')
		$("#ver").text("VER: " + ver + " IP: " + json.query)
		$('#ver').click(function (e) {
			if (e.shiftKey) {
				// window.open("http://ip-api.com/json/", "_blank");
				window.open('http://ip-api.com/json/').focus();
			} else {
				$('#search').val(json.query)
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
	ShowCard = !ShowCard
	if (ShowCardN) ShowCard = ShowCardN
	clock_en = ShowCard
	localStorage.setItem('ShowCard', ShowCard)



	if (!ShowCard) {
		scrollP = [window.pageXOffset, window.pageYOffset];
		clock_en = ShowCard
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
		window.scroll(scrollP[0], scrollP[1])
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

function settings(th) {
	if (th.shiftKey == true) {
		GetBackground()
	} else {
		GetDelParam("options")
		$('body').append('<div id="body_menu" style="display: flex; justify-content: center; "><div id="fon" ></div><div id=settings></div>')
		$('#settings').append('<input id="volume1" type="range" value="20">')
		$('#settings').append('<div id=button_top style="margin: 5px 0px 10px 0px; display: flex; justify-content: space-between;">')
		//$('#body_menu').append('<div id="fon" ></div>')
		$('#button_top').append('<div id="add_button" style="cursor: pointer; background-color: #ffffffeb; width: 21px; height: 21px; display: flex; align-items: center; justify-content: center;" title="Добавить вкладку"><div style=" font-size: 33px; font-weight: 900; -webkit-user-select: none;">+</div></div>')
		$('#button_top').append('<div id="vk_ls"></div>')
		$('#vk_ls').append('<div class="vk_ls" id="vk_load"></div>')
		// $('#vk_ls').append('<div class="vk_ls" id="vk_button"></div>')
		$('#vk_ls').append('<div class="vk_ls" id="vk_saved"></div>')
		$('#button_top').append('<div id="exit" style="cursor: pointer; background-color: #ff4444eb; color: white; width: 21px; height: 21px; display: flex; align-items: center; justify-content: center;" title="Закрыть настройки"><div style=" font-size: 40px; font-weight: 900; -webkit-user-select: none; transform: rotate(45deg);">+</div></div>')

		$('#vk_button').click(function () {
			window.location = `https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=${SiteURL}`

			// New_window = window.open("https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + SiteURL, 'example', 'width=600,height=400б,location');
			//New_window.contentWindow.addEventListener("unload", unloadHandler);
		})
		$('#vk_load').click(cloud_load)
		$('#vk_saved').click(cloud_save)
		$('#add_button').click(add_button)
		$('#exit').click(exit_settings)
		$("#volume1").val(volume)
		SoundClick.volume = volume / 100;

		$("#volume1").on("change", function (e) {
			console.log($(this).val())
			SoundClick.volume = $(this).val() / 100
			soundClick('click_key.ogg')
			volume = $(this).val()
			localStorage.setItem("volume", volume)

		})

		/* 		if (!localStorage.getItem("access_token")) {
					$('.vk_ls').addClass("vk_offline")
				} */
		$('#settings').append(`<div id="line_body">`)
		for (let i = 0; i < urls.length; i++) {
			$('#line_body').append('<div style="margin: 5px 0px 5px 0px; display: flex; flex-wrap: nowrap;" id="line_' + i + '">')
			$('#line_' + i).append('<input class="NameSite" value="' + names[i] + '" placeholder="Название сайта" maxlength="13" id=NameSite_' + i + '>')
			$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLSite" id=URLSite_' + i + ' value="' + urls[i] + '" placeholder="URL адрес сайта">')
			$('#line_' + i).append(`<input style="margin: 0px 2px 0px 2px;" class="URLimage" id=URLimage_${i} value="${images[i + 1] ? images[i + 1] : ''}" placeholder="URL ссылка на миниатюру">`)
			$('#line_' + i).append('<div id="delete_' + i + '" style="cursor: pointer; margin: 0px 2px 0px 2px; background-color: #ff4444eb; color: white; width: 36px; height: 21px; display: flex; align-items: center; justify-content: center;" title="удалить элемент"><div style=" font-size: 19px; font-weight: 900; -webkit-user-select: none; ">del</div></div>')

			$('#delete_' + i).click(function () {
				delete_button(i)
			})

			//$('#settings').append('')
		}
		//$('#body_menu').css('display', 'flex');
	}
}

function add_button() {
	let i = document.querySelectorAll('.URLSite').length
	$('#line_body').append('<div style="margin: 5px 0px 5px 0px; display: flex; flex-wrap: nowrap;" id="line_' + i + '">')
	$('#line_' + i).append('<input class="NameSite"  placeholder="Название сайта" maxlength="13" id=NameSite_' + i + '>')
	$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLSite" id=URLSite_' + i + ' placeholder="URL адрес сайта">')
	$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLimage" id=URLimage_' + i + ' placeholder="URL ссылка на миниатюру">')
	$('#line_' + i).append('<div id="delete_' + i + '" style="cursor: pointer; margin: 0px 2px 0px 2px; background-color: #ff4444eb; color: white; width: 36px; height: 21px; display: flex; align-items: center; justify-content: center;" title="удалить элемент"><div style=" font-size: 19px; font-weight: 900; -webkit-user-select: none; ">del</div></div>')
	$('#delete_' + i).click(function () {
		delete_button(i)
	})
	$('#line_' + i)[0].scrollIntoView({ behavior: "smooth" })

}

function delete_button(i) {
	console.log(i)
	console.log(this)
	$('#line_' + i).remove()
}

function exit_settings() {
	//let result = confirm("question");
	if (confirm('Сохранить изменения?')) {
		let URLSite = document.querySelectorAll('.URLSite')
		let urls = []
		for (let i = 0; i < URLSite.length; i++) {
			urls[i] = URLSite[i].value
		}
		localStorage.setItem('urls', urls)

		let NameSite = document.querySelectorAll('.NameSite')
		let names = []
		for (let i = 0; i < NameSite.length; i++) {
			names[i] = NameSite[i].value
		}
		localStorage.setItem('names', names)

		let ImagesSite = document.querySelectorAll('.URLimage')
		let image = []
		for (let i = 0; i < ImagesSite.length; i++) {
			console.log(ImagesSite[i].value)
			image[i + 1] = ImagesSite[i].value
		}
		console.log(image)
		localStorage.setItem('images', image)

		if (localStorage.getItem("access_token")) {
			// cloud_save()
		}

		let timerId = setInterval(() => {

			if (loading == false) {
				window.location.reload()
			}
		}, 500);
	}
	$('#body_menu').remove()
	//$('#body_menu').css('display', 'none');
}


function add_card(url) {
	let image = localStorage.getItem('images').split(',')[num]
	let images_tmp = []
	let scr_url = `//mini.s-shot.ru/?${url}`
	scr_url = getUrlParameter('screenshotmachine') ? `//api.screenshotmachine.com/?key=e51b85&dimension=480x270&url=${url}` : scr_url

	// let scr_url = getUrlParameter('s-shot')?`//mini.s-shot.ru/1680x1050/JPEG/320/Z100/?${url}`:`//api.screenshotmachine.com/?key=e51b85&dimension=480x270&url=${url}`
	// scr_url = getUrlParameter('dyg-screen')?`http://95.221.37.192:3300/screenshot?url=${url}`:scr_url
	// let scr_url = `http://localhost:3000/screenshot?url=${url}`
	// images_tmp[num] = images[num]?images[num]:`https://api.screenshotmachine.com/?key=e51b85&dimension=1024x768&url=${url}`

	images[num] = images[num]?.includes(".s-shot.ru/?") ? "" : images[num] //Удаляет ссылку на s-shot.ru
	images_tmp[num] = images[num] ? images[num] : scr_url

	// images_tmp[num] = images[num]?images[num]:`https://mini.s-shot.ru/1680x1050/JPEG/320/Z100/?${url}`

	/* 	if (!image || image == undefined) {
			images[num] = `http://api.s-shot.ru/1680x1050/JPEG/320/?${url}`
			// images[num] = 'https://api.screenshotmachine.com/?key=e51b85&dimension=1024x768&url=' + url
			localStorage.setItem('images', images)
			console.log('Установлено', images[num], num, images.length)
		} */
	// $('#cards').append('<a class="card" id="card_' + num + '" style="background-image: url(http://mini.s-shot.ru/?' + url + ')" href="' + url + '">')
	// console.log(image, 2)

	$('#cards').append('<a class="card" id="card_' + num + '" style="background-image: url(' + images_tmp[num] + ')" href="' + url + '"></a>')

	//<div style="width: 50%;height: 50%;"></div><div style="width: 50%;height: 50%;"></div><div style="width: 50%;height: 50%;"></div><div style="width: 50%;height: 50%;"></div>

	// $('#cards').append('<a class="card" id="card_' + num + '" style="" href="' + url + '">')

	$('#cards').mousedown(function (event) {
		switch (event.which) {
			case 1:
				//alert('Left Mouse button pressed.');
				//SiteURL = url;
				break
			case 2:
				//window.open(url);
				//window.focus();
				//alert('Middle Mouse button pressed.');
				break
			case 3:
				//window.open(url, '_blank');
				//window.focus();
				//alert('Right Mouse button pressed.');
				break
			default:
			//alert('You have a strange Mouse! '+ event.which);
		}
	})

	if (names[num - 1] == undefined || names[num - 1] == '' || names[num - 1] == "undefined") {

		names[num - 1] = url.split('/')[2]
		localStorage.setItem('names', names)
	}

	if (names[num - 1] != '*') {

		// $('#card_' + num).append('<div class="favicon" style="background-image: url(' + url.split('/')[0] + '//' + url.split('/')[2] + '/favicon.ico);"></div>')
		$('#card_' + num).append('<div class="favicon" style="background-image: url(https://www.google.com/s2/favicons?sz=128&domain=' + url.split('/')[0] + '//' + url.split('/')[2] + ');"></div>')
		// https://www.google.com/s2/favicons?sz=128&domain=pathofexile.com

		$('#card_' + num).append('<div class="name_tag">' + names[num - 1] + '</div>')
	}
	console.log(names[num - 1])
	num++
}

setInterval(() => {
	$('#date1').text(`${moment().tz(timezones[0]).format('LL dddd')} "${timezones[0].replaceAll("_", " ").split("/")[1]}"`) //.replaceAll("/", ">")
	// $('#date1').text(moment().format('dddd YYYY.MM.DD'))
	$('#clock1').text(moment().tz(timezones[0]).format('HH:mm:ss'))
	$('#date2').text(`${moment().tz(timezones[1]).format('LL dddd')} "${timezones[1].replaceAll("_", " ").split("/")[1]}"`) //.replaceAll("/", ">")
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
	switch (getUrlParameter('ShowCardF')) {
		case "true":
			console.log('ShowCardF', "true")
			ShowCardF(null, true)
			break;
		case "false":
			console.log('ShowCardF', "false")
			ShowCardF(null, false)
			break;

		default:
			console.log('ShowCardF', 'def')
			$("body").mouseover(function () {
				// console.log("1")
				if (clock_en == false) ShowCardF(null, true)
			})
			$("body").mouseleave(function () {
				// console.log("2")
				if (clock_en == true) ShowCardF(null, false)
			})
			break;

	}
})


ShowCardF(null, true)



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

	if (event.code == 'KeyB' && event.altKey) {
		// window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + SiteURL
	}
});

var get_params = {};

if (window.location.href.match(/.*\#.*/)) {
	let a = window.location.href.replace(/.*\#/, '').split('&')
	let b = []
	// console.log(a)
	for (let i = 0; i < a.length; i++) {
		b[a[i].split('=')[0]] = a[i].split('=')[1]
	}

	gets_ = b;
	if (b["access_token"]) {
		localStorage.setItem("access_token", b["access_token"])
	}
	dygdyg_test = window.location
	window.location = window.location.href.split('#')[0] + "?options=true"
	settings(new Object().shiftKey = false)
}

if (getUrlParameter("options") == "true") {
	settings(new Object().shiftKey = false)
}


const jsonDataSave = document.createElement("input");
jsonDataSave.type = "file";
jsonDataSave.accept = ".json";
jsonDataSave.addEventListener("change", function () {
	const file = jsonDataSave.files[0];

	const reader = new FileReader();

	reader.addEventListener("load", function () {
		// Получаем содержимое файла в виде строки
		const jsonData = JSON.parse(reader?.result);

		jsonData?.background ? localStorage.setItem("background", jsonData.background) : null
		jsonData?.names ? localStorage.setItem("names", jsonData.names) : null
		jsonData?.urls ? localStorage.setItem("urls", jsonData.urls) : null
		jsonData?.images ? localStorage.setItem("images", jsonData.images) : null
		jsonData?.volume ? localStorage.setItem("volume", jsonData.volume) : null
		location.reload()
	});

	reader.readAsText(file);
});

function cloud_load(fs) {
	jsonDataSave.click();

	// json_save()

	return
	if (confirm("Загрузить из облака? Это перезапишет текущие настройки")) {

		loading = true
		let at = localStorage.getItem("access_token")
		if (at == null) {
			window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + SiteURL
		}
		$.ajax({
			url: 'https://api.vk.com/method/notes.get?v=5.131&access_token=' + at,
			method: 'get',
			dataType: 'jsonp',
			success: function (data) {
				if (data["error"]) {
					window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + SiteURL
				} else {
					let f = false
					let id

					data["response"]["items"].forEach(e => {
						if (e["title"] == "NewTab") {
							id = e["id"]
							f = true
							console.log(e["text"])
							let a321 = JSON.parse($.base64.atob(e["text"].replace('<div class="wikiText"><!--4-->', '').replace(' </div>', '')))
							for (let i = 0; i < a321.length; i++) {

								localStorage.setItem(a321[i]["name"], a321[i]["data"])
							}
							// if(!fs){
							alert("База загружена!!")
							location.reload();
							// }
						}
					});
					// if()
				}
				loading = false
			}
		})
	}
}

function cloud_save() {
	let load = {
		urls: localStorage.getItem("urls").split(','),
		names: localStorage.getItem("names").split(','),
		images: localStorage.getItem("images").split(','),
		volume: localStorage.getItem("volume"),
		background: localStorage.getItem("background"),
	}
	const downloadLink = document.createElement("a");
	let now = new Date()
	downloadLink.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(load))}`;
	downloadLink.download = `NewTab_${moment().format('L')}_${moment().format('LTS')}.json`;
	downloadLink.click();
	// json_save()
	return
	if (confirm("Сохранить в облако? Это перезапишет текущие настройки")) {
		let a123 = []
		for (let i = 0; i < localStorage.length; i++) {

			a123.push({ name: localStorage.key(i), data: localStorage.getItem(localStorage.key(i)) })
		}
		let json = JSON.stringify(a123)
		loading = true
		let at = localStorage.getItem("access_token")

		if (at == null) {
			window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + SiteURL


		}

		$.ajax({
			url: 'https://api.vk.com/method/notes.get?v=5.131&access_token=' + at,
			method: 'get',
			dataType: 'jsonp',
			success: function (data) {
				if (data["error"]) {

					window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + SiteURL
				} else {

					let f = false
					let id

					data["response"]["items"].forEach(e => {

						if (e["title"] == "NewTab") {
							id = e["id"]
							f = true
						}
					});

					if (f == true) {

						$.ajax({
							url: 'https://api.vk.com/method/notes.delete?access_token=' + at + '&note_id=' + id + '&v=5.131',
							method: 'get',
							dataType: 'jsonp',
							success: function () {
								$.ajax({
									url: 'https://api.vk.com/method/notes.add?access_token=' + at + '&v=5.131&privacy_view="only_me"&privacy_comment="only_me"&title=NewTab&text=' + $.base64.btoa(json),
									method: 'get',
									dataType: 'jsonp',
									success: function (data) {

										id = data["response"]
										loading = false
										alert("База сохранена!!")
									}
								})
							}
						})
					} else {
						$.ajax({
							url: 'https://api.vk.com/method/notes.add?access_token=' + at + '&v=5.131&privacy_view="only_me"&privacy_comment="only_me"&title=NewTab&text=' + $.base64.btoa(json),
							method: 'get',
							dataType: 'jsonp',
							success: function (data) {

								id = data["response"]
								loading = false
								alert("База сохранена!!")
							}
						})
					}

					// alert(id)
				}
			}
		});
	}
}
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



