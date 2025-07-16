var FindProxyForURL = function(init, profiles) {
    return function(url, host) {
        "use strict";
        var result = init, scheme = url.substr(0, url.indexOf(":"));
        do {
            if (!profiles[result]) return result;
            result = profiles[result];
            if (typeof result === "function") result = result(url, host, scheme);
        } while (typeof result !== "string" || result.charCodeAt(0) === 43);
        return result;
    };
}("+auto switch", {
    "+auto switch": function(url, host, scheme) {
        "use strict";
        if (/^preflight-auth\.non-existent-website\.zzzzzzzzeroomega\.zero$/.test(host)) return "+pr6 poland";
        if (/192\.168\.1\.1$/.test(host)) return "DIRECT";
        if (/192\.168\..*\./.test(host)) return "DIRECT";
        if (/(?:^|\.)epicgames\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)metademolab\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)d1c5y0e1wfs94q\.cloudfront\.net$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)proxy6\.net$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)skydimo\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)gstatic\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)browser-intake-datadoghq\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)chatgpt\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)oaiusercontent\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)openai\.com$/.test(host)) return "+pr6 poland";
        if (/pornmult\.site$/.test(host)) return "+pr6 poland";
        if (/bing\.com$/.test(host)) return "+pr6 poland";
        if (/designer\.microsoft\.com$/.test(host)) return "+pr6 poland";
        if (/ecs\.office\.com$/.test(host)) return "+pr6 poland";
        if (/azureedge\.net$/.test(host)) return "+pr6 poland";
        if (/microsoft\.com$/.test(host)) return "+pr6 poland";
        if (/live\.com$/.test(host)) return "+pr6 poland";
        if (/vo\.msecnd\.net$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)unrealengine\.com$/.test(host)) return "+pr6 poland";
        if (/animego\.org$/.test(host)) return "+pr6 poland";
        if (/gemini\.google\.com$/.test(host)) return "+pr6 poland";
        if (/sf-converter\.com$/.test(host)) return "+pr6 poland";
        if (/(?:^|\.)grompokerua33\.com$/.test(host)) return "+pr6 poland";
        if (/grok\.com$/.test(host)) return "+pr6 poland";
        if (/x\.ai$/.test(host)) return "+pr6 poland";
        if (/metademolab\.com$/.test(host)) return "+pr6 poland";
        if (/discordapp\.com$/.test(host)) return "DIRECT";
        if (/discord\.gg$/.test(host)) return "+pr6 poland";
        if (/discord\.com$/.test(host)) return "+pr6 poland";
        if (/temu\.com$/.test(host)) return "+pr6 poland";
        if (/rutracker\.org$/.test(host)) return "+pr6 poland";
        if (/developer\.android\.com$/.test(host)) return "+pr6 poland";
        if (/linktodo\.ws$/.test(host)) return "+pr6 poland";
        return "DIRECT";
    },
    "+pr6 poland": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";
        return "SOCKS5 185.77.138.253:8000; SOCKS 185.77.138.253:8000";
    }
});