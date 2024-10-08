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
        if (/2ip\.ru$/.test(host)) return "DIRECT";
        if (/(?:^|\.)fbsbx\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)fbcdn\.net$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)fbthirdpartypixel\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)facebook\.com$/.test(host)) return "+GPT_2";
        if (/vost\.pw$/.test(host)) return "+GPT_2";
        if (/discord\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)discordapp\.com$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)discordapp\.net$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)discord\.gg$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)discord\.media$/.test(host)) return "+GPT_2";
        if (/(?:^|\.)pr-cy\.ru$/.test(host)) return "+GPT_2";
        return "DIRECT";
    },
    "+GPT_2": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";
        return "PROXY cLkQbf:TGCfC5@138.59.5.104:9337";
    }
});