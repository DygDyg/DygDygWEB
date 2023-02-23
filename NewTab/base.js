let ver = 1.11
let clock_en = true
var loading = false
var gets_ = {}


let SoundClick = new Audio();

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
$('#searchs').append('<input id="search" type="text" placeholder="Искать в яндекс, Shift - перевести, Ctrl - youtube, Alt - darklibria">')
$('#search').on("input", function () {
	soundClick('click_key.ogg')
})

$(document).ready(function () {
	$('#search').keydown(function (e) {
		if (e.keyCode === 13) {
			if ($(this).val().startsWith('http://') || $(this).val().startsWith('https://') || $(this).val().startsWith('file://') || $(this).val().startsWith('ftp://') || $(this).val().startsWith('steam://') || $(this).val().startsWith('magnet:?')) {
				document.location.href = $(this).val()
			} else {
				if (event.shiftKey) {
					document.location.href = 'https://translate.yandex.ru/?text=' + $(this).val()
				} else if (event.ctrlKey) {
					document.location.href = 'https://www.youtube.com/results?search_query=' + $(this).val()
				} else if (event.altKey) {
					document.location.href = 'https://darklibria.it/search?find=' + $(this).val()
				} else {
					document.location.href = 'https://yandex.ru/search/?text=' + $(this).val()
				}
			}
			// console.log($(this).val().startsWith("http://"))
			//alert($(this).val());
			//
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
	'<div class="clock" id="clock1">12:34:56</div>' +
	'<div class="clockscroll" id="clock1scroll"></div>' +
	'<div id="clock2" class="clock">12:34:56</div>' +
	'<div class="clockscroll"id="clock2scroll"></div>' +
	'</div>')


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
		// console.log(data)
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
	// if (ShowCardN) ShowCard = ShowCardN
	// console.log("ShowCardTest")
	ShowCard = !ShowCard
	clock_en = ShowCard
	localStorage.setItem('ShowCard', ShowCard)



	if (!ShowCard) {
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
		$('body').append('<div id="body_menu" style="display: flex; justify-content: center; "><div id="fon" ></div><div id=settings></div>')
		$('#settings').append('<div id=button_top style="margin: 5px 0px 10px 0px; display: flex; justify-content: space-between;">')
		//$('#body_menu').append('<div id="fon" ></div>')
		$('#button_top').append('<div id="add_button" style="cursor: pointer; background-color: #ffffffeb; width: 21px; height: 21px; display: flex; align-items: center; justify-content: center;" title="Добавить вкладку"><div style=" font-size: 33px; font-weight: 900; -webkit-user-select: none;">+</div></div>')
		$('#button_top').append('<div id="vk_ls"></div>')
		$('#vk_ls').append('<div class="vk_ls" id="vk_load"></div>')
		$('#vk_ls').append('<div id="vk_button"></div>')
		$('#vk_ls').append('<div class="vk_ls" id="vk_saved"></div>')
		$('#button_top').append('<div id="exit" style="cursor: pointer; background-color: #ff4444eb; color: white; width: 21px; height: 21px; display: flex; align-items: center; justify-content: center;" title="Закрыть настройки"><div style=" font-size: 40px; font-weight: 900; -webkit-user-select: none; transform: rotate(45deg);">+</div></div>')

		$('#vk_button').click(function() {
			window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + document.location.href

		})
		$('#vk_load').click(cloud_load)
		$('#vk_saved').click(cloud_save)
		$('#add_button').click(add_button)
		$('#exit').click(exit_settings)

		for (let i = 0; i < urls.length; i++) {
			$('#settings').append('<div style="margin: 5px 0px 5px 0px; display: flex; flex-wrap: nowrap;" id="line_' + i + '">')
			$('#line_' + i).append('<input class="NameSite" value="' + names[i] + '" placeholder="Название сайта" maxlength="13" id=NameSite_' + i + '>')
			$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLSite" id=URLSite_' + i + ' value="' + urls[i] + '" placeholder="URL адрес сайта">')
			$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLimage" id=URLimage_' + i + ' value="' + images[i + 1] + '" placeholder="URL ссылка на миниатюру">')
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
	$('#settings').append('<div style="margin: 5px 0px 5px 0px; display: flex; flex-wrap: nowrap;" id="line_' + i + '">')
	$('#line_' + i).append('<input class="NameSite"  placeholder="Название сайта" maxlength="13" id=NameSite_' + i + '>')
	$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLSite" id=URLSite_' + i + ' placeholder="URL адрес сайта">')
	$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLimage" id=URLimage_' + i + ' placeholder="URL ссылка на миниатюру">')
	$('#line_' + i).append('<div id="delete_' + i + '" style="cursor: pointer; margin: 0px 2px 0px 2px; background-color: #ff4444eb; color: white; width: 36px; height: 21px; display: flex; align-items: center; justify-content: center;" title="удалить элемент"><div style=" font-size: 19px; font-weight: 900; -webkit-user-select: none; ">del</div></div>')
	$('#delete_' + i).click(function () {
		delete_button(i)
	})
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

		window.location.reload()
	}
	$('#body_menu').remove()
	//$('#body_menu').css('display', 'none');
}

function add_card(url) {
	let image = localStorage.getItem('images').split(',')[num]
	if (!image || image == undefined) {
		images[num] = 'http://mini.s-shot.ru/?' + url
		localStorage.setItem('images', images)
		console.log('Установлено', images[num], num, images.length)
	}
	// $('#cards').append('<a class="card" id="card_' + num + '" style="background-image: url(http://mini.s-shot.ru/?' + url + ')" href="' + url + '">')
	// console.log(image, 2)

	$('#cards').append('<a class="card" id="card_' + num + '" style="background-image: url(' + images[num] + ')" href="' + url + '">')

	// $('#cards').append('<a class="card" id="card_' + num + '" style="" href="' + url + '">')

	$('#cards').mousedown(function (event) {
		switch (event.which) {
			case 1:
				//alert('Left Mouse button pressed.');
				//document.location.href = url;
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
	if (names[num - 1] == 'undefined' || names[num - 1] == '') {

		names[num - 1] = url.split('/')[2]
	}

	if (names[num - 1] != '*') {

		$('#card_' + num).append('<div class="favicon" style="background-image: url(' + url.split('/')[0] + '//' + url.split('/')[2] + '/favicon.ico);"></div>')

		$('#card_' + num).append('<div class="name_tag">' + names[num - 1] + '</div>')
	}

	num++
}

setInterval(() => {

	$('#clock1').text(moment().format('HH:mm:ss'))
	$('#clock2').text(moment().tz('Asia/Vladivostok').format('HH:mm:ss'))

	time_rotator(moment().format('HH'), '#clock1scroll')
	time_rotator(moment().tz('Asia/Vladivostok').format('HH'), '#clock2scroll')
}, 1000)


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


$("body").mouseover(function () {
	// console.log("1")
	if (clock_en == false) ShowCardF(null, true)
})
$("body").mouseleave(function () {
	// console.log("2")
	if (clock_en == true) ShowCardF(null, false)
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
		// window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + document.location.href
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

	// console.log(b)
	gets_ = b;
	if (b["access_token"]) {
		localStorage.setItem("access_token", b["access_token"])
	}

}

function cloud_load() {
	loading = true
	let at = localStorage.getItem("access_token")
	if (at == null) {
		window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + document.location.href
	}
	$.ajax({
		url: 'https://api.vk.com/method/notes.get?v=5.131&access_token=' + at,
		method: 'get',
		dataType: 'jsonp',
		success: function (data) {
			if (data["error"]) {
				console.log(data["error"]["error_code"])
				window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + document.location.href
			} else {
				let f = false
				let id

				data["response"]["items"].forEach(e => {
					if (e["title"] == "NewTab") {
						id = e["id"]
						f = true
						// console.log(e["text"].replace('<div class="wikiText"><!--4-->', '').replace(' </div>', '')) //<div class="wikiText"><!--4-->add </div>
						console.log(e)
						let a321 = JSON.parse(e["text"].replace('<div class="wikiText"><!--4-->', '').replace(' </div>', ''))
						console.log(a321)
						for (let i = 0; i < a321.length; i++) {
							localStorage.setItem(a321[i]["name"], a321[i]["data"])
						}
						// location.reload();
					}
				});
				// if()
			}
			loading = false
		}
	})
}

function cloud_save() {
	let a123 = []
	for (let i = 0; i < localStorage.length; i++) {

		a123.push({ name: localStorage.key(i), data: localStorage.getItem(localStorage.key(i)) })
	}
	let json = JSON.stringify(a123)
	loading = true
	let at = localStorage.getItem("access_token")

	if (at == null) {
		window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + document.location.href
	}

	$.ajax({
		url: 'https://api.vk.com/method/notes.get?v=5.131&access_token=' + at,
		method: 'get',
		dataType: 'jsonp',
		success: function (data) {
			if (data["error"]) {
				console.log(data["error"]["error_code"])
				window.location = "https://oauth.vk.com/authorize?client_id=5330608&display=page&response_type=token&v=5.131&scope=2048&redirect_uri=" + document.location.href
			} else {
			
			let f = false
			let id
			console.log(data["response"]["items"])
			data["response"]["items"].forEach(e => {
				console.log(e["title"])
				if (e["title"] == "NewTab") {
					id = e["id"]
					f = true
				}
			});

			if (f == true) {
				console.log("OK")
				console.log(id)
				$.ajax({
					url: 'https://api.vk.com/method/notes.delete?access_token=' + at + '&note_id=' + id + '&v=5.131',
					method: 'get',
					dataType: 'jsonp',
					success: function () {
						$.ajax({
							url: 'https://api.vk.com/method/notes.add?access_token=' + at + '&v=5.131&privacy_view="only_me"&privacy_comment="only_me"&title=NewTab&text=' + json,
							method: 'get',
							dataType: 'jsonp',
							success: function (data) {
								console.log(data)
								id = data["response"]
								loading = false
							}
						})
					}
				})
			} else {
				$.ajax({
					url: 'https://api.vk.com/method/notes.add?access_token=' + at + '&v=5.131&privacy_view="only_me"&privacy_comment="only_me"&title=NewTab&text=' + json,
					method: 'get',
					dataType: 'jsonp',
					success: function (data) {
						console.log(data)
						id = data["response"]
						loading = false
					}
				})
				console.log("НЕ OK")
			}

			// alert(id)
		}
	}
	});
}