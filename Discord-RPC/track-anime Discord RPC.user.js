// ==UserScript==
// @name         track-anime Discord RPC
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Добавляет интеграцию track-anime с активностью в дискорд
// @author       ДугДуг
// @match          *://track-anime.dygdyg.ru/*
// @icon         https://track-anime.dygdyg.ru/favicon.png
// @noframes
// @grant        none
// ==/UserScript==


// Настройки WebSocket
const wsUrl = 'ws://localhost:4654';
const clientId = '1403578059851960533';
const timer_int = 5;
let ws;
let time = 0;


// console.log(1111, window.paren)

// Функция для подключения к WebSocket
function connectWebSocket() {
    ws = new WebSocket(wsUrl);
    window.ws = ws
    ws.onopen = function () {
        // console.log('WebSocket подключен');
        // Отправляем тестовые данные активности

    };

    ws.onmessage = function (event) {
        // console.log('Получен ответ от сервера:', event.data);
    };

    ws.onclose = function () {
        console.log('WebSocket отключен, пытаюсь переподключиться...');
        setTimeout(connectWebSocket, 15000); // Переподключение через 15 секунд
    };

    ws.onerror = function (error) {
        console.error('Ошибка WebSocket:', error);
    };



    setInterval(() => {
        if(document.hidden) return
		if(ws.readyState != 1) return
		if(window.label.time==time)return
		// console.log(111,time)
        if (window.label) {
            info = {}
            if ((new URL(window.location.href)).searchParams.get("shikimori_id")) {
                info.button_label = "Открыть аниме"
                info.url = window.location.origin + "/?shikimori_id=" + (new URL(window.location.href)).searchParams.get("shikimori_id");
            } else {
                info.button_label = "Открыть сайт"
                info.url = window.location.origin;
            }
            const activityData = {
                clientId: clientId,
                details: window.label.details,
                state: window.label.state,
                largeImageKey: 'site_icon',
                largeImageText: 'Мой сайт',
                instance: false,
                buttons: [
                    {
                        label: info.button_label,
                        url: info.url
                    }
                ]
            };
            if (window?.label?.timestamps?.start) {
                activityData.startTimestamp = Number(window?.label?.timestamps?.start*1000);
            } else {
                activityData.startTimestamp = Number(new Date()) + 10000;
            }
            ws.send(JSON.stringify(activityData));
			time = window.label.time
        }
    }, timer_int*1000);
}

// Запускаем подключение при загрузке страницы
window.addEventListener('load', () => {
    connectWebSocket();
});