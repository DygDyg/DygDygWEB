// ==UserScript==
// @name            YouTube Всё сразу
// @description     Всё сразу
// @version         1.1
// @author          Креветка (Discord: Креветка#8574)
// @match           *://*.youtube.com/*
// @updateURL       https://dygdyg.github.io/DygDygWEB/user.js/YouTube.all.user.js
// @downloadURL     https://dygdyg.github.io/DygDygWEB/user.js/YouTube.all.user.js
// @icon            https://script.artiromiur.ru/icons/YouTube.svg
// @grant           unsafeWindow
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_addStyle
// @grant           GM_setClipboard
// @run-at          document-start
// @grant           window.onurlchange
// @grant           GM_addValueChangeListener
// ==/UserScript==

'use strict'

const css = `
.yt-kre-settings {
    display: flex;
    color: white;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-sizing: border-box;
    margin-right: 1rem;
    cursor: pointer;
}
.yt-kre-settings:hover {
    background: rgb(255 255 255 / 10%);
}
.yt-kre-settings svg {
    padding: 2px;
    box-sizing: border-box;
    width: 24px;
    height: 24px;
}
.yt-kre-sett * {
    box-sizing: border-box;
}
.yt-kre-sett {
    position: fixed;
    z-index: -1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-in-out;
    opacity: 0;
}
.yt-kre-sett.yt-kre-show {
    opacity: 1;
    z-index: 99999999;
}
.yt-kre-over {
    position: fixed;
    width: 100%;
    height: 100%;
    background: #000000b0;
    z-index: 1;
}

/* toggler */
:root {
    --yt-kre-label-height: 24px;
    --yt-kre-label-width: 48px;
    --yt-kre-label-border-radius: var(--yt-kre-label-height);
    --yt-kre-label-border: 1px;
    --yt-kre-label-border-color: #606060 var(--yt-kre-label-border) solid;
}
.yt-kre-toggler {
    display: flex;
    align-items: center;
    user-select: none;
    gap: 1rem;
}
.yt-kre-toggler .yt-kre-toggler__input {
    display: none;
}
.yt-kre-toggler__label {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
}
.yt-kre-toggler .yt-kre-toggler__title {
    flex: 1;
}
.yt-kre-toggler__text {
    width: 100px;
    font-size: 1.4rem;
}
.yt-kre-toggler .yt-kre-toggler__label:before {
    content: '';
    width: var(--yt-kre-label-width);
    height: var(--yt-kre-label-height);
    background-color: #222;
    border-radius: var(--yt-kre-label-border-radius);
    border: var(--yt-kre-label-border-color);
    transition: background-color 0.25s ease-in-out;
}
.yt-kre-toggler .yt-kre-toggler__label:after {
    content: '';
    width: calc(var(--yt-kre-label-height) - calc(var(--yt-kre-label-border) * 4));
    height: calc(var(--yt-kre-label-height) - calc(var(--yt-kre-label-border) * 4));
    position: absolute;
    border-radius: 50%;
    border: var(--yt-kre-label-border-color);
    background-color: #606060;
    transform: translateX(calc(var(--yt-kre-label-border) * 2));
    transition: all 0.25s ease-in-out;
}
.yt-kre-toggler .yt-kre-toggler__input:checked + .yt-kre-toggler__label:after {
    background-color: #606060;
    transform: translateX(calc(var(--yt-kre-label-width) - var(--yt-kre-label-height) + calc(var(--yt-kre-label-border) * 2)));
    border-color: #606060;
}
.yt-kre-toggler .yt-kre-toggler__input:checked + .yt-kre-toggler__label:before {
    background-color: #950000;
    border-color: #606060;
}
.yt-kre-toggler .yt-kre-toggler__input ~ .yt-kre-toggler__text:after {
    content: attr(data-off);
    transition: all 0.25s ease-in-out;
    color: #fff;
}
.yt-kre-toggler .yt-kre-toggler__input:checked ~ .yt-kre-toggler__text:after {
    content: attr(data-on);
}
/* end toggler */

/* tabs */
.yt-kre-youtube {
    font-size: 1.6rem;
    color: #fff;
    width: 600px;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
    background: #212121;
    z-index: 2;
}

.yt-kre-header {
    padding: 2rem;
}
.yt-kre-bottom {
    padding: 0 1rem 2rem;
    display: flex;
    justify-content: flex-end;
}
.yt-kre-bottom span {
    padding: 8px 16px;
    border-radius: 50px;
    color: rgb(61, 161, 247);
    cursor: pointer;
}
.yt-kre-bottom span:hover {
    background: rgb(38, 56, 80);
}
.yt-kre-tabs {
    position: relative;
}
.yt-kre-tab {
    user-select: none;
}
.yt-kre-tab > label {
    position: relative;
    width: 170px;
    height: 42px;
    cursor: pointer;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;
}
.yt-kre-tab > label:after {
    content: '';
    position: absolute;
    border-top: 21px solid transparent;
    border-bottom: 21px solid transparent;
    border-left: 15px solid transparent;
    border-left-color: none;
    transform: translateX(100%);
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
    transition: all 0.2s ease-in-out;
}
.yt-kre-tab > [type='radio'] {
    display: none;
}
.yt-kre-tab-content {
    position: absolute;
    overflow: auto;
    left: 170px;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 0 2rem 2rem;
    background: #212121;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.yt-kre-tab > [type='radio']:checked ~ label {
    background: #950000;
    z-index: 2;
}
.yt-kre-tab > [type='radio']:checked ~ label ~ .yt-kre-tab-content {
    z-index: 1;
}
.yt-kre-tab > [type='radio']:checked ~ label:after {
    border-left-color: #950000;
}
/* end tabs */

.yt-kre-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.yt-kre-wrapper:has(.yt-kre-tgl-main > input:checked) .yt-kre-hidden {
    display: flex;
}
.yt-kre-fieldset {
    border: 2px dashed #950000;
    padding: 0.5rem 0 1.2rem;
    border-radius: 0.5rem;
    text-align: center;
    user-select: none;
}
.yt-kre-legend {
    padding: 0 2rem;
}
.yt-kre-ovh {
    overflow: hidden;
}
.yt-kre-input {
    border: 1px solid #606060;
    padding: 0.5rem 1rem;
    background: transparent;
    border-radius: 5px;
    color: #fff;
}
.yt-kre-input:focus-visible {
    outline: none;
}
.yt-kre-flex-line {
    display: flex;
    align-items: center;
}
.yt-kre-flex-line > :first-child {
    flex: 0 0 60%;
}

/* custom select */
.yt-kre-custom-select-container,
.yt-kre-custom-select-value,
.yt-kre-custom-select-options,
.yt-kre-custom-select-option {
    box-sizing: border-box;
}
.yt-kre-custom-select-container {
    display: inline-block;
    position: relative;
    outline: none;
}
.yt-kre-custom-select-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #808080;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
}
.yt-kre-custom-select-value:after {
    content: '';
    display: inline-block;
    border: 6px solid transparent;
    border-top-color: #808080;
    transition: 0.25s ease-in-out;
    transform: rotate(90deg);
}
.yt-kre-custom-select-value.yt-kre-custom-select-open:after {
    transform: rotate(0deg);
    transform: translateY(25%);
}
.yt-kre-custom-select-value.yt-kre-custom-select-open {
    border-radius: 4px 4px 0 0;
}
.yt-kre-custom-select-option {
    padding: 0.25rem 0.5rem;
    cursor: pointer;
}
.yt-kre-custom-select-option:hover {
    background-color: rgba(128 128 128 / 50%);
}
.yt-kre-custom-select-option.selected {
    background-color: rgba(128 128 128 / 80%);
}
.yt-kre-custom-select-options {
    position: absolute;
    display: none;
    margin: 0;
    padding: 0;
    border: 1px solid #808080;
    width: 100%;
    border-top: none;
    max-height: 120px;
    overflow-y: auto;
    background-color: #222;
    color: #fff;
    list-style: none;
}
.yt-kre-custom-select-options.yt-kre-custom-select-show {
    display: flex;
    border-radius: 0 0 4px 4px;
    flex-direction: column;
}
.yt-kre-custom-select-options::-webkit-scrollbar {
    width: 16px;
}
.yt-kre-custom-select-options::-webkit-scrollbar-thumb {
    background-color: #808080;
    box-shadow: none;
    border-radius: 8px;
    border: 4px solid transparent;
    background-clip: content-box;
}
.yt-kre-custom-select-options::-webkit-scrollbar-track {
    border-left: 1px solid #808080;
    background-color: rgba(219, 219, 219, 0.2);
}
/* end custom select */

.yt-kre-shorts-done {
    width: 48px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.yt-kre-shorts-btn-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.yt-kre-shorts-btn-text {
    font-size: 1.4rem;
    color: #fff;
    text-align: center;
    width: 48px;
    word-wrap: break-word;
}
.yt-kre-shorts-btn-round {
    color: var(--yt-spec-static-overlay-text-primary);
    background-color: var(--yt-spec-static-overlay-button-secondary);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    color: var(var(--yt-spec-static-overlay-text-primary));
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
.yt-kre-shorts-btn-round:hover {
    background-color: var(--yt-spec-static-overlay-tonal-hover);
    border-color: transparent;
}
.yt-kre-hidden {
    display: none;
}
.yt-kre-hidden-watched,
.yt-kre-hidden-unwatched {
    display: none !important;
}

.yt-kre-settings-add {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    flex: 1 !important;
}
.yt-kre-cur-point {
    cursor: pointer;
}
.yt-kre-clr {
    color: rgb(61, 161, 247);
}

.yt-kre-sr-wrapper {
    display: flex;
    font-size: 1.4rem;
    gap: 5px;
    border-radius: 8px;
    padding: 0 2rem;
    height: 32px;
    box-sizing: border-box;
    margin: 32px 0rem 0 0;
    background-color: rgb(39 39 39);
    align-items: center;
    color: #fff;
    position: relative;
    z-index: 1;
}
.yt-kre-no-sel {
    user-select: none;
}
.yt-kre-sr-slider {
    flex: 1;
    color: #fff;
}
.yt-kre-sr-out {
    background: #272727;
    height: 25px;
    width: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: 5px;
    border: 1px solid #3f3f3f;
}
.yt-kre-sr-out::before {
    content: 'x';
}

.yt-kre-input-with-num {
    display: flex;
    flex-direction: column;
    flex: 1;
    font-size: 8px;
}
.yt-kre-input-num {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.yt-kre-input-num span {
    flex: 0 0 1vw;
    text-align: center;
}


.kre-video-speed {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 50px;
    z-index: 1;
    background: aliceblue;
    padding: 8px 16px;
    border-radius: 16px;
    color: red;
}
.kre-video-speed .txt {
}
`
GM_addStyle(css)

const sett = {
    style: '',
    player: '#movie_player, .html5-video-player',
    btn_like: '#actions #segmented-like-button button',
    btn_dislike: '#actions #segmented-dislike-button button',
    icons: {
        settings: `<svg viewBox="0 0 512 512" width="24" height="24"><path fill="currentColor" d="M331.8 224.1c28.29 0 54.88 10.99 74.86 30.97l19.59 19.59c40.01-17.74 71.25-53.3 81.62-96.65c5.725-23.92 5.34-47.08 .2148-68.4c-2.613-10.88-16.43-14.51-24.34-6.604l-68.9 68.9h-75.6V97.2l68.9-68.9c7.912-7.912 4.275-21.73-6.604-24.34c-21.32-5.125-44.48-5.51-68.4 .2148c-55.3 13.23-98.39 60.22-107.2 116.4C224.5 128.9 224.2 137 224.3 145l82.78 82.86C315.2 225.1 323.5 224.1 331.8 224.1zM384 278.6c-23.16-23.16-57.57-27.57-85.39-13.9L191.1 158L191.1 95.99l-127.1-95.99L0 63.1l96 127.1l62.04 .0077l106.7 106.6c-13.67 27.82-9.251 62.23 13.91 85.39l117 117.1c14.62 14.5 38.21 14.5 52.71-.0016l52.75-52.75c14.5-14.5 14.5-38.08-.0016-52.71L384 278.6zM227.9 307L168.7 247.9l-148.9 148.9c-26.37 26.37-26.37 69.08 0 95.45C32.96 505.4 50.21 512 67.5 512s34.54-6.592 47.72-19.78l119.1-119.1C225.5 352.3 222.6 329.4 227.9 307zM64 472c-13.25 0-24-10.75-24-24c0-13.26 10.75-24 24-24S88 434.7 88 448C88 461.3 77.25 472 64 472z"></path></svg>`,
        dl: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17 18V19H6V18H17ZM16.5 11.4L15.8 10.7L12 14.4V4H11V14.4L7.2 10.6L6.5 11.3L11.5 16.3L16.5 11.4Z" class="style-scope yt-icon"></path></svg>`,
        zoom: `<svg width="100%" height="100%" viewBox="0 0 36 36" version="1.0"><path id="ytp-svg-zoom" d="M25,18h-2v3h-3v2h5V18z M13,15h3v-2h-5v5h2V15z M27,9H9c-1.1,0-2,0.9-2,2v14c0,1.1,0.9,2,2,2h18c1.1,0,2-0.9,2-2V11C29,9.9,28.1,9,27,9z M27,25H9V11h18V25z" class="ytp-svg-fill"></path></svg>`
    },
    getBrowser: (ua => {
        if (ua.indexOf('edge') > -1) return 'MS Edge'
        else if (ua.indexOf('edg/') > -1) return 'edge'
        else if (ua.indexOf('opr') > -1 && !!unsafeWindow.opr) return 'opera'
        else if (ua.indexOf('chrome') > -1 && !!unsafeWindow.chrome) return 'chrome'
        else if (ua.indexOf('trident') > -1) return 'MS IE'
        else if (ua.indexOf('firefox') > -1) return 'Mozilla Firefox'
        else if (ua.indexOf('safari') > -1) return 'safari'
        else return false
    })(navigator.userAgent.toLowerCase()),
    resoles: [
        ['highres', 'Максимальное'],
        ['hd2880', '8k'],
        ['hd2160', '4k'],
        ['hd1440', '1440p'],
        ['hd1080', '1080p'],
        ['hd720', '720p'],
        ['large', '480p'],
        ['medium', '360p'],
        ['small', '240p'],
        ['tiny', '144p'],
        ['auto', 'Автоматически']
    ],
    speeds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2, 3, 4, 8, 16],
    TABS: [
        ['HD', 'hd', ['High Definition', 'Автоматически выставляет качество видео.'], create_HD_settings],
        ['AL', 'al', ['Auto Like', 'Автоматически ставит лайк при просмотре видео до определённого момента.'], create_AL_settings],
        //['DL', 'dl', ['Downloader', 'Позволяет скачивать видео разных разрешений видео или разного качества звук.'], create_DL_settings],
        ['HV', 'hv', ['Hide Video', 'Позволяет скрывать просмотренное или не просмотренное видео на канале.'], create_HV_settings],
        ['SR', 'sr', ['Speed Range', 'Добавляет ползунок под видео для изменения скорости.'], create_SR_settings],
        ['Zoom', 'zoom', ['Zoom Button', 'Позволяет выставлять видео в формате 21:9.'], create_ZOOM_settings],
        ['Shorts', 'shorts', ['AutoScroll Shorts', 'Автоматические включает следующее видео когда заканчивается текущее видео.'], create_SHORTS_settings]
    ]
}

class Select {
    constructor(el, prefix, w = 0) {
        this.element = el
        this.elementWidth = w || 0
        this.options = getFormattedOptions(el.querySelectorAll('option'))
        this.customElement = document.createElement('div')
        this.labelElement = document.createElement('span')
        this.optionsCustomElement = document.createElement('ul')
        setupCustomElem(this, prefix)
        el.style.display = 'none'
        el.after(this.customElement)
    }

    get selectedOption() {
        return this.options.find(option => option.selected)
    }

    get selectedOptionIndex() {
        return this.options.indexOf(this.selectedOption)
    }

    selectValue(value) {
        const newSelectionOption = this.options.find(op => op.value === value)
        const prevSelectionOption = this.selectedOption
        prevSelectionOption.selected = false
        prevSelectionOption.element.selected = false

        newSelectionOption.selected = true
        newSelectionOption.element.selected = true

        this.labelElement.innerText = newSelectionOption.label
        this.optionsCustomElement.querySelector(`[data-value="${prevSelectionOption.value}"]`).classList.remove('selected')

        const newCustomEl = this.optionsCustomElement.querySelector(`[data-value="${newSelectionOption.value}"]`)
        newCustomEl.classList.add('selected')
        newCustomEl.scrollIntoView({ block: 'nearest' })
        this.element.dispatchEvent(new Event('change'))
    }
}

function setupCustomElem(select, prefix) {
    select.customElement.classList.add(`${prefix}custom-select-container`)
    select.customElement.tabIndex = -1

    if (select.elementWidth > 0) {
        select.customElement.style.width = `${select.elementWidth}px`
    }
    select.labelElement.classList.add(`${prefix}custom-select-value`)
    select.labelElement.innerText = select.selectedOption.label
    select.customElement.append(select.labelElement)

    select.optionsCustomElement.classList.add(`${prefix}custom-select-options`)
    select.options.forEach(option => {
        const optionElement = document.createElement('li')
        optionElement.classList.add(`${prefix}custom-select-option`)
        optionElement.classList.toggle('selected', option.selected)
        optionElement.innerText = option.label
        optionElement.dataset.value = option.value
        optionElement.addEventListener('click', () => {
            select.selectValue(option.value)
            select.optionsCustomElement.classList.remove('yt-kre-custom-select-show')
            select.labelElement.classList.remove('yt-kre-custom-select-open')
        })
        select.optionsCustomElement.append(optionElement)
    })
    select.customElement.append(select.optionsCustomElement)

    select.labelElement.addEventListener('click', () => {
        select.optionsCustomElement.classList.toggle('yt-kre-custom-select-show')
        select.labelElement.classList.toggle('yt-kre-custom-select-open')
        select.optionsCustomElement.querySelector('.selected').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })

    select.customElement.addEventListener('blur', () => {
        select.optionsCustomElement.classList.remove('yt-kre-custom-select-show')
        select.labelElement.classList.remove('yt-kre-custom-select-open')
    })
}

function getFormattedOptions(optionElements) {
    return [...optionElements].map(optionElement => {
        return {
            value: optionElement.value,
            label: optionElement.label,
            selected: optionElement.selected,
            element: optionElement
        }
    })
}

function CE(element, attribute, inner) {
    if (typeof element === 'undefined') return false
    const el = document.createElement(element)
    if (typeof attribute === 'object') {
        for (const [name, value] of Object.entries(attribute)) {
            if (Object.prototype.toString.call(value).includes('Object')) {
                const obj = Object.entries(value)
                // prettier-ignore
                switch (name) {
                    case 'data': obj.map(([k, v]) => (el.dataset[k] = v)); break
                    case 'style': obj.map(([k, v]) => (el.style[k] = v)); break
                    case 'event': obj.map(([k, [fn, opt]]) => el.addEventListener(k, fn, opt == undefined ? true : opt)); break
                }
            } else {
                if (['checked', 'selected'].includes(name) && value === false) continue
                el.setAttribute(name, value)
            }
        }
    }
    if (typeof inner !== 'undefined') {
        if (!Array.isArray(inner)) inner = [inner]
        for (const key of inner) {
            if (!key) continue
            if (key.tagName) el.appendChild(key)
            else if (typeof key === 'string' && key.trim().startsWith('<')) el.innerHTML = key
            else el.appendChild(document.createTextNode(key))
        }
    }
    return el
}

function toggleSettings(e) {
    if (e.altKey) {
        const hv = document.querySelector('[data-prop="watched"]')
        hv.checked = !hv.checked
        hv.dispatchEvent(new Event('change'))
        return
    }
    const sett = document.getElementById('yt-kre-settings')
    sett.classList.toggle('yt-kre-show')
    document.body.classList.toggle('yt-kre-ovh')
}

function waitElem(el, callBack) {
    const elem = document.querySelector(el)
    if (elem) {
        callBack(elem)
    } else {
        setTimeout(waitElem, 250, el, callBack)
    }
}

function lastTab(event) {
    if (event.target && event.target.matches("input[type='radio']")) {
        GM_setValue('active_tab', event.target.value)
    }
}

function createSettings() {
    const aTab = GM_getValue('active_tab', 'HD')
    const tb = []
    for (const [sn, id, TD, fn] of sett.TABS) {
        tb.push(CE('div', { class: 'yt-kre-tab' }, [CE('input', { value: sn, checked: sn == aTab ? '' : false, type: 'radio', name: 'yt-kre-tabs', id: `kre_${id}` }), CE('label', { for: `kre_${id}` }, TD[0]), innerContent.call(CE('div', { class: 'yt-kre-tab-content' }), TD, sn, id, fn)]))
    }
    const rootElement = CE('div', { id: 'yt-kre-settings', class: 'yt-kre-sett' }, [
        CE('div', { class: 'yt-kre-over', event: { click: [toggleSettings, { capture: true, once: false, passive: false }] } }),
        CE('div', { class: 'yt-kre-youtube' }, [
            //
            CE('h1', { class: 'yt-kre-header' }, 'Настройки'),
            CE('div', { class: 'yt-kre-tabs', event: { click: [lastTab, { capture: true, once: false, passive: false }] } }, tb),
            CE('div', { class: 'yt-kre-bottom' }, CE('span', { event: { click: [toggleSettings] } }, 'Закрыть'))
        ])
    ])
    document.body.append(rootElement)
    document.querySelectorAll('[data-select]').forEach(el => new Select(el, 'yt-kre-', 150))

    if (GM_getValue('debug', false)) {
        document.body.classList.add('yt-kre-ovh')
        rootElement.classList.add('show')
    }
}

function changeValue() {
    GM_setValue(this.dataset.prop, this.checked)
}

function innerContent(T_D, shortName, id, fn) {
    const tgl = CE('div', { class: 'yt-kre-toggler yt-kre-tgl-main' }, [
        CE('h2', { class: 'yt-kre-toggler__title' }, `YouTube ${shortName}`),
        CE('input', { id: `yt-kre-${id}`, data: { prop: id }, type: 'checkbox', class: 'yt-kre-toggler__input', checked: GM_getValue(id, false), event: { change: [changeValue] } }),
        CE('label', { for: `yt-kre-${id}`, class: 'yt-kre-toggler__label' }),
        CE('div', { data: { off: 'Выкл.', on: 'Вкл.' }, class: 'yt-kre-toggler__text' })
    ])
    const wrap = CE('div', { class: 'yt-kre-wrapper' }, tgl)
    const elements = fn() || []
    for (const node of elements) wrap.append(node)

    this.append(wrap)
    const desc = CE('fieldset', { class: 'yt-kre-fieldset' }, [CE('legend', { class: 'yt-kre-legend' }, T_D[0]), CE('div', { class: 'yt-kre-desc' }, T_D[1])])
    this.append(desc)
    return this
}

function vch({ currentTarget: target }) {
    const e = {
        min: Number(target.min),
        max: Number(target.max),
        val: target.valueAsNumber
    }
    if (e.val < e.min) target.value = e.min
    if (e.val > e.max) target.value = e.max
    GM_setValue(this.dataset.prop, target.valueAsNumber)
}

function create_AL_settings() {
    return [
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            //
            CE('div', {}, 'Лайкать после'),
            CE('input', { class: 'yt-kre-input', type: 'number', min: '1', max: '99', maxLength: 2, data: { prop: 'left_time' }, value: GM_getValue('left_time', 98), event: { change: [vch] } }),
            CE('div', { style: { marginLeft: '-34px', zIndex: -1 } }, '%')
        ]),
        CE('div', { class: 'yt-kre-toggler yt-kre-hidden' }, [
            CE('div', { class: 'yt-kre-toggler__title' }, 'Только подписчиков'),
            CE('input', { id: `yt-kre-tgl-subscribe-only`, data: { prop: 'subscribe_only' }, type: 'checkbox', class: 'yt-kre-toggler__input', checked: GM_getValue('subscribe_only', false), event: { change: [changeValue] } }),
            CE('label', { for: `yt-kre-tgl-subscribe-only`, class: 'yt-kre-toggler__label' }),
            CE('div', { data: { off: 'Нет', on: 'Да' }, class: 'yt-kre-toggler__text' })
        ])
    ]
}

function create_SR_settings() {
    return [
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            //
            CE('div', {}, 'Увеличить скорость'),
            CE('div', { style: { fontSize: '2rem' } }, '➕️')
        ]),
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            //
            CE('div', {}, 'Уменьшить скорость'),
            CE('div', { style: { fontSize: '2rem' } }, '➖')
        ]),
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            //
            CE('div', {}, 'Сбросить скорость'),
            CE('div', { style: { fontSize: '2rem' } }, '✖️')
        ])
    ]
}

function create_DL_settings() {
    // yt-kre-hidden
    return [CE('div', { class: 'yt-kre-flex-line' }, 'в разработке')]
}

function create_SHORTS_settings() {
    return [
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            //
            CE('div', {}, 'Перемотка'),
            CE('input', { class: 'yt-kre-input', type: 'number', min: '1', max: '5', data: { prop: 'seek_video' }, value: GM_getValue('seek_video', 1), event: { change: [vch] } }),
            CE('div', { style: { marginLeft: '-34px', marginТop: '-2px', zIndex: -1 } }, 'сек.')
        ]),
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            //
            CE('div', {}, 'Кнопки'),
            CE('div', { style: { fontSize: '2rem' } }, '⬅️ ➡️')
        ]),
        CE('div', { class: 'yt-kre-toggler yt-kre-hidden' }, [
            CE('div', { class: 'yt-kre-toggler__title' }, 'Добавить кнопку скачать'),
            CE('input', { id: `yt-kre-tgl-shorts-dl-btn`, data: { prop: 'shorts_dl_btn' }, type: 'checkbox', class: 'yt-kre-toggler__input', checked: GM_getValue('shorts_dl_btn', false), event: { change: [changeValue] } }),
            CE('label', { for: `yt-kre-tgl-shorts-dl-btn`, class: 'yt-kre-toggler__label' }),
            CE('div', { data: { off: 'Нет', on: 'Да' }, class: 'yt-kre-toggler__text' })
        ])
    ]
}

function create_ZOOM_settings() {
    return [
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            //
            CE('div', {}, 'Увеличить на'),
            CE('input', { class: 'yt-kre-input', type: 'number', step: '0.0001', min: '1', max: '3', data: { prop: 'scale' }, value: GM_getValue('scale', 1.3329), event: { change: [vch] } })
        ]),
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            CE('div', { class: 'yt-kre-settings-add' }, [
                //
                CE('span', {}, 'Для корректной работы необходимо выставить'),
                CE('span', { class: 'yt-kre-clr' }, 'D3D9'),
                CE('span', {}, 'в настройках'),
                CE('span', { class: 'yt-kre-clr yt-kre-cur-point', title: 'Нажми что бы скопировать', data: { text: `${sett.getBrowser || 'chrome'}://flags/#use-angle` }, event: { click: [copyText] } }, 'chrome://flags/#use-angle')
            ])
        ])
    ]
}

function create_HV_settings() {
    return [
        CE('div', { class: 'yt-kre-toggler yt-kre-hidden' }, [
            CE('div', { class: 'yt-kre-toggler__title' }, `Просмотренные`),
            CE('input', { id: `yt-kre-watched`, data: { prop: 'watched' }, type: 'checkbox', class: 'yt-kre-toggler__input', checked: GM_getValue('watched', false), event: { change: [changeValue] } }),
            CE('label', { for: `yt-kre-watched`, class: 'yt-kre-toggler__label' }),
            CE('div', { data: { off: 'Показывать', on: 'Скрывать' }, class: 'yt-kre-toggler__text' })
        ]),
        CE('div', { class: 'yt-kre-toggler yt-kre-hidden' }, [
            CE('div', { class: 'yt-kre-toggler__title' }, `Не просмотренные`),
            CE('input', { id: `yt-kre-unwatched`, data: { prop: 'unwatched' }, type: 'checkbox', class: 'yt-kre-toggler__input', checked: GM_getValue('unwatched', false), event: { change: [changeValue] } }),
            CE('label', { for: `yt-kre-unwatched`, class: 'yt-kre-toggler__label' }),
            CE('div', { data: { off: 'Показывать', on: 'Скрывать' }, class: 'yt-kre-toggler__text' })
        ])
    ]
}

function create_HD_settings() {
    function vch() {
        GM_setValue(this.name, this.value)
    }
    const savedRes = GM_getValue('video_quality', 'hd1080')
    const opt = sett.resoles.map(([k, v]) => CE('option', { value: k, selected: savedRes == k ? '' : false }, v))
    return [
        CE('div', { class: 'yt-kre-flex-line yt-kre-hidden' }, [
            CE('div', {}, 'Качество'),
            CE('select', { name: 'video_quality', event: { change: [vch] }, data: { select: '' } }, opt)
        ]),
        CE('div', { class: 'yt-kre-toggler yt-kre-hidden' }, [
            CE('div', { class: 'yt-kre-toggler__title' }, 'Скрывать рек. видео'),
            CE('input', { id: `yt-kre-tgl-recom_video-dl-btn`, data: { prop: 'recom_video' }, type: 'checkbox', class: 'yt-kre-toggler__input', checked: GM_getValue('recom_video', false), event: { change: [changeValue] } }),
            CE('label', { for: `yt-kre-tgl-recom_video-dl-btn`, class: 'yt-kre-toggler__label' }),
            CE('div', { data: { off: 'Нет', on: 'Да' }, class: 'yt-kre-toggler__text' })
        ])
    ]
}

function copyText(e) {
    GM_setClipboard(e.currentTarget.dataset.text)
}

function getVideoID() {
    const link = new URL(location.href)
    // prettier-ignore
    return (link.searchParams.get('v') || location.search.replace('?', '').split('&').reduce((s, c) => ((s[c.split('=')[0]] = c.split('=')[1]), s), {}).v)
}

function setResolution(player) {
    const likeResolution = GM_getValue('video_quality', 'hd1080')
    const currentQuality = player.getPlaybackQuality()
    const res = sett.resoles.map(([k]) => k)
    let resToSet = likeResolution
    if (res.indexOf(resToSet) >= res.indexOf(currentQuality)) {
    } else {
        const end = res.length - 1
        const availableQuality = player.getAvailableQualityLevels()
        let nextBestIndex = Math.max(res.indexOf(resToSet), 0)

        while (availableQuality.indexOf(res[nextBestIndex]) === -1 && nextBestIndex < end) {
            ++nextBestIndex
        }
        resToSet = res[nextBestIndex]
    }
    player.setPlaybackQualityRange(resToSet)
    player.setPlaybackQuality(resToSet)
}

function RecomVideo(v) {
    if (v) {
        RecomVideo.stl = GM_addStyle('#movie_player .ytp-ce-element-show { display: none; }')
    } else {
        RecomVideo.stl?.remove()
    }
}

function HD() {
    if (HD.counter == undefined) HD.counter = 0
    const player = document.querySelector(sett.player)
    if (player && typeof player.getPlaybackQuality === 'function') {
        const curV_ID = getVideoID()
        if (curV_ID && curV_ID !== HD.lastVideo) {
            HD.lastVideo = curV_ID
            setResolution(player)
        }
    } else {
        if (HD.counter >= 20) return
        HD.counter += 1
        setTimeout(HD, 150)
    }
}

function checkLikeOrDislike() {
    return new Promise((resolve, reject) => {
        const l = document.querySelector(sett.btn_like)
        const d = document.querySelector(sett.btn_dislike)

        if (!l || !d) {
            return reject({ error: { message: 'нет кнопок' } })
        }
        if (l.hasAttribute('aria-pressed') && l.getAttribute('aria-pressed') == 'true') {
            return resolve({ status: 'liked' })
        }
        if (d.hasAttribute('aria-pressed') && d.getAttribute('aria-pressed') == 'true') {
            return resolve({ status: 'disliked' })
        }
        return resolve({ status: 'OK' })
    }).then(res => res, err => err)
}

function timeupdate() {
    if (!GM_getValue('al', false)) {
        this.removeEventListener('timeupdate', timeupdate, false)
        return
    }
    const left = GM_getValue('left_time', 98)
    const view = (this.currentTime * 100) / this.duration

    if (view >= left) {
        const sub = document.querySelector('#owner #subscribe-button ytd-subscribe-button-renderer')
        const checkSubscribe = (btn => (!GM_getValue('subscribe_only', false) ? true : btn?.hasAttribute('subscribe-button-hidden') || false))(sub)

        if (checkSubscribe) document.querySelector(sett.btn_like)?.click()
        this.removeEventListener('timeupdate', timeupdate, false)
    }
}

async function AL() {
    if (AL.counter == undefined) AL.counter = 0
    const player = document.querySelector(sett.player)
    if (player) {
        AL.counter = 0
        const { error, status } = await checkLikeOrDislike()
        if (error) {
            setTimeout(AL, 150)
        } else {
            if (['liked', 'disliked'].includes(status)) return
            player.querySelector('video').addEventListener('timeupdate', timeupdate, false)
        }
    } else {
        if (AL.counter >= 20) return
        AL.counter += 1
        setTimeout(AL, 150)
    }
}

function zoomStyleChanger(v) {
    return GM_addStyle(`.yt-kre-zoom-video { transform: scale(${v}) } .yt-kre-zoom-video-transition { transition: transform 300ms }`)
}

function Zoom(add = true) {
    if (Zoom.counter == undefined) Zoom.counter = 0

    if (Zoom.stl == undefined) {
        let scale = GM_getValue('scale', 1.3329)
        Zoom.stl = zoomStyleChanger(scale)
    }

    if (!add) {
        document.querySelector('.yt-kre-zoom')?.remove()
        Zoom.stl?.remove()
        delete Zoom.stl
    }

    const player = document.querySelector(sett.player)
    if (player) {
        Zoom.counter = 0
        const video = player.querySelector('video')
        video.classList.add('yt-kre-zoom-video-transition')
        const controls = player.querySelector('.ytp-right-controls')
        if (controls && add) {
            const zoomButton = controls.querySelector('.yt-kre-zoom') || CE('button', { class: 'yt-kre-zoom ytp-button', event: { click: [_ => video.classList.toggle('yt-kre-zoom-video')] } }, sett.icons.zoom)
            controls.insertBefore(zoomButton, controls.querySelector('.ytp-fullscreen-button'))
        }
    } else {
        if (Zoom.counter >= 20) return
        Zoom.counter += 1
        setTimeout(Zoom, 150)
    }
}

function scrollEnded() {
    urlChanged()
}

function urlChanged() {
    const sub = location.href.includes('subscriptions')
    if (GM_getValue('hv', false) && sub) {
        clearTimeout(urlChanged.timerHV)
        urlChanged.timerHV = setTimeout(HV, 500)
    }
}

function ShowHideFunc(enabled = true) {
    if (!location.href.includes('subscriptions')) return
    const view = document.querySelector('[page-subtype="subscriptions"] [href*="subscriptions"] path')
    if (!view) return
    const l = view.getAttribute('d').length

    // l < 120 ? сетка : список
    if (GM_getValue('watched', false) && enabled) {
        const searchWatched = l < 120 ? '#items > ytd-grid-video-renderer:not(.yt-kre-hidden-watched):has(#overlays > :last-child:nth-child(3))' : 'ytd-item-section-renderer[page-subtype="subscriptions"]:not(.yt-kre-hidden-watched):has(#overlays > :last-child:nth-child(3))'
        document.querySelectorAll(searchWatched).forEach(el => el.classList.add('yt-kre-hidden-watched'))
    } else {
        document.querySelectorAll('.yt-kre-hidden-watched').forEach(el => el.classList.remove('yt-kre-hidden-watched'))
    }
    if (GM_getValue('unwatched', false) && enabled) {
        const searchUnWatched = l < 120 ? '#items > ytd-grid-video-renderer:not(.yt-kre-hidden-unwatched):has(#overlays > :last-child:nth-child(2))' : 'ytd-item-section-renderer[page-subtype="subscriptions"]:not(.yt-kre-hidden-unwatched):has(#overlays > :last-child:nth-child(2))'
        document.querySelectorAll(searchUnWatched).forEach(el => el.classList.add('yt-kre-hidden-unwatched'))
    } else {
        document.querySelectorAll('.yt-kre-hidden-unwatched').forEach(el => el.classList.remove('yt-kre-hidden-unwatched'))
    }
}

function HV() {
    if (HV.counter == undefined) HV.counter = 0
    const view = document.querySelector('[page-subtype="subscriptions"] [href*="subscriptions"] path')
    if (view) {
        HV.counter = 0
        ShowHideFunc()
    } else {
        if (HV.counter >= 20) return
        HV.counter += 1
        setTimeout(HV, 150)
    }
}

function loadFunc() {
    waitElem('#end', el => {
        const btn = CE('div', { class: 'yt-kre-settings', event: { click: [toggleSettings, { capture: true, once: false, passive: false }] } }, sett.icons.settings)
        el.prepend(btn)
        createSettings()
    })
    urlChanged()
}

function next() {
    document.querySelector('#navigation-button-down [button-next]')?.click()
}

function ShortsDL() {
    open(`https://ru.savefrom.net/#url=${location.href}`, '_')
}

function Shorts() {
    if (Shorts.lastVideo) {
        Shorts.lastVideo.removeEventListener('ended', next, true)
        Shorts.lastVideo = null
    }
    const video = document.querySelector('[is-active] video')
    if (!video) {
        setTimeout(Shorts, 150)
        return
    }

    if (GM_getValue('shorts_dl_btn', false)) {
        document.querySelector('#yt-kre-shorts-done')?.remove()
        const wrapper = CE('div', { id: 'yt-kre-shorts-done', class: 'yt-kre-shorts-done' }, [
            CE('div', { class: 'yt-kre-shorts-btn-wrap' }, [
                //
                CE('div', { class: 'yt-kre-shorts-btn-round', event: { click: [ShortsDL] } }, sett.icons.dl),
                CE('div', { class: 'yt-kre-shorts-btn-text' }, 'Скачать')
            ])
        ])
        document.querySelector('[is-active] #actions')?.prepend(wrapper)
    }

    if (video.duration < 30) {
        setTimeout(_ => document.querySelector('[is-active] #progress-bar-line')?.removeAttribute('hidden'), 250)
    }
    video.loop = false
    Shorts.lastVideo = video
    video.addEventListener('ended', next, true)
}

function onScrollEnd() {
    clearTimeout(onScrollEnd.isScrolling)
    onScrollEnd.isScrolling = setTimeout(scrollEnded, 50)
}

function setVideoSpeed(speed) {
    waitElem('video', el => (el.playbackRate = speed))
}

function DL() {
    return CE('button', { class: 'yt-kre-dl' }, 'Скачать')
}

function showVideoSpeed(s) {
    clearTimeout(showVideoSpeed.t)
    const speedElement = document.getElementById('kre-sr') || CE('div', { id: 'kre-sr', class: 'kre-video-speed' }, `${s}`)
    speedElement.innerText = `${s}`
    document.querySelector('#player-wide-container')?.appendChild(speedElement);

    showVideoSpeed.t = setTimeout(() => {
        document.querySelector('#player-wide-container')?.removeChild(speedElement)
    }, 1000)
}

function onSlider(e) {
    const s = sett.speeds[e.currentTarget.valueAsNumber - 1]
    GM_setValue('speed', s)
    showVideoSpeed(s)
}

function SR() {
    if (SR.counter == undefined) SR.counter = 0
    const player = document.querySelector(sett.player)
    if (player) {
        const speed = GM_getValue('speed', 1)
        setVideoSpeed(speed)
        const index = sett.speeds.indexOf(speed)
        const step = (index == -1 ? sett.speeds.indexOf(1) : index) + 1
        const opt = sett.speeds.map((e, i) => CE('option', { value: i + 1 }))
        const num = sett.speeds.map((e, i) => CE('span', {}, e))

        waitElem('div#content div#columns div#player', el => {
            document.getElementById('yt-kre-sr-container')?.remove()
            const wrapper = CE('div', { id: 'yt-kre-sr-container', class: 'yt-kre-sr-wrapper yt-kre-no-sel' }, [
                CE('div', {}, 'Скорость видео'),
                CE('output', { class: 'yt-kre-sr-out' }, speed),
                CE('div', { class: 'yt-kre-input-with-num' }, [
                    CE('input', { tabindex: -1, class: 'yt-kre-sr-slider', event: { mouseup: [e => e.currentTarget.blur()], input: [onSlider] }, type: 'range', min: 1, max: sett.speeds.length, value: step, step: 1, name: 'yt-kre-sr-slider', list: 'yt-kre-sr-slider-list' }),
                    CE('div', { class: 'yt-kre-input-num' }, num)
                ]),
                CE('datalist', { id: 'yt-kre-sr-slider-list' }, opt)
            ])
            el.after(wrapper)
        })
    } else {
        if (SR.counter >= 20) return
        SR.counter += 1
        setTimeout(SR, 150)
    }
}

function loadedData({ target }) {
    if (!(target instanceof window.HTMLMediaElement)) return

    const watch = location.href.includes('watch')
    const shorts = location.href.includes('shorts')
    if (GM_getValue('hd', false) && watch) HD()
    if (GM_getValue('recom_video', false) && watch) RecomVideo(true)
    if (GM_getValue('zoom', false) && watch) Zoom()
    if (GM_getValue('al', false) && watch) AL()
    if (GM_getValue('sr', false) && watch) SR()
    if (GM_getValue('shorts', false) && shorts) Shorts()

    if (GM_getValue('open_details', false) && watch) waitElem('#description #expand', el => el.click())
}

function keyDown(event) {
    if (location.href.includes('shorts')) {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
        if (!GM_getValue('shorts', false) || document.activeElement === document.querySelector('input') || document.activeElement === document.querySelector('#contenteditable-root')) return
        const video = document.querySelector('[is-active] video')
        const seek = Number(GM_getValue('seek_video', 1))

        // prettier-ignore
        switch (event.key) {
            case 'ArrowLeft': video.currentTime -= seek; break
            case 'ArrowRight': video.currentTime += seek; break
        }
    }
    if (location.href.includes('watch')) {
        if (!['+', '-', '*'].includes(event.key)) return
        if (GM_getValue('sr', false)) {
            const slider = document.querySelector('[name="yt-kre-sr-slider"]')
            const val = slider?.valueAsNumber
            if (!val) return
            // prettier-ignore
            switch (event.key) {
                case '+': if (val < sett.speeds.length) slider.value = val + 1; break
                case '-': if (val > 0) slider.value = val - 1; break
                case '*': slider.value = sett.speeds.indexOf(1) + 1; break
            }
            slider.dispatchEvent(new Event('input'))
        }
    }
}

document.addEventListener('keydown', keyDown, { capture: true, once: false, passive: false })
window.addEventListener('loadeddata', loadedData, { capture: true, once: false, passive: false })
window.addEventListener('load', loadFunc, { capture: true, once: false, passive: false })
window.addEventListener('scroll', onScrollEnd, { capture: true, once: false, passive: false })
if (window.onurlchange === null) {
    window.addEventListener('urlchange', urlChanged, { capture: true, once: false, passive: false })
}

GM_addValueChangeListener('shorts', (key, old_v, new_v, rem) => {
    const video = document.querySelector('[is-active] video')
    if (old_v) {
        if (Shorts.lastVideo) {
            Shorts.lastVideo.removeEventListener('ended', next, true)
            Shorts.lastVideo = null
            if (video) video.loop = true
        }
    } else {
        if (video) {
            video.loop = false
            video.addEventListener('ended', next, true)
            Shorts.lastVideo = video
        }
    }
})

GM_addValueChangeListener('watched', (key, old_v, new_v, rem) => {
    if (!GM_getValue('hv', false) || !new_v) {
        return ShowHideFunc(false)
    }
    ShowHideFunc()
})

GM_addValueChangeListener('unwatched', (key, old_v, new_v, rem) => {
    if (!GM_getValue('hv', false) || !new_v) {
        return ShowHideFunc(false)
    }
    ShowHideFunc()
})

GM_addValueChangeListener('hv', (key, old_v, new_v, rem) => {
    ShowHideFunc(new_v)
})

GM_addValueChangeListener('zoom', (key, old_v, new_v, rem) => {
    Zoom(new_v)
})

GM_addValueChangeListener('scale', (key, old_v, new_v, rem) => {
    Zoom.stl?.remove()
    Zoom.stl = zoomStyleChanger(new_v)
})

GM_addValueChangeListener('recom_video', (key, old_v, new_v, rem) => {
    RecomVideo.stl?.remove()
    RecomVideo(new_v)
})

GM_addValueChangeListener('al', (key, old_v, new_v, rem) => {
    if (new_v) document.querySelector('video')?.addEventListener('timeupdate', timeupdate, false)
    else document.querySelector('video')?.removeEventListener('timeupdate', timeupdate, false)
})

GM_addValueChangeListener('speed', (key, old_v, new_v, rem) => {
    setVideoSpeed(new_v)
    const slider = document.querySelector('input[name="yt-kre-sr-slider"]')
    const out = document.querySelector('output.yt-kre-sr-out')
    if (out) out.innerHTML = new_v
    if (slider && rem) {
        slider.value = sett.speeds.indexOf(new_v) + 1
    }
})

/* window.addEventListener('loadstart', event => console.log('loadstart'), true)
window.addEventListener('loadeddata', event => console.log('loadeddata'), true)
window.addEventListener('loadedmetadata', event => console.log('loadedmetadata'), true) */

/*
```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\YtVideo]
"URL Protocol"=""
@="URL:YtVideo Protocol"
[HKEY_CLASSES_ROOT\YtVideo\shell\open]
[HKEY_CLASSES_ROOT\YtVideo\shell\open\command]
@="\"C:\\Program Files\\PotPlayer\\PotPlayerMini64.exe\" \"%1\""
```
window.location = 'YtVideo://launch?id=' + location.href
*/
