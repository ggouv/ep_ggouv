// javascript use by server and client : shared.

var collectContentPre = function(hook, context){
	var tname = context.cls,
		state = context.state,
		lineAttributes = state.lineAttributes

	var tagIndex = tname.indexOf("tasklist-not-done");
	if(tagIndex !== -1){
		lineAttributes['tasklist-not-done'] = tags[tagIndex];
	}

	tagIndex = tname.indexOf("tasklist-done");
	if(tagIndex !== -1){
		lineAttributes['tasklist-done'] = tags[tagIndex];
	}
};

var collectContentPost = function(hook, context){
	var tname = context.tname,
		state = context.state,
		lineAttributes = state.lineAttributes

	if (tname.indexOf("tasklist-not-done") >= 0){
		delete lineAttributes['tasklist-not-done'];
	}

	if (tname.indexOf("tasklist-done") >= 0){
		delete lineAttributes['tasklist-done'];
	}
};

exports.collectContentPre = collectContentPre;
exports.collectContentPost = collectContentPost;
