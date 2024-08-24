var FindProxyForURL = function(init, profiles) {
    return function(url, host) {
        "use strict";
        var result = init, scheme = url.substr(0, url.indexOf(":"));
        do {
            result = profiles[result];
            if (typeof result === "function") result = result(url, host, scheme);
        } while (typeof result !== "string" || result.charCodeAt(0) === 43);
        return result;
    };
}("+auto switch", {
    "+auto switch": function(url, host, scheme) {
        "use strict";
        if (/www\.youtube\.com$/.test(host)) return "+ip6";
        if (/youtube\.com$/.test(host)) return "+ip6";
        if (/ytimg\.com$/.test(host)) return "+ip6";
        if (/timg\.com$/.test(host)) return "+ip6";
        if (/ggpht\.com$/.test(host)) return "+ip6";
        if (/(?:^|\.)googlevideo\.com$/.test(host)) return "+ip6";
        if (/rutracker\.org$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)readmanga\.live$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)oaistatic\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)browser-intake-datadoghq\.com$/.test(host)) return "+ip6";
        if (/(?:^|\.)chatgpt\.com$/.test(host)) return "+ip6";
        if (/(?:^|\.)oaiusercontent\.com$/.test(host)) return "+ip6";
        if (/(?:^|\.)openai\.com$/.test(host)) return "+ip6";
        if (/bing\.com$/.test(host)) return "+GPT_2";
        if (/pornmult\.site$/.test(host)) return "+GPT_2";
        if (/designer\.microsoft\.com$/.test(host)) return "+GPT_2";
        if (/ecs\.office\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)unrealengine\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)epicgames\.com$/.test(host)) return "+GPT_2";
        if (/vost\.pw$/.test(host)) return "+GPT_2";
        if (/dygdyg\.github\.io$/.test(host)) return "DIRECT";
        if (/track-anime\.github\.io$/.test(host)) return "DIRECT";
        if (/shikimori\.one$/.test(host)) return "DIRECT";
        if (/^192\.168\..*\./.test(host)) return "DIRECT";
        return "DIRECT";
    },
    "+ip6": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";
        return "PROXY 200.71.127.90:9409";
    },
    "+GPT_2": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";
        return "PROXY 200.71.127.90:9409";
    }
});