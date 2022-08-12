// if (!localStorage.getItem('image'))
// {
// 	localStorage.setItem('image', "")
// }


if (localStorage.getItem('background')) {
	$('body').css('background-image', 'url(' + localStorage.getItem('background') + ')')
}

at = 'access_token=5068f7995068f7995068f7993e5039a129550685068f79909b64ef038338754cb12e019&v=5.52&'
getdata = 'owner_id=-22786271&album_id=229998745&photo_sizes=true&count=1000'
var req = 'https://api.vk.com/method/photos.get?' + at + getdata

$.ajax({
	url: req,
	type: 'GET',
	dataType: 'jsonp',
	success: function (msg) {
		if (msg.response) {
			rand = Math.round(Math.random() * msg.response.count)
			//console.log(msg.response);
			console.log(msg.response.items[rand].sizes)
			//console.log(rand)
			//console.log(Math.random() * (1000 - 0) + 1000)
			//$('body').css('background-image', 'url('+msg.response.items[rand].sizes[msg.response.items[rand].sizes.length-1].src+')');
			//background-image: url(https://cdn.discordapp.com/attachments/807742820923736116/843995288044961822/w-dog.ru_1280x1024.jpg);
			if (msg.response.items[rand].sizes[6].src) {
				localStorage.setItem('background', msg.response.items[rand].sizes[6].src)
			}
		}
	}
})

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
$('#searchs').append('<input id="search" type="text" placeholder="Искать в яндекс">')

$(document).ready(function () {
	$('#search').keydown(function (e) {
		if (e.keyCode === 13) {
			//alert($(this).val());
			document.location.href = 'https://yandex.ru/search/?text=' + $(this).val()
		}
	})
})

$('body').append('<div id="cards"></div>')

for (let i = 0; i < urls.length; i++) {
	add_card(urls[i])
}
$('body').prepend('<div id="Button_Settings_Cover"><div id="Button_Settings"></div></div>')
$('#Button_Settings_Cover').click(settings)
resize_info()

function settings() {
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
		$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLimage" id=URLimage_' + i + ' value="' + images[i+1] + '" placeholder="URL ссылка на миниатюру">')
		$('#line_' + i).append('<div id="delete_' + i + '" style="cursor: pointer; margin: 0px 2px 0px 2px; background-color: #ff4444eb; color: white; width: 36px; height: 21px; display: flex; align-items: center; justify-content: center;" title="удалить элемент"><div style=" font-size: 19px; font-weight: 900; -webkit-user-select: none; ">del</div></div>')

		$('#delete_' + i).click(function () {
			delete_button(i)
		})

		//$('#settings').append('')
	}
	//$('#body_menu').css('display', 'flex');
}

function add_button() {
	let i = document.querySelectorAll('.URLSite').length
	$('#settings').append('<div style="margin: 5px 0px 5px 0px; display: flex; flex-wrap: nowrap;" id="line_' + i + '">')
	$('#line_' + i).append('<input class="NameSite"  placeholder="Название сайта" maxlength="13" id=NameSite_' + i + '>')
	$('#line_' + i).append('<input style="margin: 0px 2px 0px 2px;" class="URLSite" id=URLSite_' + i + ' placeholder="URL адрес сайта">')
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
			image[i+1] = ImagesSite[i].value
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
		images[num] = "http://mini.s-shot.ru/?" + url
		localStorage.setItem('images', images)
		console.log("Установлено",images[num], num, images.length)
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
	if(names[num - 1] == "undefined"|| names[num - 1] == "")
	{
		console.log(url.split("/")[2])
		names[num - 1] = url.split("/")[2]
	}
	// console.log(names[num - 1])
	$('#card_' + num).append('<div class="name_tag">' + names[num - 1] + '</div>')
	num++
}
