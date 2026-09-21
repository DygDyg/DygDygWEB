import time
import threading
import requests
import json
import os
import webbrowser

from io import BytesIO
from PIL import Image, ImageDraw
import pystray

from PyQt6.QtGui import QImage, QPainter
from PyQt6.QtSvg import QSvgRenderer
from PyQt6.QtCore import QByteArray, QBuffer, QIODevice


# ---------------------- CONFIG ----------------------

CONFIG_FILE = "config.json"
default_config = {
    "api_url": "https://figame.dygdyg.win/my_ip_info.php",
    "update_interval": 5,
    "site_url": "https://2ip.ru/"
}

API_URL = default_config["api_url"]
UPDATE_INTERVAL = default_config["update_interval"]
SITE_URL = default_config["site_url"]
stop_update_thread = False


def save_config(conf):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(conf, f, indent=4, ensure_ascii=False)


def load_config():
    """Загружает конфиг и добавляет недостающие поля."""
    global API_URL, UPDATE_INTERVAL, SITE_URL

    config_changed = False

    # Если файла нет → создаём
    if not os.path.exists(CONFIG_FILE):
        save_config(default_config)
        print("Создан config.json")
        conf = default_config.copy()
    else:
        # Пробуем прочитать существующий
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                conf = json.load(f)

            # Добавляем отсутствующие поля
            for key, value in default_config.items():
                if key not in conf:
                    conf[key] = value
                    config_changed = True
                    print(f"Добавлено поле по умолчанию: {key} = {value}")

        except Exception as e:
            print("Ошибка чтения config.json:", e)
            conf = default_config.copy()
            save_config(conf)

    # Если что-то добавлено — сохраняем
    if config_changed:
        save_config(conf)
        print("config.json обновлён.")

    API_URL = conf["api_url"]
    UPDATE_INTERVAL = conf["update_interval"]
    SITE_URL = conf["site_url"]

    print("Настройки загружены:", conf)


# ---------------------- DEFAULT GLOBE ICON ----------------------

def generate_globe_icon(size=32):
    """Рисует мини-глобус, пока флаг не загружен или при ошибке."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Земля
    draw.ellipse((1, 1, size - 2, size - 2), fill="#3FA9F5", outline="#1C6EA4", width=2)
    draw.line((size / 2, 3, size / 2, size - 3), fill="white", width=2)
    draw.line((3, size / 2, size - 3, size / 2), fill="white", width=2)
    draw.ellipse((4, 8, size - 4, size - 8), outline="white", width=2)
    draw.ellipse((4, 12, size - 4, size - 12), outline="white", width=2)

    return img


# ---------------------- SVG → PNG ----------------------

def svg_to_png_bytes(svg_data: bytes, size=32) -> bytes:
    renderer = QSvgRenderer(QByteArray(svg_data))

    img = QImage(size, size, QImage.Format.Format_ARGB32)
    img.fill(0x00000000)

    painter = QPainter(img)
    renderer.render(painter)
    painter.end()

    qbuf = QBuffer()
    qbuf.open(QIODevice.OpenModeFlag.ReadWrite)
    img.save(qbuf, "PNG")

    return bytes(qbuf.data())


# ---------------------- LOAD IMAGE ----------------------

def load_image_from_url(url):
    try:
        raw = requests.get(url, timeout=3).content

        if url.endswith(".svg"):
            png = svg_to_png_bytes(raw, size=32)
            return Image.open(BytesIO(png)).convert("RGBA")

        return Image.open(BytesIO(raw)).convert("RGBA")

    except Exception:
        return None


# ---------------------- DATA REQUEST ----------------------

def get_flag_and_tooltip():
    """Возвращает (иконка или None, tooltip) с ЧИСТЫМИ ошибками."""
    try:
        r = requests.get(API_URL, timeout=3)
        data = r.json()

        ip = data.get("ip", "unknown")
        country = data.get("country", "unknown")
        org = data.get("connection", {}).get("org", "unknown")

        tooltip = (
            f"🌐 IP: {ip}\n"
            f"🏳️ Country: {country}\n"
            f"🏢 Org: {org}"
        )

        flag_url = data.get("flag", {}).get("img")
        if not flag_url:
            return None, tooltip

        img = load_image_from_url(flag_url)
        return img, tooltip

    except requests.exceptions.ConnectionError:
        return None, "❌ Нет подключения к интернету"

    except requests.exceptions.Timeout:
        return None, "❌ Сервер не отвечает (таймаут)"

    except requests.exceptions.RequestException:
        return None, "❌ Ошибка сети"

    except Exception:
        return None, "❌ Ошибка обработки данных"


# ---------------------- UPDATE THREAD ----------------------

def updater(icon):
    global stop_update_thread
    globe_icon = generate_globe_icon()

    while not stop_update_thread:
        img, tooltip = get_flag_and_tooltip()

        if img:
            icon.icon = img
        else:
            icon.icon = globe_icon

        icon.title = tooltip
        time.sleep(UPDATE_INTERVAL)


# ---------------------- MENU ACTIONS ----------------------

def open_settings(icon, item):
    os.startfile(CONFIG_FILE)


def reload_settings(icon, item):
    global stop_update_thread

    print("Перезагрузка настроек...")
    load_config()

    stop_update_thread = True
    time.sleep(0.2)
    stop_update_thread = False

    threading.Thread(target=updater, args=(icon,), daemon=True).start()


def exit_app(icon, item):
    global stop_update_thread
    stop_update_thread = True
    icon.stop()


def open_site(icon, item):
    webbrowser.open(SITE_URL)


# ---------------------- TRAY ----------------------

def start_tray_icon():
    load_config()

    globe = generate_globe_icon(32)

    menu = pystray.Menu(
        pystray.MenuItem("Открыть сайт", open_site, default=True),
        pystray.MenuItem("Настройки", open_settings),
        pystray.MenuItem("Перезагрузить настройки", reload_settings),
        pystray.MenuItem("Выход", exit_app)
    )

    icon = pystray.Icon("IP_Flag", globe, "Загрузка...", menu)

    threading.Thread(target=updater, args=(icon,), daemon=True).start()
    icon.run()


if __name__ == "__main__":
    start_tray_icon()
