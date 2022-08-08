if (!localStorage.getItem('urls')) {
    urls = ['https://yandex.ru/', 'https://vk.com', 'https://www.youtube.com/feed/subscriptions']
    localStorage.setItem('urls', urls)
    alert('URL База загружена')
}

if (!localStorage.getItem('names')) {
    names = ['yandex.ru', 'vk.com', 'youtube.com']
    localStorage.setItem('names', names)
    alert('Name База  загружена')
}

urls = localStorage.getItem('urls').split(',')
names = localStorage.getItem('names').split(',')