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
        if (/(?:^|\.)skydimo\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)gstatic\.com$/.test(host)) return "+GPT_2";
        if (/2ip\.ru$/.test(host)) return "+proxy1";
        if (/(?:^|\.)fbsbx\.com$/.test(host)) return "+proxy1";
        if (/(?:^|\.)fbcdn\.net$/.test(host)) return "+proxy1";
        if (/(?:^|\.)fbthirdpartypixel\.com$/.test(host)) return "+proxy1";
        if (/(?:^|\.)facebook\.com$/.test(host)) return "+proxy1";
        if (/vost\.pw$/.test(host)) return "+proxy1";
        if (/www\.youtube\.com$/.test(host)) return "+proxy1";
        if (/youtube\.com$/.test(host)) return "+proxy1";
        if (/ytimg\.com$/.test(host)) return "+proxy1";
        if (/timg\.com$/.test(host)) return "+proxy1";
        if (/ggpht\.com$/.test(host)) return "+proxy1";
        if (/(?:^|\.)googlevideo\.com$/.test(host)) return "+proxy1";
        if (/rutracker\.org$/.test(host)) return "+proxy1";
        if (/(?:^|\.)readmanga\.live$/.test(host)) return "+proxy1";
        if (/(?:^|\.)oaistatic\.com$/.test(host)) return "+proxy1";
        if (/(?:^|\.)browser-intake-datadoghq\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)chatgpt\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)oaiusercontent\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)openai\.com$/.test(host)) return "+GPT_2";
        if (/pornmult\.site$/.test(host)) return "+GPT_2";
        if (/bing\.com$/.test(host)) return "+GPT_2";
        if (/designer\.microsoft\.com$/.test(host)) return "+GPT_2";
        if (/ecs\.office\.com$/.test(host)) return "+GPT_2";
        if (/azureedge\.net$/.test(host)) return "+GPT_2";
        if (/microsoft\.com$/.test(host)) return "+GPT_2";
        if (/live\.com$/.test(host)) return "+GPT_2";
        if (/vo\.msecnd\.net$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)unrealengine\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)epicgames\.com$/.test(host)) return "+GPT_2";
        if (/dygdyg\.github\.io$/.test(host)) return "DIRECT";
        if (/track-anime\.github\.io$/.test(host)) return "DIRECT";
        if (/shikimori\.one$/.test(host)) return "DIRECT";
        if (/^192\.168\..*\./.test(host)) return "DIRECT";
        if (/cloud\.google\.com$/.test(host)) return "+proxy1";
        return "DIRECT";
    },
    "+GPT_2": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";
        return "PROXY 138.59.5.104:9337";
    },
    "+proxy1": "+GPT_2"
});