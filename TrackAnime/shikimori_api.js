

var sh_api = {}

sh_api.url_get = new URL(window.location.href)
sh_api.UserData = {}
sh_api.FavoritsLis = {}

sh_api.getCookie = async (name) => {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

sh_api.add_token = async () => {

    if (sh_api.getCookie("sh_access_token")) {
        return sh_api.getCookie("sh_access_token")
    }


    if (!code && !sh_api.getCookie("sh_refresh_token")) {
        window.open(`https://shikimori.one/oauth/authorize?client_id=aBohwwIpPXeCgSlo1xorfHKPaRBsdpW0_MMF8S-7SWA&redirect_uri=${window.location.origin}${window.location.pathname}&response_type=code`, "_self");
        return
    }

    if (!sh_api.getCookie("sh_access_token") && sh_api.getCookie("sh_refresh_token")) {
        console.log("reload_token")
        sh_api.refresh_token()

        return
    }

    console.log(1, code)
    await fetch('https://shikimori.one/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Track Anime By DygDyg'
        },
        body: `grant_type=authorization_code&client_id=aBohwwIpPXeCgSlo1xorfHKPaRBsdpW0_MMF8S-7SWA&client_secret=4lyibuneC2Z34-EBoyX0tgs2ytagD4hda-SiFfpSUAo&code=${code}&redirect_uri=${window.location.origin}${window.location.pathname}`
    })
        .then(response => response.json())
        .then(data => {
            console.log("get", data);
            document.cookie = `sh_access_token=${data.access_token}; path=/; max-age=${data.expires_in}`
            document.cookie = `sh_refresh_token=${data.refresh_token}; path=/; max-age=9999999999999999999;`

            sh_api.url_get.searchParams.delete("code")
            window.history.pushState({}, '', url_get);

            if (data.error == "invalid_grant") window.open(`https://shikimori.one/oauth/authorize?client_id=aBohwwIpPXeCgSlo1xorfHKPaRBsdpW0_MMF8S-7SWA&redirect_uri=${window.location.origin}${window.location.pathname}&response_type=code`, "_self");
            // location.reload()
        })
        .catch(error => console.error(error));
}

sh_api.refresh_token = async () => {

    if (sh_api.getCookie("sh_access_token")) {
        return sh_api.getCookie("sh_access_token")
    }

    if (!sh_api.getCookie("sh_refresh_token")) {
        window.open(`https://shikimori.one/oauth/authorize?client_id=aBohwwIpPXeCgSlo1xorfHKPaRBsdpW0_MMF8S-7SWA&redirect_uri=${window.location.origin}${window.location.pathname}&response_type=code`, "_self");
    }

    await fetch('https://shikimori.one/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Track Anime By DygDyg'
        },
        body: `grant_type=refresh_token&client_id=aBohwwIpPXeCgSlo1xorfHKPaRBsdpW0_MMF8S-7SWA&client_secret=4lyibuneC2Z34-EBoyX0tgs2ytagD4hda-SiFfpSUAo&refresh_token=${sh_api.getCookie("sh_refresh_token")}`
    })
        .then(response => response.json())
        .then(data => {
            console.log("rf", data);
            document.cookie = `sh_access_token=${data.access_token}; path=/; max-age=${data.expires_in}`
            document.cookie = `sh_refresh_token=${data.refresh_token}; path=/;`
            if (data.error == "invalid_grant") window.open(`https://shikimori.one/oauth/authorize?client_id=aBohwwIpPXeCgSlo1xorfHKPaRBsdpW0_MMF8S-7SWA&redirect_uri=${window.location.origin}${window.location.pathname}&response_type=code`, "_self");
            location.reload()
        })
        .catch(error => console.error(error));
}

sh_api.get_user = async () => {
    var url = `https://shikimori.one/api/users/${url_get.searchParams.get('user') ? url_get.searchParams.get('user') : "whoami"}?access_token=${getCookie("sh_access_token")}`
    await fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log("user_data", data);
            sh_api.UserData = data
            sh_api.get_favorit()
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });


    // document.cookie = getCookie("KeyTab") ? `` : `KeyTab=${KeyTab}; path=/; max-age=10`
}

sh_api.get_favorit = async () => {
    await fetch(`https://shikimori.one/api/users/${sh_api.url_get.searchParams.get('user') ? sh_api.url_get.searchParams.get('user') : sh_api.UserData.id}/anime_rates?limit=5000&access_token=${getCookie("sh_access_token")}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log("anime_rates", data);
            sh_api.Favorits = data
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
