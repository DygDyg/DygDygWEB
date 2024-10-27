# pip install upnpy
# pip install flask
from flask import Flask, request, redirect, url_for, send_from_directory, render_template_string
import upnpy
import os
import configparser
import ssl
import shutil
from datetime import datetime, timedelta


# Настройка файла конфигурации
config = configparser.ConfigParser()
# config_path = '/media/config.ini'
config_path = 'config.ini'


# Если конфигурационный файл не существует, создаем его с настройками по умолчанию
if not os.path.exists(config_path):
    config['DEFAULT'] = {
        'UPLOAD_FOLDER': 'file',
        'USE_HTTPS': 'False',  # По умолчанию HTTP
        'SSL_CERT': 'cert.crt',  # Путь к сертификату (необязательно)
        'SSL_KEY': 'cert.key',  # Путь к приватному ключу (необязательно)
        'FILE_EXPIRATION_DAYS': '5',  # Количество дней, после которых файлы будут удалены
        'UPNP': 'true',
        'port': '5000'

    }
    with open(config_path, 'w') as configfile:
        config.write(configfile)

# Загружаем конфигурацию
config.read(config_path)
UPLOAD_FOLDER = config.get('DEFAULT','UPLOAD_FOLDER', fallback='file')
USE_HTTPS = config.getboolean('DEFAULT', 'USE_HTTPS', fallback=False)
SSL_CERT = config.get('DEFAULT','SSL_CERT', fallback='cert.crt')
SSL_KEY = config.get('DEFAULT','SSL_KEY', fallback='cert.key')
FILE_EXPIRATION_DAYS = config.getint('DEFAULT', 'FILE_EXPIRATION_DAYS', fallback=5)
UPnP_ENABLED = config.getboolean('DEFAULT', 'UPNP', fallback=True)
HTTP_PORT = config.getint('settings', 'port', fallback=5000)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Настройка Flask
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def list_services():
    upnp = upnpy.UPnP()
    devices = upnp.discover()
    for device in devices:
        print(f'Устройство UPnP найдено: {device}')
        # Выводим информацию о сервисах
        for service in device.services:
            print(f'Service: {service}')


def open_upnp_port(port):
    try:
        upnp = upnpy.UPnP()
        devices = upnp.discover()
        for device in devices:
            print(f'Устройство UPnP найдено: {device}')
            # Используем правильный сервис
            service = device.services.get('WANIPConnection') or device.services.get('WANPPPConnection')
            if service is not None:
                service.addportmapping(port, 'TCP', upnp.lanaddr, port, 'Flask App', '', '')
                print(f'Порт {port} открыт через UPnP')
                return True
            else:
                print('Сервис WANIPConnection или WANPPPConnection не найден.')
                return False
    except Exception as e:
        print(f'Не удалось открыть порт через UPnP: {e}')
        return False

def close_upnp_port(port):
    try:
        upnp = upnpy.UPnP()
        devices = upnp.discover()
        for device in devices:
            print(f'Устройство UPnP найдено: {device}')
            # Удаление проброса порта
            device.deleteportmapping(port, 'TCP')
            print(f'Порт {port} закрыт через UPnP')
            return
    except Exception as e:
        print(f'Не удалось закрыть порт через UPnP: {e}')



def get_free_space():
    """Возвращает свободное место на диске в читаемом формате."""
    total, used, free = shutil.disk_usage("/")
    return format_file_size(free)


def format_file_size(size):
    """Форматирует размер файла в читаемый формат."""
    for unit in ['Б', 'КБ', 'МБ', 'ГБ']:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{size:.2f} ТБ"

# HTML-шаблон с кнопками удаления для каждого файла
html_template = """

<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Файловый менеджер</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #212121;
      color: #ffffff;
    }
    h1, h2 {
      color: #ffffff;
    }
    .file-list {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr;
      gap: 10px;
      padding: 10px;
      background-color: #232323;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .file-list div {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .file-list div:last-child {
      border-bottom: none;
    }
    .delete-button {
      display: inline;
      background-color: #ff4d4d;
      border: none;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
    }
    /* Стили для drag-and-drop */
    .drop-zone {
      cursor: grab;
      margin-top: 20px;
      padding: 20px;
      border: 2px dashed #bbb;
      border-radius: 5px;
      text-align: center;
      color: #bebebe;
      background-color: #2f2f2f;
      transition: background-color 0.3s;
    }
    .drop-zone.dragover {
      background-color: #004852;
      color: #ffffff;
    }

    a:link {
      color: #acb8ff !important;
    }

    a:visited {
      color: #e69aff !important;
    }
    a {
      color: #3391ff;
    }
    div#loading {
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      position: absolute;
      background-color: #0a13236b;
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    div#loading div {
      font-size: 300%;
    }
  </style>
</head>
<body>
<div id="loading" style="visibility: hidden">
  <div>loading...</div>
  </div>
  <h1>Загрузка и скачивание файлов</h1>
  <h2>Свободное место на диске: {{ free_space }} / {{ total_space }}</h2>
  
  <h2>Загрузить файл</h2>
  <!-- Зона для drag-and-drop -->
  <div id="drop-zone" class="drop-zone">
    Перетащите файлы сюда или нажмите для выбора
  </div>
  <input type="file" id="file-input" style="display: none;" multiple> <!-- скрытое поле для выбора файлов -->

  <h2>Доступные файлы:</h2>
  <div class="file-list">
    <div><strong>Название</strong></div>
    <div><strong>Создан</strong></div>
    <div><strong>Размер</strong></div>
    <div><strong>Удалится</strong></div>
    <div><strong>Действие</strong></div>
    {% for file, created_time, size, deletion_date in files %}
      <div >
        <a target="_blank" class="link_" href="{{ url_for('download_file', filename=file) }}">{{ file }}</a>
      </div>
      <div>{{ created_time }}</div>
      <div>{{ size }}</div>
      <div>{{ deletion_date }}</div>
      <div>
        <form action="{{ url_for('delete_file', filename=file) }}" method="post" style="display:inline;">
          <button type="submit" class="delete-button">Удалить</button>
        </form>
      </div>
    {% endfor %}
  </div>

  <script>
    // Обработчик для drag-and-drop
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");

    dropZone.addEventListener("click", () => {
      fileInput.click(); // Открыть диалог выбора файлов при клике на зону
    });

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      const files = e.dataTransfer.files;
      handleFiles(files); // Обработка перетаскиваемых файлов
      console.log("load")
    });

    fileInput.addEventListener("change", (e) => {
      const files = e.target.files;
      handleFiles(files); // Обработка файлов, выбранных через диалог
    });

    function handleFiles(files) {
      document.getElementById("loading").style.visibility = 'visible'
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      // AJAX-запрос для загрузки файлов
      fetch("/", {
        method: "POST",
        body: formData
      }).then(response => {
        if (response.ok) {
          // alert("Файл(ы) успешно загружен(ы)!");
          console.log("Файл(ы) успешно загружен(ы)!")
          window.location.reload(); // Обновляем страницу для обновления списка файлов
        } else {
          alert("Ошибка при загрузке файлов.");
        }
      }).catch(error => {
        console.error("Ошибка:", error);
        alert("Ошибка при загрузке файлов.");
      });
    }
  </script>
</body>
</html>


"""
def get_disk_usage():
    """Возвращает общий объём и свободное место на диске в читаемом формате."""
    total, used, free = shutil.disk_usage("/")
    return format_file_size(total), format_file_size(free)

def delete_old_files():
    expiration_date = datetime.now() - timedelta(days=FILE_EXPIRATION_DAYS)
    for file in os.listdir(app.config['UPLOAD_FOLDER']):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file)
        if os.path.isfile(file_path) and datetime.fromtimestamp(os.path.getctime(file_path)) < expiration_date:
            os.remove(file_path)

  

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # Проверка, что файл включен в запрос
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file:
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
            return redirect(url_for('upload_file'))

    # Удаляем старые файлы
    delete_old_files()

    # Получаем информацию о диске
    total_space, free_space = get_disk_usage()

    # Список файлов в директории для отображения с датами создания, размерами и датами удаления
    files = []
    for file in os.listdir(app.config['UPLOAD_FOLDER']):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file)
        created_time = datetime.fromtimestamp(os.path.getctime(file_path)).strftime('%Y-%m-%d %H:%M:%S')
        size = os.path.getsize(file_path)
        formatted_size = format_file_size(size)

        # Рассчитываем дату удаления
        created_date = datetime.fromtimestamp(os.path.getctime(file_path))
        deletion_date = created_date + timedelta(days=FILE_EXPIRATION_DAYS)
        formatted_deletion_date = deletion_date.strftime('%Y-%m-%d %H:%M:%S')

        files.append((file, created_time, formatted_size, formatted_deletion_date))

    # Сортировка файлов по дате создания (от новых к старым)
    files = sorted(files, key=lambda x: datetime.strptime(x[1], '%Y-%m-%d %H:%M:%S'), reverse=True)

    return render_template_string(html_template, files=files, total_space=total_space, free_space=free_space)





@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/delete/<filename>', methods=['POST'])
def delete_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    return redirect(url_for('upload_file'))

if __name__ == '__main__':
    print("================================================")
    list_services()
    if UPnP_ENABLED:
        open_upnp_port(HTTP_PORT)
    if USE_HTTPS:
        app.run(host='0.0.0.0', port=HTTP_PORT, ssl_context=(SSL_CERT, SSL_KEY), debug=True)
    else:
        app.run(host='0.0.0.0', port=HTTP_PORT, debug=True)
