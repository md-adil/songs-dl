const page = require('./page-loader'),
	downloader = require('./downloader');
module.exports = async (path) => {
	const $ = await page(path);
	fileFiles($).forEach(async file => {
		await downloader.single(title, link);
	});
}

const findFiles = $ => {
	return [
		{
			title: 'The title',
			link: 'http://'
		}
	];
};
