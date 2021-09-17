function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=')

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1]
		}
	}
}

var req = $('#VK_URL_JSON').text()
//alert(req);

if (getUrlParameter('access_token')) {
	req = req + '&access_token=' + getUrlParameter('access_token')
	//console.log('a')
} else {
	req = req + '&access_token=' + '0d6bdfbd0d6bdfbd0d6bdfbd390d1c30e000d6b0d6bdfbd6dccaa2bb030f8333b4fd3fe' + '&v=5.131'
	//console.log('b')
}

$.ajax({
	url: req,
	dataType: 'jsonp',
	success: function (data, textStatus) {
		if (data.error) {
			console.warn(data.error.error_msg)
			return
		}

		
		for (const item in data.response.items) {
			const element = data.response.items[item]
			let asd = element.sizes.sort((a,b) => (a.height > b.height) ? 1 : ((b.height > a.height) ? -1 : 0))
			myGameInstance.SendMessage('Main', 'Json_base_URL_add', asd[asd.length-1].url)
		}
		myGameInstance.SendMessage('Main', 'Start_Load_Texture')
	}
})



function test321(a)
{
	console.log("ебучий тест321:", a);
}

window.test321 = test321;
