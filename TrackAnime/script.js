var data, dat, targetFrame, endid, endid2, prev_page
const scrollM = 2000;
document.body.r = 2;
var ignoreVoice = false
moment.locale('ru');
var HistoryIsActivy = true
var TypePage = 0
var url_get = new URL(window.location.href)
const KeyTab = Math.floor(Math.random() * 10000000000)
const VideoPlayerAnime = document.getElementById('VideoPlayerAnime');
const VideoInfo = document.getElementById('VideoInfo');
const VoiceSettings = document.getElementById('VoiceSettings');
const VideoPlayer = document.getElementById('VideoPlayer');
const list_calendar = document.getElementById("list_calendar");
const container_ = document.body.querySelector('.container_');
const URLSearch = "https://kodikapi.com/search?token=45c53578f11ecfb74e31267b634cc6a8&with_material_data=true&title="
var URLList = "https://kodikapi.com/list?limit=100&with_material_data=true&camrip=false&token=45c53578f11ecfb74e31267b634cc6a8"//&countries=Япония"
var URLCalendar = "https://kodikapi.com/list?limit=100&with_material_data=true&camrip=false&token=45c53578f11ecfb74e31267b634cc6a8&anime_status=ongoing"//&anime_kind=tv"//&countries=Япония"
var URLListStart = "https://kodikapi.com/list?limit=100&with_material_data=true&camrip=false&token=45c53578f11ecfb74e31267b634cc6a8"
Notification.requestPermission()
const voice = [
    "AniStar",
    "Dream Cast",
    "AnimeVost",
    "AniDub Online",
    "AniDUB",
    "JAM",
    "AniLibria.TV",
    "SHIZA Project",
]

VideoInfo.info = {
    "cover": VideoInfo.querySelector("#info_cover"),
    "title": VideoInfo.querySelector("#info_title"),
    "description": VideoInfo.querySelector("#info_description"),

    "countries": VideoInfo.querySelector("#info_countries"),
    "genres": VideoInfo.querySelector("#info_genres"),
    "studios": VideoInfo.querySelector("#info_studios"),
    "updated_at": VideoInfo.querySelector("#info_updated_at"),
    "screenshots": VideoInfo.querySelector("#info_screenshots"),
    "info_status": VideoInfo.querySelector("#info_status"),
    "year": VideoInfo.querySelector("#info_year"),
    "rating_mpaa": VideoInfo.querySelector("#info_rating_mpaa"),
    "shikimori_rating": VideoInfo.querySelector("#info_shikimori_rating"),
    "shikimori_votes": VideoInfo.querySelector("#info_shikimori_votes"),


}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(() => {
    if (!HistoryIsActivy) return
    GetKodi("", true)
}, 30 * 1000);  //Автопроверка 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setVideoInfo(e) {
    var html
    console.log(e.material_data, VideoInfo.info)
    const tv = e.material_data.anime_kind ? ` [${e.material_data.anime_kind.toUpperCase()}]` : ""
    VideoInfo.info.cover.src = e.material_data.poster_url;
    VideoInfo.info.title.textContent = e.material_data.anime_title ? `${tv} ${e.material_data.anime_title}` : "?";
    VideoInfo.info.countries.textContent = e.material_data.countries ? e.material_data.countries : "?";
    VideoInfo.info.description.textContent = e.material_data.description ? e.material_data.description : "?";
    VideoInfo.info.info_status.textContent = e.material_data.anime_status ? e.material_data.anime_status : "?";
    VideoInfo.info.studios.textContent = e.material_data.anime_studios ? e.material_data.anime_studios : "?";
    VideoInfo.info.year.textContent = e.material_data.year ? e.material_data.year : "?";
    VideoInfo.info.rating_mpaa.textContent = e.material_data.rating_mpaa ? e.material_data.rating_mpaa : "?";
    

    html = ""
    e.material_data.screenshots.forEach(el => {
        html = html + `
        <div class="carousel-item">
        <img src="${el}"
            class="d-block w-100" alt="...">
    </div>
    ` });
    VideoInfo.info.screenshots.innerHTML = html;
    VideoInfo.info.screenshots.querySelectorAll(".carousel-item")[0]?.classList.add("active");

    html = "Жанры: "
    e.material_data.anime_genres.forEach(el => {
        html = html + `
        <a href="${null}"class="info_genre link-danger link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">${el}</a>
        `
    })
    VideoInfo.info.genres.innerHTML = html;



}
document.getElementById('VoiceButtonMenu').addEventListener('click', () => {
    VoiceSettingsMenu()
})

document.getElementById('search_input').addEventListener('change', (e) => {
    console.log(e.target.value)
    GetKodi(encodeURI(e.target.value))
})


document.getElementById("VideoInfoBtn").addEventListener('click', () => {
    let DialogVideoInfo = document.getElementById('DialogVideoInfo')
    DialogVideoInfo.classList.contains('DialogVideoInfoScroll') ? DialogVideoInfo.classList.remove("DialogVideoInfoScroll") : DialogVideoInfo.classList.add("DialogVideoInfoScroll")

})

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

closeDialogButton.addEventListener('click', () => {
    DialogVideoInfo.classList.remove("DialogVideoInfoScroll")
    VideoPlayerAnime.close();
    VideoPlayer.contentWindow.location.href = "../index.htm";
    url_get.searchParams.delete("id")
    window.history.pushState({}, '', url_get);
});
document.getElementById("list_calendar_Button").addEventListener('click', async () => {
    getCalendar()
});
VideoPlayerAnime.addEventListener("close", () => {
    document.title = "Track Anime By ДугДуг"
});


// window.onscroll = function () {
container_.addEventListener('scroll', async function (e) {
    // console.log(e.target.scrollTop)
    if ((e.target.scrollTop + window.scrollY) >= e.target.scrollHeight - scrollM && HistoryIsActivy == true) {
        GetKodi()
        // setTimeout(GetKodi, 0)
    }
});

var base_anime = localStorage.getItem('BaseAnime')
if (base_anime) {
    base_anime = JSON.parse(base_anime)
} else {
    base_anime = {}
}
if (base_anime.base) {
    delete base_anime.base;
    localStorage.setItem('BaseAnime', JSON.stringify(base_anime));
}
base_anime.fav = base_anime.fav ? base_anime.fav : []


/* document.addEventListener('keydown', function (event) {
    if (event.code == 'F2') {

    }
}); */


// url_get.searchParams.delete("shikimori")
// url_get.searchParams.set("shikimori", `${shikimori}`)
// window.history.pushState({}, '', url_get);

///////////////////// GET параметры 
if (url_get.searchParams.get('id')) {
    console.log(url_get.searchParams.get('id'))
    e = JSON.parse(httpGet(`https://kodikapi.com/search?token=45c53578f11ecfb74e31267b634cc6a8&with_material_data=true&id=${url_get.searchParams.get('id')}`).response).results[0]
    console.log(e)
    const ed = {
        "title": e.material_data.anime_title,
        "cover": `${e.material_data.poster_url}`,
        // "cover": `https://shikimori.one${base_anime.base[e.shikimori_id].image.original}`,
        "date": formatDate(e.material_data.next_episode_at),
        // "date": formatDate(base_anime.base[e.shikimori_id].next_episode_at),
        "voice": formatDate(e.material_data.next_episode_at).moment.format('dddd'),
        "series": e.episodes_count ? e.episodes_count : "M",
        "link": e.link,
        "kp": e.kinopoisk_id,
        "imdb": e.imdb_id,
        "shikimori": e.shikimori_id,
        "status": e.material_data.all_status,
        "raiting": e.material_data.shikimori_rating,
        "material_data": e.material_data,
        "id": e.id,
    }
    dialog(ed, true)
}

// url_get.searchParams.delete("seartch")

async function getCalendar() {
    console.log(TypePage)
    if (TypePage == 1) {
        HistoryIsActivy = true
        TypePage = 0
        document.getElementById("list_calendar").classList.add("hide")
        document.getElementById("list_serch").classList.remove("hide")
        // GetKodi()
        return
    }

    HistoryIsActivy = false
    TypePage = 1
    // var tmp1 = list_calendar.getElementsByClassName('ned')
    document.getElementById("load").classList.remove("hide")
    document.getElementById("list_calendar").classList.add("hide")

    setTimeout(addCalendar, 10)
}

async function addCalendar() {
    document.getElementById("list_history").classList.add("hide")
    document.getElementById("list_serch").classList.add("hide")
    document.getElementById("list_calendar").classList.remove("hide")
    var URLCalendarAdd = URLCalendar;
    var data = []
    var d1
    var d3 = list_calendar.getElementsByClassName('ned')

    for (let i = 0; i < d3.length; i++) {
        d3[i].innerHTML = ""
    }

    // return
    while (URLCalendarAdd) {
        d1 = JSON.parse(httpGet(URLCalendarAdd).response)
        var d2 = data
        var id = []
        data = d2.concat(d1.results)
        URLCalendarAdd = d1.next_page
    }
    data.forEach(e => {
        if ((e.type == 'anime-serial') && e.translation.type == "voice" && e.shikimori_id && e.material_data.shikimori_rating > 0 && e.material_data.countries != "Китай") {
            if (id.includes(e.shikimori_id)) return
            console.log(e.material_data.shikimori_rating, e.material_data.countries == "Китай", e.material_data.anime_title, e)
            id.push(e.shikimori_id)
            const e1 = {
                "title": e.material_data.anime_title,
                "cover": `${e.material_data.poster_url}`,
                // "cover": `https://shikimori.one${base_anime.base[e.shikimori_id].image.original}`,
                "date": formatDate(e.material_data.next_episode_at),
                // "date": formatDate(base_anime.base[e.shikimori_id].next_episode_at),
                "voice": formatDate(e.material_data.next_episode_at).moment.format('dddd'),
                "series": e.episodes_count ? e.episodes_count : "M",
                "link": e.link,
                "kp": e.kinopoisk_id,
                "imdb": e.imdb_id,
                "shikimori": e.shikimori_id,
                "status": e.material_data.all_status,
                "raiting": e.material_data.shikimori_rating,
                "material_data": e.material_data,
                "id": e.id,
            }
            const cart = add_cart(e1)
            formatDate(e.material_data.next_episode_at).moment.day() == 0 ? d3[6].appendChild(cart) : d3[formatDate(e.material_data.next_episode_at).moment.day() - 1].appendChild(cart)
        }
    });
    list_calendar.getElementsByClassName('ned_spoiler')[formatDate().moment.day() - 1].open = true
    list_calendar.getElementsByClassName('ned_name')[formatDate().moment.day() - 1].scrollIntoView({ behavior: "smooth", block: "start", inline: "start" })
    document.getElementById("load").classList.add("hide")
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
async function add_push(e) {
    if (!GetFavorite(e.shikimori) && base_anime.fav.length > 0) return

    const perm = await Notification.requestPermission()

    // return showToast(e);

    if (perm != "granted") {
        showToast(e);
        // console.log(e)
        return
    }

    notification = new Notification(e.title,
        {
            body: `Серия ${e.series} в озвучке ${e.voice}`,
            // tag: e.date.string,
            icon: e.cover,
        })

    notification.addEventListener("click", (event) => {
        e.shift = event.shiftKey
        dialog(e, !event.shiftKey)
    })

}

function SetFavorite(e) {
    base_anime.fav.push(e)
    localStorage.setItem('BaseAnime', JSON.stringify(base_anime));
    return base_anime.fav
}

function DeleteFavorite(e) {
    base_anime.fav = base_anime.fav.filter(item => !item.includes(e));
    localStorage.setItem('BaseAnime', JSON.stringify(base_anime));
    return base_anime.fav
}

function GetFavorite(e) {
    let result = base_anime.fav.filter(item => item.toLowerCase().includes(e.toLowerCase()));
    if (result.length > 0) {
        return true
    }
    return false
}
function VoiceSettingsMenu() {
    const checkboxList = document.getElementById('checkbox-list');
    const buttonContainer = document.getElementById('button-container');

    base_anime.translation.sort().forEach((voice, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `voice-${index}`;
        checkbox.className = 'form-check-input';
        checkbox.checked = base_anime.translationActive.includes(voice);

        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = `voice-${index}`;
        checkboxLabel.className = 'form-check-label';
        checkboxLabel.textContent = voice;
        console.log(voice, encodeURIComponent(voice))
        checkboxLabel.classList.add(encodeURIComponent(voice));

        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'form-check';
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(checkboxLabel);

        checkbox.checked ? VoiceSettings.prepend(checkboxDiv) : VoiceSettings.appendChild(checkboxDiv);
    });

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'btn btn-primary mt-3';
    saveButton.textContent = 'Сохранить';
    VoiceSettings.prepend(saveButton)
    saveButton.addEventListener('click', () => {
        base_anime.translationActive = [];
        const checkboxes = document.querySelectorAll('.form-check-input');

        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                base_anime.translationActive.push(checkbox.nextElementSibling.textContent);
            }
        });
        if (base_anime.translationActive.length > 0) localStorage.setItem('BaseAnime', JSON.stringify(base_anime));
        console.log('base_anime.translationActive:', base_anime.translationActive);
        VoiceSettings.innerHTML = ""
        VoiceSettings.close()
        location.reload();
    });

    VoiceSettings.showModal()

}
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp;


}
RangeRaitingObj = document.getElementById('RangeRaiting')
RangeRaitingObj.addEventListener("input", RangeRaiting);
RangeRaitingObj.addEventListener("change", () => { GetKodi() });
RangeRaitingObj.title = `Фильтр по минимальному рейтингу: ${RangeRaitingObj.value}`
function RangeRaiting(r) {
    // console.log(1, r)
    document.body.r = r.target.value;
    r.target.title = `Фильтр по минимальному рейтингу: ${r.target.value}`
    document.body.querySelectorAll(".cart_").forEach(e => {
        e.r < r.target.value ? e.classList.add('hide') : e.classList.remove('hide')
    })
}

function add_cart(e) {
    const cart = document.createElement('div');
    cart.classList.add('cart_', 'bg-dark', 'text-white');
    cart.r = e.raiting
    document.body.r > cart.r ? cart.classList.add('hide') : null;

    cart.addEventListener("click", (event) => {

        e.shift = event.shiftKey
        console.log(e)
        dialog(e, !event.shiftKey)
        cart.classList.remove("new_cart")
    })

    const imgTop = document.createElement('div');
    imgTop.style.backgroundImage = `url(${e.cover}`;
    imgTop.src = e.cover;
    imgTop.classList.add('cart-img-top');
    imgTop.alt = 'cover';
    cart.appendChild(imgTop);

    const cartTitle = document.createElement('h5');
    cartTitle.classList.add('cart-title');
    cartTitle.textContent = e.title;
    cartTitle.title = e.title;
    imgTop.appendChild(cartTitle);


    const cartTime = document.createElement('h5');
    cartTime.classList.add('cart-time');
    cartTime.textContent = e.date.moment.calendar();
    cartTime.title = e.date.moment.calendar();
    imgTop.appendChild(cartTime);

    const cartCal = document.createElement('h5');
    cartCal.classList.add('cart-cal');
    cartCal.textContent = e.date.moment.fromNow();//
    cartCal.title = e.date.moment.format('MMMM Do YYYY, HH:mm:ss'); //${days.name[Number(days.dayOfWeek)]}
    cartCal.style.color = e.kp ? "#ffcccc" : "#ffffff"
    cartCal.style.color = e.imdb ? "#daedff" : "#ffffff"
    cartTime.appendChild(cartCal);

    const cartVoice = document.createElement('h5');
    cartVoice.classList.add('cart-voice');
    cartVoice.classList.add(encodeURIComponent(e.voice));
    cartVoice.textContent = e.voice;
    cartVoice.title = e.status;
    imgTop.appendChild(cartVoice);

    const cartRaiting = document.createElement('div');

    cartRaiting.classList.add('cart-raiting');
    cartRaiting.innerHTML = `
    <div class="progress cartRaitingProgress progress-bar-vertical ">
    <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="height: 60%;">
      <span class="sr-only">60% Complete</span>
    </div>
  </div>
    `
    cartRaiting.r = e.raiting
    cartRaiting.title = `Рейтинг шикимори: ${e.raiting}`
    cartRaiting.label = cartRaiting.querySelector(".sr-only")
    cartRaiting.progress = cartRaiting.querySelector(".progress-bar")
    cartRaiting.progress.style.height = `${e.raiting * 10}%`
    cartRaiting.label.textContent = `Рейтинг шикимори: ${e.raiting}`

    imgTop.appendChild(cartRaiting);

    const cartSeries = document.createElement('h5');
    cartSeries.classList.add('cart-series');
    cartSeries.textContent = e.series;
    cartSeries.title = e.status;
    cartSeries.style.color = e.kp ? "#ffa9a9" : "#ffffff"
    cartSeries.style.color = e.imdb ? "#a9d5ff" : "#ffffff"
    cartSeries.style.color = e.status == "released" ? "#a9ffb4" : "#ffffff"
    imgTop.appendChild(cartSeries);


    const cartFavorite = document.createElement('div');
    cartFavorite.classList.add('cart-fav');
    cartFavorite.textContent = "♥";
    cartFavorite.title = e.series;
    imgTop.appendChild(cartFavorite);
    cartFavorite.style.color = GetFavorite(e.shikimori) ? "#ffdd00" : "#ffffff"

    cart.addEventListener("mouseover", (ev) => {
        cartFavorite.style.color = GetFavorite(e.shikimori) ? "#ffdd00" : "#ffffff"
    });

    cartFavorite.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (GetFavorite(e.shikimori)) {
            cartFavorite.style.color = "#ffffff"
            console.log(DeleteFavorite(e.shikimori))
        } else {
            cartFavorite.style.color = "#ffdd00"
            SetFavorite(e.shikimori)
        }


    })
    // setTimeout(() => cart.classList.add("cart_spawn"), 0)

    return cart
}

function formatDate(isoDateString) {
    var days = {}
    var data

    days.moment = moment.utc(isoDateString)
    days.name = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    days.name_s = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

    if (isoDateString) {
        date = new Date(isoDateString)
    } else {
        date = new Date()
    };

    days.day = String(date.getDate()).padStart(2, '0');
    days.month = String(date.getMonth() + 1).padStart(2, '0');
    days.year = date.getFullYear();
    days.hours = String(date.getHours()).padStart(2, '0');
    days.minutes = String(date.getMinutes()).padStart(2, '0');
    days.seconds = String(date.getSeconds()).padStart(2, '0');
    days.dayOfWeek = Number(String(date.getDay()).padStart(2, '0'));
    days.dayOfWeek_n = days.moment.format('dddd');
    days.dayOfWeek_ns = days.name_s[days.dayOfWeek + 1]
    days.string = `${days.moment.calendar()}`
    days.moment_7 = moment.utc(isoDateString)
    days.moment_7.add(7, 'days')
    return days;
}

document.addEventListener('DOMContentLoaded', function () {
    // showToast();
});

function showToast(e) {
    // prompt("",JSON.stringify(e))
    // console.log(e)
    var audio = new Audio();
    audio.preload = 'auto';
    audio.src = './meloboom.mp3';
    audio.play();
    var toast0 = document.createElement('div');
    document.getElementById('ToastsMain').appendChild(toast0)

    toast0.innerHTML = `
    <div class="toast liveToast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false" style="user-select: none;">
    <div class="toast-header">
      <img src="${e.cover}" style="height: 75px;" class="imgs rounded me-2" alt="...">
      <strong class="${encodeURIComponent(e.voice)} me-auto">${e.voice}</strong>
      <small class="text-muted">${e.date.string}</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Закрыть"></button>
    </div>
    <div class="toast-body">
      ${e.title}
    </div>
  </div>
    `;


    var toast1 = new bootstrap.Toast(toast0.querySelector(".liveToast"));

    toast0.addEventListener('hidden.bs.toast', function (e) {
        toast0.remove()
        // console.log("aaa")
    })
    toast1.show();

    toast0.querySelector(".toast-header").addEventListener("click", (ev) => {
        // console.log(e)
        toast1.hide();
    })

    // toast0.show();
    // toast.dispose()
}

function dialog(e, info) {
    setVideoInfo(e)
    url_get.searchParams.set("id", `${e.id}`)
    window.history.pushState({}, '', url_get);
    document.title = `TA: ${e.title}`

    if (e.shift) {
        //     showToast(e);
        // add_push(e)
        // return
    }

    VideoPlayerAnime.showModal();




    if ((e.imdb || e.kp) && e.shift) {
        VideoPlayer.contentWindow.location.href = e.kp ? `//dygdyg.github.io/DygDygWEB/svetacdn.htm?loadserv=kinobox&kinopoiskID=${e.kp}` : `//dygdyg.github.io/DygDygWEB/svetacdn.htm?loadserv=kinobox&imdb=${e.imdb}`
        return
    }
    VideoPlayer.contentWindow.location.href = e.link
    /* 
        if (DialogVideoInfo.classList.contains('DialogVideoInfoScroll')) {
            DialogVideoInfo.classList.remove("DialogVideoInfoScroll")
            DialogVideoInfo.classList.add("DialogVideoInfoScroll")
        } */


    info ? DialogVideoInfo.classList.add("DialogVideoInfoScroll") : DialogVideoInfo.classList.remove("DialogVideoInfoScroll")
}
function VoiceTranslate(name) {

    if (ignoreVoice || base_anime.translationActive < 1) return true
    if (base_anime.translationActive) {
        return base_anime.translationActive.includes(name)
    } else {
        base_anime.translationActive = voice;
        return voice.includes(name)
    }


}
async function GetKodi(seartch, revers) {
    // if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - scrollM && HistoryIsActivy == true && document.getElementById('search_input').value ) {
    if ((window.innerHeight + window.scrollY) >= container_.offsetHeight - scrollM) {
        // console.log(123)
        if (!seartch || seartch == undefined || seartch == "") {
            HistoryIsActivy = true
            ignoreVoice = false
            document.getElementById('list_history').classList.add("hide")
            targetFrame = document.getElementById('list_serch')
            targetFrame.classList.remove("hide")

            if (revers) {
                dat = JSON.parse(httpGet(URLListStart).response)
                endid2 = dat.results[0].id
            } else {
                dat = JSON.parse(httpGet(URLList).response)
                URLList = dat.next_page
                endid = endid ? endid : dat.results[0].id

            }

            url_get = new URL(window.location.href)
            url_get.searchParams.delete("seartch")
            window.history.pushState({}, '', url_get);
        } else {
            HistoryIsActivy = false
            ignoreVoice = true
            document.getElementById('search_input').value = decodeURIComponent(seartch)
            targetFrame = document.getElementById('list_history')
            targetFrame.classList.remove("hide")
            targetFrame.innerHTML = ""
            document.getElementById('list_serch').classList.add("hide")
            dat1 = JSON.parse(httpGet(`${URLSearch}${seartch}`).response)
            dat = {}

            dat.results = dat1.results.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.shikimori_id === value.shikimori_id
                ))
            );

            url_get = new URL(window.location.href)
            url_get.searchParams.set("seartch", `${seartch}`)
            window.history.pushState({}, '', url_get);
            console.log(dat1)
        }
        data = dat.results
        prev_page = dat.prev_page


        GetKodiScan(data, revers)
        // container_.scrollHeight
        if (window.innerHeight >= container_.scrollHeight - scrollM && HistoryIsActivy) {
            setTimeout(GetKodi, 0)
        }
        return seartch
    }
}
// }

GetKodi(url_get.searchParams.get('seartch'))





function ScanBase(e, i, revers) {
    document.getElementById("loading-bar").classList.remove("hide");
    var t = 0
    if (i >= e.length) {
        GetKodiScan(data, revers)
        document.getElementById("loading-bar").classList.add("hide");
        // localStorage.setItem('BaseAnime', JSON.stringify(base_anime));
        //container_.offsetHeight
        if (window.innerHeight >= container_.scrollHeight - scrollM && HistoryIsActivy) {
            GetKodi()
        }
        return;
    }
    const prog = `${i}%`
    document.getElementById("loading-bar").style.width = prog
    document.getElementById("loading-bar").textContent = prog

    setTimeout(() => {
        ScanBase(e, i + 1, revers);
    }, t);
}

function GetKodiScan(data, revers) {
    var t1 = false
    data.forEach(e => {

        if (revers && endid == e.id || t1) {

            t1 = true
            endid = endid2
            return
        }
        if ((e.type == 'anime-serial' || e.type == "anime") && e.translation.type == "voice" && e.shikimori_id && e.material_data.shikimori_rating > 0 && e.material_data.countries != "Китай") {
            // console.log(endid)

            if (VoiceTranslate(e.translation.title)) {
                const dat = new Date(e.updated_at)
                if (!e.shikimori_id) return
                // console.log(e.material_data.shikimori_rating)
                const e1 = {
                    "title": e.material_data.anime_title,
                    "cover": `${e.material_data.poster_url}`,
                    // "cover": `https://shikimori.one${base_anime.base[e.shikimori_id].image.original}`,
                    "date": formatDate(e.updated_at),
                    // "date": formatDate(base_anime.base[e.shikimori_id].next_episode_at),
                    "voice": e.translation.title,
                    "series": e.episodes_count ? e.episodes_count : "M",
                    "link": e.link,
                    "kp": e.kinopoisk_id,
                    "imdb": e.imdb_id,
                    "shikimori": e.shikimori_id,
                    "status": e.material_data.all_status,
                    "raiting": e.material_data.shikimori_rating,
                    "material_data": e.material_data,
                    "id": e.id,

                }
                const cart = add_cart(e1)
                if (revers && prev_page == null) {
                    targetFrame.prepend(cart)
                    cart.classList.add("new_cart")
                    add_push(e1)
                } else {
                    targetFrame.appendChild(cart)

                };


            }
            if (!base_anime.translation) base_anime.translation = [];
            if (!base_anime.translationActive) base_anime.translationActive = voice;
            if (!base_anime.translation.includes(e.translation.title)) base_anime.translation.push(e.translation.title);
        }

    });
}
// console.log(base_anime.translation)
localStorage.setItem('BaseAnime', JSON.stringify(base_anime));