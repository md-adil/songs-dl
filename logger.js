const chalk = require('chalk');
exports.error = message => {
	console.log(chalk.bgRed(message));
}

exports.success = message => {
	console.log(chalk.green(message));
}

exports.info = message => {
	console.log(chalk.blue(message));
};

exports.warning = message => {
	console.log(chalk.yellow(message));
}
