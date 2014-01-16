if(typeof exports == 'undefined'){
	var exports = this['mymodule'] = {};
}
tags = ['tasklist-not-done', 'tasklist-done'];

var underscore = require('ep_etherpad-lite/static/js/underscore'),

	/* Include the Security module, we will use this later to escape a HTML attribute*/
	Security = require('ep_etherpad-lite/static/js/security.js'),

	/* Define the regular expressions we will use to detect if a string looks like a reference to a pad IE [[foo]] */
	UserHrefRegexp = new RegExp(/\B([@!\#][A-Za-z0-9_]+)/g),
	padEditor,

	/* Take the string and remove the first and last 2 characters IE [[foo]] returns foo */
	linkSanitizingFn = function(result) {
		if (!result) return result;
		result.index = result.index + 0;
		var s = result[0];
		result[0] = s
			.substr(0,s.length) // Skip the first two char
			.replace(/\s+/g, ''); // Every space will be replaced by nothing
		return result;
	},

	/* Define a custom regular expression object */
	CustomRegexp = function(regexp, sanitizeResultFn) {
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
		hashtag,
		cls = context.cls;

	if (cls.indexOf('externalHref') >= 0) { // if it already has the class of externalHref
		cls = cls.replace(/(^| )externalHref:(\S+)/g, function(x0, space, url) {
			if (url.indexOf('@') == 0) userMention = url.replace('@', '');
			if (url.indexOf('!') == 0) groupMention = url.replace('!', '');
			if (url.indexOf('#') == 0) hashtag = url.replace('#', '');
			return space + "url";
		});
	}
	if (userMention) {
		return [{
			extraOpenTags: '<mention onclick="parent.top.elgg.deck_river.userPopup(\'' + Security.escapeHTMLAttribute(userMention) +'\');" class="ggouv-mention">',
			extraCloseTags: '</mention>',
			cls: cls
		}];
	}
	if (groupMention) {
		return [{
			extraOpenTags: '<mention onclick="parent.top.elgg.deck_river.groupPopup(\'' + Security.escapeHTMLAttribute(groupMention) +'\');" class="ggouv-mention">',
			extraCloseTags: '</mention>',
			cls: cls
		}];
	}
	if (hashtag) {
		return [{
			extraOpenTags: '<mention onclick="parent.top.elgg.deck_river.hashtagPopup(\'' + Security.escapeHTMLAttribute(hashtag) +'\', \'elgg\');" class="ggouv-hashtag">',
			extraCloseTags: '</mention>',
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
	return ['ep_ggouv/static/css/ace.css'];
}

exports.aceEditEvent = function(hook, context) {
	if (!context.callstack.docTextChanged) return false; // we should only run this if the pad contents is changed...

	var $pt = parent.top;

	if (typeof $pt.elgg != 'undefined' && context.callstack.domClean) {// && context.callstack.type != "setBaseText") {
		var date = ($.inArray(context.callstack.type, ['setup', 'setBaseText']) > -1) ? new Date(clientVars.collab_client_vars.time) : new Date(),
			timestamp = date.getTime()/1000,
			revCount = pad.getCollabRevisionNumber(),
			revString = revCount+' '+html10n.get('ggouv.count.revision'+(revCount <= 1 ? '':'s')),
			savedRev = clientVars.savedRevisions.length,
			savedRevString = savedRev ? ' — '+savedRev+' '+html10n.get('ggouv.count.savedRevision'+(savedRev == 1 ? '':'s')) : '';

		$pt.$('#pad-revisions-count').html(revString+savedRevString);
		$pt.$('#pad-infos').removeClass('hidden').find('acronym').html($pt.elgg.friendly_time(timestamp)).attr({
			time: timestamp,
			'original-title': $pt.$.datepicker.formatDate('D dd M yy', date)+' '+$pt.elgg.echo('at')+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
		});

		// add me if first time
		if (context.callstack.type != "setBaseText") addHistoricalUserToSidebar(pad.myUserInfo);
	}

	// live preview
	if (typeof $pt.elgg != 'undefined' && $pt.$('#md-preview-pad').is(":visible")) {
		$pt.$('#md-preview-pad').html($pt.elgg.markdown_wiki.ShowdownConvert(context.rep.alltext));
	}
}

addHistoricalUserToSidebar = function(user) {
	var $pt = parent.top,
		$pa = $pt.$('#pad-authors').removeClass('hidden'),
		authors = $pa.data('authors') || [],
		alreadyHere = $.grep(authors, function(i) {
			return i.userId == user.userId;
		});
	if (!alreadyHere.length && $pa.length) {
		// store new user in data
		authors.push(user);
		$pa.data('authors', authors);

		// check if image is avaible. Prevent custom user not registred in ggouv.
		var img = new Image(),
			addUser = function(imgSrc) {
				var userName = user.name || html10n.get('pad.userlist.unnamed');

				$pa.find('.elgg-body ul').append(
					$('<li>',{
						'class': 'elgg-avatar elgg-avatar-small '+ user.userId.replace('.', '-'),
						html: $('<div>',{
							'class': imgSrc ? 'elgg-user-info-popup info-popup ui-draggable' : '',
							title: userName,
							html: $('<img>',{
								src: imgSrc ? imgSrc : $pt.elgg.get_site_url()+'_graphics/icons/user/defaulttiny.gif',
								alt: userName,
								title: userName,
								'class': 'float'
							}).add($('<div>',{
								html: userName,
								style: 'border-left:5px solid '+(/^#/.test(user.colorId) ? user.colorId : clientVars.colorPalette[user.colorId])+';',
								'class': 'pad-user float'+(imgSrc?'':' anonym')
							}))
						})
					})
				);
			};

		img.src = $pt.elgg.get_site_url()+'avatar/user/'+user.name+'/tiny';
		img.onload = function() {
			addUser(img.src);
		};
		img.onerror = function() {
			addUser(false);
		};
	}

};




exports.postAceInit = function(hook, context) {

	$.each(clientVars.collab_client_vars.historicalAuthorData, function(e, a) {
		addHistoricalUserToSidebar($.extend(a, {userId: e}));
	})

	// tasklist
	$('#tasklist').insertAfter('#outdent').show().click(function() { // apply attribtes when we click the editbar button
		context.ace.callWithAce(function(ace) { // call the function to apply the attribute inside ACE
			ace.ace_doInsertTaskList();
		}, 'tasklist', true); // TODO what's the second attribute do here?
	});
	context.ace.callWithAce(function(ace) {
		var doc = ace.ace_getDocument();
		$(doc).find('#innerdocbody').on('click', underscore(exports.tasklist.doUpdateTaskList).bind(ace));
	}, 'tasklist', true);

	// group clearAuthorship and signature
	$('#clearAuthorship').insertBefore('#insertSignature').children().attr('class', 'grouped-left');

	// popup on user list
	if (context.pad.myUserInfo.name !== undefined && context.pad.myUserInfo.name !== '') {
		$('#myusernameedit').addClass('noedit').attr('readonly', true);
	}
	var pop = function(user) {
		var $pt = parent.top;

		if (typeof $pt.elgg != 'undefined') {
			$pt.elgg.deck_river.userPopup(user);
			$pt.$('#user-info-popup').css('top', '80px'); // prevent default on close click popup when popup is over pad iframe
		}
	};

	$('#myusernameedit.noedit').on('click', function() {
		pop($(this).blur().val());
		return false;
	});
	$('#otheruserstable').on('click', 'td', function() {
		var user = $(this).html();

		if (user.slice(0,1) == '<') return false;
		pop($(this).html());
	});

	//document.domain = '127.0.0.1';
	document.domain = 'http://ggouv.fr';

}













/***
*
* Most of the logic for task lists are done here
*
*/
exports.tasklist = {

	/***
	*
	*  Toggle if some text is or aren't a task list
	*
	***/

	doInsertTaskList: function(){
		var rep = this.rep;
		var documentAttributeManager = this.documentAttributeManager;
		if (!(rep.selStart && rep.selEnd)){ return; } // only continue if we have some caret position
		var firstLine = rep.selStart[0]; // Get the first line
		var lastLine = Math.max(firstLine, rep.selEnd[0] - ((rep.selEnd[1] === 0) ? 1 : 0)); // Get the last line
		underscore(underscore.range(firstLine, lastLine + 1)).each(function(i){ // For each line, either turn on or off task list
			var istasklist = documentAttributeManager.getAttributeOnLine(i, 'tasklist-not-done');
			if(!istasklist){ // if its already a tasklist item
				documentAttributeManager.setAttributeOnLine(i, 'tasklist-not-done', 'tasklist-not-done'); // make the line a task list
			}else{
				documentAttributeManager.removeAttributeOnLine(i, 'tasklist-not-done'); // remove the task list from the line
			}
		});
	},


	/***
	*
	*  Toggle a task as done/not done -- called by ace_inner.js
	*
	***/

	doToggleTaskListItem: function(){
		var rep = this.rep;
		var documentAttributeManager = this.documentAttributeManager;
		var isDone = documentAttributeManager.getAttributeOnLine(rep.selEnd[0], 'tasklist-done');
		if(isDone){
			documentAttributeManager.removeAttributeOnLine(rep.selEnd[0], 'tasklist-done'); // remove the task list from the line
			documentAttributeManager.setAttributeOnLine(rep.selEnd[0], 'tasklist-not-done', 'tasklist-not-done'); // make it undone
		}else{
			documentAttributeManager.removeAttributeOnLine(rep.selEnd[0], 'tasklist-not-done'); // remove the task list from the line
			documentAttributeManager.setAttributeOnLine(rep.selEnd[0], 'tasklist-done', 'tasklist-done'); // make it done
		}

	},


	/***
	*
	*  Is it a task list item and has the checkbox been clicked?
	*
	***/

	doUpdateTaskList: function(event){ // This is in the wrong context to access doc attr manager
		var ace = this;
		var target = event.target;
		var isTaskList = ($(target).hasClass("tasklist-not-done") || $(target).hasClass("tasklist-done"));
		var targetRight = event.target.offsetLeft + 14; // The right hand side of the checkbox -- remember the checkbox can be indented
		var isCheckbox = (event.pageX < targetRight); // was the click to the left of the checkbox
		if(!isTaskList || !isCheckbox){ return; } // Dont continue if we're not clicking a checkbox of a tasklist
		padEditor.callWithAce(function(ace){ // call the function to apply the attribute inside ACE
			ace.ace_doToggleTaskListItem();
		}, 'tasklist', true); // TODO what's the second attribute do here?
	}
};


/***
 *
 *  Once ace is initialized, we bind the functions to the context
 *
 ***/

exports.aceInitialized = function(hook, context) {
	var editorInfo = context.editorInfo;
	editorInfo.ace_doInsertTaskList = underscore(exports.tasklist.doInsertTaskList).bind(context); // What does underscore do here?
	editorInfo.ace_doToggleTaskListItem = underscore(exports.tasklist.doToggleTaskListItem).bind(context); // TODO
	padEditor = context.editorInfo.editor;
};


/***
 *
 *  Add the Javascript to Ace inner head, this is for the onClick listener
 *
 ***/
exports.aceDomLineProcessLineAttributes = function(name, context){
	if (context.cls.indexOf("tasklist-not-done") !== -1) var type = "tasklist-not-done";
	if (context.cls.indexOf("tasklist-done") !== -1) var type = "tasklist-done";
	var tagIndex = context.cls.indexOf(type);

	if (tagIndex !== undefined && type){
		var tag = tags[tagIndex],
			modifier = {
				preHtml: '<li class="'+type+'"">',
				postHtml: '</li>',
				processedMarker: true
			};
		return [modifier]; // return the modifier
	}
	return []; // or return nothing
};


/***
 *
 * Turn attributes into classes
 *
 ***/
exports.aceAttribsToClasses = function(hook, context){
	if (context.key == 'tasklist-not-done' || context.key == 'tasklist-done') return [context.value];
};

