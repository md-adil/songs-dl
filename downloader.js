const axios = require('axios'),
	logger = require('./logger'),
	https = require('https'),
	cheerio = require('cheerio'),
	path = require('path'),
	unzip = require('unzip'),
	{ Bar, Presets } = require('cli-progress'),
	fse = require('fs-extra'),
	fs = require('fs');

const rename = Promise.promisify(fs.rename);

const downloading = async (file, link) => {
	const downloadingFile = file + '.part',
		bar = new Bar({}, Presets.shades_classic),
		response = await axios({
			method: 'get',
			url: link,
			httpsAgent: new https.Agent({ rejectUnauthorized: false }),
			responseType: 'stream'
		}),
		length = response.headers['content-length'];
	bar.start(length);
	await new Promise((resolve, reject) => {
		let downloaded = 0;
		response.data.on('data', buff => {
			downloaded += buff.length;
			bar.update(downloaded);
		})
		.pipe(fs.createWriteStream(downloadingFile))
		.on('finish', () => {
			resolve(file);
		})
		.on('error', (err) => {
			reject(err);
		})
	});
	bar.stop();
	await rename(downloadingFile, file);
	return file;
}

module.exports = exports = download = async (file, link) => {

	const finfo = path.parse(file);
	if(finfo.dir) {
		await fse.ensureDir(finfo.dir);
	}

	if(isExists(file)) {
		logger.warning('Already exists. Skipping...');
	}

	logger.info('downloading', link);

	try {
		await downloading(file, link);
		if(isZip(file)) {
			extractZip(file);
		}
	} catch(err) {
		if(!err.response) {
			throw err;
		}
		console.log(err.response.statusText);
	}
}

exports.list = async ( title, link ) => {
	try {
		const { data } = await axios.get(link);
		const $ = cheerio.load(data), figures = $('figure');
		for(let i = 0; i < figures.length; i++) {
			const item = $(figures[i]).find('figcaption h3 a'),
				itemTitle = item.text().trim();
			console.log('Downloading: ', itemTitle, item.attr('href'));
			await single(path.join(title, itemTitle), item.attr('href'));
		}
	} catch(err) {
		if(!err.response) {
			throw err;
		}
		console.log(err.response.statusText);
	}
}

exports.single = single = async (title, link) => {
	try {
		const { data } = await axios.get(link);
		const $ = cheerio.load(data);
		const lists = {};
		$('.page-down-btns a').each((i, d) => {
			const type = extractQuality($(d).text().trim());
			lists[type] = $(d).attr('href');
		});
		const file = lists['230kbps'] || lists['128kbps'];
		return download(title, file);
	} catch(err) {
		if(!err.response) {
			throw err;
		}
		console.log(err.response.statusText);
	}
}

const extractQuality = str => {
	const matched = str.toLowerCase().match(/(\d+kbps)/);
	if(!matched) {
		return '128kbps';
	}
	return matched[0];
}

const extractZip = (file) => {
	const readStream = fs.createReadStream(file),
		writeStream = fs.createWriteStream(file.replace(/\.zip$/, ''));
	return new Promise((resolve, reject) => {
		readStream.pipe(unzip.Parse())
		.on('entry', (entry) => {
			console.log('Extracting', entry.path)
		})
		.pipe(writeStream)
		.on('finish', () => {
			resolve();
		})
		.on('error', (err) => {
			reject(err)
		});
	});
}

const isZip = file => {
	return file.endsWith('.zip')
}

const isExists = file => {
	if(isZip(file)) {
		return fs.existsSync(file.replace(/\.zip$/, ''));
	}
	return fs.existsSync(file);
}

