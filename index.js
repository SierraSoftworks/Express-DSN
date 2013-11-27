var dsn = (require.modules || {}).dsn = module.exports = {};

dsn.options = {
	cookie: 'dsn',
	property: 'notifications'
};

dsn.extend = function(app) {
	/// <summary>Extends the specified Express application to support DSN notifications</summary>
	/// <param name="app" type="Object">The Express application to extend</param>

	app.use(function(req, res, next) {
		if(req.cookies)
			res.locals[dsn.options.property] = req.cookies[dsn.options.cookie];

		extendResponse(res);
		next();
	});
};

function extendResponse(response) {
	response.notify = function(notification) {
		/// <summary>Adds a notification to be displayed to the client</summary>
		/// <param name="notification" type="Object">The notification you wish to display to the user</param>
		return dsn.notify(response, notification);
	};

	response.clearNotifications = function() {
		/// <summary>Removes any active notifications from the current response object</summary>
		response.locals[dns.options.property] = null;
		response.clearCookie(dns.options.cookie);
	};

	var redirect = response.redirect;
	var render = response.render;

	response.redirect = function() {
		if(response.locals[dsn.options.property])
			response.cookie(dsn.options.cookie, response.locals[dsn.options.property]);
		return redirect.apply(this, arguments);
	};

	response.render = function() {
		if(response.locals[dsn.options.property])
			response.clearCookie(dsn.options.cookie);
		return render.apply(this, arguments);
	};
}

dsn.notify = function(res, notification) {
	/// <summary>Adds a notification to be displayed to the client</summary>
	/// <param name="res" type="Object">The response object on which the notification should be displayed</param>
	/// <param name="notification" type="Object">The notification you wish to display to the user</param>

	res.locals[dsn.options.property] = res.locals[dsn.options.property] || [];
	res.locals[dsn.options.property].push(notification);
};

dsn.clear = function(response) {
	/// <summary>Removes any active notifications from the current response object</summary>
	/// <param name="response" type="Object">The Express response object who's notifications should be cleared</param>
	
	response.locals[dns.options.property] = null;
	response.clearCookie(dns.options.cookie);
};