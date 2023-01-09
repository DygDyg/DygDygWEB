// ==UserScript==
// @name         JSON formatter
// @version      2.2.2
// @description  Format JSON data in a beautiful way.
// @author       Пироженка
// @include      /^https?://(.*)/.*$/
// @icon		 http://cn.gravatar.com/avatar/a0ad718d86d21262ccd6ff271ece08a3?s=80
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @updateURL    https://script.artiromiur.ru/json_format.user.js
// @downloadURL  https://script.artiromiur.ru/json_format.user.js
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

'use strict';
const gap = 5;
const formatter = { options: [{ key: 'show-quotes', title: '"', def: true }, { key: 'show-commas', title: ',', def: true }] };
const config = Object.assign({}, formatter.options.reduce((res, item) => { res[item.key] = item.def; return res; }, {}), GM_getValue('config'));

formatJSON();

function safeHTML(html) {
	return String(html).replace(/[<&"]/g, key => ({ '<': '&lt;', '&': '&amp;', '"': '&quot;' })[key]);
}

function createElement(tag, props) {
	const el = document.createElement(tag);
	if (props) {
		Object.keys(props).forEach(key => { el[key] = props[key]; });
	}
	return el;
}

function createQuote() {
	return createElement('span', { className: 'subtle quote', textContent: '"' });
}

function createComma() {
	return createElement('span', { className: 'subtle comma', textContent: ',' });
}

function loadJSON() {
	const raw = document.body.innerText;
	try {
		const content = JSON.parse(raw);
		return { raw, content };
	} catch(e) { }
	try {
		const parts = raw.match(/^(.*?\w\s*\()(.+)(\)[;\s]*)$/);
		const content = JSON.parse(parts[2]);
		return {
			raw,
			content,
			prefix: createElement('span', {
				className: 'subtle',
				textContent: parts[1].trim()
			}),
			suffix: createElement('span', {
				className: 'subtle',
				textContent: parts[3].trim()
			})
		};
	} catch(e) { }
}

function formatJSON() {
	if (formatter.formatted) return;
	formatter.formatted = true;
	formatter.data = loadJSON();
	if (!formatter.data) return;
	formatter.style = GM_addStyle(`.tips-link{color:slateblue}.tips-val{color:dodgerblue}.complex.collapse::before{display:none}*{margin:0;padding:0}html,body{font-family:Menlo,'Microsoft YaHei',Tahoma;background:#1E1E1E}#json-formatter{position:relative;margin:0;padding:2em 1em 1em 2em;font-size:14px;line-height:1.5}#json-formatter>pre{white-space:pre-wrap}#json-formatter>pre:not(.show-quotes) .quote,#json-formatter>pre:not(.show-commas) .comma{display:none;color:#D4D4D4}.subtle{color:#D4D4D4}.number{color:#B5CE9F}.null{color:gray}.key{color:#9CDCFE}.string{color:#CE916A}.boolean{color:#499CD6}.bracket{color:#D4D4D4}.item{cursor:pointer}.content{padding-left:2em}.collapse>span>.content{display:inline;padding-left:0}.collapse>span>.content>*{display:none}.collapse>span>.content::before{content:'...'}.complex{position:relative;color:#D4D4D4}.complex::before{content:'';position:absolute;top:1.5em;left:-.5em;bottom:.7em;margin-left:-1px;border-left:1px dashed #999}.folder{color:#999;position:absolute;top:0;left:-1em;width:1em;text-align:center;transform:rotate(90deg);transition:transform .3s;cursor:pointer}.collapse>.folder{transform:rotate(0)}.summary{color:#999;margin-left:1em}*:not(.collapse)>.summary{display:none}.tips{position:absolute;border-radius:.5em;box-shadow:0 0 1em gray;background:white;z-index:1;white-space:nowrap;color:black}.tips-key{font-weight:bold}.menu{position:fixed;top:0;right:0;padding:5px;user-select:none;z-index:10}.menu>span{display:inline-block;padding:4px 8px;margin-right:5px;border-radius:4px;background:#ddd;border:1px solid;cursor:pointer;border-color:#ddd}.menu>span.toggle:not(.active){background:gray;border-color:gray}`);
	formatter.root = createElement('div', { id: 'json-formatter' });
	document.body.innerHTML = '';
	document.body.append(formatter.root);
	initTips();
	initMenu();
	bindEvents();
	generateNodes(formatter.data, formatter.root);
}

function generateNodes(data, container) {
	const pre = createElement('pre');
	formatter.pre = pre;
	const root = createElement('div');
	const rootSpan = createElement('span');
	root.append(rootSpan);
	pre.append(root);
	const queue = [Object.assign({ el: rootSpan, elBlock: root }, data)];
	while (queue.length) {
		const item = queue.shift();
		const { el, content, prefix, suffix } = item;
		if (prefix) el.append(prefix);
		if (Array.isArray(content)) {
			queue.push(...generateArray(item));
		} else if (content && typeof content === 'object') {
			queue.push(...generateObject(item));
		} else {
			const type = content == null ? 'null' : typeof content;
			if (type === 'string') el.append(createQuote());
			const node = createElement('span', {
				className: `${type} item`,
				textContent: `${content}`
			});
			node.dataset.type = type;
			node.dataset.value = content;
			el.append(node);
			if (type === 'string') el.append(createQuote());
		}
		if (suffix) el.append(suffix);
	}
	container.append(pre);
	updateView();
}

function setFolder(el, length) {
	if (length) {
		el.classList.add('complex');
		el.append(createElement('div', {
			className: 'folder',
			textContent: '\u25b8'
		}));
		el.append(createElement('span', {
			textContent: `// ${length} items`,
			className: 'summary'
		}));
	}
}

function generateArray({ el, elBlock, content }) {
	const elContent = content.length && createElement('div', {
		className: 'content'
	});
	setFolder(elBlock, content.length);
	el.append(createElement('span', {
		textContent: '[',
		className: 'bracket'
	}), elContent || ' ', createElement('span', {
		textContent: ']',
		className: 'bracket'
	}));
	return content.map((item, i) => {
		const elChild = createElement('div');
		elContent.append(elChild);
		const elValue = createElement('span');
		elChild.append(elValue);
		if (i < content.length - 1) elChild.append(createComma());
		return {
			el: elValue,
			elBlock: elChild,
			content: item
		};
	});
}

function generateObject({ el, elBlock, content }) {
	const keys = Object.keys(content);
	const elContent = keys.length && createElement('div', {
		className: 'content'
	});
	setFolder(elBlock, keys.length);
	el.append(createElement('span', {
		textContent: '{',
		className: 'bracket'
	}), elContent || ' ', createElement('span', {
		textContent: '}',
		className: 'bracket'
	}));
	return keys.map((key, i) => {
		const elChild = createElement('div');
		elContent.append(elChild);
		const elValue = createElement('span');
		const node = createElement('span', {
			className: 'key item',
			textContent: key
		});
		node.dataset.type = typeof key;
		elChild.append(createQuote(), node, createQuote(), ': ', elValue);
		if (i < keys.length - 1) elChild.append(createComma());
		return { el: elValue, content: content[key], elBlock: elChild };
	});
}

function updateView() {
	formatter.options.forEach(({ key }) => { formatter.pre.classList[config[key] ? 'add' : 'remove'](key); });
}

function removeEl(el) {
	el.remove();
}

function initMenu() {
	const menu = createElement('div', { className: 'menu' });
	const btnCopy = createElement('span', { textContent: 'копировать всё' });
	btnCopy.addEventListener('click', () => { GM_setClipboard(formatter.data.raw); }, false);
	const btnCloseAll = createElement('span', { textContent: 'свернуть/развернуть всё' });
	btnCloseAll.addEventListener('click', () => {
		let a = document.querySelectorAll('.content .folder');
		for (let i = 0; i < a.length; i++) {
			const element = a[i];
			element.parentNode.classList.toggle('collapse');
		}
	}, false);
	menu.append(btnCopy);
	menu.append(btnCloseAll);
	formatter.options.forEach(item => {
		const span = createElement('span', {
			className: `toggle ${config[item.key] ? 'active' : ''}`,
			innerHTML: item.title
		});
		span.dataset.key = item.key;
		menu.append(span);
	});
	menu.addEventListener('click', e => {
		const el = e.target;
		const { key } = el.dataset;
		if (key) {
			config[key] = !config[key];
			GM_setValue('config', config);
			el.classList.toggle('active');
			updateView();
		}
	}, false);
	formatter.root.append(menu);
}

function initTips() {
	const tips = createElement('div', { className: 'tips' });
	const hide = () => removeEl(tips);
	tips.addEventListener('click', e => { e.stopPropagation(); }, false);
	document.addEventListener('click', hide, false);

	formatter.tips = {
		node: tips,
		hide,
		show(range) {
			const scrollTop = document.body.scrollTop;
			const rects = range.getClientRects();
			let rect;
			if (rects[0].top < 100) {
				rect = rects[rects.length - 1];
				tips.style.top = `${rect.bottom + scrollTop + gap}px`;
				tips.style.bottom = '';
			} else {
				rect = rects[0];
				tips.style.top = '';
				tips.style.bottom = `${formatter.root.offsetHeight - rect.top - scrollTop + gap}px`;
			}
			tips.style.left = `${rect.left}px`;
			/* const { type, value } = range.startContainer.dataset;
			const html = [`<span class="tips-key">type</span>: <span class="tips-val">${safeHTML(type)}</span>`];
			if (type === 'string' && /^(https?|ftps?):\/\/\S+/.test(value)) {
				console.log('a', /^(https?|ftps?):\/\/\S+/.test(value));
				html.push('<br>', `<a class="tips-link" href="${encodeURI(value)}" target="_blank">Open link</a>`);
			}
			tips.innerHTML = html.join(''); */
			formatter.root.append(tips);
		}
	};
}

function selectNode(node) {
	const selection = window.getSelection();
	selection.removeAllRanges();
	const range = document.createRange();
	range.setStartBefore(node.firstChild);
	range.setEndAfter(node.firstChild);
	selection.addRange(range);
	return range;
}

function bindEvents() {
	formatter.root.addEventListener('click', e => {
		e.stopPropagation();
		const { target } = e;
		if (target.classList.contains('item')) {
			formatter.tips.show(selectNode(target));
		} else {
			formatter.tips.hide();
		}
		if (target.classList.contains('folder')) {
			target.parentNode.classList.toggle('collapse');
		}
	}, false);

	formatter.root.addEventListener('mouseover', async function (e) {
		if (e.target.classList.contains('item')) {
			const { type, value } = e.target.dataset;
			if (type === 'string' && /^(https?|ftps?):\/\/\S+/.test(value)) {
				await testImage(value, function (src, status) {
					if (status === 'success') {
						const popup = $('<img>', {
							class: 'imagePreview',
							src: src,
							style: `display: block; position: absolute; max-width: 300px; left: ${e.pageX + 10}, top: ${e.pageY}; border-radius: 10px; border: 10px solid #3e718c;`
						});
						formatter.root.append(popup[0]);
					}
				});
			}
		}
	});

	function showCustomMenu() {
		console.log('aga..');
	}

	window.oncontextmenu = function (e) {
		//e.preventDefault();
		showCustomMenu();
	}
}

$(document).on('mousemove', function (e) {
	let impPrev = $('.imagePreview');
	if (impPrev.length)
		impPrev.css({ left: e.pageX + 10, top: e.pageY });
});

$('.item').hover(function (e) {
	// console.log('пришёл', e);
}, function () {
	$('.imagePreview').remove()
});

function testImage(url, callback, timeout) {
	timeout = timeout || 5000;
	var timedOut = false, timer;
	var img = new Image();
	img.onerror = img.onabort = function () {
		if (!timedOut) {
			clearTimeout(timer);
			callback(url, "error");
		}
	};
	img.onload = function () {
		if (!timedOut) {
			clearTimeout(timer);
			callback(url, "success");
		}
	};
	img.src = url;
	timer = setTimeout(function () {
		timedOut = true;
		// reset .src to invalid URL so it stops previous
		// loading, but doesn't trigger new load
		img.src = "//!!!!/test.jpg";
		callback(url, "timeout");
	}, timeout);
};