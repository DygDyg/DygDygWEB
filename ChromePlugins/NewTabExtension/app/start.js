// window.open("https://dygdyg.github.io/DygDygWEB/close.htm", '_blank')
const NEWTAB_SETTINGS_KEY = 'newtab.settings.v2';

var background;
var urls;
var names;
var images;
var ShowCard;
var newTabSettings;
var savedTimezones;
var clockBehavior;
var searchSettings;

const NEWTAB_SEARCH_ENGINE_IDS = ['browserDefault'];

function stringToBool(val) {
	return (val + '').toLowerCase() === 'true';
}

function legacyArray(key) {
	const value = localStorage.getItem(key);
	if (!value) return [];
	return value.split(',');
}

function imageFromArray(imageList, index, urlCount) {
	if (!Array.isArray(imageList)) return '';
	const isShiftedLegacyImages = imageList.length === urlCount + 1 && imageList[0] === '';
	return isShiftedLegacyImages ? (imageList[index + 1] || '') : (imageList[index] || '');
}

function defaultNewTabSettings() {
	return {
		version: 2,
		updatedAt: new Date().toISOString(),
		background: 'https://sun9-17.userapi.com/c857628/v857628352/16b73d/w-YSbE4d4mc.jpg',
		showCards: true,
		clockBehavior: 'hover',
		search: {
			default: 'browserDefault',
			shift: 'browserDefault',
			ctrl: 'browserDefault',
			alt: 'browserDefault'
		},
		volume: 100,
		timezones: ['Europe/Moscow', 'Asia/Vladivostok'],
		cards: [
			{ name: '', url: 'https://yandex.ru/', image: '' },
			{ name: '', url: 'https://vk.com', image: '' },
			{ name: '', url: 'https://youtube.com/feed/subscriptions', image: '' }
		]
	};
}

function settingsFromLegacy() {
	const defaults = defaultNewTabSettings();
	const legacyUrls = legacyArray('urls');
	const legacyNames = legacyArray('names');
	const legacyImages = legacyArray('images');
	const cardUrls = legacyUrls.length ? legacyUrls : defaults.cards.map(card => card.url);

	return {
		version: 2,
		updatedAt: new Date().toISOString(),
		background: localStorage.getItem('background') || defaults.background,
		showCards: localStorage.getItem('ShowCard') === null ? defaults.showCards : stringToBool(localStorage.getItem('ShowCard')),
		clockBehavior: defaults.clockBehavior,
		search: defaults.search,
		volume: Number(localStorage.getItem('volume') || defaults.volume),
		timezones: defaults.timezones,
		cards: cardUrls
			.filter(url => url !== undefined && url !== null && String(url).trim() !== '')
			.map((url, index) => ({
				name: legacyNames[index] || '',
				url: String(url).trim(),
				image: imageFromArray(legacyImages, index, cardUrls.length)
			}))
	};
}

function normalizeNewTabSettings(settings) {
	const defaults = defaultNewTabSettings();
	const source = settings && typeof settings === 'object' ? settings : {};
	const sourceSearch = source.search && typeof source.search === 'object' ? source.search : {};
	const cards = Array.isArray(source.cards)
		? source.cards
		: (Array.isArray(source.urls) ? source.urls.map((url, index) => ({
			url,
			name: Array.isArray(source.names) ? source.names[index] : '',
			image: imageFromArray(source.images, index, source.urls.length)
		})) : defaults.cards);

	return {
		version: 2,
		updatedAt: source.updatedAt || new Date().toISOString(),
		background: source.background || defaults.background,
		showCards: source.showCards === undefined
			? (source.ShowCard === undefined ? defaults.showCards : stringToBool(source.ShowCard))
			: Boolean(source.showCards),
		clockBehavior: ['fixed', 'hover'].includes(source.clockBehavior) ? source.clockBehavior : defaults.clockBehavior,
		search: {
			default: NEWTAB_SEARCH_ENGINE_IDS.includes(sourceSearch.default) ? sourceSearch.default : defaults.search.default,
			shift: NEWTAB_SEARCH_ENGINE_IDS.includes(sourceSearch.shift) ? sourceSearch.shift : defaults.search.shift,
			ctrl: NEWTAB_SEARCH_ENGINE_IDS.includes(sourceSearch.ctrl) ? sourceSearch.ctrl : defaults.search.ctrl,
			alt: NEWTAB_SEARCH_ENGINE_IDS.includes(sourceSearch.alt) ? sourceSearch.alt : defaults.search.alt
		},
		volume: source.volume === undefined || source.volume === null ? defaults.volume : Number(source.volume),
		timezones: Array.isArray(source.timezones) && source.timezones.length
			? [source.timezones[0] || defaults.timezones[0], source.timezones[1] || defaults.timezones[1]]
			: defaults.timezones,
		cards: cards
			.filter(card => card && card.url !== undefined && card.url !== null && String(card.url).trim() !== '')
			.map(card => ({
				name: card.name === undefined || card.name === null ? '' : String(card.name),
				url: String(card.url).trim(),
				image: card.image === undefined || card.image === null ? '' : String(card.image)
			}))
	};
}

function writeLegacySettings(settings) {
	const legacyImages = [''];

	localStorage.setItem('background', settings.background);
	localStorage.setItem('ShowCard', settings.showCards);
	localStorage.setItem('volume', settings.volume);
	localStorage.setItem('urls', settings.cards.map(card => card.url));
	localStorage.setItem('names', settings.cards.map(card => card.name));

	settings.cards.forEach((card, index) => {
		legacyImages[index + 1] = card.image || '';
	});
	localStorage.setItem('images', legacyImages);
}

function exposeSettingsGlobals(settings) {
	background = settings.background;
	urls = settings.cards.map(card => card.url);
	names = settings.cards.map(card => card.name);
	images = [''];
	settings.cards.forEach((card, index) => {
		images[index + 1] = card.image || '';
	});
	ShowCard = settings.showCards;
	clockBehavior = settings.clockBehavior;
	searchSettings = settings.search;
	savedTimezones = settings.timezones;
	newTabSettings = settings;
}

function persistNewTabSettings(settings) {
	const normalized = normalizeNewTabSettings(settings);
	localStorage.setItem(NEWTAB_SETTINGS_KEY, JSON.stringify(normalized));
	writeLegacySettings(normalized);
	exposeSettingsGlobals(normalized);
	return normalized;
}

function saveNewTabSettings(settings) {
	return persistNewTabSettings({
		...normalizeNewTabSettings(settings),
		updatedAt: new Date().toISOString()
	});
}

function loadNewTabSettings() {
	const stored = localStorage.getItem(NEWTAB_SETTINGS_KEY);

	if (stored) {
		try {
			return persistNewTabSettings(JSON.parse(stored));
		} catch (error) {
			console.warn('NewTab settings v2 повреждены, читаю старый формат', error);
		}
	}

	return persistNewTabSettings(settingsFromLegacy());
}

function getNewTabSettings() {
	return normalizeNewTabSettings(newTabSettings || settingsFromLegacy());
}

function applyNewTabSettings(settings) {
	return persistNewTabSettings(settings);
}

loadNewTabSettings();

console.log(urls, names, images, background);
