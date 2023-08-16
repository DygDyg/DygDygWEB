// ==UserScript==
// @name         ✅ Discord tool
// @namespace    By ДугДуг
// @version      0.1
// @description  Добавляет галочку в название канала
// @author       ДугДуг
// @match        https://discord.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @updateURL    https://dygdyg.github.io/DygDygWEB/user.js/discord_utility.user.js
// @downloadURL  https://dygdyg.github.io/DygDygWEB/user.js/discord_utility.user.js
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addStyle
// ==/UserScript==


// GM_registerMenuCommand('✅ Пометить завершённым', () => {
// 	// test3(new Date())
// 	ds_GET_Name_Chennal("✅ ")
// });

function ds_GET_Name_Chennal(mes) {
	var token = localStorage.getItem("token").replace(/^"(.+(?="$))"$/, '$1');

	var channel_id = document.location.href.split('/')
	channel_id = channel_id[channel_id.length - 1]
	var channel_url = `https://discord.com/api/v9/channels/${channel_id}`;
	const req = new XMLHttpRequest();
	req.open("GET", channel_url);
	console.log(token)
	req.setRequestHeader("authority", "discordapp.com");
	req.setRequestHeader("authorization", token);
	req.responseType = 'json';

	req.onload = () => {
		const data = req.response;
		console.log(data);
		// console.log(data.type);
		// console.log(data.name.startsWith("✅ "));
		if (data.type == 3 && !data.name.startsWith(mes)) {
			ds_Chenal_Name(mes + data.name)
		}
	};
	req.send();
}


function ds_Chenal_Name(mes) {

	var token = localStorage.getItem("token").replace(/^"(.+(?="$))"$/, '$1');
	var channel_id = document.location.href.split('/')
	channel_id = channel_id[channel_id.length - 1]

	var channel_url = `https://discord.com/api/v9/channels/${channel_id}`;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("PATCH", channel_url);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.setRequestHeader("authorization", token);
	xmlhttp.setRequestHeader("accept", "/");
	xmlhttp.setRequestHeader("authority", "discordapp.com");
	// xmlhttp.send(base64)
	// return
	xmlhttp.send(JSON.stringify({
		name: mes
	}));
}


function ds_message(mes) {
	var token = localStorage.getItem("token").replace(/^"(.+(?="$))"$/, '$1');
	var channel_id = document.location.href.split('/')
	channel_id = channel_id[channel_id.length - 1]

	var channel_url = `https://discord.com/api/v9/channels/${channel_id}/messages`;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", channel_url);
	xmlhttp.setRequestHeader("Content-Type", "application/json");
	xmlhttp.setRequestHeader("authorization", token);
	xmlhttp.setRequestHeader("accept", "/");
	xmlhttp.setRequestHeader("authority", "discordapp.com");
	// xmlhttp.send(base64)
	// return
	xmlhttp.send(JSON.stringify({
		content: mes
	}));
}

GM_addStyle(`
.dyg_panel {
    width: 42px;
    position: fixed;
    z-index: 9999999;
    top: 72px;
    right: -3px;
    transition: filter 0.5s;
    backdrop-filter: blur(3px);
    border-radius: 10px 0px 0px 10px;
    border-style: solid;
    border-color: #1368d1;
    box-shadow: -8px 8px 10px 4px #0000006e;
    background-size: 100%;
    background-color: #ffffff1a;
	overflow: hidden;
	max-height: 0%;
    transition: max-height 5s, padding 5s;
	}

.dyg_button {
    margin: 5px;
	cursor: pointer;
	transition: filter, 0.5s;
}
.dyg_button:hover{
	transition: filter, 0.5s;
	filter: hue-rotate(45deg);
}
`)
ds_pannel()
function ds_pannel() {
	let func_buttons = [
		{
			ico: "✅",
			type: "rename",
			title: "Выполнено",
			message: "✅"
		},
		{
			ico: "🔄️",
			type: "rename",
			title: "В процессе",
			message: "🔄️"
		},
		{
			ico: "1️⃣",
			type: "mes",
			title: "Здравствуйте, напишите ваш ник, сервер и фракцию!!!",
			message: "Hello, tell me your nickname, server and faction!!!"
		},
		{
			ico: "2️⃣",
			type: "mes",
			title: "Я первый нах!!!!",
			message: "Я первый нах!!!!"
		},
		{
			ico: "3️⃣",
			type: "mes",
			title: "Hello world of Warcraft!!!!",
			message: "Hello world of Warcraft!!!!"
		},
		{
			ico: "4️⃣",
			type: "mes",
			title: "Ебал я в рот, такой поход!!!!",
			message: "Ебал я в рот, такой поход!!!!"
		},
	]
	let panel = document.createElement('div');
	panel.className = "dyg_panel";

	setTimeout(() => panel.setAttribute('style', 'max-height: 100%;'), 3000);
	
	document.body.append(panel);

	let button = new Array;
	for (let i = 0; i < func_buttons.length; i++) {
		button.push(document.createElement('div'));
		button[i].className = `dyg_button`
		button[i].id = `button_${i}`;
		panel.append(button[i])
		button[i].textContent = func_buttons[i]["ico"]
		button[i].title = func_buttons[i]["title"]
		button[i].onclick = function (e) {
			switch (func_buttons[i]["type"]) {
				case "mes":
					ds_message(func_buttons[i]["message"])
					break;

				case "rename":
					ds_GET_Name_Chennal(func_buttons[i]["message"])
				default:
					break;
			}


		}
	}
}