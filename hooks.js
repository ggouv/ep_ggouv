var path = require('path');
var eejs = require("ep_etherpad-lite/node/eejs");
var Changeset = require("ep_etherpad-lite/static/js/Changeset");
var settings = require("../../src/node/utils/Settings");

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

exports.eejsBlock_editbarMenuLeft = function (hook_name, args, cb) {
	args.content = args.content + eejs.require("ep_ggouv/templates/toolbar.html");
	return cb();
};

exports.eejsBlock_styles = function (hook_name, args, cb) {
	args.content = args.content + eejs.require("ep_ggouv/templates/style.html", {}, module);
	return cb();
};

// line, apool,attribLine,text
exports.getLineHTMLForExport = function (hook, context) {
	var task = _analyzeLine(context.attribLine, context.apool);
	if (task) {
		if (task == 'tasklist-not-done') task = 'tasklist';
		var href = "http://" + settings.ip + ":" + settings.port,
			inlineStyle = "background: url('"+href+"/static/plugins/ep_ggouv/static/img/"+task+".png') no-repeat 2px 1px;padding-left: 20px;list-style: none;";

		return "<li class=\""+task+"\" style=\"" + inlineStyle + "\"><span>" + context.text.substring(1) + "</span></li>";
	}
}

function _analyzeLine(alineAttrs, apool) {
	var task = null;
	if (alineAttrs) {
		var opIter = Changeset.opIterator(alineAttrs);
		if (opIter.hasNext()) {
			var op = opIter.next();
			task = Changeset.opAttributeValue(op, 'tasklist-not-done', apool);
			if (!task) task = Changeset.opAttributeValue(op, 'tasklist-done', apool);
		}
	}
	return task;
}