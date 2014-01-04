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

exports.aceEditEvent = function(hook, context) {
	if (context.callstack.docTextChanged) { // http://127.0.0.1/~mama/ggouv.fr/Elgg/etherpad/view/103000/aui-eauiea%C3%A9p
		var $pt = parent.top,
			date = new Date(),
			timestamp = date.getTime()/1000;

		if (context.callstack.domClean && context.callstack.type != "setBaseText") {
			$pt.$('#pad-revisions-count').html(pad.getCollabRevisionNumber());
			$pt.$('#pad-infos acronym').html($pt.elgg.echo("friendlytime:justnow")).attr({
				time: timestamp,
				'original-title': $pt.$.datepicker.formatDate('D dd M yy', date)+' '+$pt.elgg.echo('at')+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
			});
		}

		// live preview
		if ($pt.$('#md-preview-pad').is(":visible")) {
			$pt.$('#md-preview-pad').html($pt.elgg.markdown_wiki.ShowdownConvert(context.rep.alltext));
		}
	}
}

exports.postAceInit = function(hook, context) {
	$('#underline').hide();
	$('#myusernameedit').css({
		'pointer-events': 'none',
		'border': 'none !important',
		'font-weight': 'bold'
	});

	//document.domain = '127.0.0.1';
/*console.log(parent.top, 'pt');
(function(a){function b(a,b){return typeof a=="function"?a.call(b):a}function c(a){while(a=a.parentNode){if(a==document)return true}return false}function d(b,c){this.$element=a(b);this.options=c;this.enabled=true;this.fixTitle()}d.prototype={show:function(){var c=this.getTitle();if(c&&this.enabled){var d=this.tip();d.find(".tipsy-inner")[this.options.html?"html":"text"](c);d[0].className="tipsy";d.remove().css({top:0,left:0,visibility:"hidden",display:"block"}).prependTo(document.body);var e=a.extend({},this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight});var f=d[0].offsetWidth,g=d[0].offsetHeight,h=b(this.options.gravity,this.$element[0]);offset=b(this.options.offset,this.$element[0]);var i;switch(h.charAt(0)){case"n":i={top:e.top+e.height+offset,left:e.left+e.width/2-f/2};break;case"s":i={top:e.top-g-offset,left:e.left+e.width/2-f/2};break;case"e":i={top:e.top+e.height/2-g/2,left:e.left-f-offset};break;case"w":i={top:e.top+e.height/2-g/2,left:e.left+e.width+offset};break}var j="";if(i.left<0){j="w"}else if(i.left+f>a(window).width()+a(document).scrollLeft()){j="e"}else if(h.length==2){j=h.charAt(1)}h=h.charAt(0)+j;if(h.length==2){if(h.charAt(1)=="w"){i.left=e.left+e.width/2-15}else{i.left=e.left+e.width/2-f+15}}d.css(i).addClass("tipsy-"+h);d.find(".tipsy-arrow")[0].className="tipsy-arrow tipsy-arrow-"+h.charAt(0);if(this.options.className){d.addClass(b(this.options.className,this.$element[0]))}if(this.options.fade){d.stop().css({opacity:0,display:"block",visibility:"visible"}).animate({opacity:this.options.opacity})}else{d.css({visibility:"visible",opacity:this.options.opacity})}}},hide:function(){if(this.options.fade){this.tip().stop().fadeOut(function(){a(this).remove()})}else{this.tip().remove()}},fixTitle:function(){var a=this.$element;if(a.attr("title")||typeof a.attr("original-title")!="string"){a.attr("original-title",a.attr("title")||"").removeAttr("title")}},getTitle:function(){var a,b=this.$element,c=this.options;this.fixTitle();var a,c=this.options;if(typeof c.title=="string"){a=b.attr(c.title=="title"?"original-title":c.title)}else if(typeof c.title=="function"){a=c.title.call(b[0])}a=(""+a).replace(/(^\s*|\s*$)/,"");return a||c.fallback},tip:function(){if(!this.$tip){this.$tip=a('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');this.$tip.data("tipsy-pointee",this.$element[0])}return this.$tip},validate:function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}},enable:function(){this.enabled=true},disable:function(){this.enabled=false},toggleEnabled:function(){this.enabled=!this.enabled}};a.fn.tipsy=function(b){function e(c){var e=a.data(c,"tipsy");if(!e){e=new d(c,a.fn.tipsy.elementOptions(c,b));a.data(c,"tipsy",e)}return e}function f(){var a=e(this);a.hoverState="in";if(b.delayIn==0){a.show()}else{a.fixTitle();setTimeout(function(){if(a.hoverState=="in")a.show()},b.delayIn)}}function g(){var a=e(this);a.hoverState="out";if(b.delayOut==0){a.hide()}else{setTimeout(function(){if(a.hoverState=="out")a.hide()},b.delayOut)}}if(b===true){return this.data("tipsy")}else if(typeof b=="string"){var c=this.data("tipsy");if(c)c[b]();return this}b=a.extend({},a.fn.tipsy.defaults,b);if(!b.live)this.each(function(){e(this)});if(b.trigger!="manual"){var h=b.live?"live":"bind",i=b.trigger=="hover"?"mouseenter":"focus",j=b.trigger=="hover"?"mouseleave":"blur";this[h](i,f)[h](j,g)}return this};a.fn.tipsy.defaults={className:null,delayIn:0,delayOut:0,fade:false,fallback:"",gravity:"n",html:false,live:false,offset:0,opacity:.8,title:"title",trigger:"hover"};a.fn.tipsy.revalidate=function(){a(".tipsy").each(function(){var b=a.data(this,"tipsy-pointee");if(!b||!c(b)){a(this).remove()}})};a.fn.tipsy.elementOptions=function(b,c){return a.metadata?a.extend({},c,a(b).metadata()):c};a.fn.tipsy.autoNS=function(){return a(this).offset().top>a(document).scrollTop()+a(window).height()/2?"s":"n"};a.fn.tipsy.autoWE=function(){return a(this).offset().left>a(document).scrollLeft()+a(window).width()/2?"e":"w"};a.fn.tipsy.autoBounds=function(b,c){return function(){var d={ns:c[0],ew:c.length>1?c[1]:false},e=a(document).scrollTop()+b,f=a(document).scrollLeft()+b,g=a(this);if(g.offset().top<e)d.ns="n";if(g.offset().left<f)d.ew="w";if(a(window).width()+a(document).scrollLeft()-g.offset().left<b)d.ew="e";if(a(window).height()+a(document).scrollTop()-g.offset().top<b)d.ns="s";return d.ns+(d.ew?d.ew:"")}}})(jQuery)

	$('a').tipsy({
		live: true,
		offset: function() {
			if ($(this).hasClass('o8')) return 8;
			return 5;
		},
		fade: true,
		html: true,
		delayIn: 500,
		gravity: function() {
			var t = $(this);

			if (t.hasClass('nw')) return 'nw';
			if (t.hasClass('n')) return 'n';
			if (t.hasClass('ne')) return 'ne';
			if (t.hasClass('w')) return 'w';
			if (t.hasClass('e')) return 'e';
			if (t.hasClass('sw')) return 'sw';
			if (t.hasClass('s')) return 's';
			if (t.hasClass('se')) return 'se';
			return 'n';
		}
	});*/
}
/*
exports.padUpdate = function(hook, context) {
	//console.log(context);
	//pad.collabClient.sendMessage('aui');
	//io.sockets.emit('users_count', clients);
	//sendMessage('test');

}*/

function getPadMarkdown(pad, revNum, callback)
{
  var atext = pad.atext;
  var Markdown;
  async.waterfall([

  // fetch revision atext
  function (callback)
  {
    if (revNum != undefined)
    {
      pad.getInternalRevisionAText(revNum, function (err, revisionAtext)
      {
        if(ERR(err, callback)) return;
        atext = revisionAtext;
        callback();
      });
    }
    else
    {
      callback(null);
    }
  },

  // convert atext to Markdown
  function (callback)
  {
    Markdown = getMarkdownFromAtext(pad, atext);
    callback(null);
  }],

  // run final callback
  function (err)
  {
    if(ERR(err, callback)) return;
    callback(null, Markdown);
  });
};