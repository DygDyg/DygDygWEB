// ==UserScript==
// @name         BookMyShow — Movie Info Collector (NEW JSON + Duration) v1.4
// @namespace    https://dygdyg.ru/
// @author       ДугДуг
// @version      1.4
// @description  Сбор данных фильма (жанры, актёры, режиссёр, длительность, постер, баннер)
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bookmyshow.com
// @match        https://in.bookmyshow.com/movies/*/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    "use strict";

    /* ---------- helpers ---------- */

    document.body.style.userSelect = "auto";

    function extractInitialState() {
        for (const s of document.querySelectorAll("script")) {
            const t = s.textContent;
            if (t && t.includes("window.__INITIAL_STATE__")) {
                try {
                    const jsonStr = t
                        .replace(/^.*?window\.__INITIAL_STATE__\s*=\s*/, "")
                        .replace(/;\s*$/, "");
                    return JSON.parse(jsonStr);
                } catch { }
            }
        }
        return null;
    }

    function extractYear(str) {
        if (!str) return "";
        const m = String(str).match(/\b(19|20)\d{2}\b/);
        return m ? m[0] : "";
    }

    function countryNameFromCode(code) {
        if (!code) return "";
        const c = code.toUpperCase();
        if (c === "IN") return "India";
        if (c === "US" || c === "USA") return "United States";
        if (c === "GB" || c === "UK") return "United Kingdom";
        return c;
    }

    function generateUUID() {
        return URL.createObjectURL(new Blob())
            .split("/")
            .pop()
            .replace(/-/g, "")
            .slice(0, 32);
    }

    /* ---------- data extraction ---------- */

    function getData() {
        const st = extractInitialState() || {};
        const path = location.pathname;

        const seoEntry =
            st.seo?.queries?.[path]?.data || {};

        const ld =
            seoEntry.ldSchema?.movieJsonLd || {};

        const synopsisStore = st.synopsisStore || {};
        const synopsis = synopsisStore.synopsis || {};
        const synopsisRender = synopsisStore.synopsisRender || {};

        const urlMatch = location.href.match(/\/movies\/[^/]+\/([A-Z0-9]+)/i);

        const duration =
            typeof ld.duration === "number" && ld.duration > 0
                ? ld.duration
                : "";

        const banner =
            synopsisRender?.bannerWidget?.bannerImageUrl || "";

        const res = {
            ttid: urlMatch ? urlMatch[1] : "—",
            title: ld.name || synopsis.eventName || document.title.trim(),
            original: ld.name || "",
            rating: "",
            votes: synopsisStore.ratingAndReviews?.totalRatingsCount || "",
            description: ld.description || synopsis.description || "",
            poster:
                ld.image ||
                document.querySelector('meta[property="og:image"]')?.content ||
                "",
            banner: banner,
            duration: duration,
            actors: "",
            director: "",
            genre: Array.isArray(ld.genre) ? ld.genre.join(", ") : "",
            country: "",
            year:
                extractYear(ld.datePublished) ||
                extractYear(synopsis.releaseDate),
            studio: "",
        };

        // Рейтинг
        const ratingNum = synopsisStore.ratingAndReviews?.rating;
        if (typeof ratingNum === "number" && ratingNum > 0) {
            const r = ratingNum / 10;
            res.rating = r % 1 === 0 ? String(Math.round(r)) : r.toFixed(1);
        }

        // Актёры
        if (Array.isArray(ld.actor)) {
            res.actors = ld.actor
                .map(a => a?.name?.trim())
                .filter(Boolean)
                .join(", ");
        }

        // Режиссёр
        if (Array.isArray(ld.director)) {
            res.director = ld.director
                .map(d => d?.name?.trim())
                .filter(Boolean)
                .join(", ");
        }

        // Страна
        const code =
            ld.releasedEvent?.location?.name ||
            ld.releasedEvent?.location?.["@id"] ||
            "";
        res.country = countryNameFromCode(code);

        return res;
    }

    /* ---------- clipboard ---------- */

    async function copyText(text) {
        try {
            if (typeof GM_setClipboard === "function") GM_setClipboard(text);
            else await navigator.clipboard.writeText(text);
        } catch {
            alert("Ошибка копирования");
        }
    }

    async function copyImage(url, btn) {
        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            await new Promise((r, e) => {
                img.onload = r;
                img.onerror = e;
            });

            const c = document.createElement("canvas");
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext("2d").drawImage(img, 0, 0);

            let blob = await new Promise(r => c.toBlob(r, "image/webp", 0.95));
            let type = "image/webp";

            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ [type]: blob }),
                ]);
            } catch {
                blob = await new Promise(r => c.toBlob(r, "image/png"));
                type = "image/png";
                await navigator.clipboard.write([
                    new ClipboardItem({ [type]: blob }),
                ]);
            }

            btn.textContent = "✅";
            setTimeout(() => (btn.textContent = "📋"), 1500);
        } catch {
            alert("Ошибка копирования изображения");
        }
    }

    /* ---------- UI ---------- */

    function makeLine(label, value) {
        const line = document.createElement("div");
        line.style.cssText =
            "display:flex;gap:6px;margin-bottom:8px;background:#2c2c2c;border-radius:6px;padding:6px 8px;";
        const l = document.createElement("div");
        l.textContent = label + ":";
        l.style.fontWeight = "bold";

        const v = document.createElement("div");
        v.textContent = value || "—";
        v.style.flex = "1";
        v.style.fontSize = "13px";
        v.style.overflowWrap = "anywhere";

        const b = document.createElement("button");
        b.textContent = "📋";
        Object.assign(b.style, {
            background: "#f5c518",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
        });
        b.onclick = () => copyText(value || "");

        line.append(l, v, b);
        return line;
    }

    function makeImageBlock(title, url) {
        const w = document.createElement("div");
        w.style.textAlign = "center";
        w.style.margin = "10px 0";

        w.innerHTML = `
      <div style="font-weight:bold;margin-bottom:6px">${title}</div>
      <img src="${url}" style="max-width:100%;border-radius:8px">
    `;

        const b = document.createElement("button");
        b.textContent = "📋";
        b.style.marginTop = "6px";
        b.onclick = () => copyImage(url, b);
        w.appendChild(b);

        return w;
    }

    /* ---------- modal ---------- */

    const modal = document.createElement("div");
    modal.style.cssText =
        "position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:10001";

    const box = document.createElement("div");
    box.style.cssText =
        "background:#1c1c1c;color:#fff;border-radius:10px;padding:20px;width:520px;max-height:90vh;overflow:auto";

    const body = document.createElement("div");

    const close = document.createElement("button");
    close.textContent = "✖";
    close.style.margin = "10px auto 0";
    close.onclick = () => (modal.style.display = "none");

    box.append(
        Object.assign(document.createElement("h2"), {
            textContent: "📋 BookMyShow данные",
            style: "text-align:center",
        }),
        body,
        close
    );
    modal.appendChild(box);

    const btn = document.createElement("button");
    btn.textContent = "📋 BMS";
    Object.assign(btn.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 10000,
        background: "#f5c518",
        borderRadius: "8px",
        padding: "10px 14px",
        cursor: "pointer",
    });

    btn.onclick = () => {
        const d = getData();
        body.innerHTML = "";

        [
            ["IMDb ID", d.ttid],
            ["Название", d.title],
            ["Оригинальное название", d.original],
            ["Рейтинг", d.rating],
            ["Голоса", d.votes],
            ["Описание", d.description],
            ["Жанр", d.genre],
            ["Страна", d.country],
            ["Год", d.year],
            ["Длительность (мин)", d.duration],
            ["Актёры", d.actors],
            ["Режиссёр", d.director],
        ].forEach(([l, v]) => body.appendChild(makeLine(l, v)));

        if (d.poster) body.appendChild(makeImageBlock("Постер", d.poster));
        if (d.banner) body.appendChild(makeImageBlock("Баннер", d.banner));

        modal.style.display = "flex";
    };

    document.body.append(modal, btn);
})();
