var express = require('express');
var should = require('should');
var request = require('supertest');
var dsn = require('../index.js');

function createServer() {
	var app = new express();

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');

	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	dsn.extend(app);
	app.use(app.router);

	app.get('/show', function(req, res) {
		return res.render('display');
	});

	app.post('/notify', function(req, res) {
		res.notify(req.body);
		return res.redirect('/show');
	});

	return app;
}

function runTestRoute(app, test, done, agent) {
	app.get('/test', function(req, res) {
		try {
			test(req, res);
			res.send(200);
			done();
		} catch(ex) {
			done(ex);
		}
	});

	(agent || request(app)).get('/test').end(function() { });
}

describe('hooking', function() {
	it('should correctly extend response objects', function(done) {
		var app = createServer();
		
		runTestRoute(app, function(req, res){
			res.should.have.property('notify');
			res.should.have.property('clearNotifications');
		}, done);
	});

	it('should add notifications to a response', function(done) {
		var app = createServer();

		runTestRoute(app, function(req, res) {
			res.notify({ valid: true });

			should.exist(res.locals.notifications);
			res.locals.notifications.length.should.equal(1);
			res.locals.notifications[0].should.eql({ valid: true });
		}, done);
	});

	it('should restore notifications across requests', function(done) {
		var app = createServer();
		var agent = request.agent(app);

		agent.post('/notify').send({ valid: true })
			.end(function(err, res) {
				if(err) return done(err);
				should.exist(res.header['set-cookie']);
				agent.jar.setCookie(res.header['set-cookie'][0]);

				runTestRoute(app, function(req, res) {
					should.exist(req.cookies.dsn);
					should.exist(res.locals.notifications);
					res.locals.notifications.length.should.eql(1);
					res.locals.notifications[0].should.eql({valid: true});
				}, done, agent);
			});
	});
});

describe('config', function() {
	before(function(done) {
		dsn.options.property = 'dsn';
		dsn.options.cookie = '_n';
		done();
	});

	after(function(done) {
		dsn.options.property = 'notifications';
		dsn.options.cookie = 'dsn';
		done();
	});

	it('should take into account custom property names', function(done) {
		var app = createServer();

		runTestRoute(app, function(req, res) {
			res.notify({ valid: true });

			should.exist(res.locals.dsn);
			res.locals.dsn.length.should.equal(1);
			res.locals.dsn[0].should.eql({ valid: true });
		}, done);
	});

	it('should take into account custom cookie names', function(done) {
		var app = createServer();
		var agent = request.agent(app);

		agent.post('/notify').send({ valid: true })
			.end(function(err, res) {
				if(err) return done(err);
				should.exist(res.header['set-cookie']);
				agent.jar.setCookie(res.header['set-cookie'][0]);

				runTestRoute(app, function(req, res) {
					should.exist(req.cookies._n);
				}, done, agent);
			});
	});
});