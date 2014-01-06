var eejs = require("ep_etherpad-lite/node/eejs");

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