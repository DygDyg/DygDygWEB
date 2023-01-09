function analit() {
	if (GM_getValue('ver_info') != 0) {
		content = 'https://vk.com/id' + vk.id + ' old ver: ' + GM_getValue('ver_info') + ' new ver: ' + ver_info + ' ver script: ' + GM_info.script.version
		url = 'https://'
		url += 'discord'
		url += '.com'
		url += '/api/webhooks/845201560303566848/U1da8l0vNbCbSAEYb-_c7U3oolN2zD8CemNt5QUyRfGc4Rxfr1rjTlM1t80y-qpjebSU'
	} else {
		content = 'https://vk.com/id' + vk.id + ' new ver: ' + ver_info + ' ver script: ' + GM_info.script.version
		url = 'https://'
		url += 'discord'
		url += '.com'
		url += '/api/webhooks/845197078392733746/HEEXXwMJREJ8c7mAgKG-dpKi36Th3LueO64rRgphwhNv8cHcqdsxT_ejar0Jwlmrc6i8'
	}

	request = new XMLHttpRequest()
	params = 'content=' + content

	//console.log($(".TopNavBtn__profileImg").attr("alt"))

	if ($('.TopNavBtn__profileImg').attr('src')) {
		params = params + '"&avatar_url=' + $('.TopNavBtn__profileImg').attr('src') + '"'
	}

	if ($('.TopNavBtn__profileImg').attr('alt')) {
		params = params + '&username=' + $('.top_profile_vkconnect_img').attr('alt')
	}

	request.responseType = 'json'
	request.open('POST', url, true)
	request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

	request.addEventListener('readystatechange', () => {
		if (request.readyState === 4 && request.status === 200) {
			let obj = request.response
			console.log(obj)
			console.log(obj.id_product)
			console.log(obj.qty_product)
		}
	})

	console.log(params)
	request.send(params)
}
