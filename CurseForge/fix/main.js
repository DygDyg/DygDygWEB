$(document).keyup(function(e) {
	// console.dir(e.originalEvent.key);

    //Обновить страницу
    if(e.originalEvent.key=="F5")
    {
        location.reload();
    }
    if(e.originalEvent.key=="F6")
    {
        console.log(document.location.href)
        }
});