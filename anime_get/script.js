const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');
const filePath = 'id.txt';
var id = readIdFromFile();

function readIdFromFile() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return parseInt(data, 10);
  } catch (err) {
    console.error('Error reading id from file:', err);
    return 0; // Если файл не найден или ошибка чтения, вернем 0
  }
}

// Функция для записи параметра id в файл
function writeIdToFile(id) {
  try {
    fs.writeFileSync(filePath, id.toString(), 'utf8');
  } catch (err) {
    console.error('Error writing id to file:', err);
  }
}

const url = 'https://discord.com/api/webhooks/1266606126389133353/DCwGYmgpxtgGwioPqxgvr-ztnj-R9QP2o_xq8LurFSi1DJdLoCrnPoI7ExLJ9kGLyXq1';
var id_start


(async () => {
  let id = readIdFromFile();
  console.log('Loaded id:', id);

  // Пример GET-запроса
  try {
    let dat = []

    const response = await axios.get('https://kodikapi.com/list?limit=10&with_material_data=true&camrip=false&token=45c53578f11ecfb74e31267b634cc6a8');
    const dataArray = response.data; // Преобразование JSON в массив
    // console.log('Fetched data:', dataArray);

    // Пример обновления id
    // console.log('Updated id:', id);
    id_start = dataArray.results[0].id;
    dataArray.results.forEach(e => {
      // console.log(e.type, e.title)
      if (e.type.includes("anime")) {
        dat.push(e)
      }
    });
    // console.log(dat)
    wh(dat)


  } catch (error) {
    console.error('Error fetching data:', error);
  }
})();


function wh(es) {
  if (es.length <= 0) {
    writeIdToFile(id_start);
    return
  }
  if (es[0].id == id) return;

  let e = es[0]
  es.shift()
  console.log(e.title)
  const data = {
    username: 'Track Anime By ДугДуг',
    avatar_url: 'https://track-anime.github.io/favicon.png',
    content: `
  ~~                                                                                                                                                                                          ~~
# [${e?.material_data?.anime_kind ? e.material_data.anime_kind.toUpperCase() : "?"}] ${e?.title}
  > **Перевод:** ${e.translation.title}
  > **Серия:** ${e.episodes_count}
  > **Длительность:** ${e.material_data?.duration}
  > **Студия:** [Студия:  ${e.material_data?.anime_studios?.[0]}](<https://track-anime.github.io/?anime_studios=${e.material_data?.anime_studios?.[0]}>) //
  > **Год выхода:** ${e.year}
  > **Жанры:**  //
  > **Статус:** Релиз  //
  > **Возрастной рейтинг:** ${e.material_data?.rating_mpaa}
  > 
  > **Рейтинг shikimori:** ${e.material_data?.rating_mpaa}/10 (${e.material_data.shikimori_votes} проголосовавших)
  
  [Открыть на Track Anime By ДугДуг](<https://track-anime.github.io/?shikimori_id=${e.shikimori_id}>)
  [Открыть на shikimori](<https://shikimori.one/animes/${e.shikimori_id}>)
  
  [Обложка](${e.material_data?.anime_poster_url})
      
  `,

  };
  setTimeout(() => {
    axios.post(url, querystring.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => {
        console.log('Success:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    wh(es)
  }, 1000);
}




// id += 1;
// writeIdToFile(id);