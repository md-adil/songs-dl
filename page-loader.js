const cheerio = require('cheerio'),
	{ baseUrl } = require('./config'),
	fs = require('fs'),
	axios = require('axios');

module.exports = async (path) => {
	if(!path) {
		return cheerio.load(fs.readFileSync('./ignore/data.html'));
	}
	const { data } = await axios.get(path);
	return cheerio.load(data);
};
