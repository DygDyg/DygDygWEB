$(document).keyup(function (e) {
	// console.dir(e.originalEvent.key);

	//Обновить страницу
	if (e.originalEvent.key == 'F5') {
		location.reload()
	}
    //Вывести ссылку в консоль
	if (e.originalEvent.key == 'F6') {
		console.log(document.location.href)
	}

    if (e.originalEvent.key == 'F7') {
		console.log("2")
	}

    $(".alpha-tag").click(function(){print("ok")})
})
