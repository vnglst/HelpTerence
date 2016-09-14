const express = require('express');
const config = require('./');

const env = process.env.NODE_ENV || 'development';

module.exports = (app) => {
	// Static files middleware
	app.use(express.static(`${config.root}/public`));

	// set views path, template engine and default layout
	app.set('views', `${config.root}/views`);
	app.set('view engine', 'ejs');

	if (env === 'development') {
		app.locals.pretty = true;
	}
};
