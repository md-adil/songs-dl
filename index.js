require('dotenv').config();
global.Promise = require('bluebird');
const { prompt, Separator, registerPrompt } = require('inquirer'),
	debug = require('debug')('app:main'),
	axios = require('axios'),
	config = require('./config'),
	pageLoader = require('./page-loader'),
	artistsLoader = require('./artists-loader'),
	categoryLoader = require('./category-loader'),
	search = require('./search'),
	downloader = require('./downloader'),
	fs = require('fs'),
	sections = require('./sections');

axios.defaults.baseURL = config.baseUrl;
registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const proptOptions = (categories) => [{
	name: 'category',
	type: 'list',
	message: 'Select option',
	choices: [
		{ name: 'Search for songs', value: 'search' },
		new Separator(),
		...categories,
		new Separator(),
		{ name: 'Artists', value: 'artists'},
		new Separator(),
	],
	pageSize: 12
}];

(async () => {
	try {
		const $ = await pageLoader(),
		{ categories, archives } = sections($);
		const { category } = await prompt(proptOptions(
			categories.map(a => ({name: a.title, value: a.link })),
		));

		switch(category) {
			case 'search':
				await search();
				break;
			case 'artists':
				await artistsLoader();
				break;
			default:
				await categoryLoader(category);
				break;
		}
	} catch(err) {
		debug(err);
	}
})();


