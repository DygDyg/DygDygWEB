const axios = require('axios');
const querystring = require('querystring');

const url = 'https://discord.com/api/webhooks/627316395075567616/f51PMQc4CiUR0XBFEHoYeh25nYpceK5UI0qPHpQDUqqgfe4q3u3Z4Tv1whhKZRIdPBJ0';
const data = {
    username: 'DygDyg',
    avatar_url: 'https://www.freepngimg.com/thumb/facebook/62681-flat-icons-face-computer-design-avatar-icon.png',
    content: 'hello world',

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
