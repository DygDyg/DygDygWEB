if (!localStorage.getItem('urls')) {
	urls = ['https://yandex.ru/', 'https://vk.com', 'https://youtube.com/feed/subscriptions']
	localStorage.setItem('urls', urls)
	alert('URL База загружена')
}
if (!localStorage.getItem('names')) {
	names = []
	localStorage.setItem('names', names)
	alert('Name База загружена')
}

if (!localStorage.getItem('images')) {
	images = []
	localStorage.setItem('images', images)
	alert('images База загружена')
}

urls = localStorage.getItem('urls').split(',')
names = localStorage.getItem('names').split(',')
images = localStorage.getItem('images').split(',')
