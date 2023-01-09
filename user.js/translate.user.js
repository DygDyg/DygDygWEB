// ==UserScript==
// @noframes
// @connect      *
// @author       Пироженка
// @run-at       document-end
// @name         Переводчик Google
// @description  Переводчик Google
// @version      2.2.2
// @include      *
// @icon         https://www.google.com/favicon.ico
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @updateURL    https://script.artiromiur.ru/translate.user.js
// @downloadURL  https://script.artiromiur.ru/translate.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

'use strict';
var $ = window.jQuery;
GM_addStyle('.gtt,.gtt *{box-sizing:border-box;padding:0;margin:0;box-shadow:none;outline:none;user-select:none}.gtt{position:absolute;padding:0.5em 1em;font-family:sans-serif;font-size:14px;max-width:400px;z-index:100000;background-color:#222;border-radius:4px;overflow:hidden;transition:width 0.2s}.gtt.gtt_setting hr{border:none!important;background:transparent!important}.gtt_setting select{border:1px solid #222;color:#000}.gtt.gtt_setting input{vertical-align:middle;margin:0 5px}.gtt.gtt_setting .gtt_row{color:#fff;padding:5px 0;display:inline-block}.gtt .gtt_close.gtt_button:hover{color:#fff}.gtt .gtt_close.gtt_button{float:right;cursor:pointer;color:#999}#ctrl::before{content:"Ctrl";position:absolute;margin-left:15px;line-height:12px;color:#fff}.gtt .gtt_toolbar{position:absolute;right:0.5em;white-space:nowrap}.gtt .gtt_toolbar .gtt_button{position:relative;width:1.2em;height:1.2em;float:none;vertical-align:baseline;cursor:pointer}.gtt .gtt_lang gtt_span{padding:0 6px}.gtt .gtt_translation *{color:#fff;text-align:left;white-space:normal;user-select:none;cursor:move}');
var DEBUG = false;
const TTS_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmtJREFUeNrsVz2P2kAQ5ZIraHGHriPdKR10aUkTcSV0afkLlGlxRwtdqpOgIw0SdFQnmT9wErRXRIL8AKTNvtU8a7zYhyz27hpGGmy863lv52vXN8aYylU+Uj4Htle3+sNq1erLey/mq9W/Vo3ok9XOWwCNrCZyvVcrd+Ddbtc0m02jiDyGAr6TVWnjRyHRIzhlOByaWq3GeQt5/3JwrC5JEtPv92m8L652gNPpNCWBeY1Gg/PmQcD3+326QjEce15JSUIwX3liFAQ8jwD+L5dLFwYSGY/HqScUwcLEvBd3xkpzwT0CK1wBTgEwQ0JPqPnzohI6+q4sAvcMPnPuYDA4CVG73c4LxTefwBoDSCy8qDUP3CPgQGicgBDc4xkTEwTlnV8aPKK7yggJsPRAlPWPMQiAuTAIwqTCFoYA3mP8t9ute4bSo2CctkFSCByCEaCSBKuAyccwMJQqD4Bb+RSgQ/7Bz263yx20gJXXxkMQeACIXan7czhkvOuAMW7zo9DARSFAvOleJhmSUcec/5kj4KU9sLf6D8x99mVkNptVer2eu7fl5q6TycRd6Z3NZsPp6c2t6gMPrVbrxFUw9pr74OIoijLzbSK6xcRxnCGwWq103znp+Yu8TqjbaUEVzOlm3Y5ZDewByv1HdY44kS+yt1Mfi0goAokuO8Sd4LqNq+37d9nw5pJQBEbsiGi1rHMNzs3p3OpLkfC2Y30WzGxKChz685J6T0kAXJ10OhI69wyx9rflEOAZEkoX8vy73gn9g0kocEpH3K5PNlWeC1SvNxKaoODnvgvWAryWPb/+EV9b0fWDs4z8F2AARfu9//VSiVMAAAAASUVORK5CYII=';
const SETTING_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAApJJREFUeNrUVz1vGkEQXRMXlLkozbVIaazIRUBpHHe4dImVhpbSLTRRWty5xV2cIhJ0litz3cmWIkETpYrEtS6wuD9gicw7zVh7yx73wWHLIw273O7szM68md1V6oVpp6CcS3xofPOJ75/D6I/Ec+KlhX9t2wPY+R/i961WKzbgeZ4KwxDdY+LrsnbbJr4iDrk9wU5J+dKkfr8vXjgj/kEccNveRLnp4ke0UGbScDiUOb/zhKayRvklOoPBQC0WC9XpdPD3DX4cx1kRqNVq0v1cr9fVbDaLZHnu1zz4eNo5LRDbJf5j92TQigfwDV7odrux8clksiQjxBOZwnFhU74JYS024CJLCJwkNxclhITpU5b5p7AWboP7NiWEgwwQD5ynKT8g7jFgrOmWl4AJLTt6rCNReSx9IGwjeAbGwUtg7BAAtJGWnqlp6YtSgAZKbGg3UB1jmxFYAzLIHqytybq68ncS9zSieqDvwmXZCDfwRBrBcyx/UsgAKjiywJ7hQZTeJRWgXAZU8qaUlp5OGemb24BmsyndbwzcPQ7HW+R7XgN2DBB+gQLUdTD6WhGJCEduo9FQQRCseGY8Hlvnj0ajqJ1Op1Gf6IF437zA4KLxL0saAtkYAx6AGwAzqWhpZVh4zrqsVCU+4rO/lEKk3RPmDDw3LSzfJSNsdaAIaci/yoILD5MpnqWdhtgIGxBmyQJf7nhlEQPvae0sB9IKCAV4YBvgZBzu1ouRAcLM98OYEQiHdqRa74QwSsaBH8gUVZ54OsqF05ae2qk3ssglKt9dY8AtChOKH7+CEL874hsUFJO0b+j8ZZmA5X6W9TCp8sPkg1ly+VGi2OjbbT/NfIub/XW3nbIfp3KE67RQr5H+CzAAckGj8GAmxoYAAAAASUVORK5CYII=';
const LINK_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnFJREFUeNrUVz1LI0EYnvXyA4zXC8ZKEZuEa7wy+QNCghZnmXS28Sdkr/LKpLvqjgSuOBCEpBC0UTZwlY0kVtdu/sDJ+DzLTNhbd2Z3s9HgCw87mZnM+/3OO46UUqySCnkPcBwn1//XxIqp8Ipnb1jW/PmIMZAHMXQKXPNoC7i+F7gwKQjh4118PgPbKbT+C3zjoFgsGjfNZjN+HoD9JO3OgX8J2rxAv9+XNqpWq3pvrWDR/Ac+Rxw3m01RKpUS1Z9Op6LX6wnXdQWYGK0Qmi+aNKcfJTZKz/NkWuJebYVyuSx934/dV6/X9b6GSYDfYVO2220JCwQC2RB1RafTWVgARkmgwXA4zOJ/T48ptInCAqzF+J75u04/EePxWC99BT5awEwpcyOYC2g/P3MwGOjIz1cJIbwfhSoqO8BNHHMGZaPRELVaLV6IGPNv6AAk0Y/KXK7BXQcms3e73f9cxMBkoDKe1Nx2LgEyMP8C3Ebi5TKXBTIwv1Z7dWHz1HdxF4B2dYW0MY+k5oEpsBYRoMk5VEgrc11D1NzZMvuBIDeZojqyGe2tVstedpclABSjAHcUgOnF2h9ifvJWDckh8AtCfAoVKzK/WKoAIRNuokq6keUrBU17utGw9QNWAVjdwOgRvt3i9aqvVfw+yqIZ6v38ilY0ib324zoiCPCd5mQfgMgODhmNRsZ6HiVUvEBwuqZSqXDqKeh+hLhPTMNonjPVJpOJzEK8RXmVh+rAubHxMfWEsAJ9+Qf4kMWnoZ5P00/g2JZStp6QlqA7phn7wplqak4THzZpn2aqT0hLfuqXVd634bt/mjmrfh2v3ALPAgwAAuGRJ1wDDiMAAAAASUVORK5CYII=';
const LANGUAGES = {
	'auto': 'Определить',
	'af': 'Afrikaans',
	'sq': 'Albanian',
	'ar': 'Arabic',
	'hy': 'Armenian',
	'az': 'Aerbaijani',
	'eu': 'Basque',
	'be': 'Belarusian',
	'bn': 'Bengali',
	'bg': 'Bulgarian',
	'ca': 'Catalan',
	'zh-CN': 'Chinese (simplified)',
	'zh-TW': 'Chinese (traditional)',
	'hr': 'Croatian',
	'cs': 'Czech',
	'da': 'Danish',
	'nl': 'Dutch',
	'en': 'English',
	'et': 'Estonian',
	'tl': 'Filipino',
	'fi': 'Finnish',
	'fr': 'French',
	'gl': 'Galician',
	'ka': 'Georgian',
	'de': 'German',
	'el': 'Greek',
	'ht': 'Haitian Creole',
	'iw': 'Hebrew',
	'hi': 'Hindi',
	'hu': 'Hungarian',
	'is': 'Icelandic',
	'id': 'Indonesian',
	'ga': 'Irish',
	'it': 'Italian',
	'ja': 'Japanese',
	'ko': 'Korean',
	'lv': 'Latvian',
	'lt': 'Lithuanian',
	'mk': 'Macedonian',
	'ms': 'Malay',
	'mt': 'Maltese',
	'no': 'Norwegian',
	'fa': 'Persian',
	'pl': 'Polish',
	'pt': 'Portuguese',
	'ro': 'Romanian',
	'ru': 'Russian',
	'sr': 'Serbian',
	'sk': 'Slovak',
	'sl': 'Slovenian',
	'es': 'Spanish',
	'sw': 'Swahili',
	'sv': 'Swedish',
	'th': 'Thai',
	'tr': 'Turkish',
	'uk': 'Ukrainian',
	'ur': 'Urdu',
	'vi': 'Vietnamese',
	'cy': 'Welsh',
	'yi': 'Yiddish'
};
const TOOLTIP = $('<gtt_div>', { class: "gtt", html: [
	$('<gtt_div>', { class: "gtt_toolbar", html: [
		$('<img>', {class: 'gtt_button gtt_tts', src: TTS_ICON }),
		$('<img>', {class: 'gtt_button gtt_link', src: LINK_ICON }),
		$('<img>', {class: 'gtt_button gtt_setting', src: SETTING_ICON })
	]}),
	$('<gtt_div>', { class: "gtt_translation" })
]});
const SETTING = $("<gtt_div>", { class: "gtt gtt_setting", html: [
	$("<gtt_div>", { class: "gtt_close gtt_button", text: "✕" }),
	$("<gtt_div>", { class: "gtt_row", html: [
		$("<gtt_div>", { text: "Активация по:" }),
		$("<input>", { name: "ctrl", type: "checkbox", id: "ctrl" })
	]}),
	$('<hr>'),
	$("<gtt_div>", { class: "gtt_row gtt_lang", html: [
		$("<select>", { name: "sl" }),
		$("<gtt_span>", { text: "→" }),
		$("<select>", { name: "tl" })
	]})
]});

// jQuery draggable plugin
(function() {
	$.fn.draggable = function(options) {
		var hndl = this,
			draggable = this;
		options = $.extend({}, {
			handle: null,
			handleChildren: true,
			cursor: 'move'
		}, options);
		if (options.handle) {
			hndl = $(options.handle);
		}
		hndl.css({
			'-webkit-user-select': 'none',
			'-moz-user-select': 'none',
			'-ms-user-select': 'none',
			'user-select': 'none',
			'cursor': options.cursor
		}).on("mousedown", function(e) {
			var x = draggable.offset().left - e.pageX,
				y = draggable.offset().top - e.pageY,
				z = draggable.css('z-index');
			// if click on children and disabled handle children
			if (!options.handleChildren && e.target != this) {
				return;
			}
			draggable.css('z-index', 100000);
			$(document.documentElement).on('mousemove.draggable', function(e) {
				draggable.offset({
					left: x + e.pageX,
					top: y + e.pageY
				});
			}).one('mouseup', function() {
				$(this).off('mousemove.draggable');
				draggable.css('z-index', z);
			});
			// disable selection
			// e.preventDefault();
		});
		return this;
	};
})();
(function() {
	// extend jQuery toggle method
	var _toggle = $.fn.toggle;
	$.fn.toggle = function(visible) {
		if (typeof visible === 'undefined') {
			visible = !this.data('visible');
		}
		if (visible === true) {
			this.stop().fadeIn('fast');
		} else if (visible === false) {
			this.stop().fadeOut('fast');
		} else {
			return _toggle.apply(this, arguments);
		}
		// use data to store visibility, doesn't use ':visible' because fade may be running
		this.data('visible', visible);
		this.trigger('toggle');
		return this;
	};
	// similar to $.fn.toggle
	// append to DOM and fade in, or fade out and detach from DOM
	$.fn.display = function(visible) {
		if (typeof visible === 'undefined') {
			visible = !this.data('visible');
		}
		if (visible) {
			$(document.body).append(this);
			this.stop().fadeIn('fast');
		} else {
			this.stop().fadeOut('fast', function() {
				$(this).detach();
			});
		}
		// use data to store visibility, doesn't use ':visible' because fade may be running
		this.data('visible', visible);
		this.trigger('display');
		return this;
	};
})();

function log() {
	if (DEBUG) {
		console.log.apply(console, Array.prototype.slice.call(arguments));
	}
}
var selectedText,
	audioContext,
	audioBuffer,
	tooltip = $(TOOLTIP).hide(),
	sttng = $(SETTING).hide(),
	toolbar = tooltip.find('.gtt_toolbar').hide(),
	sttngButton = toolbar.find('.gtt_setting.gtt_button'),
	linkButton = toolbar.find('.gtt_link.gtt_button'),
	ttsButton = toolbar.find('.gtt_tts.gtt_button').hide();
toolbar.find('.gtt_button').addBack().on('toggle', function(e) {
	tooltip.trigger('width');
});
// update auto width
tooltip.on('width', function(e) {
	var currentWidth = tooltip.width(),
		// + 1 for decimal
		width = tooltip.width('auto').width() + 1;
	if (toolbar.data('visible')) {
		width += sttngButton.width() + linkButton.width() + 8;
		if (audioBuffer) {
			width += ttsButton.width();
		}
	}
	// CSS transition must specify width
	tooltip.width(currentWidth).width(width);
}).mouseenter(function(e) {
	toolbar.toggle(true);
}).mouseleave(function(e) {
	toolbar.toggle(false);
}).draggable({
	// handleChildren: false,
	handle: tooltip.find('.gtt_translation')
});
sttngButton.click(function() {
	var offset = tooltip.offset();
	sttng.display().offset({
		left: offset.left,
		top: offset.top + tooltip.outerHeight() + 4
	});
});
linkButton.click(function() {
	window.open('http://translate.google.com/#' + encodeURIComponent(GM_getValue('sl') || 'auto') + '/' + encodeURIComponent(GM_getValue('tl') || 'auto') + '/' + encodeURIComponent(selectedText), '_blank');
});
sttng.draggable({
	//handleChildren: false
}).find('.gtt_close.gtt_button').click(function(e) {
	sttng.display(false);
	e.preventDefault();
}).end();
// create language option
$.each(LANGUAGES, function(key, value) {
	sttng.find('select').each(function() {
		$(this).append($('<option>').attr('value', key).text(value));
	});
});
try {
	// Fix up for prefixing
	audioContext = new (window.AudioContext || window.webkitAudioContext)();
	log(audioContext)
	ttsButton.click(function(e) {
		if (!audioBuffer) {
			log('No TTS buffer');
			return;
		}
		var audioSource = audioContext.createBufferSource();
		audioSource.buffer = audioBuffer;
		audioSource.connect(audioContext.destination);
		audioSource.start(0);
		log('Playing TTS', audioBuffer);
	});
} catch (e) {
	log('Web Audio API is not supported in this browser', e);
}

function getSelection() {
	var selection = window.getSelection(),
		docElem = document.documentElement,
		left = window.scrollX - docElem.clientLeft,
		top = window.scrollY - docElem.clientTop,
		rect;
	if (selection.toString()) {
		rect = selection.getRangeAt(0).getBoundingClientRect();
		return {
			text: selection.toString(),
			x: left + rect.left,
			y: top + rect.bottom
		};
	}
	var input = $(':focus').filter('input, textarea');
	if (input.length && input.val() && 'selectionStart' in input[0] && 'selectionEnd' in input[0]) {
		var text = input.val().slice(input[0].selectionStart, input[0].selectionEnd);
		rect = input[0].getBoundingClientRect();
		return {
			text: text,
			x: left + rect.left,
			y: top + rect.bottom
		};
	}
	return null;
}

function tts(audioContext, targetLang, text, onSuccess, retry) {
	if (!(audioContext instanceof AudioContext) || (typeof targetLang !== 'string') || (typeof text !== 'string') || (typeof onSuccess !== 'function')) {
		return;
	}
	if (typeof retry === 'undefined') {
		retry = 3;
	}
	GM_xmlhttpRequest({
		method: "GET",
		// use 8-bit no conversion encode
		overrideMimeType: "text/plain; charset=x-user-defined",
		url: "https://translate.google.com/translate_tts?" + $.param({
			client: 'tw-ob',
			tl: targetLang,
			ie: 'UTF-8',
			q: text
		}),
		onload: function(response) {
			var length = response.responseText.length,
				buffer = new Uint8Array(length);
			log('TTS length', length);
			// retry if google return empty response
			if (length == 0) {
				if (+retry > 0) {
					tts(audioContext, targetLang, text, onSuccess, retry - 1);
				}
				return;
			}
			for (var i = 0; i < length; i++) {
				buffer[i] = response.responseText.charCodeAt(i);
			}
			log(buffer.buffer)
			audioContext.decodeAudioData(buffer.buffer, function(buffer) {
				log('TTS buffer decode success');
				onSuccess(buffer);
			}, function(e) {
				log('decodeAudioData Error', e.err, buffer);
			});
		}
	});
}
/**
 * Translate text into tooltip
 */
function translate(text, left, top) {
	text = text.trim().replace(/[\u0000-\u001f]/g, '');
	if (!(typeof text === 'string') && !text) return;
	left && tooltip.css('left', left);
	top && tooltip.css('top', top);
	audioBuffer = null;
	ttsButton.toggle(false);
	tooltip.display(true).width('auto').find('.gtt_translation').text('Loading...').end();
	GM_xmlhttpRequest({
		method: "GET",
		url: "https://translate.google.com/translate_a/t?" + $.param({
			// if using { client: 't' }, google will return a non-standard JSON array
			client: 'dict-chrome-ex',
			sl: GM_getValue('sl') || 'auto',
			tl: GM_getValue('tl') || 'auto',
			q: text
		}),
		//https://translate.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=ru&q=title
		onload: function(response) {
			var json,
				translation = [];
			try {
				json = JSON.parse(response.responseText);
			} catch (e) {
				log(e, response);
				tooltip.find('.gtt_translation').text('Parsing JSON error').end().width('auto');
				return;
			}
			log('Translated JSON', json);
			$.each(json.sentences, function(index, sentence) {
				if (sentence.trans) {
					translation.push($('<gtt_div>').text(sentence.trans));
				}
			});
			if (translation.length === 0) {
				tooltip.display(false);
				return;
			}
			tooltip.find('.gtt_translation').empty().append(translation).end().width('auto');
			tts(audioContext, json.src, text, function(buffer) {
				audioBuffer = buffer;
				ttsButton.toggle(true);
			});
		}
	});
}
// on language change
sttng.find('select').change(function() {
	GM_setValue($(this).attr('name'), $(this).find(':selected').val());
	translate(selectedText);
}).each(function() {
	var setting = GM_getValue($(this).attr('name')) || 'auto';
	$(this).val(setting);
}).end().find('[name="ctrl"]').prop('checked', Boolean(GM_getValue('ctrl'))).change(function() {
	GM_setValue('ctrl', $(this).prop('checked'));
}).end();

$(document).bind('mouseup keyup', function(e) {
	let selection = getSelection();
	if (e.type == 'mouseup')
	{
		// if click on tooltip
		if ((e.target == tooltip[0] || tooltip.has(e.target).length) || (e.target == sttng[0] || sttng.has(e.target).length)) {
			return;
		}
		tooltip.display(false);
		sttng.display(false);
		if (GM_getValue('ctrl') && !e.ctrlKey) { // if not press Ctrl when necessary
			return;
		}
		if (selection) {
			selectedText = selection.text;
			translate(selection.text, selection.x, selection.y + 4);
		}
	}
	else if (e.type == 'keyup')
	{
		if (!GM_getValue('ctrl') || e.keyCode != 17) {
			return;
		}
		if (selection) {
			selectedText = selection.text;
			translate(selection.text, selection.x, selection.y + 4);
		}
	}
});