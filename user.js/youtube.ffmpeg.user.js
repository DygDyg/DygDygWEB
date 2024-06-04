// ==UserScript==
// @name         youtube ffmpeg
// @namespace    http://tampermonkey.net/
// @version      2024-05-30
// @description  Позволяет скачивать и обрезать видео с ютуба
// @author       ДугДуг
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at        document-start
// @grant        GM_addStyle
// @grant 		 GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

GM_addStyle(`

.btn_ff:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.btn_ff {
    color: white;
    display: flex;
    padding: 5px 16px;
    align-items: center;
    background: #272727;
    border-radius: 24px;
    /* width: 60px; */
    justify-content: center;
    font-size: 1.6rem;
    margin-right: 7px;
    height: 28px;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition: all 0.1s ease-in-out;
	text-align: center;
}
.p_ff .btn_ff {
    border-radius: 40px 0px 0px 40px;
    margin-right: 0px;
    margin-left: 7px;
}
.p_ff {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    flex-direction: row;
    margin-right: 7px;
}

.panel_ff {
    display: flex;
    flex-wrap: nowrap;
    // justify-content: space-between;
    // justify-content: center;
    flex-direction: row;
    margin: 6px;
    position: relative;
}
.in_ff {
    background-color: var(--ytd-searchbox-background);
    border: 1px solid var(--ytd-searchbox-legacy-border-color);
    border-right: none;
    border-radius: 0px 40px 40px 0px;
    box-shadow: inset 0 1px 2px var(--ytd-searchbox-legacy-border-shadow-color);
    caret-color: var(--yt-spec-text-primary);
    color: var(--ytd-searchbox-text-color);
    padding: 0 4px 0 16px;
}
#tt_start_marker {
    width: 5px;
    height: 25px;
    background-color: #cfd20c;
    position: absolute;
    left: 0%;
    top: -10px;
}
#tt_stop_marker {
    width: 5px;
    height: 25px;
    background-color: #18d20c;
    position: absolute;
    left: 0%;
    top: -10px;
}

`)

window.addEventListener('loadeddata', loadedData, { capture: true, once: false, passive: false })


function loadedData({ target }) {
    // console.log("test")
    if (!(target instanceof window.HTMLMediaElement) && !location.href.startsWith("https://www.youtube.com/watch")) return
    // console.log("test2")
    document.querySelector(".panel_ff")?.remove()



    // console.log("test3")
    const panel = document.createElement('div')
    panel.classList.add("panel_ff")
    document.getElementById("primary-inner").insertBefore(panel, document.getElementById("yt-kre-sr-container"))
    // console.log(document.getElementById("primary-inner"))
    panel.innerHTML = `
        <div class="p_ff">
        <div class="btn_ff" id="btn_ff_start">Начало</div>
        <input class="in_ff" id="in_ff_start" autocapitalize="none" autocomplete="off" autocorrect="off" name="ешьу" tabindex="0" type="time" spellcheck="false" placeholder="время" aria-label="время">
        </div>
        </div>
        <div class="p_ff">
        <div class="btn_ff" id="btn_ff_stop">Конец</div>
        <input class="in_ff" id="in_ff_stop" autocapitalize="none" autocomplete="off" autocorrect="off" name="ешьу" tabindex="0" type="time" spellcheck="false" placeholder="время" aria-label="время">
        </div>
        </div>
        <div class="btn_ff" id="btn_ff_load" >Обрезать</div>
        `
    // console.log(document.getElementById("primary-inner"))
    const marker_time_start = document.createElement('div')
    const marker_time_stop = document.createElement('div')

    marker_time_start.id = "tt_start_marker"
    marker_time_stop.id = "tt_stop_marker"

    document.body.querySelector(".ytp-chapters-container").prepend(marker_time_start)
    document.body.querySelector(".ytp-chapters-container").prepend(marker_time_stop)


    const ff_start = {
        btn: document.getElementById("btn_ff_start"),
        in: document.getElementById("in_ff_start"),
        mr: document.getElementById("tt_start_marker"),
        time: 0.0,
    }

    const ff_stop = {
        btn: document.getElementById("btn_ff_stop"),
        in: document.getElementById("in_ff_stop"),
        mr: document.getElementById("tt_stop_marker"),
        time: 0.0,
    }

    ff_start.btn.addEventListener("click", () => {
        console.log(target.currentTime, target.duration, target.currentTime/target.duration*100)
        ff_start.in.value = secondsToTime(target.currentTime)
        ff_start.time = target.currentTime
        marker_time_start.style.left = `${target.currentTime/target.duration*100}%`
    })

    ff_stop.btn.addEventListener("click", () => {
        console.log(target.currentTime)
        ff_stop.in.value = secondsToTime(target.currentTime)
        ff_stop.time = target.currentTime
        marker_time_stop.style.left = `${target.currentTime/target.duration*100}%`
    })

    document.getElementById("btn_ff_load").addEventListener("click", () => {

        const url = ff_start.time < ff_stop.time ? `yt-dlp2:\\?v=${getVideoID()}&ff_start=${ff_start.time}&ff_stop=${ff_stop.time}&` : `yt-dlp2:\\?v=${getVideoID()}&ff_start=${ff_stop.time}&ff_stop=${ff_start.time}&`
        console.log(url)
        document.location.href = url
    })

    // console.log("ff:", ff_start, ff_stop)

}


///////////////////////////////////////////////////////////////////////////////// libs
function secondsToTime(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.floor(divisor_for_seconds);

    var milliseconds = Math.floor((divisor_for_seconds - seconds) * 1000);

    var timeString = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds) + "." + (milliseconds < 10 ? "00" + milliseconds : (milliseconds < 100 ? "0" + milliseconds : milliseconds));
    return timeString;
}

function getVideoID() {
    const link = new URL(location.href)
    // prettier-ignore
    return (link.searchParams.get('v') || location.search.replace('?', '').split('&').reduce((s, c) => ((s[c.split('=')[0]] = c.split('=')[1]), s), {}).v)
}
