const DonationController = require('../api/controllers/DonationController');

module.exports = (app) => {
	// home route
	app.get('/', DonationController.index);

	// assume 404 since no middleware responded
	app.use((req, res) => {
		res.status(404)
			.render('404', {
				url: req.originalUrl,
				error: 'Not found',
			});
	});
};
