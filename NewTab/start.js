function stringToBool(val) {
    return (val + '').toLowerCase() === 'true';
}

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

if (!localStorage.getItem('background')) {

    background = "https://sun9-17.userapi.com/c857628/v857628352/16b73d/w-YSbE4d4mc.jpg"
	localStorage.setItem('background', background)
    alert('background База загружена')
}

if (!localStorage.getItem('ShowCard')) {
	localStorage.setItem('ShowCard', true)
	alert('ShowCard База загружена')
}

background = localStorage.getItem('background')
urls = localStorage.getItem('urls').split(',')
names = localStorage.getItem('names').split(',')
images = localStorage.getItem('images').split(',')
ShowCard = stringToBool(localStorage.getItem('ShowCard'))

