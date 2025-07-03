// ==UserScript==
// @name         VK FIX YouTube
// @namespace    https://dygdyg.github.io/
// @version      2025-07-04
// @description  Чинит плеер ютуба в вк
// @author       ДугДуг
// @match        https://vk.com/*
// @updateURL    https://dygdyg.github.io/DygDygWEB/DygDygWEB/user.js/VK_FIX_YouTube.user.js
// @downloadURL  https://dygdyg.github.io/DygDygWEB/DygDygWEB/user.js/VK_FIX_YouTube.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vk.com
// @grant        none
// ==/UserScript==


setInterval(() => {
    document.querySelectorAll('.AttachCard:not(.yt-pleer):not(.not-yt-pleer)').forEach(e => {

        let url = new URL(e.href);
        // console.log(url.host, !e.classList.contains("yt-pleer"))
        if ((url.host == "www.youtube.com" || url.host == "youtube.com" || url.host == "youtu.be") && !e.classList.contains("yt-pleer")) {
            let url = new URL(e.href);
            let videoId = url.pathname.split("/").pop(); // Извлекаем ID видео
            console.log(url.pathname.split("/")[1], e.href)
            if(url.pathname.split("/")[1]=="watch")
            {
                videoId = url.searchParams.get("v")
                console.log(videoId)
            }
            let style_video = url.pathname.split("/")[1]=="shorts"?"width: 50%; aspect-ratio: 9 / 16;":"width: 100%; aspect-ratio: 16 / 9;"
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
        }else{
            // e.classList.add("not-yt-pleer")
        }
    });
}, 1000)
