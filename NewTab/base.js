let ver = 1.4

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
	;(function ($) {
		//const windowInnerWidth = window.innerWidth
		//const windowInnerHeight = window.innerHeight
		//$('.card').css('height', window.innerWidth / 15);
		//alert(windowInnerWidth)
	})(jQuery)
}

num = 1
$('body').append('<div id="searchs"></div>')
$('#searchs').append('<input id="search" type="text" placeholder="Искать в яндекс, Shift - google, Ctrl - youtube, Alt - darklibria">')

$(document).ready(function () {
	$('#search').keydown(function (e) {
		if (e.keyCode === 13) {
			if ($(this).val().startsWith('http://') || $(this).val().startsWith('https://') || $(this).val().startsWith('file://') || $(this).val().startsWith('ftp://') || $(this).val().startsWith('steam://') || $(this).val().startsWith('magnet:?')) {
				document.location.href = $(this).val()
			} else {
				if (event.shiftKey) {
					document.location.href = 'https://www.google.ru/search?q=' + $(this).val()
				} else if (event.ctrlKey) {
					document.location.href = 'https://www.youtube.com/results?search_query=' + $(this).val()
				}else if (event.altKey) {
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
$('body').prepend('<div id="ver">' + "VER: "+ ver + '</div>')

$('body').append('<div id="clockG"><div id="clock">12:34:56</div></div>')



	$.ajax({
		url: "https://api.ipify.org?format=jsonp&callback=?",
		jsonp: "callback",
		dataType: "jsonp",
		data: {
			q: "select title,abstract,url from search.news where query=\"cat\"",
			format: "json"
		},
		success: function(json) {

			// $('body').prepend('<div id="ver">'+ "VER: "+ ver + " IP: " + json.ip + '</div>')
			$("#ver").text("VER: "+ ver + " IP: " + json.ip)
			// alert(json.ip)
		}
	})

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

function ShowCardF() {
	ShowCard = !ShowCard
	localStorage.setItem('ShowCard', ShowCard)

	if (!ShowCard) {
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
		$('#button_top').append('<div id="exit" style="cursor: pointer; background-color: #ff4444eb; color: white; width: 21px; height: 21px; display: flex; align-items: center; justify-content: center;" title="Закрыть настройки"><div style=" font-size: 40px; font-weight: 900; -webkit-user-select: none; transform: rotate(45deg);">+</div></div>')

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

	$('#cards').append('<a class="card" id="card_' + num + '" style="background-image: url(' + images[num] +')" href="' + url + '">')

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

		$('#card_' + num).append('<div class="favicon" style="background-image: url('+url.split('/')[0]+'//'+url.split('/')[2]+'/favicon.ico);"></div>')

		$('#card_' + num).append('<div class="name_tag">' + names[num - 1] + '</div>')	}

	num++
}

setInterval(() => {
	let time = new Date()
	$('#clock').text(time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds())
}, 1000)