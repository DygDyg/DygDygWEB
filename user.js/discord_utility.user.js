// ==UserScript==
// @name         ✅ Discord tool
// @namespace    By ДугДуг
// @version      0.3
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


GM_registerMenuCommand('Перезагрузить панель', () => {ds_pannel()});
GM_registerMenuCommand('Добавить кнопку "сообщение в чат"', () => {ds_panel_add("mes")});
GM_registerMenuCommand('Добавить кнопку "переименовать диалог"', () => {ds_panel_add("rename")});



let panel;
const ds_LocalStorage = window.localStorage;

function ds_GET_Name_Chennal(mes, func_buttons) {
	var token = ds_LocalStorage.getItem("token").replace(/^"(.+(?="$))"$/, '$1');

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
		console.log("1) ", mes, data.name)
		if (data.type == 3 && !data.name.startsWith(mes)) {
			
			func_buttons.forEach(e => {
				if (e["type"]=="rename") {
					console.log(e["message"])
					console.log(data.name)
					// e["message"] = e["message"]/g
					// a = e["message"]/g
					console.log("a", e["message"])
					data.name = data.name.replace(new RegExp(e["message"],'g'), ``);
					console.log("b", data.name)
				}
			});
			ds_Chenal_Name(mes + data.name)
		}
	};
	req.send();
}


function ds_Chenal_Name(mes) {
	var token = ds_LocalStorage.getItem("token").replace(/^"(.+(?="$))"$/, '$1');
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
	var token = ds_LocalStorage.getItem("token").replace(/^"(.+(?="$))"$/, '$1');
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
ds_pannel(3000)

function ds_pannel(delay) {
	
	for (let i = 0; i < document.getElementsByClassName("dyg_panel").length; i++) {
		document.getElementsByClassName("dyg_panel")[i].remove()	
	}

	let func_buttons = JSON.parse(ds_LocalStorage.getItem('buttons_panel'))
	if (func_buttons == null) {
		func_buttons = [
			{
				ico: "✅",
				type: "rename",
				title: "Выполнено",
				message: "✅"
			},
			{
				ico: "🔄",
				type: "rename",
				title: "В процессе",
				message: "🔄"
			},
			{
				ico: "1️⃣",
				type: "mes",
				title: "Здравствуйте, напишите ваш ник, сервер и фракцию!!!",
				message: "Hello, tell me your nickname, server and faction!!!"
			},
		]
		ds_LocalStorage.setItem('buttons_panel', JSON.stringify(func_buttons))
	}

	panel = document.createElement('div');
	panel.className = "dyg_panel";

	setTimeout(() => panel.setAttribute('style', 'max-height: 100%;'), delay);

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
			// console.log(e.shiftKey)
			if(e.shiftKey) return ds_panel_delete(i, func_buttons)

			switch (func_buttons[i]["type"]) {
				case "mes":
					ds_message(func_buttons[i]["message"])
					break;

				case "rename":
					ds_GET_Name_Chennal(func_buttons[i]["message"], func_buttons)
				default:
					break;
			}


		}
	}
}
function ds_panel_add(type)
{
	local_button = {
		ico: prompt("Лого Эмодзи", "✅"),
		type: type,
		title: prompt("Подсказка", "Выполнено"),
		message: prompt("Сообщение чата/иконка статуса", "✅")
	}
	ds_pannel()
}


function ds_panel_delete(i, func_buttons)
{
	console.log(func_buttons)
	if(confirm(`Удалить элемент №${i}`))
	{
		func_buttons.splice(i, 1);
		console.log(func_buttons)
		ds_LocalStorage.setItem('buttons_panel', JSON.stringify(func_buttons))
		ds_pannel(0)
	}

}