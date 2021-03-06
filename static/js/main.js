if(typeof exports == 'undefined'){
	var exports = this['mymodule'] = {};
}

$(document).ready(function (){
	// close slidr
	$('body').on('mouseenter', function() {
		if (parent.ggouv !== undefined) {
			parent.ggouv.slidr();
			parent.$('.elgg-menu-item-groups').removeClass('hover');
		}
	});

	$('#chatinput').attr('placeholder', 'Entrez un message...');

	$('#mycolorpickersave').off().on('click', function() {
		setTimeout(function(){
			$(parent.$('#pad-authors .'+pad.myUserInfo.userId.replace('.', '-')+' .pad-user')).css('border-left', '5px solid '+pad.myUserInfo.colorId);
		}, 500);

	});

	$('#insertSignature a').off().on('click', function(e){
		var userName = pad.getUserName();

		if (!userName || userName == "undefined" || userName == "unnamed"){
			$("#myusernameedit").val(prompt("Entrez votre nom et essayez de nouveau.",""));
			e = jQuery.Event("keypress");
			e.which = 13;
			$("#myusernameedit").keypress().trigger(e);
		} else {
			var d = new Date();
			/*var offset = (d.getTimezoneOffset()/60)*(-1);
			//Modified for the UTC+(Number) so that we get UTC-(Number) instead of UTC+-(Number)
			//Offset now contains a prefix (+/-)
			if(offset > 0){
				offset = "+" + offset;
			}*/
			/* As it sits, this is the current key for the replacer:
			 * %u% - The Username of the current person
			 * %Y% - The Year of the current timezone
			 * %M% - The Month of the current timezone
			 * %D% - The Day of the current timezone
			 * %h% - The Hour of the current timezone
			 * %m% - The Minutes of the current timezone
			 * %s% - The Seconds of the current timezone
			 * %o% - The current timezone offset of UTC
			 */
			//EDIT THE BELOW LINE FOLLOWING THE ABOVE KEY FOR SIGNATURE FORMATTING.
			var signature = " — @%u% %D%-%M%-%Y% à %h%:%m%:%s%  ";
			//Notes - Is regexing the fastest method here? Opera and FF seem to go faster on a mystring.split('.').join(' ');
			//But the performance increase is minor, so no more work unless it becomes more proven.
			//Not sure if there is a better way to do the following.
			signature = signature.replace(/%u%/g, pad.getUserName());
			signature = signature.replace(/%Y%/g, d.getFullYear());
			signature = signature.replace(/%M%/g, ("0" + (d.getMonth()+1)).slice(-2));
			signature = signature.replace(/%D%/g, ("0" + d.getDate()).slice(-2));
			signature = signature.replace(/%h%/g, ("0" + d.getHours()).slice(-2));
			signature = signature.replace(/%m%/g, ("0" + d.getMinutes()).slice(-2));
			signature = signature.replace(/%s%/g, ("0" + d.getSeconds()).slice(-2));
			//signature = signature.replace(/%o%/g, offset);

			var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;

			return padeditor.ace.callWithAce(function (ace) {
				rep = ace.ace_getRep();
				ace.ace_replaceRange(rep.selStart, rep.selEnd, signature);
			}, "addSignature");
		}
	});

	var $hs = $('#heading-selection').attr('title', 'Mise en forme');
	if ($('#editbar').length && $.fn.tipsy) {
		$('#editbar li a').add($hs).tipsy({
			live: true,
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
		});
	}

});

(function(a){function b(a,b){return typeof a=="function"?a.call(b):a}function c(a){while(a=a.parentNode){if(a==document)return true}return false}function d(b,c){this.$element=a(b);this.options=c;this.enabled=true;this.fixTitle()}d.prototype={show:function(){var c=this.getTitle();if(c&&this.enabled){var d=this.tip();d.find(".tipsy-inner")[this.options.html?"html":"text"](c);d[0].className="tipsy";d.remove().css({top:0,left:0,visibility:"hidden",display:"block"}).prependTo(document.body);var e=a.extend({},this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight});var f=d[0].offsetWidth,g=d[0].offsetHeight,h=b(this.options.gravity,this.$element[0]);offset=b(this.options.offset,this.$element[0]);var i;switch(h.charAt(0)){case"n":i={top:e.top+e.height+offset,left:e.left+e.width/2-f/2};break;case"s":i={top:e.top-g-offset,left:e.left+e.width/2-f/2};break;case"e":i={top:e.top+e.height/2-g/2,left:e.left-f-offset};break;case"w":i={top:e.top+e.height/2-g/2,left:e.left+e.width+offset};break}var j="";if(i.left<0){j="w"}else if(i.left+f>a(window).width()+a(document).scrollLeft()){j="e"}else if(h.length==2){j=h.charAt(1)}h=h.charAt(0)+j;if(h.length==2){if(h.charAt(1)=="w"){i.left=e.left+e.width/2-15}else{i.left=e.left+e.width/2-f+15}}d.css(i).addClass("tipsy-"+h);d.find(".tipsy-arrow")[0].className="tipsy-arrow tipsy-arrow-"+h.charAt(0);if(this.options.className){d.addClass(b(this.options.className,this.$element[0]))}if(this.options.fade){d.stop().css({opacity:0,display:"block",visibility:"visible"}).animate({opacity:this.options.opacity})}else{d.css({visibility:"visible",opacity:this.options.opacity})}}},hide:function(){if(this.options.fade){this.tip().stop().fadeOut(function(){a(this).remove()})}else{this.tip().remove()}},fixTitle:function(){var a=this.$element;if(a.attr("title")||typeof a.attr("original-title")!="string"){a.attr("original-title",a.attr("title")||"").removeAttr("title")}},getTitle:function(){var a,b=this.$element,c=this.options;this.fixTitle();var a,c=this.options;if(typeof c.title=="string"){a=b.attr(c.title=="title"?"original-title":c.title)}else if(typeof c.title=="function"){a=c.title.call(b[0])}a=(""+a).replace(/(^\s*|\s*$)/,"");return a||c.fallback},tip:function(){if(!this.$tip){this.$tip=a('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');this.$tip.data("tipsy-pointee",this.$element[0])}return this.$tip},validate:function(){if(!this.$element[0].parentNode){this.hide();this.$element=null;this.options=null}},enable:function(){this.enabled=true},disable:function(){this.enabled=false},toggleEnabled:function(){this.enabled=!this.enabled}};a.fn.tipsy=function(b){function e(c){var e=a.data(c,"tipsy");if(!e){e=new d(c,a.fn.tipsy.elementOptions(c,b));a.data(c,"tipsy",e)}return e}function f(){var a=e(this);a.hoverState="in";if(b.delayIn==0){a.show()}else{a.fixTitle();setTimeout(function(){if(a.hoverState=="in")a.show()},b.delayIn)}}function g(){var a=e(this);a.hoverState="out";if(b.delayOut==0){a.hide()}else{setTimeout(function(){if(a.hoverState=="out")a.hide()},b.delayOut)}}if(b===true){return this.data("tipsy")}else if(typeof b=="string"){var c=this.data("tipsy");if(c)c[b]();return this}b=a.extend({},a.fn.tipsy.defaults,b);if(!b.live)this.each(function(){e(this)});if(b.trigger!="manual"){var h=b.live?"on":"bind",i=b.trigger=="hover"?"mouseenter":"focus",j=b.trigger=="hover"?"mouseleave":"blur";this[h](i,f)[h](j,g)}return this};a.fn.tipsy.defaults={className:null,delayIn:0,delayOut:0,fade:false,fallback:"",gravity:"n",html:false,live:false,offset:0,opacity:.8,title:"title",trigger:"hover"};a.fn.tipsy.revalidate=function(){a(".tipsy").each(function(){var b=a.data(this,"tipsy-pointee");if(!b||!c(b)){a(this).remove()}})};a.fn.tipsy.elementOptions=function(b,c){return a.metadata?a.extend({},c,a(b).metadata()):c};a.fn.tipsy.autoNS=function(){return a(this).offset().top>a(document).scrollTop()+a(window).height()/2?"s":"n"};a.fn.tipsy.autoWE=function(){return a(this).offset().left>a(document).scrollLeft()+a(window).width()/2?"e":"w"};a.fn.tipsy.autoBounds=function(b,c){return function(){var d={ns:c[0],ew:c.length>1?c[1]:false},e=a(document).scrollTop()+b,f=a(document).scrollLeft()+b,g=a(this);if(g.offset().top<e)d.ns="n";if(g.offset().left<f)d.ew="w";if(a(window).width()+a(document).scrollLeft()-g.offset().left<b)d.ew="e";if(a(window).height()+a(document).scrollTop()-g.offset().top<b)d.ns="s";return d.ns+(d.ew?d.ew:"")}}})(jQuery)


exports.handleClientMessage_NEW_CHANGES = function(hook, context, callback) {
	var connectedUsers = pad.collabClient.getConnectedUsers(),
		userWhoMakeChange = $.grep(connectedUsers, function(i) {
			return i.userId == context.original_msg.author;
		});

	if (userWhoMakeChange.length) addHistoricalUserToSidebar(userWhoMakeChange[0]);
};
exports.handleClientMessage_USER_NEWINFO = function(hook, context, callback) {
	var user = context.original_msg.userInfo,
		$userBlock = $(parent.$('#pad-authors .'+user.userId.replace('.', '-')+' .pad-user'));

	$userBlock.css('border-left', '5px solid '+(/^#/.test(user.colorId) ? user.colorId : clientVars.colorPalette[user.colorId]));
	if (user.name) $userBlock.html(user.name);
};
exports.handleClientMessage_CHAT_MESSAGE = function(hook, context, callback) {
	if (parent.top.ggouv !== undefined) parent.top.ggouv.notify();
};

