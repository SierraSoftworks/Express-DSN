var dsn = (require.modules || {}).dsn = module.exports = {};

dsn.options = {
	cookie: 'dsn',

	property: 'notifications',
	hook: {
		store: {
			redirect: true,
			location: true
		},
		clear: {
			render: true,
			json: true
		}
	}
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

	function hookStore(property) {
		(function(property) {
			var original = response[property];
			response[property] = function() {
				if(response.locals[dsn.options.property])
					response.cookie(dsn.options.cookie, response.locals[dsn.options.property]);
				return original.apply(this, arguments);
			};
		})(property);
	}

	function hookClear(property) {
		(function(property) {
			var original = response[property];
			response[property] = function() {
				if(response.locals[dsn.options.property])
					response.clearCookie(dsn.options.cookie);
				return original.apply(this, arguments);
			};
		})(property);
	}

	for(var k in dsn.options.hook.store) {
		if(dsn.options.hook.store[k]) hookStore(k);
	}

	for(var k in dsn.options.hook.clear) {
		if(dsn.options.hook.clear) hookClear(k);
	}
}
