var path = require('path');
var eejs = require("ep_etherpad-lite/node/eejs");

// override index.html page
exports.expressCreateServer = function (hook_name, args, cb) {
	// expose current stats
	args.app.get('/stats', function(req, res) {
	res.json(require('ep_etherpad-lite/node/stats').toJSON())
	})

	//serve index.html under /
	args.app.get('/', function(req, res)
	{
	res.send(eejs.require("ep_ggouv/templates/index.html"));
	});

	//serve robots.txt
	args.app.get('/robots.txt', function(req, res)
	{
	var filePath = path.normalize(__dirname + "/../ep_etherpad-lite/static/custom/robots.txt");
	res.sendfile(filePath, function(err)
	{
		//there is no custom favicon, send the default robots.txt which dissallows all
		if(err)
		{
		filePath = path.normalize(__dirname + "/../ep_etherpad-lite/static/robots.txt");
		res.sendfile(filePath);
		}
	});
	});

	//serve pad.html under /p
	args.app.get('/p/:pad', function(req, res, next)
	{
	res.send(eejs.require("ep_etherpad-lite/templates/pad.html", {req: req}));
	});

	//serve timeslider.html under /p/$padname/timeslider
	args.app.get('/p/:pad/timeslider', function(req, res, next)
	{
	res.send(eejs.require("ep_ggouv/templates/timeslider.html", {req: req}));
	});

	//serve favicon.ico from all path levels except as a pad name
	args.app.get( /\/favicon.ico$/, function(req, res)
	{
	var filePath = path.normalize(__dirname + "/static/img/favicon.ico");
	res.sendfile(filePath, function(err)
	{
		//there is no custom favicon, send the default favicon
		if(err)
		{
		filePath = path.normalize(__dirname + "/../ep_etherpad-lite/static/favicon.ico");
		res.sendfile(filePath);
		}
	});
	});
};

exports.getLineHTMLForExport = function(hook_name, args, cb) {
//	console.log(args, 'agr');
/*	{ line: { listLevel: 0, text: '', aline: '|1+1' },
  apool:
   { numToAttrib: { '0': [Object], '1': [Object], '2': [Object], '3': [Object] },
     attribToNum:
      { 'bold,true': 0,
        'author,a.Rr5tCeqie9cQrPIj': 1,
        'author,a.t5eXxqPez78IaUAW': 2,
        'author,a.YSoLrQzyzplvjvXU': 3 },
     nextNum: 4 },
  attribLine: '|1+1',
  text: 'LE TEXTE DE LA LIGNE' } 'agrs'*/
	return args.text;
};



exports.eejsBlock_editbarMenuLeft = function (hook_name, args, cb) {
	args.content = args.content + eejs.require("ep_ggouv/templates/toolbar.html");
	return cb();
};

exports.eejsBlock_scripts = function (hook_name, args, cb) {
	args.content = args.content + eejs.require("ep_ggouv/templates/scripts.html", {}, module);
	return cb();
};

exports.eejsBlock_styles = function (hook_name, args, cb) {
	args.content = args.content + eejs.require("ep_ggouv/templates/style.html", {}, module);
	return cb();
};