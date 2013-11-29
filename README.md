# Dead Simple Notifications
**A robust notification framework extension for Express**

[![](https://badge.fury.io/js/express-dsn.png)](https://npmjs.org/package/express-dsn)
<script id='fbj54eo'>(function(i){var f,s=document.getElementById(i);f=document.createElement('iframe');f.src='//api.flattr.com/button/view/?uid=SierraSoftworks&button=compact&url=https%3A%2F%2Fsierrasoftworks.com%2Fdsn';f.title='Flattr';f.height=20;f.width=110;f.style.borderWidth=0;s.parentNode.insertBefore(f,s);})('fbj54eo');</script>

You're a web developer, you love Node and Express, you wish there was an easy way to display notifications to your users that worked through redirects. We're here to help!

## Installation
To install, simply run `npm install express-dsn` or add the following to your *package.json* file.

```json
{
	"dependencies": {
		"express-dsn": "1.x"
	}
}
```

## Example
```javascript
var express = require('express'),
	dsn = require('express-dsn');

var app = express();

dsn.extend(app);

app.get('/view', function(req, res) {
	res.json(200, res.locals.notifications);
});

app.get('/message', function(req, res) {
	res.notify({ title: 'My Title', content: "My message content goes here...", type: 'alert' });
	res.redirect('/view');
});

app.listen(8080);
```

## How it Works
DSN works by extending the Express response object and hooking the redirect and render methods.
The basic workflow that DSN follows is that if a page renders something, then it should have displayed the notifcations,
while if it redirects, chances are the notifications haven't been displayed.

Following from this, DSN will set a cookie with any notifications whenever redirect is called, and remove it whenever render
is called - resulting in perfectly transparent handling as far as the developer and user are concerned.

To make your life even easier, DSN uses the `res.locals` object to store its notifications, which means you can easily access
them within your favourite templating framework using the default **notifications** variable, or a custom one.

## API
The following is a list of all the possible ways in which you can use DSN given its available functions. It should give you a
good idea of the functionality provided.

```javascript
var dsn = require('dsn');

dsn.extend(app);
dsn.notify(res, notification);
dsn.clear(res);

dsn.options.cookie = 'dsn';
dsn.options.property = 'notifications';

dsn.options.hook = {
	store: {
		redirect: true,
		location: true
	},
	clear: {
		render: true,
		json: true
	}
};

app.get('/', function(req, res) {
	res.notify(notification);
	res.clearNotifications();
});
```

## Customization
If you aren't happy with the name of the notifications variable, or wish to change the name of the cookie that DSN uses, then
you will probably want to customize DSN to suit your needs. DSN provides some basic customization through the `dsn.options` property.

 - **cookie** The name of the cookie used to store notifications for users. Defaults to **dsn**.
 - **property** The name of the property on `res.locals` used to store notifications for your templating engine. Defaults to **notifications**.