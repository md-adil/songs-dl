module.exports = ($) => {
	return parseWidgets($);
}

const parseWidgets = $ => {
	const widgets = $('.primary-sidebar .widget'),
		ret = {};
	widgets.each((i, widget) => {
		let title = $(widget).find('.widget-header').text();
		if(!title) {
			return;
		}
		title = title.trim().toLowerCase();
		ret[title] = parseWidgetItem($, widget);
	});
	return ret;
}


const parseWidgetItem = ($, widget) => {
	return $(widget).find('.widget-body ul li a')
	.map((i, link) => ({
		title: $(link).text().trim(),
		link: $(link).attr('href')
	})).toArray();
}
