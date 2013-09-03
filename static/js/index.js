/* Include the Security module, we will use this later to escape a HTML attribute*/
var Security = require('ep_etherpad-lite/static/js/security.js');

/* Define the regular expressions we will use to detect if a string looks like a reference to a pad IE [[foo]] */
var UserHrefRegexp = new RegExp(/\B([@!][A-Za-z0-9_]+)/g);


/* Take the string and remove the first and last 2 characters IE [[foo]] returns foo */
var linkSanitizingFn = function(result) {
	if (!result) return result;
	result.index = result.index + 0;
	var s = result[0];
	result[0] = s
		.substr(0,s.length) // Skip the first two char
		.replace(/\s+/g, ''); // Every space will be replaced by nothing
	return result;
};


/* Define a custom regular expression object */
var CustomRegexp = function(regexp, sanitizeResultFn) {
	this.regexp = regexp;
	this.sanitizeResultFn = sanitizeResultFn;
};

CustomRegexp.prototype.exec = function(text) {
	var result = this.regexp.exec(text);
	return this.sanitizeResultFn(result);
}

var getCustomRegexpFilter = function(regExp, tag, sanitizeFn, linestylefilter) {
	var customRegexp = new CustomRegexp(regExp, sanitizeFn);
	return linestylefilter.getRegexpFilter(customRegexp, tag);
}
/* End of defining a custom regular expression object */


exports.aceCreateDomLine = function(name, context){
	var userMention,
		groupMention,
		cls = context.cls;

	if (cls.indexOf('externalHref') >= 0) { // if it already has the class of externalHref
		cls = cls.replace(/(^| )externalHref:(\S+)/g, function(x0, space, url) {
			if (url.indexOf('@') == 0) userMention = url.replace('@', '');
			if (url.indexOf('!') == 0) groupMention = url.replace('!', '');
			return space + "url";
		});
	}
	if (userMention) {
		return [{
			extraOpenTags: '<span onclick="parent.top.elgg.deck_river.userPopup(\'' + Security.escapeHTMLAttribute(userMention) +'\');" class="ggouv-mention">',
			extraCloseTags: '</span>',
			cls: cls
		}];
	}
	if (groupMention) {
		return [{
			extraOpenTags: '<span onclick="parent.top.elgg.deck_river.groupPopup(\'' + Security.escapeHTMLAttribute(groupMention) +'\');" class="ggouv-mention">',
			extraCloseTags: '</span>',
			cls: cls
		}];
	}
	return;
}

exports.aceGetFilterStack = function(name, context) {
	var filter = getCustomRegexpFilter(
			UserHrefRegexp,
			'externalHref',
			linkSanitizingFn,
			context.linestylefilter
		);
	return [filter];
}

exports.aceEditorCSS = function(hook_name, cb) { // inner pad CSS;
	return ['ep_ggouv/static/css/ggouv.css'];
}
