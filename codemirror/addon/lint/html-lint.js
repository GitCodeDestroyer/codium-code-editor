// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Depends on htmlhint.js from http://htmlhint.com/js/htmlhint.js

// declare global: HTMLHint

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("htmlhint"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "htmlhint"], mod);
  else // Plain browser env
    mod(CodeMirror, window.HTMLHint);
})(function(CodeMirror, HTMLHint) {
  "use strict";

  var defaultRules = {
  "tagname-lowercase": false,
  "attr-lowercase": false,
  "attr-value-double-quotes": false,
  "doctype-first": false,
  "tag-pair": true,
  "spec-char-escape": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true,
  "title-require": true,
  "head-script-disabled": true,
  "alt-require": true,
  "attr-value-not-empty": false,
  "space-tab-mixed-disabled": "true",
  "attr-unsafe-chars": true,
  "href-abs-or-rel": false,
  "id-class-ad-disabled": true,
  "inline-script-disabled": false,
  "inline-style-disabled": false,
  "style-disabled": false,
  "id-class-value": "underline",
  "doctype-html5": true,
  "tag-self-close": false
};

  CodeMirror.registerHelper("lint", "html", function(text, options) {
    var found = [];
    if (HTMLHint && !HTMLHint.verify) HTMLHint = HTMLHint.HTMLHint;
    if (!HTMLHint) HTMLHint = window.HTMLHint;
    if (!HTMLHint) {
      if (window.console) {
          window.console.error("Error: HTMLHint not found, not defined on window, or not available through define/require, CodeMirror HTML linting cannot run.");
      }
      return found;
    }
    var messages = HTMLHint.verify(text, options && options.rules || defaultRules);
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      var startLine = message.line - 1, endLine = message.line - 1, startCol = message.col - 1, endCol = message.col;
      found.push({
        from: CodeMirror.Pos(startLine, startCol),
        to: CodeMirror.Pos(endLine, endCol),
        message: message.message,
        severity : message.type
      });
    }
    return found;
  });
});
