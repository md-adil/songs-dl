const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs');
const downloader = require('./downloader');
const { prompt } = require('inquirer');

const promptOption = (artists, page) => {
	const navs = [ { name: chalk.dim('-- Next --'), value: '__next__' } ];
	if(page != 1) {
		navs.push({ name: chalk.dim('-- Prev --'), value: '__prev__' });
	}
	return [
		{
			name: 'artist',
			message: 'Select artist to download',
			type: 'list',
			choices: [...artists, ...navs ],
			pageSize: 30
		}
	]
}
	

module.exports = exports = async () => {
	let page = 1;
	while(true) {
		const data = fs.readFileSync('./ignore/artist.html');
		const $ = cheerio.load(data);
		const artists = findArtists($);
		const { artist } = await prompt(promptOption(artists, page));
		if(artist == '__next__') {
			page++;
		}
		if(artist == '__prev__') {
			page--;
		}
	}
}

const findArtists = $ => {
	return $('.content-wrapper figure a').map((i, f) => {
		return {
			name: $(f).text().trim(),
			value: $(f).attr('href')
		}
	}).toArray();
}

exports.all = () => {
	findAllArtists();
}

exports.find = (title, link) => {
	return findAlbum();
}

const findAlbums = artist => {

}
