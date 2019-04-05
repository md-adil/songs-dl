const { prompt, Separator } = require('inquirer'),
	path = require('path'),
	chalk = require('chalk'),
	fs = require('fs'),
	config = require('./config'),
	cheerio = require('cheerio'),
	downloader = require('./downloader'),
	artistLoader = require('./artists-loader'),
	debounce = require('debounce'),
	axios = require('axios');

module.exports = async () => {
	while(true) {
		const { item } = await prompt(promptQuery());
		if(!item) {
			continue;
		}
		
		if(item.type == 'singles') {
			return downloader.list(item.title, item.link);
		}

		if(item.type == 'artists') {
			return downloader.list(item.title, item.link + '?cat=single');
		}
	}
}

const promptQuery = () => [{
	type: 'autocomplete',
	name: 'item',
	message: 'Type keywords',
	source: (a, b) => new Promise((resolve, reject) => findDebounce(b, resolve, reject))
}];

const find = async (q, done, fail) => {
	try {
		const { singles, albums, artists } = await fetch(q);
		done([
			{ name: chalk.dim('-- Single --'), value: null },
			...singles,
			{ name: chalk.dim('-- Album --'), value: null },
			...albums,
			{ name: chalk.dim('-- Artist --'), value: null },
			...artists
		]);
	} catch(err) {
		fail(err);
	}
}

const findDebounce = debounce(find, 300);

const fetch = async (q) => {
	const { data } = await axios.get(`${config.search}?q=${q}`);
	// const data = fs.readFileSync('./ignore/search.html');
	return parse(cheerio.load(data));
}

const parse = $ => {
	const data = {},
		$headers = $('.archive-body .page-header');
	$headers.each((i, header) => {
		const $header = $(header),
			title = $header.find('h1').find('a').remove().end().text().trim().toLowerCase(),
			$figures = $header.next().find('figure');
		data[title] = parseItems($, $figures, title);
	})
	return data;
}

const parseItems = ($, $figures, type) => {
	return $figures.map((i, f) => {
		let $a = $(f).find('figcaption h3 a'),
			name = $a.text().trim();
		return {
			name: name,
			value: { type, title: name, link: $a.attr('href') }
		}
	}).toArray();
}

// console.log(parse(cheerio.load(fs.readFileSync('ignore/search.html'))));