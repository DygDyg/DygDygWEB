import os
import re
import requests
import configparser
import subprocess
import tkinter as tk
from tkinter import simpledialog, messagebox, ttk


# === Чтение конфигурации ===
CONFIG_FILE = "config.ini"
config = configparser.ConfigParser()

if not os.path.exists(CONFIG_FILE):
    config["telegram"] = {"token": "PUT_YOUR_TOKEN_HERE"}
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        config.write(f)
    raise RuntimeError(
        f"Файл {CONFIG_FILE} создан. Впиши свой токен в [telegram] token и запусти снова."
    )

config.read(CONFIG_FILE, encoding="utf-8")
BOT_TOKEN = config.get("telegram", "token", fallback="").strip()
if not BOT_TOKEN:
    raise RuntimeError(f"Не найден токен в {CONFIG_FILE}")

API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"
FILE_URL = f"https://api.telegram.org/file/bot{BOT_TOKEN}"


def ask_url():
    """Окно ввода ссылки на стикерпак."""
    root = tk.Tk()
    root.withdraw()
    url = simpledialog.askstring(
        "Стикерпак", "Введите ссылку на стикерпак (t.me/addstickers/...)"
    )
    root.destroy()
    return url


def get_sticker_set(short_name: str):
    resp = requests.get(f"{API_URL}/getStickerSet", params={"name": short_name})
    data = resp.json()
    if not data.get("ok"):
        raise RuntimeError(f"Ошибка API: {data}")
    return data["result"]


def convert_webm_to_webp(infile, outfile):
    """Конвертация webm → animated webp через ffmpeg без окна консоли."""
    cmd = [
        "ffmpeg", "-y", "-i", infile,
        "-c:v", "libwebp",
        "-loop", "0",
        "-preset", "picture",
        "-an",
        "-vsync", "0",
        outfile
    ]
    try:
        kwargs = {
            "stdout": subprocess.DEVNULL,
            "stderr": subprocess.DEVNULL,
            "check": True
        }
        if os.name == "nt":  # скрыть окно ffmpeg на Windows
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        subprocess.run(cmd, **kwargs)
        os.remove(infile)  # удаляем оригинальный webm
        return True
    except Exception as e:
        print(f"Ошибка конвертации {infile}: {e}")
        return False


def download_pack(short_name: str, stickers, out_dir: str):
    """Скачивает стикеры с прогрессбаром и конвертацией webm → webp."""
    total = len(stickers)

    root = tk.Tk()
    root.title("Загрузка стикеров")
    root.geometry("400x120")

    label = tk.Label(root, text=f"Скачивание {total} файлов...")
    label.pack(pady=10)

    progress = ttk.Progressbar(root, length=350, mode="determinate", maximum=total)
    progress.pack(pady=10)

    root.update()

    ok_count = 0
    for i, s in enumerate(stickers, start=1):
        file_id = s["file_id"]
        try:
            file_info = requests.get(f"{API_URL}/getFile", params={"file_id": file_id}).json()
            if not file_info.get("ok"):
                raise RuntimeError(file_info)
            file_path = file_info["result"]["file_path"]
            ext = os.path.splitext(file_path)[1] or ".bin"
            fname = f"{i:03d}{ext}"
            fullpath = os.path.join(out_dir, fname)

            # скачиваем файл
            url = f"{FILE_URL}/{file_path}"
            r = requests.get(url, stream=True)
            with open(fullpath, "wb") as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)

            # если webm — конвертируем в animated webp
            if ext == ".webm":
                webp_out = os.path.splitext(fullpath)[0] + ".webp"
                if convert_webm_to_webp(fullpath, webp_out):
                    print(f"[{i}] ✔ webm → webp: {webp_out}")

            ok_count += 1
        except Exception as e:
            print(f"[{i}] Ошибка: {e}")

        # обновляем прогресс
        progress["value"] = i
        label.config(text=f"[{i}/{total}] Загружено...")
        root.update_idletasks()
        root.update()

    root.destroy()
    messagebox.showinfo("Готово", f"Скачано {ok_count} файлов из {total}.\nПапка: {out_dir}")


def main():
    url = ask_url()
    if not url:
        messagebox.showinfo("Выход", "Ссылка не введена.")
        return

    m = re.search(r"(?:addstickers/)([A-Za-z0-9_]+)", url)
    if not m:
        messagebox.showerror("Ошибка", "Не удалось извлечь short_name из ссылки.")
        return
    short_name = m.group(1)

    out_dir = os.path.join(os.getcwd(), short_name)
    os.makedirs(out_dir, exist_ok=True)

    try:
        pack = get_sticker_set(short_name)
    except Exception as e:
        messagebox.showerror("Ошибка API", str(e))
        return

    stickers = pack["stickers"]
    if not stickers:
        messagebox.showinfo("Результат", "Стикеров не найдено.")
        return

    download_pack(short_name, stickers, out_dir)


if __name__ == "__main__":
    main()