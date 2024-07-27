const axios = require('axios');
const querystring = require('querystring');

const url = 'https://discord.com/api/webhooks/627316395075567616/f51PMQc4CiUR0XBFEHoYeh25nYpceK5UI0qPHpQDUqqgfe4q3u3Z4Tv1whhKZRIdPBJ0';
const data = {
    username: 'Track Anime By ДугДуг',
    avatar_url: 'https://track-anime.github.io/favicon.png',
    content: `
~~                                                                                                                                                                                          ~~
#  [TV] Моя подруга-олениха Нокотан 
[Вышла 20 дней назад. 07.07.2024]

> **Серии:** 4/?  
> **Длительность:** 23 минуты
> **Студия:** [Студии:  Wit Studio](<https://track-anime.github.io/?anime_studios=%D0%A1%D1%82%D1%83%D0%B4%D0%B8%D0%B8%3A%20%20Wit%20Studio>) 
> **Год выхода:** 2024
> **Жанры:**  
> **Статус:** Релиз  
> **Возрастной рейтинг:** [pg_13](<https://track-anime.github.io/?rating_mpaa=pg_13>)
> 
> **Рейтинг shikimori:** 7.76/10 (2478 проголосовавших)

[Открыть на Track Anime By ДугДуг](<https://track-anime.github.io/?shikimori_id=58426>)
[Открыть на shikimori](<https://shikimori.one/animes/58426>)

[Обложка](https://shikimori.one/system/animes/original/58426.jpg?1718266672)
    
`,

};

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
