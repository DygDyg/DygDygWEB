$(document).keyup(function(e) {
	// console.dir(e.originalEvent.key);

    //Обновить страницу
    if(e.originalEvent.key=="F5")
    {
        location.reload();
    }
});