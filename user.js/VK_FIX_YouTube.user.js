// ==UserScript==
// @name         VK FIX YouTube
// @namespace    http://tampermonkey.net/
// @version      2025-08-02
// @description  try to take over the world!
// @author       ДугДуг
// @match        https://vk.com/*
// @match        https://web.vk.me/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vk.com
// @grant        none
// ==/UserScript==
function convertLinksToURLObjects(text) {
    // Регулярное выражение для поиска URL
    const urlPattern = /https?:\/\/[^\s<>"']+/g;

    // Находим все совпадения в строке
    const links = text.match(urlPattern) || [];

    // Преобразуем ссылки в объекты URL
    const urlObjects = links.map(link => {
        try {
            return new URL(link);
        } catch (error) {
            console.warn(`Невалидный URL: ${link}`);
            return null;
        }
    }).filter(url => url !== null); // Фильтруем невалидные URL

    return urlObjects;
}


setInterval(() => {
    document.querySelectorAll('.AttachCard:not(.yt-pleer):not(.not-yt-pleer)').forEach(e => {

        let url = convertLinksToURLObjects(e.querySelector(".AttachmentCell__headline").textContent);
        if (url.length == 0) return

        // console.log(url[0])
        // console.log(url.host, !e.classList.contains("yt-pleer"))
        url = url[0]
        window.a = url
        if ((url.host == "www.youtube.com" || url.host == "youtube.com" || url.host == "youtu.be") && !e.classList.contains("yt-pleer")) {
            // console.log(url)
            // let url = new URL(e.href);
            let videoId = url.pathname.split("/").pop(); // Извлекаем ID видео
            console.log(url.pathname.split("/")[1], e.href)
            if (url.pathname.split("/")[1] == "watch") {
                videoId = url.searchParams.get("v")
                console.log(videoId)
            }
            let style_video = url.pathname.split("/")[1] == "shorts" ? "width: 50%; aspect-ratio: 9 / 16;" : "width: 100%; aspect-ratio: 16 / 9;"
            let style_shorts = "width: 50%; aspect-ratio: 9 / 16;"
            // console.log(videoId);
            // Добавляем iframe после элемента e
            e.classList.add("yt-pleer")

            e.insertAdjacentHTML('afterend', `
              <iframe
                  align="middle"
                  style="${style_video}"
                  src="https://www.youtube.com/embed/${videoId}"
                  frameborder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
              </iframe>
          `);
        } else {
            // e.classList.add("not-yt-pleer")
        }
    });
}, 1000)
