function run_tests() {
	var st = new SanityTest;
	run_javascript_tests(st, Urlencoded, js_beautify, html_beautify, css_beautify), run_css_tests(st, Urlencoded, js_beautify, html_beautify, css_beautify), run_html_tests(st, Urlencoded, js_beautify, html_beautify, css_beautify), JavascriptObfuscator.run_tests(st), P_A_C_K_E_R.run_tests(st), Urlencoded.run_tests(st), MyObfuscate.run_tests(st);
	var results = st.results_raw().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;").replace(/\r/g, "·").replace(/\n/g, "<br>");
	$("#testresults").html(results).show()
}

function any(a, b) {
	return a || b
}

function unpacker_filter(source) {
	var trailing_comments = "",
		comment = "",
		unpacked = "",
		found = !1;
	do found = !1, /^\s*\/\*/.test(source) ? (found = !0, comment = source.substr(0, source.indexOf("*/") + 2), source = source.substr(comment.length).replace(/^\s+/, ""), trailing_comments += comment + "\n") : /^\s*\/\//.test(source) && (found = !0, comment = source.match(/^\s*\/\/.*/)[0], source = source.substr(comment.length).replace(/^\s+/, ""), trailing_comments += comment + "\n"); while (found);
	for (var unpackers = [P_A_C_K_E_R, Urlencoded, MyObfuscate], i = 0; i < unpackers.length; i++) unpackers[i].detect(source) && (unpacked = unpackers[i].unpack(source), unpacked != source && (source = unpacker_filter(unpacked)));
	return trailing_comments + source
}

function beautify(editor, code) {
	beautify_in_progress = !0;
	var output, source = editor ? editor.getValue() : code.val(),
		opts = {};
	opts.indent_size = $(".size-value").val(),
	opts.indent_with_tabs = true,
	opts.indent_char = 1 == opts.indent_size ? "	" : " ",
	opts.max_preserve_newlines = 5,
	opts.preserve_newlines = "-1" !== opts.max_preserve_newlines,
	opts.keep_array_indentation = !0,
	opts.break_chained_methods = !0,
	opts.indent_scripts = "normal",
	opts.brace_style = "end-expand",
	opts.space_before_conditional = !0,
	opts.unescape_strings = !1,
	opts.jslint_happy = !0,
	opts.end_with_newline = !0,
	opts.wrap_line_length = 0,
	1 == inDisplayLang ? output = html_beautify(source, opts) : 2 == inDisplayLang ? (source = unpacker_filter(source),
		output = css_beautify(source, opts)) : 3 == inDisplayLang && (source = unpacker_filter(source),
		output = js_beautify(source, opts)),
	editor ? editor.setValue(output) : code.val(output),
	beautify_in_progress = !1
}

function looks_like_html(source) {
	var trimmed = source.replace(/^[ \t\n\r]+/, ""),
		comment_mark = "<!--";
	return trimmed && "<" === trimmed.substring(0, 1) && trimmed.substring(0, 4) !== comment_mark
}! function(global, factory) {
	"object" == typeof exports && "undefined" != typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define(factory) : global.CodeMirror = factory()
}(this, function() {
	"use strict";

	function classTest(cls) {
		return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*")
	}

	function removeChildren(e) {
		for (var count = e.childNodes.length; count > 0; --count) e.removeChild(e.firstChild);
		return e
	}

	function removeChildrenAndAdd(parent, e) {
		return removeChildren(parent).appendChild(e)
	}

	function elt(tag, content, className, style) {
		var e = document.createElement(tag);
		if (className && (e.className = className), style && (e.style.cssText = style), "string" == typeof content) e.appendChild(document.createTextNode(content));
		else if (content)
			for (var i = 0; i < content.length; ++i) e.appendChild(content[i]);
		return e
	}

	function eltP(tag, content, className, style) {
		var e = elt(tag, content, className, style);
		return e.setAttribute("role", "presentation"), e
	}

	function contains(parent, child) {
		if (3 == child.nodeType && (child = child.parentNode), parent.contains) return parent.contains(child);
		do
			if (11 == child.nodeType && (child = child.host), child == parent) return !0; while (child = child.parentNode)
	}

	function activeElt() {
		var activeElement;
		try {
			activeElement = document.activeElement
		} catch (e) {
			activeElement = document.body || null
		}
		for (; activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement;) activeElement = activeElement.shadowRoot.activeElement;
		return activeElement
	}

	function addClass(node, cls) {
		var current = node.className;
		classTest(cls).test(current) || (node.className += (current ? " " : "") + cls)
	}

	function joinClasses(a, b) {
		for (var as = a.split(" "), i = 0; i < as.length; i++) as[i] && !classTest(as[i]).test(b) && (b += " " + as[i]);
		return b
	}

	function bind(f) {
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			return f.apply(null, args)
		}
	}

	function copyObj(obj, target, overwrite) {
		target || (target = {});
		for (var prop in obj) !obj.hasOwnProperty(prop) || overwrite === !1 && target.hasOwnProperty(prop) || (target[prop] = obj[prop]);
		return target
	}

	function countColumn(string, end, tabSize, startIndex, startValue) {
		null == end && (end = string.search(/[^\s\u00a0]/), -1 == end && (end = string.length));
		for (var i = startIndex || 0, n = startValue || 0;;) {
			var nextTab = string.indexOf("	", i);
			if (0 > nextTab || nextTab >= end) return n + (end - i);
			n += nextTab - i, n += tabSize - n % tabSize, i = nextTab + 1
		}
	}

	function indexOf(array, elt) {
		for (var i = 0; i < array.length; ++i)
			if (array[i] == elt) return i;
		return -1
	}

	function findColumn(string, goal, tabSize) {
		for (var pos = 0, col = 0;;) {
			var nextTab = string.indexOf("	", pos); - 1 == nextTab && (nextTab = string.length);
			var skipped = nextTab - pos;
			if (nextTab == string.length || col + skipped >= goal) return pos + Math.min(skipped, goal - col);
			if (col += nextTab - pos, col += tabSize - col % tabSize, pos = nextTab + 1, col >= goal) return pos
		}
	}

	function spaceStr(n) {
		for (; spaceStrs.length <= n;) spaceStrs.push(lst(spaceStrs) + " ");
		return spaceStrs[n]
	}

	function lst(arr) {
		return arr[arr.length - 1]
	}

	function map(array, f) {
		for (var out = [], i = 0; i < array.length; i++) out[i] = f(array[i], i);
		return out
	}

	function insertSorted(array, value, score) {
		for (var pos = 0, priority = score(value); pos < array.length && score(array[pos]) <= priority;) pos++;
		array.splice(pos, 0, value)
	}

	function nothing() {}

	function createObj(base, props) {
		var inst;
		return Object.create ? inst = Object.create(base) : (nothing.prototype = base, inst = new nothing), props && copyObj(props, inst), inst
	}

	function isWordCharBasic(ch) {
		return /\w/.test(ch) || ch > "" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
	}

	function isWordChar(ch, helper) {
		return helper ? helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch) ? !0 : helper.test(ch) : isWordCharBasic(ch)
	}

	function isEmpty(obj) {
		for (var n in obj)
			if (obj.hasOwnProperty(n) && obj[n]) return !1;
		return !0
	}

	function isExtendingChar(ch) {
		return ch.charCodeAt(0) >= 768 && extendingChars.test(ch)
	}

	function skipExtendingChars(str, pos, dir) {
		for (;
			(0 > dir ? pos > 0 : pos < str.length) && isExtendingChar(str.charAt(pos));) pos += dir;
		return pos
	}

	function findFirst(pred, from, to) {
		for (var dir = from > to ? -1 : 1;;) {
			if (from == to) return from;
			var midF = (from + to) / 2,
				mid = 0 > dir ? Math.ceil(midF) : Math.floor(midF);
			if (mid == from) return pred(mid) ? from : to;
			pred(mid) ? to = mid : from = mid + dir
		}
	}

	function Display(place, doc, input) {
		var d = this;
		this.input = input, d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler"), d.scrollbarFiller.setAttribute("cm-not-content", "true"), d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler"), d.gutterFiller.setAttribute("cm-not-content", "true"), d.lineDiv = eltP("div", null, "CodeMirror-code"), d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1"), d.cursorDiv = elt("div", null, "CodeMirror-cursors"), d.measure = elt("div", null, "CodeMirror-measure"), d.lineMeasure = elt("div", null, "CodeMirror-measure"), d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv], null, "position: relative; outline: none");
		var lines = eltP("div", [d.lineSpace], "CodeMirror-lines");
		d.mover = elt("div", [lines], null, "position: relative"), d.sizer = elt("div", [d.mover], "CodeMirror-sizer"), d.sizerWidth = null, d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;"), d.gutters = elt("div", null, "CodeMirror-gutters"), d.lineGutter = null, d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll"), d.scroller.setAttribute("tabIndex", "-1"), d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror"), ie && 8 > ie_version && (d.gutters.style.zIndex = -1, d.scroller.style.paddingRight = 0), webkit || gecko && mobile || (d.scroller.draggable = !0), place && (place.appendChild ? place.appendChild(d.wrapper) : place(d.wrapper)), d.viewFrom = d.viewTo = doc.first, d.reportedViewFrom = d.reportedViewTo = doc.first, d.view = [], d.renderedView = null, d.externalMeasured = null, d.viewOffset = 0, d.lastWrapHeight = d.lastWrapWidth = 0, d.updateLineNumbers = null, d.nativeBarWidth = d.barHeight = d.barWidth = 0, d.scrollbarsClipped = !1, d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null, d.alignWidgets = !1, d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null, d.maxLine = null, d.maxLineLength = 0, d.maxLineChanged = !1, d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null, d.shift = !1, d.selForContextMenu = null, d.activeTouch = null, input.init(d)
	}

	function getLine(doc, n) {
		if (n -= doc.first, 0 > n || n >= doc.size) throw new Error("There is no line " + (n + doc.first) + " in the document.");
		for (var chunk = doc; !chunk.lines;)
			for (var i = 0;; ++i) {
				var child = chunk.children[i],
					sz = child.chunkSize();
				if (sz > n) {
					chunk = child;
					break
				}
				n -= sz
			}
		return chunk.lines[n]
	}

	function getBetween(doc, start, end) {
		var out = [],
			n = start.line;
		return doc.iter(start.line, end.line + 1, function(line) {
			var text = line.text;
			n == end.line && (text = text.slice(0, end.ch)), n == start.line && (text = text.slice(start.ch)), out.push(text), ++n
		}), out
	}

	function getLines(doc, from, to) {
		var out = [];
		return doc.iter(from, to, function(line) {
			out.push(line.text)
		}), out
	}

	function updateLineHeight(line, height) {
		var diff = height - line.height;
		if (diff)
			for (var n = line; n; n = n.parent) n.height += diff
	}

	function lineNo(line) {
		if (null == line.parent) return null;
		for (var cur = line.parent, no = indexOf(cur.lines, line), chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent)
			for (var i = 0; chunk.children[i] != cur; ++i) no += chunk.children[i].chunkSize();
		return no + cur.first
	}

	function lineAtHeight(chunk, h) {
		var n = chunk.first;
		outer: do {
			for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
				var child = chunk.children[i$1],
					ch = child.height;
				if (ch > h) {
					chunk = child;
					continue outer
				}
				h -= ch, n += child.chunkSize()
			}
			return n
		} while (!chunk.lines);
		for (var i = 0; i < chunk.lines.length; ++i) {
			var line = chunk.lines[i],
				lh = line.height;
			if (lh > h) break;
			h -= lh
		}
		return n + i
	}

	function isLine(doc, l) {
		return l >= doc.first && l < doc.first + doc.size
	}

	function lineNumberFor(options, i) {
		return String(options.lineNumberFormatter(i + options.firstLineNumber))
	}

	function Pos(line, ch, sticky) {
		return void 0 === sticky && (sticky = null), this instanceof Pos ? (this.line = line, this.ch = ch, void(this.sticky = sticky)) : new Pos(line, ch, sticky)
	}

	function cmp(a, b) {
		return a.line - b.line || a.ch - b.ch
	}

	function equalCursorPos(a, b) {
		return a.sticky == b.sticky && 0 == cmp(a, b)
	}

	function copyPos(x) {
		return Pos(x.line, x.ch)
	}

	function maxPos(a, b) {
		return cmp(a, b) < 0 ? b : a
	}

	function minPos(a, b) {
		return cmp(a, b) < 0 ? a : b
	}

	function clipLine(doc, n) {
		return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1))
	}

	function clipPos(doc, pos) {
		if (pos.line < doc.first) return Pos(doc.first, 0);
		var last = doc.first + doc.size - 1;
		return pos.line > last ? Pos(last, getLine(doc, last).text.length) : clipToLen(pos, getLine(doc, pos.line).text.length)
	}

	function clipToLen(pos, linelen) {
		var ch = pos.ch;
		return null == ch || ch > linelen ? Pos(pos.line, linelen) : 0 > ch ? Pos(pos.line, 0) : pos
	}

	function clipPosArray(doc, array) {
		for (var out = [], i = 0; i < array.length; i++) out[i] = clipPos(doc, array[i]);
		return out
	}

	function seeReadOnlySpans() {
		sawReadOnlySpans = !0
	}

	function seeCollapsedSpans() {
		sawCollapsedSpans = !0
	}

	function MarkedSpan(marker, from, to) {
		this.marker = marker, this.from = from, this.to = to
	}

	function getMarkedSpanFor(spans, marker) {
		if (spans)
			for (var i = 0; i < spans.length; ++i) {
				var span = spans[i];
				if (span.marker == marker) return span
			}
	}

	function removeMarkedSpan(spans, span) {
		for (var r, i = 0; i < spans.length; ++i) spans[i] != span && (r || (r = [])).push(spans[i]);
		return r
	}

	function addMarkedSpan(line, span) {
		line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span], span.marker.attachLine(line)
	}

	function markedSpansBefore(old, startCh, isInsert) {
		var nw;
		if (old)
			for (var i = 0; i < old.length; ++i) {
				var span = old[i],
					marker = span.marker,
					startsBefore = null == span.from || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
				if (startsBefore || span.from == startCh && "bookmark" == marker.type && (!isInsert || !span.marker.insertLeft)) {
					var endsAfter = null == span.to || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
					(nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to))
				}
			}
		return nw
	}

	function markedSpansAfter(old, endCh, isInsert) {
		var nw;
		if (old)
			for (var i = 0; i < old.length; ++i) {
				var span = old[i],
					marker = span.marker,
					endsAfter = null == span.to || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
				if (endsAfter || span.from == endCh && "bookmark" == marker.type && (!isInsert || span.marker.insertLeft)) {
					var startsBefore = null == span.from || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
					(nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh, null == span.to ? null : span.to - endCh))
				}
			}
		return nw
	}

	function stretchSpansOverChange(doc, change) {
		if (change.full) return null;
		var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans,
			oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
		if (!oldFirst && !oldLast) return null;
		var startCh = change.from.ch,
			endCh = change.to.ch,
			isInsert = 0 == cmp(change.from, change.to),
			first = markedSpansBefore(oldFirst, startCh, isInsert),
			last = markedSpansAfter(oldLast, endCh, isInsert),
			sameLine = 1 == change.text.length,
			offset = lst(change.text).length + (sameLine ? startCh : 0);
		if (first)
			for (var i = 0; i < first.length; ++i) {
				var span = first[i];
				if (null == span.to) {
					var found = getMarkedSpanFor(last, span.marker);
					found ? sameLine && (span.to = null == found.to ? null : found.to + offset) : span.to = startCh
				}
			}
		if (last)
			for (var i$1 = 0; i$1 < last.length; ++i$1) {
				var span$1 = last[i$1];
				if (null != span$1.to && (span$1.to += offset), null == span$1.from) {
					var found$1 = getMarkedSpanFor(first, span$1.marker);
					found$1 || (span$1.from = offset, sameLine && (first || (first = [])).push(span$1))
				} else span$1.from += offset, sameLine && (first || (first = [])).push(span$1)
			}
		first && (first = clearEmptySpans(first)), last && last != first && (last = clearEmptySpans(last));
		var newMarkers = [first];
		if (!sameLine) {
			var gapMarkers, gap = change.text.length - 2;
			if (gap > 0 && first)
				for (var i$2 = 0; i$2 < first.length; ++i$2) null == first[i$2].to && (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null));
			for (var i$3 = 0; gap > i$3; ++i$3) newMarkers.push(gapMarkers);
			newMarkers.push(last)
		}
		return newMarkers
	}

	function clearEmptySpans(spans) {
		for (var i = 0; i < spans.length; ++i) {
			var span = spans[i];
			null != span.from && span.from == span.to && span.marker.clearWhenEmpty !== !1 && spans.splice(i--, 1)
		}
		return spans.length ? spans : null
	}

	function removeReadOnlyRanges(doc, from, to) {
		var markers = null;
		if (doc.iter(from.line, to.line + 1, function(line) {
				if (line.markedSpans)
					for (var i = 0; i < line.markedSpans.length; ++i) {
						var mark = line.markedSpans[i].marker;
						!mark.readOnly || markers && -1 != indexOf(markers, mark) || (markers || (markers = [])).push(mark)
					}
			}), !markers) return null;
		for (var parts = [{
				from: from,
				to: to
			}], i = 0; i < markers.length; ++i)
			for (var mk = markers[i], m = mk.find(0), j = 0; j < parts.length; ++j) {
				var p = parts[j];
				if (!(cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0)) {
					var newParts = [j, 1],
						dfrom = cmp(p.from, m.from),
						dto = cmp(p.to, m.to);
					(0 > dfrom || !mk.inclusiveLeft && !dfrom) && newParts.push({
						from: p.from,
						to: m.from
					}), (dto > 0 || !mk.inclusiveRight && !dto) && newParts.push({
						from: m.to,
						to: p.to
					}), parts.splice.apply(parts, newParts), j += newParts.length - 3
				}
			}
		return parts
	}

	function detachMarkedSpans(line) {
		var spans = line.markedSpans;
		if (spans) {
			for (var i = 0; i < spans.length; ++i) spans[i].marker.detachLine(line);
			line.markedSpans = null
		}
	}

	function attachMarkedSpans(line, spans) {
		if (spans) {
			for (var i = 0; i < spans.length; ++i) spans[i].marker.attachLine(line);
			line.markedSpans = spans
		}
	}

	function extraLeft(marker) {
		return marker.inclusiveLeft ? -1 : 0
	}

	function extraRight(marker) {
		return marker.inclusiveRight ? 1 : 0
	}

	function compareCollapsedMarkers(a, b) {
		var lenDiff = a.lines.length - b.lines.length;
		if (0 != lenDiff) return lenDiff;
		var aPos = a.find(),
			bPos = b.find(),
			fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
		if (fromCmp) return -fromCmp;
		var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
		return toCmp ? toCmp : b.id - a.id
	}

	function collapsedSpanAtSide(line, start) {
		var found, sps = sawCollapsedSpans && line.markedSpans;
		if (sps)
			for (var sp = void 0, i = 0; i < sps.length; ++i) sp = sps[i], sp.marker.collapsed && null == (start ? sp.from : sp.to) && (!found || compareCollapsedMarkers(found, sp.marker) < 0) && (found = sp.marker);
		return found
	}

	function collapsedSpanAtStart(line) {
		return collapsedSpanAtSide(line, !0)
	}

	function collapsedSpanAtEnd(line) {
		return collapsedSpanAtSide(line, !1)
	}

	function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
		var line = getLine(doc, lineNo),
			sps = sawCollapsedSpans && line.markedSpans;
		if (sps)
			for (var i = 0; i < sps.length; ++i) {
				var sp = sps[i];
				if (sp.marker.collapsed) {
					var found = sp.marker.find(0),
						fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker),
						toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
					if (!(fromCmp >= 0 && 0 >= toCmp || 0 >= fromCmp && toCmp >= 0) && (0 >= fromCmp && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) || fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0))) return !0
				}
			}
	}

	function visualLine(line) {
		for (var merged; merged = collapsedSpanAtStart(line);) line = merged.find(-1, !0).line;
		return line
	}

	function visualLineEnd(line) {
		for (var merged; merged = collapsedSpanAtEnd(line);) line = merged.find(1, !0).line;
		return line
	}

	function visualLineContinued(line) {
		for (var merged, lines; merged = collapsedSpanAtEnd(line);) line = merged.find(1, !0).line, (lines || (lines = [])).push(line);
		return lines
	}

	function visualLineNo(doc, lineN) {
		var line = getLine(doc, lineN),
			vis = visualLine(line);
		return line == vis ? lineN : lineNo(vis)
	}

	function visualLineEndNo(doc, lineN) {
		if (lineN > doc.lastLine()) return lineN;
		var merged, line = getLine(doc, lineN);
		if (!lineIsHidden(doc, line)) return lineN;
		for (; merged = collapsedSpanAtEnd(line);) line = merged.find(1, !0).line;
		return lineNo(line) + 1
	}

	function lineIsHidden(doc, line) {
		var sps = sawCollapsedSpans && line.markedSpans;
		if (sps)
			for (var sp = void 0, i = 0; i < sps.length; ++i)
				if (sp = sps[i], sp.marker.collapsed) {
					if (null == sp.from) return !0;
					if (!sp.marker.widgetNode && 0 == sp.from && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp)) return !0
				}
	}

	function lineIsHiddenInner(doc, line, span) {
		if (null == span.to) {
			var end = span.marker.find(1, !0);
			return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker))
		}
		if (span.marker.inclusiveRight && span.to == line.text.length) return !0;
		for (var sp = void 0, i = 0; i < line.markedSpans.length; ++i)
			if (sp = line.markedSpans[i], sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to && (null == sp.to || sp.to != span.from) && (sp.marker.inclusiveLeft || span.marker.inclusiveRight) && lineIsHiddenInner(doc, line, sp)) return !0
	}

	function heightAtLine(lineObj) {
		lineObj = visualLine(lineObj);
		for (var h = 0, chunk = lineObj.parent, i = 0; i < chunk.lines.length; ++i) {
			var line = chunk.lines[i];
			if (line == lineObj) break;
			h += line.height
		}
		for (var p = chunk.parent; p; chunk = p, p = chunk.parent)
			for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
				var cur = p.children[i$1];
				if (cur == chunk) break;
				h += cur.height
			}
		return h
	}

	function lineLength(line) {
		if (0 == line.height) return 0;
		for (var merged, len = line.text.length, cur = line; merged = collapsedSpanAtStart(cur);) {
			var found = merged.find(0, !0);
			cur = found.from.line, len += found.from.ch - found.to.ch
		}
		for (cur = line; merged = collapsedSpanAtEnd(cur);) {
			var found$1 = merged.find(0, !0);
			len -= cur.text.length - found$1.from.ch, cur = found$1.to.line, len += cur.text.length - found$1.to.ch
		}
		return len
	}

	function findMaxLine(cm) {
		var d = cm.display,
			doc = cm.doc;
		d.maxLine = getLine(doc, doc.first), d.maxLineLength = lineLength(d.maxLine), d.maxLineChanged = !0, doc.iter(function(line) {
			var len = lineLength(line);
			len > d.maxLineLength && (d.maxLineLength = len, d.maxLine = line)
		})
	}

	function iterateBidiSections(order, from, to, f) {
		if (!order) return f(from, to, "ltr", 0);
		for (var found = !1, i = 0; i < order.length; ++i) {
			var part = order[i];
			(part.from < to && part.to > from || from == to && part.to == from) && (f(Math.max(part.from, from), Math.min(part.to, to), 1 == part.level ? "rtl" : "ltr", i), found = !0)
		}
		found || f(from, to, "ltr")
	}

	function getBidiPartAt(order, ch, sticky) {
		var found;
		bidiOther = null;
		for (var i = 0; i < order.length; ++i) {
			var cur = order[i];
			if (cur.from < ch && cur.to > ch) return i;
			cur.to == ch && (cur.from != cur.to && "before" == sticky ? found = i : bidiOther = i), cur.from == ch && (cur.from != cur.to && "before" != sticky ? found = i : bidiOther = i)
		}
		return null != found ? found : bidiOther
	}

	function getOrder(line, direction) {
		var order = line.order;
		return null == order && (order = line.order = bidiOrdering(line.text, direction)), order
	}

	function getHandlers(emitter, type) {
		return emitter._handlers && emitter._handlers[type] || noHandlers
	}

	function off(emitter, type, f) {
		if (emitter.removeEventListener) emitter.removeEventListener(type, f, !1);
		else if (emitter.detachEvent) emitter.detachEvent("on" + type, f);
		else {
			var map = emitter._handlers,
				arr = map && map[type];
			if (arr) {
				var index = indexOf(arr, f);
				index > -1 && (map[type] = arr.slice(0, index).concat(arr.slice(index + 1)))
			}
		}
	}

	function signal(emitter, type) {
		var handlers = getHandlers(emitter, type);
		if (handlers.length)
			for (var args = Array.prototype.slice.call(arguments, 2), i = 0; i < handlers.length; ++i) handlers[i].apply(null, args)
	}

	function signalDOMEvent(cm, e, override) {
		return "string" == typeof e && (e = {
			type: e,
			preventDefault: function() {
				this.defaultPrevented = !0
			}
		}), signal(cm, override || e.type, cm, e), e_defaultPrevented(e) || e.codemirrorIgnore
	}

	function signalCursorActivity(cm) {
		var arr = cm._handlers && cm._handlers.cursorActivity;
		if (arr)
			for (var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []), i = 0; i < arr.length; ++i) - 1 == indexOf(set, arr[i]) && set.push(arr[i])
	}

	function hasHandler(emitter, type) {
		return getHandlers(emitter, type).length > 0
	}

	function eventMixin(ctor) {
		ctor.prototype.on = function(type, f) {
			on(this, type, f)
		}, ctor.prototype.off = function(type, f) {
			off(this, type, f)
		}
	}

	function e_preventDefault(e) {
		e.preventDefault ? e.preventDefault() : e.returnValue = !1
	}

	function e_stopPropagation(e) {
		e.stopPropagation ? e.stopPropagation() : e.cancelBubble = !0
	}

	function e_defaultPrevented(e) {
		return null != e.defaultPrevented ? e.defaultPrevented : 0 == e.returnValue
	}

	function e_stop(e) {
		e_preventDefault(e), e_stopPropagation(e)
	}

	function e_target(e) {
		return e.target || e.srcElement
	}

	function e_button(e) {
		var b = e.which;
		return null == b && (1 & e.button ? b = 1 : 2 & e.button ? b = 3 : 4 & e.button && (b = 2)), mac && e.ctrlKey && 1 == b && (b = 3), b
	}

	function zeroWidthElement(measure) {
		if (null == zwspSupported) {
			var test = elt("span", "​");
			removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")])), 0 != measure.firstChild.offsetHeight && (zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && 8 > ie_version))
		}
		var node = zwspSupported ? elt("span", "​") : elt("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
		return node.setAttribute("cm-text", ""), node
	}

	function hasBadBidiRects(measure) {
		if (null != badBidiRects) return badBidiRects;
		var txt = removeChildrenAndAdd(measure, document.createTextNode("AخA")),
			r0 = range(txt, 0, 1).getBoundingClientRect(),
			r1 = range(txt, 1, 2).getBoundingClientRect();
		return removeChildren(measure), r0 && r0.left != r0.right ? badBidiRects = r1.right - r0.right < 3 : !1
	}

	function hasBadZoomedRects(measure) {
		if (null != badZoomedRects) return badZoomedRects;
		var node = removeChildrenAndAdd(measure, elt("span", "x")),
			normal = node.getBoundingClientRect(),
			fromRange = range(node, 0, 1).getBoundingClientRect();
		return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1
	}

	function defineMode(name, mode) {
		arguments.length > 2 && (mode.dependencies = Array.prototype.slice.call(arguments, 2)), modes[name] = mode
	}

	function defineMIME(mime, spec) {
		mimeModes[mime] = spec
	}

	function resolveMode(spec) {
		if ("string" == typeof spec && mimeModes.hasOwnProperty(spec)) spec = mimeModes[spec];
		else if (spec && "string" == typeof spec.name && mimeModes.hasOwnProperty(spec.name)) {
			var found = mimeModes[spec.name];
			"string" == typeof found && (found = {
				name: found
			}), spec = createObj(found, spec), spec.name = found.name
		} else {
			if ("string" == typeof spec && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) return resolveMode("application/xml");
			if ("string" == typeof spec && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) return resolveMode("application/json")
		}
		return "string" == typeof spec ? {
			name: spec
		} : spec || {
			name: "null"
		}
	}

	function getMode(options, spec) {
		spec = resolveMode(spec);
		var mfactory = modes[spec.name];
		if (!mfactory) return getMode(options, "text/plain");
		var modeObj = mfactory(options, spec);
		if (modeExtensions.hasOwnProperty(spec.name)) {
			var exts = modeExtensions[spec.name];
			for (var prop in exts) exts.hasOwnProperty(prop) && (modeObj.hasOwnProperty(prop) && (modeObj["_" + prop] = modeObj[prop]), modeObj[prop] = exts[prop])
		}
		if (modeObj.name = spec.name, spec.helperType && (modeObj.helperType = spec.helperType), spec.modeProps)
			for (var prop$1 in spec.modeProps) modeObj[prop$1] = spec.modeProps[prop$1];
		return modeObj
	}

	function extendMode(mode, properties) {
		var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : modeExtensions[mode] = {};
		copyObj(properties, exts)
	}

	function copyState(mode, state) {
		if (state === !0) return state;
		if (mode.copyState) return mode.copyState(state);
		var nstate = {};
		for (var n in state) {
			var val = state[n];
			val instanceof Array && (val = val.concat([])), nstate[n] = val
		}
		return nstate
	}

	function innerMode(mode, state) {
		for (var info; mode.innerMode && (info = mode.innerMode(state), info && info.mode != mode);) state = info.state, mode = info.mode;
		return info || {
			mode: mode,
			state: state
		}
	}

	function startState(mode, a1, a2) {
		return mode.startState ? mode.startState(a1, a2) : !0
	}

	function highlightLine(cm, line, context, forceToEnd) {
		var st = [cm.state.modeGen],
			lineClasses = {};
		runMode(cm, line.text, cm.doc.mode, context, function(end, style) {
			return st.push(end, style)
		}, lineClasses, forceToEnd);
		for (var state = context.state, loop = function(o) {
				context.baseTokens = st;
				var overlay = cm.state.overlays[o],
					i = 1,
					at = 0;
				context.state = !0, runMode(cm, line.text, overlay.mode, context, function(end, style) {
					for (var start = i; end > at;) {
						var i_end = st[i];
						i_end > end && st.splice(i, 1, end, st[i + 1], i_end), i += 2, at = Math.min(end, i_end)
					}
					if (style)
						if (overlay.opaque) st.splice(start, i - start, end, "overlay " + style), i = start + 2;
						else
							for (; i > start; start += 2) {
								var cur = st[start + 1];
								st[start + 1] = (cur ? cur + " " : "") + "overlay " + style
							}
				}, lineClasses), context.state = state, context.baseTokens = null, context.baseTokenPos = 1
			}, o = 0; o < cm.state.overlays.length; ++o) loop(o);
		return {
			styles: st,
			classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null
		}
	}

	function getLineStyles(cm, line, updateFrontier) {
		if (!line.styles || line.styles[0] != cm.state.modeGen) {
			var context = getContextBefore(cm, lineNo(line)),
				resetState = line.text.length > cm.options.maxHighlightLength && copyState(cm.doc.mode, context.state),
				result = highlightLine(cm, line, context);
			resetState && (context.state = resetState), line.stateAfter = context.save(!resetState), line.styles = result.styles, result.classes ? line.styleClasses = result.classes : line.styleClasses && (line.styleClasses = null), updateFrontier === cm.doc.highlightFrontier && (cm.doc.modeFrontier = Math.max(cm.doc.modeFrontier, ++cm.doc.highlightFrontier))
		}
		return line.styles
	}

	function getContextBefore(cm, n, precise) {
		var doc = cm.doc,
			display = cm.display;
		if (!doc.mode.startState) return new Context(doc, !0, n);
		var start = findStartLine(cm, n, precise),
			saved = start > doc.first && getLine(doc, start - 1).stateAfter,
			context = saved ? Context.fromSaved(doc, saved, start) : new Context(doc, startState(doc.mode), start);
		return doc.iter(start, n, function(line) {
			processLine(cm, line.text, context);
			var pos = context.line;
			line.stateAfter = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo ? context.save() : null, context.nextLine()
		}), precise && (doc.modeFrontier = context.line), context
	}

	function processLine(cm, text, context, startAt) {
		var mode = cm.doc.mode,
			stream = new StringStream(text, cm.options.tabSize, context);
		for (stream.start = stream.pos = startAt || 0, "" == text && callBlankLine(mode, context.state); !stream.eol();) readToken(mode, stream, context.state), stream.start = stream.pos
	}

	function callBlankLine(mode, state) {
		if (mode.blankLine) return mode.blankLine(state);
		if (mode.innerMode) {
			var inner = innerMode(mode, state);
			return inner.mode.blankLine ? inner.mode.blankLine(inner.state) : void 0
		}
	}

	function readToken(mode, stream, state, inner) {
		for (var i = 0; 10 > i; i++) {
			inner && (inner[0] = innerMode(mode, state).mode);
			var style = mode.token(stream, state);
			if (stream.pos > stream.start) return style
		}
		throw new Error("Mode " + mode.name + " failed to advance stream.")
	}

	function takeToken(cm, pos, precise, asArray) {
		var style, doc = cm.doc,
			mode = doc.mode;
		pos = clipPos(doc, pos);
		var tokens, line = getLine(doc, pos.line),
			context = getContextBefore(cm, pos.line, precise),
			stream = new StringStream(line.text, cm.options.tabSize, context);
		for (asArray && (tokens = []);
			(asArray || stream.pos < pos.ch) && !stream.eol();) stream.start = stream.pos, style = readToken(mode, stream, context.state), asArray && tokens.push(new Token(stream, style, copyState(doc.mode, context.state)));
		return asArray ? tokens : new Token(stream, style, context.state)
	}

	function extractLineClasses(type, output) {
		if (type)
			for (;;) {
				var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
				if (!lineClass) break;
				type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
				var prop = lineClass[1] ? "bgClass" : "textClass";
				null == output[prop] ? output[prop] = lineClass[2] : new RegExp("(?:^|s)" + lineClass[2] + "(?:$|s)").test(output[prop]) || (output[prop] += " " + lineClass[2])
			}
		return type
	}

	function runMode(cm, text, mode, context, f, lineClasses, forceToEnd) {
		var flattenSpans = mode.flattenSpans;
		null == flattenSpans && (flattenSpans = cm.options.flattenSpans);
		var style, curStart = 0,
			curStyle = null,
			stream = new StringStream(text, cm.options.tabSize, context),
			inner = cm.options.addModeClass && [null];
		for ("" == text && extractLineClasses(callBlankLine(mode, context.state), lineClasses); !stream.eol();) {
			if (stream.pos > cm.options.maxHighlightLength ? (flattenSpans = !1, forceToEnd && processLine(cm, text, context, stream.pos), stream.pos = text.length, style = null) : style = extractLineClasses(readToken(mode, stream, context.state, inner), lineClasses), inner) {
				var mName = inner[0].name;
				mName && (style = "m-" + (style ? mName + " " + style : mName))
			}
			if (!flattenSpans || curStyle != style) {
				for (; curStart < stream.start;) curStart = Math.min(stream.start, curStart + 5e3), f(curStart, curStyle);
				curStyle = style
			}
			stream.start = stream.pos
		}
		for (; curStart < stream.pos;) {
			var pos = Math.min(stream.pos, curStart + 5e3);
			f(pos, curStyle), curStart = pos
		}
	}

	function findStartLine(cm, n, precise) {
		for (var minindent, minline, doc = cm.doc, lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1e3 : 100), search = n; search > lim; --search) {
			if (search <= doc.first) return doc.first;
			var line = getLine(doc, search - 1),
				after = line.stateAfter;
			if (after && (!precise || search + (after instanceof SavedContext ? after.lookAhead : 0) <= doc.modeFrontier)) return search;
			var indented = countColumn(line.text, null, cm.options.tabSize);
			(null == minline || minindent > indented) && (minline = search - 1, minindent = indented)
		}
		return minline
	}

	function retreatFrontier(doc, n) {
		if (doc.modeFrontier = Math.min(doc.modeFrontier, n), !(doc.highlightFrontier < n - 10)) {
			for (var start = doc.first, line = n - 1; line > start; line--) {
				var saved = getLine(doc, line).stateAfter;
				if (saved && (!(saved instanceof SavedContext) || line + saved.lookAhead < n)) {
					start = line + 1;
					break
				}
			}
			doc.highlightFrontier = Math.min(doc.highlightFrontier, start)
		}
	}

	function updateLine(line, text, markedSpans, estimateHeight) {
		line.text = text, line.stateAfter && (line.stateAfter = null), line.styles && (line.styles = null), null != line.order && (line.order = null), detachMarkedSpans(line), attachMarkedSpans(line, markedSpans);
		var estHeight = estimateHeight ? estimateHeight(line) : 1;
		estHeight != line.height && updateLineHeight(line, estHeight)
	}

	function cleanUpLine(line) {
		line.parent = null, detachMarkedSpans(line)
	}

	function interpretTokenStyle(style, options) {
		if (!style || /^\s*$/.test(style)) return null;
		var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
		return cache[style] || (cache[style] = style.replace(/\S+/g, "cm-$&"))
	}

	function buildLineContent(cm, lineView) {
		var content = eltP("span", null, null, webkit ? "padding-right: .1px" : null),
			builder = {
				pre: eltP("pre", [content], "CodeMirror-line"),
				content: content,
				col: 0,
				pos: 0,
				cm: cm,
				trailingSpace: !1,
				splitSpaces: (ie || webkit) && cm.getOption("lineWrapping")
			};
		lineView.measure = {};
		for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
			var line = i ? lineView.rest[i - 1] : lineView.line,
				order = void 0;
			builder.pos = 0, builder.addToken = buildToken, hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction)) && (builder.addToken = buildTokenBadBidi(builder.addToken, order)), builder.map = [];
			var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
			insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate)), line.styleClasses && (line.styleClasses.bgClass && (builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "")), line.styleClasses.textClass && (builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || ""))), 0 == builder.map.length && builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure))), 0 == i ? (lineView.measure.map = builder.map, lineView.measure.cache = {}) : ((lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map), (lineView.measure.caches || (lineView.measure.caches = [])).push({}))
		}
		if (webkit) {
			var last = builder.content.lastChild;
			(/\bcm-tab\b/.test(last.className) || last.querySelector && last.querySelector(".cm-tab")) && (builder.content.className = "cm-tab-wrap-hack")
		}
		return signal(cm, "renderLine", cm, lineView.line, builder.pre), builder.pre.className && (builder.textClass = joinClasses(builder.pre.className, builder.textClass || "")), builder
	}

	function defaultSpecialCharPlaceholder(ch) {
		var token = elt("span", "•", "cm-invalidchar");
		return token.title = "\\u" + ch.charCodeAt(0).toString(16), token.setAttribute("aria-label", token.title), token
	}

	function buildToken(builder, text, style, startStyle, endStyle, title, css) {
		if (text) {
			var content, displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text,
				special = builder.cm.state.specialChars,
				mustWrap = !1;
			if (special.test(text)) {
				content = document.createDocumentFragment();
				for (var pos = 0;;) {
					special.lastIndex = pos;
					var m = special.exec(text),
						skipped = m ? m.index - pos : text.length - pos;
					if (skipped) {
						var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
						content.appendChild(ie && 9 > ie_version ? elt("span", [txt]) : txt), builder.map.push(builder.pos, builder.pos + skipped, txt), builder.col += skipped, builder.pos += skipped
					}
					if (!m) break;
					pos += skipped + 1;
					var txt$1 = void 0;
					if ("	" == m[0]) {
						var tabSize = builder.cm.options.tabSize,
							tabWidth = tabSize - builder.col % tabSize;
						txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab")), txt$1.setAttribute("role", "presentation"), txt$1.setAttribute("cm-text", "	"), builder.col += tabWidth
					} else "\r" == m[0] || "\n" == m[0] ? (txt$1 = content.appendChild(elt("span", "\r" == m[0] ? "␍" : "␤", "cm-invalidchar")), txt$1.setAttribute("cm-text", m[0]), builder.col += 1) : (txt$1 = builder.cm.options.specialCharPlaceholder(m[0]), txt$1.setAttribute("cm-text", m[0]), content.appendChild(ie && 9 > ie_version ? elt("span", [txt$1]) : txt$1), builder.col += 1);
					builder.map.push(builder.pos, builder.pos + 1, txt$1), builder.pos++
				}
			} else builder.col += text.length, content = document.createTextNode(displayText), builder.map.push(builder.pos, builder.pos + text.length, content), ie && 9 > ie_version && (mustWrap = !0), builder.pos += text.length;
			if (builder.trailingSpace = 32 == displayText.charCodeAt(text.length - 1), style || startStyle || endStyle || mustWrap || css) {
				var fullStyle = style || "";
				startStyle && (fullStyle += startStyle), endStyle && (fullStyle += endStyle);
				var token = elt("span", [content], fullStyle, css);
				return title && (token.title = title), builder.content.appendChild(token)
			}
			builder.content.appendChild(content)
		}
	}

	function splitSpaces(text, trailingBefore) {
		if (text.length > 1 && !/  /.test(text)) return text;
		for (var spaceBefore = trailingBefore, result = "", i = 0; i < text.length; i++) {
			var ch = text.charAt(i);
			" " != ch || !spaceBefore || i != text.length - 1 && 32 != text.charCodeAt(i + 1) || (ch = " "), result += ch, spaceBefore = " " == ch
		}
		return result
	}

	function buildTokenBadBidi(inner, order) {
		return function(builder, text, style, startStyle, endStyle, title, css) {
			style = style ? style + " cm-force-border" : "cm-force-border";
			for (var start = builder.pos, end = start + text.length;;) {
				for (var part = void 0, i = 0; i < order.length && (part = order[i], !(part.to > start && part.from <= start)); i++);
				if (part.to >= end) return inner(builder, text, style, startStyle, endStyle, title, css);
				inner(builder, text.slice(0, part.to - start), style, startStyle, null, title, css), startStyle = null, text = text.slice(part.to - start), start = part.to
			}
		}
	}

	function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
		var widget = !ignoreWidget && marker.widgetNode;
		widget && builder.map.push(builder.pos, builder.pos + size, widget), !ignoreWidget && builder.cm.display.input.needsContentAttribute && (widget || (widget = builder.content.appendChild(document.createElement("span"))), widget.setAttribute("cm-marker", marker.id)), widget && (builder.cm.display.input.setUneditable(widget), builder.content.appendChild(widget)), builder.pos += size, builder.trailingSpace = !1
	}

	function insertLineContent(line, builder, styles) {
		var spans = line.markedSpans,
			allText = line.text,
			at = 0;
		if (spans)
			for (var style, css, spanStyle, spanEndStyle, spanStartStyle, title, collapsed, len = allText.length, pos = 0, i = 1, text = "", nextChange = 0;;) {
				if (nextChange == pos) {
					spanStyle = spanEndStyle = spanStartStyle = title = css = "", collapsed = null, nextChange = 1 / 0;
					for (var foundBookmarks = [], endStyles = void 0, j = 0; j < spans.length; ++j) {
						var sp = spans[j],
							m = sp.marker;
						"bookmark" == m.type && sp.from == pos && m.widgetNode ? foundBookmarks.push(m) : sp.from <= pos && (null == sp.to || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos) ? (null != sp.to && sp.to != pos && nextChange > sp.to && (nextChange = sp.to, spanEndStyle = ""), m.className && (spanStyle += " " + m.className), m.css && (css = (css ? css + ";" : "") + m.css), m.startStyle && sp.from == pos && (spanStartStyle += " " + m.startStyle), m.endStyle && sp.to == nextChange && (endStyles || (endStyles = [])).push(m.endStyle, sp.to), m.title && !title && (title = m.title), m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0) && (collapsed = sp)) : sp.from > pos && nextChange > sp.from && (nextChange = sp.from)
					}
					if (endStyles)
						for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2) endStyles[j$1 + 1] == nextChange && (spanEndStyle += " " + endStyles[j$1]);
					if (!collapsed || collapsed.from == pos)
						for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2) buildCollapsedSpan(builder, 0, foundBookmarks[j$2]);
					if (collapsed && (collapsed.from || 0) == pos) {
						if (buildCollapsedSpan(builder, (null == collapsed.to ? len + 1 : collapsed.to) - pos, collapsed.marker, null == collapsed.from), null == collapsed.to) return;
						collapsed.to == pos && (collapsed = !1)
					}
				}
				if (pos >= len) break;
				for (var upto = Math.min(len, nextChange);;) {
					if (text) {
						var end = pos + text.length;
						if (!collapsed) {
							var tokenText = end > upto ? text.slice(0, upto - pos) : text;
							builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle, spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css)
						}
						if (end >= upto) {
							text = text.slice(upto - pos), pos = upto;
							break
						}
						pos = end, spanStartStyle = ""
					}
					text = allText.slice(at, at = styles[i++]), style = interpretTokenStyle(styles[i++], builder.cm.options)
				}
			} else
				for (var i$1 = 1; i$1 < styles.length; i$1 += 2) builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1 + 1], builder.cm.options))
	}

	function LineView(doc, line, lineN) {
		this.line = line, this.rest = visualLineContinued(line), this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1, this.node = this.text = null, this.hidden = lineIsHidden(doc, line)
	}

	function buildViewArray(cm, from, to) {
		for (var nextPos, array = [], pos = from; to > pos; pos = nextPos) {
			var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
			nextPos = pos + view.size, array.push(view)
		}
		return array
	}

	function pushOperation(op) {
		operationGroup ? operationGroup.ops.push(op) : op.ownsGroup = operationGroup = {
			ops: [op],
			delayedCallbacks: []
		}
	}

	function fireCallbacksForOps(group) {
		var callbacks = group.delayedCallbacks,
			i = 0;
		do {
			for (; i < callbacks.length; i++) callbacks[i].call(null);
			for (var j = 0; j < group.ops.length; j++) {
				var op = group.ops[j];
				if (op.cursorActivityHandlers)
					for (; op.cursorActivityCalled < op.cursorActivityHandlers.length;) op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm)
			}
		} while (i < callbacks.length)
	}

	function finishOperation(op, endCb) {
		var group = op.ownsGroup;
		if (group) try {
			fireCallbacksForOps(group)
		} finally {
			operationGroup = null, endCb(group)
		}
	}

	function signalLater(emitter, type) {
		var arr = getHandlers(emitter, type);
		if (arr.length) {
			var list, args = Array.prototype.slice.call(arguments, 2);
			operationGroup ? list = operationGroup.delayedCallbacks : orphanDelayedCallbacks ? list = orphanDelayedCallbacks : (list = orphanDelayedCallbacks = [], setTimeout(fireOrphanDelayed, 0));
			for (var loop = function(i) {
					list.push(function() {
						return arr[i].apply(null, args)
					})
				}, i = 0; i < arr.length; ++i) loop(i)
		}
	}

	function fireOrphanDelayed() {
		var delayed = orphanDelayedCallbacks;
		orphanDelayedCallbacks = null;
		for (var i = 0; i < delayed.length; ++i) delayed[i]()
	}

	function updateLineForChanges(cm, lineView, lineN, dims) {
		for (var j = 0; j < lineView.changes.length; j++) {
			var type = lineView.changes[j];
			"text" == type ? updateLineText(cm, lineView) : "gutter" == type ? updateLineGutter(cm, lineView, lineN, dims) : "class" == type ? updateLineClasses(cm, lineView) : "widget" == type && updateLineWidgets(cm, lineView, dims)
		}
		lineView.changes = null
	}

	function ensureLineWrapped(lineView) {
		return lineView.node == lineView.text && (lineView.node = elt("div", null, null, "position: relative"), lineView.text.parentNode && lineView.text.parentNode.replaceChild(lineView.node, lineView.text), lineView.node.appendChild(lineView.text), ie && 8 > ie_version && (lineView.node.style.zIndex = 2)), lineView.node
	}

	function updateLineBackground(cm, lineView) {
		var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
		if (cls && (cls += " CodeMirror-linebackground"), lineView.background) cls ? lineView.background.className = cls : (lineView.background.parentNode.removeChild(lineView.background), lineView.background = null);
		else if (cls) {
			var wrap = ensureLineWrapped(lineView);
			lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild), cm.display.input.setUneditable(lineView.background)
		}
	}

	function getLineContent(cm, lineView) {
		var ext = cm.display.externalMeasured;
		return ext && ext.line == lineView.line ? (cm.display.externalMeasured = null, lineView.measure = ext.measure, ext.built) : buildLineContent(cm, lineView)
	}

	function updateLineText(cm, lineView) {
		var cls = lineView.text.className,
			built = getLineContent(cm, lineView);
		lineView.text == lineView.node && (lineView.node = built.pre), lineView.text.parentNode.replaceChild(built.pre, lineView.text), lineView.text = built.pre, built.bgClass != lineView.bgClass || built.textClass != lineView.textClass ? (lineView.bgClass = built.bgClass, lineView.textClass = built.textClass, updateLineClasses(cm, lineView)) : cls && (lineView.text.className = cls)
	}

	function updateLineClasses(cm, lineView) {
		updateLineBackground(cm, lineView), lineView.line.wrapClass ? ensureLineWrapped(lineView).className = lineView.line.wrapClass : lineView.node != lineView.text && (lineView.node.className = "");
		var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
		lineView.text.className = textClass || ""
	}

	function updateLineGutter(cm, lineView, lineN, dims) {
		if (lineView.gutter && (lineView.node.removeChild(lineView.gutter), lineView.gutter = null), lineView.gutterBackground && (lineView.node.removeChild(lineView.gutterBackground), lineView.gutterBackground = null), lineView.line.gutterClass) {
			var wrap = ensureLineWrapped(lineView);
			lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass, "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + dims.gutterTotalWidth + "px"), cm.display.input.setUneditable(lineView.gutterBackground), wrap.insertBefore(lineView.gutterBackground, lineView.text)
		}
		var markers = lineView.line.gutterMarkers;
		if (cm.options.lineNumbers || markers) {
			var wrap$1 = ensureLineWrapped(lineView),
				gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px");
			if (cm.display.input.setUneditable(gutterWrap), wrap$1.insertBefore(gutterWrap, lineView.text), lineView.line.gutterClass && (gutterWrap.className += " " + lineView.line.gutterClass), !cm.options.lineNumbers || markers && markers["CodeMirror-linenumbers"] || (lineView.lineNumber = gutterWrap.appendChild(elt("div", lineNumberFor(cm.options, lineN), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + cm.display.lineNumInnerWidth + "px"))), markers)
				for (var k = 0; k < cm.options.gutters.length; ++k) {
					var id = cm.options.gutters[k],
						found = markers.hasOwnProperty(id) && markers[id];
					found && gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " + dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"))
				}
		}
	}

	function updateLineWidgets(cm, lineView, dims) {
		lineView.alignable && (lineView.alignable = null);
		for (var node = lineView.node.firstChild, next = void 0; node; node = next) next = node.nextSibling, "CodeMirror-linewidget" == node.className && lineView.node.removeChild(node);
		insertLineWidgets(cm, lineView, dims)
	}

	function buildLineElement(cm, lineView, lineN, dims) {
		var built = getLineContent(cm, lineView);
		return lineView.text = lineView.node = built.pre, built.bgClass && (lineView.bgClass = built.bgClass), built.textClass && (lineView.textClass = built.textClass), updateLineClasses(cm, lineView), updateLineGutter(cm, lineView, lineN, dims), insertLineWidgets(cm, lineView, dims), lineView.node
	}

	function insertLineWidgets(cm, lineView, dims) {
		if (insertLineWidgetsFor(cm, lineView.line, lineView, dims, !0), lineView.rest)
			for (var i = 0; i < lineView.rest.length; i++) insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, !1)
	}

	function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
		if (line.widgets)
			for (var wrap = ensureLineWrapped(lineView), i = 0, ws = line.widgets; i < ws.length; ++i) {
				var widget = ws[i],
					node = elt("div", [widget.node], "CodeMirror-linewidget");
				widget.handleMouseEvents || node.setAttribute("cm-ignore-events", "true"), positionLineWidget(widget, node, lineView, dims), cm.display.input.setUneditable(node), allowAbove && widget.above ? wrap.insertBefore(node, lineView.gutter || lineView.text) : wrap.appendChild(node), signalLater(widget, "redraw")
			}
	}

	function positionLineWidget(widget, node, lineView, dims) {
		if (widget.noHScroll) {
			(lineView.alignable || (lineView.alignable = [])).push(node);
			var width = dims.wrapperWidth;
			node.style.left = dims.fixedPos + "px", widget.coverGutter || (width -= dims.gutterTotalWidth, node.style.paddingLeft = dims.gutterTotalWidth + "px"), node.style.width = width + "px"
		}
		widget.coverGutter && (node.style.zIndex = 5, node.style.position = "relative", widget.noHScroll || (node.style.marginLeft = -dims.gutterTotalWidth + "px"))
	}

	function widgetHeight(widget) {
		if (null != widget.height) return widget.height;
		var cm = widget.doc.cm;
		if (!cm) return 0;
		if (!contains(document.body, widget.node)) {
			var parentStyle = "position: relative;";
			widget.coverGutter && (parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;"), widget.noHScroll && (parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;"), removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle))
		}
		return widget.height = widget.node.parentNode.offsetHeight
	}

	function eventInWidget(display, e) {
		for (var n = e_target(e); n != display.wrapper; n = n.parentNode)
			if (!n || 1 == n.nodeType && "true" == n.getAttribute("cm-ignore-events") || n.parentNode == display.sizer && n != display.mover) return !0
	}

	function paddingTop(display) {
		return display.lineSpace.offsetTop
	}

	function paddingVert(display) {
		return display.mover.offsetHeight - display.lineSpace.offsetHeight
	}

	function paddingH(display) {
		if (display.cachedPaddingH) return display.cachedPaddingH;
		var e = removeChildrenAndAdd(display.measure, elt("pre", "x")),
			style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle,
			data = {
				left: parseInt(style.paddingLeft),
				right: parseInt(style.paddingRight)
			};
		return isNaN(data.left) || isNaN(data.right) || (display.cachedPaddingH = data), data
	}

	function scrollGap(cm) {
		return scrollerGap - cm.display.nativeBarWidth
	}

	function displayWidth(cm) {
		return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth
	}

	function displayHeight(cm) {
		return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight
	}

	function ensureLineHeights(cm, lineView, rect) {
		var wrapping = cm.options.lineWrapping,
			curWidth = wrapping && displayWidth(cm);
		if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
			var heights = lineView.measure.heights = [];
			if (wrapping) {
				lineView.measure.width = curWidth;
				for (var rects = lineView.text.firstChild.getClientRects(), i = 0; i < rects.length - 1; i++) {
					var cur = rects[i],
						next = rects[i + 1];
					Math.abs(cur.bottom - next.bottom) > 2 && heights.push((cur.bottom + next.top) / 2 - rect.top)
				}
			}
			heights.push(rect.bottom - rect.top)
		}
	}

	function mapFromLineView(lineView, line, lineN) {
		if (lineView.line == line) return {
			map: lineView.measure.map,
			cache: lineView.measure.cache
		};
		for (var i = 0; i < lineView.rest.length; i++)
			if (lineView.rest[i] == line) return {
				map: lineView.measure.maps[i],
				cache: lineView.measure.caches[i]
			};
		for (var i$1 = 0; i$1 < lineView.rest.length; i$1++)
			if (lineNo(lineView.rest[i$1]) > lineN) return {
				map: lineView.measure.maps[i$1],
				cache: lineView.measure.caches[i$1],
				before: !0
			}
	}

	function updateExternalMeasurement(cm, line) {
		line = visualLine(line);
		var lineN = lineNo(line),
			view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
		view.lineN = lineN;
		var built = view.built = buildLineContent(cm, view);
		return view.text = built.pre, removeChildrenAndAdd(cm.display.lineMeasure, built.pre), view
	}

	function measureChar(cm, line, ch, bias) {
		return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias)
	}

	function findViewForLine(cm, lineN) {
		if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo) return cm.display.view[findViewIndex(cm, lineN)];
		var ext = cm.display.externalMeasured;
		return ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size ? ext : void 0
	}

	function prepareMeasureForLine(cm, line) {
		var lineN = lineNo(line),
			view = findViewForLine(cm, lineN);
		view && !view.text ? view = null : view && view.changes && (updateLineForChanges(cm, view, lineN, getDimensions(cm)), cm.curOp.forceUpdate = !0), view || (view = updateExternalMeasurement(cm, line));
		var info = mapFromLineView(view, line, lineN);
		return {
			line: line,
			view: view,
			rect: null,
			map: info.map,
			cache: info.cache,
			before: info.before,
			hasHeights: !1
		}
	}

	function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
		prepared.before && (ch = -1);
		var found, key = ch + (bias || "");
		return prepared.cache.hasOwnProperty(key) ? found = prepared.cache[key] : (prepared.rect || (prepared.rect = prepared.view.text.getBoundingClientRect()), prepared.hasHeights || (ensureLineHeights(cm, prepared.view, prepared.rect), prepared.hasHeights = !0), found = measureCharInner(cm, prepared, ch, bias), found.bogus || (prepared.cache[key] = found)), {
			left: found.left,
			right: found.right,
			top: varHeight ? found.rtop : found.top,
			bottom: varHeight ? found.rbottom : found.bottom
		}
	}

	function nodeAndOffsetInLineMap(map, ch, bias) {
		for (var node, start, end, collapse, mStart, mEnd, i = 0; i < map.length; i += 3)
			if (mStart = map[i], mEnd = map[i + 1], mStart > ch ? (start = 0, end = 1, collapse = "left") : mEnd > ch ? (start = ch - mStart, end = start + 1) : (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) && (end = mEnd - mStart, start = end - 1, ch >= mEnd && (collapse = "right")), null != start) {
				if (node = map[i + 2], mStart == mEnd && bias == (node.insertLeft ? "left" : "right") && (collapse = bias), "left" == bias && 0 == start)
					for (; i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft;) node = map[(i -= 3) + 2], collapse = "left";
				if ("right" == bias && start == mEnd - mStart)
					for (; i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft;) node = map[(i += 3) + 2], collapse = "right";
				break
			}
		return {
			node: node,
			start: start,
			end: end,
			collapse: collapse,
			coverStart: mStart,
			coverEnd: mEnd
		}
	}

	function getUsefulRect(rects, bias) {
		var rect = nullRect;
		if ("left" == bias)
			for (var i = 0; i < rects.length && (rect = rects[i]).left == rect.right; i++);
		else
			for (var i$1 = rects.length - 1; i$1 >= 0 && (rect = rects[i$1]).left == rect.right; i$1--);
		return rect
	}

	function measureCharInner(cm, prepared, ch, bias) {
		var rect, place = nodeAndOffsetInLineMap(prepared.map, ch, bias),
			node = place.node,
			start = place.start,
			end = place.end,
			collapse = place.collapse;
		if (3 == node.nodeType) {
			for (var i$1 = 0; 4 > i$1; i$1++) {
				for (; start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start));) --start;
				for (; place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end));) ++end;
				if (rect = ie && 9 > ie_version && 0 == start && end == place.coverEnd - place.coverStart ? node.parentNode.getBoundingClientRect() : getUsefulRect(range(node, start, end).getClientRects(), bias), rect.left || rect.right || 0 == start) break;
				end = start, start -= 1, collapse = "right"
			}
			ie && 11 > ie_version && (rect = maybeUpdateRectForZooming(cm.display.measure, rect))
		} else {
			start > 0 && (collapse = bias = "right");
			var rects;
			rect = cm.options.lineWrapping && (rects = node.getClientRects()).length > 1 ? rects["right" == bias ? rects.length - 1 : 0] : node.getBoundingClientRect()
		}
		if (ie && 9 > ie_version && !start && (!rect || !rect.left && !rect.right)) {
			var rSpan = node.parentNode.getClientRects()[0];
			rect = rSpan ? {
				left: rSpan.left,
				right: rSpan.left + charWidth(cm.display),
				top: rSpan.top,
				bottom: rSpan.bottom
			} : nullRect
		}
		for (var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top, mid = (rtop + rbot) / 2, heights = prepared.view.measure.heights, i = 0; i < heights.length - 1 && !(mid < heights[i]); i++);
		var top = i ? heights[i - 1] : 0,
			bot = heights[i],
			result = {
				left: ("right" == collapse ? rect.right : rect.left) - prepared.rect.left,
				right: ("left" == collapse ? rect.left : rect.right) - prepared.rect.left,
				top: top,
				bottom: bot
			};
		return rect.left || rect.right || (result.bogus = !0), cm.options.singleCursorHeightPerLine || (result.rtop = rtop, result.rbottom = rbot), result
	}

	function maybeUpdateRectForZooming(measure, rect) {
		if (!window.screen || null == screen.logicalXDPI || screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure)) return rect;
		var scaleX = screen.logicalXDPI / screen.deviceXDPI,
			scaleY = screen.logicalYDPI / screen.deviceYDPI;
		return {
			left: rect.left * scaleX,
			right: rect.right * scaleX,
			top: rect.top * scaleY,
			bottom: rect.bottom * scaleY
		}
	}

	function clearLineMeasurementCacheFor(lineView) {
		if (lineView.measure && (lineView.measure.cache = {}, lineView.measure.heights = null, lineView.rest))
			for (var i = 0; i < lineView.rest.length; i++) lineView.measure.caches[i] = {}
	}

	function clearLineMeasurementCache(cm) {
		cm.display.externalMeasure = null, removeChildren(cm.display.lineMeasure);
		for (var i = 0; i < cm.display.view.length; i++) clearLineMeasurementCacheFor(cm.display.view[i])
	}

	function clearCaches(cm) {
		clearLineMeasurementCache(cm), cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null, cm.options.lineWrapping || (cm.display.maxLineChanged = !0), cm.display.lineNumChars = null
	}

	function pageScrollX() {
		return chrome && android ? -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft)) : window.pageXOffset || (document.documentElement || document.body).scrollLeft
	}

	function pageScrollY() {
		return chrome && android ? -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop)) : window.pageYOffset || (document.documentElement || document.body).scrollTop
	}

	function widgetTopHeight(lineObj) {
		var height = 0;
		if (lineObj.widgets)
			for (var i = 0; i < lineObj.widgets.length; ++i) lineObj.widgets[i].above && (height += widgetHeight(lineObj.widgets[i]));
		return height
	}

	function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
		if (!includeWidgets) {
			var height = widgetTopHeight(lineObj);
			rect.top += height, rect.bottom += height
		}
		if ("line" == context) return rect;
		context || (context = "local");
		var yOff = heightAtLine(lineObj);
		if ("local" == context ? yOff += paddingTop(cm.display) : yOff -= cm.display.viewOffset, "page" == context || "window" == context) {
			var lOff = cm.display.lineSpace.getBoundingClientRect();
			yOff += lOff.top + ("window" == context ? 0 : pageScrollY());
			var xOff = lOff.left + ("window" == context ? 0 : pageScrollX());
			rect.left += xOff, rect.right += xOff
		}
		return rect.top += yOff, rect.bottom += yOff, rect
	}

	function fromCoordSystem(cm, coords, context) {
		if ("div" == context) return coords;
		var left = coords.left,
			top = coords.top;
		if ("page" == context) left -= pageScrollX(), top -= pageScrollY();
		else if ("local" == context || !context) {
			var localBox = cm.display.sizer.getBoundingClientRect();
			left += localBox.left, top += localBox.top
		}
		var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
		return {
			left: left - lineSpaceBox.left,
			top: top - lineSpaceBox.top
		}
	}

	function charCoords(cm, pos, context, lineObj, bias) {
		return lineObj || (lineObj = getLine(cm.doc, pos.line)), intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context)
	}

	function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
		function get(ch, right) {
			var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
			return right ? m.left = m.right : m.right = m.left, intoCoordSystem(cm, lineObj, m, context)
		}

		function getBidi(ch, partPos, invert) {
			var part = order[partPos],
				right = 1 == part.level;
			return get(invert ? ch - 1 : ch, right != invert)
		}
		lineObj = lineObj || getLine(cm.doc, pos.line), preparedMeasure || (preparedMeasure = prepareMeasureForLine(cm, lineObj));
		var order = getOrder(lineObj, cm.doc.direction),
			ch = pos.ch,
			sticky = pos.sticky;
		if (ch >= lineObj.text.length ? (ch = lineObj.text.length, sticky = "before") : 0 >= ch && (ch = 0, sticky = "after"), !order) return get("before" == sticky ? ch - 1 : ch, "before" == sticky);
		var partPos = getBidiPartAt(order, ch, sticky),
			other = bidiOther,
			val = getBidi(ch, partPos, "before" == sticky);
		return null != other && (val.other = getBidi(ch, other, "before" != sticky)), val
	}

	function estimateCoords(cm, pos) {
		var left = 0;
		pos = clipPos(cm.doc, pos), cm.options.lineWrapping || (left = charWidth(cm.display) * pos.ch);
		var lineObj = getLine(cm.doc, pos.line),
			top = heightAtLine(lineObj) + paddingTop(cm.display);
		return {
			left: left,
			right: left,
			top: top,
			bottom: top + lineObj.height
		}
	}

	function PosWithInfo(line, ch, sticky, outside, xRel) {
		var pos = Pos(line, ch, sticky);
		return pos.xRel = xRel, outside && (pos.outside = !0), pos
	}

	function coordsChar(cm, x, y) {
		var doc = cm.doc;
		if (y += cm.display.viewOffset, 0 > y) return PosWithInfo(doc.first, 0, null, !0, -1);
		var lineN = lineAtHeight(doc, y),
			last = doc.first + doc.size - 1;
		if (lineN > last) return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, !0, 1);
		0 > x && (x = 0);
		for (var lineObj = getLine(doc, lineN);;) {
			var found = coordsCharInner(cm, lineObj, lineN, x, y),
				merged = collapsedSpanAtEnd(lineObj),
				mergedPos = merged && merged.find(0, !0);
			if (!merged || !(found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0)) return found;
			lineN = lineNo(lineObj = mergedPos.to.line)
		}
	}

	function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
		y -= widgetTopHeight(lineObj);
		var end = lineObj.text.length,
			begin = findFirst(function(ch) {
				return measureCharPrepared(cm, preparedMeasure, ch - 1).bottom <= y
			}, end, 0);
		return end = findFirst(function(ch) {
			return measureCharPrepared(cm, preparedMeasure, ch).top > y
		}, begin, end), {
			begin: begin,
			end: end
		}
	}

	function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
		preparedMeasure || (preparedMeasure = prepareMeasureForLine(cm, lineObj));
		var targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
		return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop)
	}

	function boxIsAfter(box, x, y, left) {
		return box.bottom <= y ? !1 : box.top > y ? !0 : (left ? box.left : box.right) > x
	}

	function coordsCharInner(cm, lineObj, lineNo, x, y) {
		y -= heightAtLine(lineObj);
		var preparedMeasure = prepareMeasureForLine(cm, lineObj),
			widgetHeight = widgetTopHeight(lineObj),
			begin = 0,
			end = lineObj.text.length,
			ltr = !0,
			order = getOrder(lineObj, cm.doc.direction);
		if (order) {
			var part = (cm.options.lineWrapping ? coordsBidiPartWrapped : coordsBidiPart)(cm, lineObj, lineNo, preparedMeasure, order, x, y);
			ltr = 1 != part.level, begin = ltr ? part.from : part.to - 1, end = ltr ? part.to : part.from - 1
		}
		var baseX, sticky, chAround = null,
			boxAround = null,
			ch = findFirst(function(ch) {
				var box = measureCharPrepared(cm, preparedMeasure, ch);
				return box.top += widgetHeight, box.bottom += widgetHeight, boxIsAfter(box, x, y, !1) ? (box.top <= y && box.left <= x && (chAround = ch, boxAround = box), !0) : !1
			}, begin, end),
			outside = !1;
		if (boxAround) {
			var atLeft = x - boxAround.left < boxAround.right - x,
				atStart = atLeft == ltr;
			ch = chAround + (atStart ? 0 : 1), sticky = atStart ? "after" : "before", baseX = atLeft ? boxAround.left : boxAround.right
		} else {
			ltr || ch != end && ch != begin || ch++, sticky = 0 == ch ? "after" : ch == lineObj.text.length ? "before" : measureCharPrepared(cm, preparedMeasure, ch - (ltr ? 1 : 0)).bottom + widgetHeight <= y == ltr ? "after" : "before";
			var coords = cursorCoords(cm, Pos(lineNo, ch, sticky), "line", lineObj, preparedMeasure);
			baseX = coords.left, outside = y < coords.top || y >= coords.bottom
		}
		return ch = skipExtendingChars(lineObj.text, ch, 1), PosWithInfo(lineNo, ch, sticky, outside, x - baseX)
	}

	function coordsBidiPart(cm, lineObj, lineNo, preparedMeasure, order, x, y) {
		var index = findFirst(function(i) {
				var part = order[i],
					ltr = 1 != part.level;
				return boxIsAfter(cursorCoords(cm, Pos(lineNo, ltr ? part.to : part.from, ltr ? "before" : "after"), "line", lineObj, preparedMeasure), x, y, !0)
			}, 0, order.length - 1),
			part = order[index];
		if (index > 0) {
			var ltr = 1 != part.level,
				start = cursorCoords(cm, Pos(lineNo, ltr ? part.from : part.to, ltr ? "after" : "before"), "line", lineObj, preparedMeasure);
			boxIsAfter(start, x, y, !0) && start.top > y && (part = order[index - 1])
		}
		return part
	}

	function coordsBidiPartWrapped(cm, lineObj, _lineNo, preparedMeasure, order, x, y) {
		var ref = wrappedLineExtent(cm, lineObj, preparedMeasure, y),
			begin = ref.begin,
			end = ref.end;
		/\s/.test(lineObj.text.charAt(end - 1)) && end--;
		for (var part = null, closestDist = null, i = 0; i < order.length; i++) {
			var p = order[i];
			if (!(p.from >= end || p.to <= begin)) {
				var ltr = 1 != p.level,
					endX = measureCharPrepared(cm, preparedMeasure, ltr ? Math.min(end, p.to) - 1 : Math.max(begin, p.from)).right,
					dist = x > endX ? x - endX + 1e9 : endX - x;
				(!part || closestDist > dist) && (part = p, closestDist = dist)
			}
		}
		return part || (part = order[order.length - 1]), part.from < begin && (part = {
			from: begin,
			to: part.to,
			level: part.level
		}), part.to > end && (part = {
			from: part.from,
			to: end,
			level: part.level
		}), part
	}

	function textHeight(display) {
		if (null != display.cachedTextHeight) return display.cachedTextHeight;
		if (null == measureText) {
			measureText = elt("pre");
			for (var i = 0; 49 > i; ++i) measureText.appendChild(document.createTextNode("x")), measureText.appendChild(elt("br"));
			measureText.appendChild(document.createTextNode("x"))
		}
		removeChildrenAndAdd(display.measure, measureText);
		var height = measureText.offsetHeight / 50;
		return height > 3 && (display.cachedTextHeight = height), removeChildren(display.measure), height || 1
	}

	function charWidth(display) {
		if (null != display.cachedCharWidth) return display.cachedCharWidth;
		var anchor = elt("span", "xxxxxxxxxx"),
			pre = elt("pre", [anchor]);
		removeChildrenAndAdd(display.measure, pre);
		var rect = anchor.getBoundingClientRect(),
			width = (rect.right - rect.left) / 10;
		return width > 2 && (display.cachedCharWidth = width), width || 10
	}

	function getDimensions(cm) {
		for (var d = cm.display, left = {}, width = {}, gutterLeft = d.gutters.clientLeft, n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft, width[cm.options.gutters[i]] = n.clientWidth;
		return {
			fixedPos: compensateForHScroll(d),
			gutterTotalWidth: d.gutters.offsetWidth,
			gutterLeft: left,
			gutterWidth: width,
			wrapperWidth: d.wrapper.clientWidth
		}
	}

	function compensateForHScroll(display) {
		return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left
	}

	function estimateHeight(cm) {
		var th = textHeight(cm.display),
			wrapping = cm.options.lineWrapping,
			perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
		return function(line) {
			if (lineIsHidden(cm.doc, line)) return 0;
			var widgetsHeight = 0;
			if (line.widgets)
				for (var i = 0; i < line.widgets.length; i++) line.widgets[i].height && (widgetsHeight += line.widgets[i].height);
			return wrapping ? widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th : widgetsHeight + th
		}
	}

	function estimateLineHeights(cm) {
		var doc = cm.doc,
			est = estimateHeight(cm);
		doc.iter(function(line) {
			var estHeight = est(line);
			estHeight != line.height && updateLineHeight(line, estHeight)
		})
	}

	function posFromMouse(cm, e, liberal, forRect) {
		var display = cm.display;
		if (!liberal && "true" == e_target(e).getAttribute("cm-not-content")) return null;
		var x, y, space = display.lineSpace.getBoundingClientRect();
		try {
			x = e.clientX - space.left, y = e.clientY - space.top
		} catch (e) {
			return null
		}
		var line, coords = coordsChar(cm, x, y);
		if (forRect && 1 == coords.xRel && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
			var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
			coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff))
		}
		return coords
	}

	function findViewIndex(cm, n) {
		if (n >= cm.display.viewTo) return null;
		if (n -= cm.display.viewFrom, 0 > n) return null;
		for (var view = cm.display.view, i = 0; i < view.length; i++)
			if (n -= view[i].size, 0 > n) return i
	}

	function updateSelection(cm) {
		cm.display.input.showSelection(cm.display.input.prepareSelection())
	}

	function prepareSelection(cm, primary) {
		void 0 === primary && (primary = !0);
		for (var doc = cm.doc, result = {}, curFragment = result.cursors = document.createDocumentFragment(), selFragment = result.selection = document.createDocumentFragment(), i = 0; i < doc.sel.ranges.length; i++)
			if (primary || i != doc.sel.primIndex) {
				var range = doc.sel.ranges[i];
				if (!(range.from().line >= cm.display.viewTo || range.to().line < cm.display.viewFrom)) {
					var collapsed = range.empty();
					(collapsed || cm.options.showCursorWhenSelecting) && drawSelectionCursor(cm, range.head, curFragment), collapsed || drawSelectionRange(cm, range, selFragment)
				}
			}
		return result
	}

	function drawSelectionCursor(cm, head, output) {
		var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine),
			cursor = output.appendChild(elt("div", " ", "CodeMirror-cursor"));
		if (cursor.style.left = pos.left + "px", cursor.style.top = pos.top + "px", cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px", pos.other) {
			var otherCursor = output.appendChild(elt("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
			otherCursor.style.display = "", otherCursor.style.left = pos.other.left + "px", otherCursor.style.top = pos.other.top + "px", otherCursor.style.height = .85 * (pos.other.bottom - pos.other.top) + "px"
		}
	}

	function cmpCoords(a, b) {
		return a.top - b.top || a.left - b.left
	}

	function drawSelectionRange(cm, range, output) {
		function add(left, top, width, bottom) {
			0 > top && (top = 0), top = Math.round(top), bottom = Math.round(bottom), fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (null == width ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px"))
		}

		function drawForLine(line, fromArg, toArg) {
			function coords(ch, bias) {
				return charCoords(cm, Pos(line, ch), "div", lineObj, bias)
			}

			function wrapX(pos, dir, side) {
				var extent = wrappedLineExtentChar(cm, lineObj, null, pos),
					prop = "ltr" == dir == ("after" == side) ? "left" : "right",
					ch = "after" == side ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1);
				return coords(ch, prop)[prop]
			}
			var start, end, lineObj = getLine(doc, line),
				lineLen = lineObj.text.length,
				order = getOrder(lineObj, doc.direction);
			return iterateBidiSections(order, fromArg || 0, null == toArg ? lineLen : toArg, function(from, to, dir, i) {
				var ltr = "ltr" == dir,
					fromPos = coords(from, ltr ? "left" : "right"),
					toPos = coords(to - 1, ltr ? "right" : "left"),
					openStart = null == fromArg && 0 == from,
					openEnd = null == toArg && to == lineLen,
					first = 0 == i,
					last = !order || i == order.length - 1;
				if (toPos.top - fromPos.top <= 3) {
					var openLeft = (docLTR ? openStart : openEnd) && first,
						openRight = (docLTR ? openEnd : openStart) && last,
						left = openLeft ? leftSide : (ltr ? fromPos : toPos).left,
						right = openRight ? rightSide : (ltr ? toPos : fromPos).right;
					add(left, fromPos.top, right - left, fromPos.bottom)
				} else {
					var topLeft, topRight, botLeft, botRight;
					ltr ? (topLeft = docLTR && openStart && first ? leftSide : fromPos.left, topRight = docLTR ? rightSide : wrapX(from, dir, "before"), botLeft = docLTR ? leftSide : wrapX(to, dir, "after"), botRight = docLTR && openEnd && last ? rightSide : toPos.right) : (topLeft = docLTR ? wrapX(from, dir, "before") : leftSide, topRight = !docLTR && openStart && first ? rightSide : fromPos.right, botLeft = !docLTR && openEnd && last ? leftSide : toPos.left, botRight = docLTR ? wrapX(to, dir, "after") : rightSide), add(topLeft, fromPos.top, topRight - topLeft, fromPos.bottom), fromPos.bottom < toPos.top && add(leftSide, fromPos.bottom, null, toPos.top), add(botLeft, toPos.top, botRight - botLeft, toPos.bottom)
				}(!start || cmpCoords(fromPos, start) < 0) && (start = fromPos), cmpCoords(toPos, start) < 0 && (start = toPos), (!end || cmpCoords(fromPos, end) < 0) && (end = fromPos), cmpCoords(toPos, end) < 0 && (end = toPos)
			}), {
				start: start,
				end: end
			}
		}
		var display = cm.display,
			doc = cm.doc,
			fragment = document.createDocumentFragment(),
			padding = paddingH(cm.display),
			leftSide = padding.left,
			rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right,
			docLTR = "ltr" == doc.direction,
			sFrom = range.from(),
			sTo = range.to();
		if (sFrom.line == sTo.line) drawForLine(sFrom.line, sFrom.ch, sTo.ch);
		else {
			var fromLine = getLine(doc, sFrom.line),
				toLine = getLine(doc, sTo.line),
				singleVLine = visualLine(fromLine) == visualLine(toLine),
				leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end,
				rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
			singleVLine && (leftEnd.top < rightStart.top - 2 ? (add(leftEnd.right, leftEnd.top, null, leftEnd.bottom), add(leftSide, rightStart.top, rightStart.left, rightStart.bottom)) : add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom)), leftEnd.bottom < rightStart.top && add(leftSide, leftEnd.bottom, null, rightStart.top)
		}
		output.appendChild(fragment)
	}

	function restartBlink(cm) {
		if (cm.state.focused) {
			var display = cm.display;
			clearInterval(display.blinker);
			var on = !0;
			display.cursorDiv.style.visibility = "", cm.options.cursorBlinkRate > 0 ? display.blinker = setInterval(function() {
				return display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden"
			}, cm.options.cursorBlinkRate) : cm.options.cursorBlinkRate < 0 && (display.cursorDiv.style.visibility = "hidden")
		}
	}

	function ensureFocus(cm) {
		cm.state.focused || (cm.display.input.focus(), onFocus(cm))
	}

	function delayBlurEvent(cm) {
		cm.state.delayingBlurEvent = !0, setTimeout(function() {
			cm.state.delayingBlurEvent && (cm.state.delayingBlurEvent = !1, onBlur(cm))
		}, 100)
	}

	function onFocus(cm, e) {
		cm.state.delayingBlurEvent && (cm.state.delayingBlurEvent = !1), "nocursor" != cm.options.readOnly && (cm.state.focused || (signal(cm, "focus", cm, e), cm.state.focused = !0, addClass(cm.display.wrapper, "CodeMirror-focused"), cm.curOp || cm.display.selForContextMenu == cm.doc.sel || (cm.display.input.reset(), webkit && setTimeout(function() {
			return cm.display.input.reset(!0)
		}, 20)), cm.display.input.receivedFocus()), restartBlink(cm))
	}

	function onBlur(cm, e) {
		cm.state.delayingBlurEvent || (cm.state.focused && (signal(cm, "blur", cm, e), cm.state.focused = !1, rmClass(cm.display.wrapper, "CodeMirror-focused")), clearInterval(cm.display.blinker), setTimeout(function() {
			cm.state.focused || (cm.display.shift = !1)
		}, 150))
	}

	function updateHeightsInViewport(cm) {
		for (var display = cm.display, prevBottom = display.lineDiv.offsetTop, i = 0; i < display.view.length; i++) {
			var cur = display.view[i],
				height = void 0;
			if (!cur.hidden) {
				if (ie && 8 > ie_version) {
					var bot = cur.node.offsetTop + cur.node.offsetHeight;
					height = bot - prevBottom, prevBottom = bot
				} else {
					var box = cur.node.getBoundingClientRect();
					height = box.bottom - box.top
				}
				var diff = cur.line.height - height;
				if (2 > height && (height = textHeight(display)), (diff > .005 || -.005 > diff) && (updateLineHeight(cur.line, height), updateWidgetHeight(cur.line), cur.rest))
					for (var j = 0; j < cur.rest.length; j++) updateWidgetHeight(cur.rest[j])
			}
		}
	}

	function updateWidgetHeight(line) {
		if (line.widgets)
			for (var i = 0; i < line.widgets.length; ++i) {
				var w = line.widgets[i],
					parent = w.node.parentNode;
				parent && (w.height = parent.offsetHeight)
			}
	}

	function visibleLines(display, doc, viewport) {
		var top = viewport && null != viewport.top ? Math.max(0, viewport.top) : display.scroller.scrollTop;
		top = Math.floor(top - paddingTop(display));
		var bottom = viewport && null != viewport.bottom ? viewport.bottom : top + display.wrapper.clientHeight,
			from = lineAtHeight(doc, top),
			to = lineAtHeight(doc, bottom);
		if (viewport && viewport.ensure) {
			var ensureFrom = viewport.ensure.from.line,
				ensureTo = viewport.ensure.to.line;
			from > ensureFrom ? (from = ensureFrom, to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight)) : Math.min(ensureTo, doc.lastLine()) >= to && (from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight), to = ensureTo)
		}
		return {
			from: from,
			to: Math.max(to, from + 1)
		}
	}

	function alignHorizontally(cm) {
		var display = cm.display,
			view = display.view;
		if (display.alignWidgets || display.gutters.firstChild && cm.options.fixedGutter) {
			for (var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft, gutterW = display.gutters.offsetWidth, left = comp + "px", i = 0; i < view.length; i++)
				if (!view[i].hidden) {
					cm.options.fixedGutter && (view[i].gutter && (view[i].gutter.style.left = left), view[i].gutterBackground && (view[i].gutterBackground.style.left = left));
					var align = view[i].alignable;
					if (align)
						for (var j = 0; j < align.length; j++) align[j].style.left = left
				}
			cm.options.fixedGutter && (display.gutters.style.left = comp + gutterW + "px")
		}
	}

	function maybeUpdateLineNumberWidth(cm) {
		if (!cm.options.lineNumbers) return !1;
		var doc = cm.doc,
			last = lineNumberFor(cm.options, doc.first + doc.size - 1),
			display = cm.display;
		if (last.length != display.lineNumChars) {
			var test = display.measure.appendChild(elt("div", [elt("div", last)], "CodeMirror-linenumber CodeMirror-gutter-elt")),
				innerW = test.firstChild.offsetWidth,
				padding = test.offsetWidth - innerW;
			return display.lineGutter.style.width = "", display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1, display.lineNumWidth = display.lineNumInnerWidth + padding, display.lineNumChars = display.lineNumInnerWidth ? last.length : -1, display.lineGutter.style.width = display.lineNumWidth + "px", updateGutterSpace(cm), !0
		}
		return !1
	}

	function maybeScrollWindow(cm, rect) {
		if (!signalDOMEvent(cm, "scrollCursorIntoView")) {
			var display = cm.display,
				box = display.sizer.getBoundingClientRect(),
				doScroll = null;
			if (rect.top + box.top < 0 ? doScroll = !0 : rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight) && (doScroll = !1), null != doScroll && !phantom) {
				var scrollNode = elt("div", "​", null, "position: absolute;\n                         top: " + (rect.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (rect.bottom - rect.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + rect.left + "px; width: " + Math.max(2, rect.right - rect.left) + "px;");
				cm.display.lineSpace.appendChild(scrollNode), scrollNode.scrollIntoView(doScroll), cm.display.lineSpace.removeChild(scrollNode)
			}
		}
	}

	function scrollPosIntoView(cm, pos, end, margin) {
		null == margin && (margin = 0);
		var rect;
		cm.options.lineWrapping || pos != end || (pos = pos.ch ? Pos(pos.line, "before" == pos.sticky ? pos.ch - 1 : pos.ch, "after") : pos, end = "before" == pos.sticky ? Pos(pos.line, pos.ch + 1, "before") : pos);
		for (var limit = 0; 5 > limit; limit++) {
			var changed = !1,
				coords = cursorCoords(cm, pos),
				endCoords = end && end != pos ? cursorCoords(cm, end) : coords;
			rect = {
				left: Math.min(coords.left, endCoords.left),
				top: Math.min(coords.top, endCoords.top) - margin,
				right: Math.max(coords.left, endCoords.left),
				bottom: Math.max(coords.bottom, endCoords.bottom) + margin
			};
			var scrollPos = calculateScrollPos(cm, rect),
				startTop = cm.doc.scrollTop,
				startLeft = cm.doc.scrollLeft;
			if (null != scrollPos.scrollTop && (updateScrollTop(cm, scrollPos.scrollTop), Math.abs(cm.doc.scrollTop - startTop) > 1 && (changed = !0)), null != scrollPos.scrollLeft && (setScrollLeft(cm, scrollPos.scrollLeft), Math.abs(cm.doc.scrollLeft - startLeft) > 1 && (changed = !0)), !changed) break
		}
		return rect
	}

	function scrollIntoView(cm, rect) {
		var scrollPos = calculateScrollPos(cm, rect);
		null != scrollPos.scrollTop && updateScrollTop(cm, scrollPos.scrollTop), null != scrollPos.scrollLeft && setScrollLeft(cm, scrollPos.scrollLeft)
	}

	function calculateScrollPos(cm, rect) {
		var display = cm.display,
			snapMargin = textHeight(cm.display);
		rect.top < 0 && (rect.top = 0);
		var screentop = cm.curOp && null != cm.curOp.scrollTop ? cm.curOp.scrollTop : display.scroller.scrollTop,
			screen = displayHeight(cm),
			result = {};
		rect.bottom - rect.top > screen && (rect.bottom = rect.top + screen);
		var docBottom = cm.doc.height + paddingVert(display),
			atTop = rect.top < snapMargin,
			atBottom = rect.bottom > docBottom - snapMargin;
		if (rect.top < screentop) result.scrollTop = atTop ? 0 : rect.top;
		else if (rect.bottom > screentop + screen) {
			var newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen);
			newTop != screentop && (result.scrollTop = newTop)
		}
		var screenleft = cm.curOp && null != cm.curOp.scrollLeft ? cm.curOp.scrollLeft : display.scroller.scrollLeft,
			screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0),
			tooWide = rect.right - rect.left > screenw;
		return tooWide && (rect.right = rect.left + screenw), rect.left < 10 ? result.scrollLeft = 0 : rect.left < screenleft ? result.scrollLeft = Math.max(0, rect.left - (tooWide ? 0 : 10)) : rect.right > screenw + screenleft - 3 && (result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw), result
	}

	function addToScrollTop(cm, top) {
		null != top && (resolveScrollToPos(cm), cm.curOp.scrollTop = (null == cm.curOp.scrollTop ? cm.doc.scrollTop : cm.curOp.scrollTop) + top)
	}

	function ensureCursorVisible(cm) {
		resolveScrollToPos(cm);
		var cur = cm.getCursor();
		cm.curOp.scrollToPos = {
			from: cur,
			to: cur,
			margin: cm.options.cursorScrollMargin
		}
	}

	function scrollToCoords(cm, x, y) {
		(null != x || null != y) && resolveScrollToPos(cm), null != x && (cm.curOp.scrollLeft = x), null != y && (cm.curOp.scrollTop = y)
	}

	function scrollToRange(cm, range) {
		resolveScrollToPos(cm), cm.curOp.scrollToPos = range
	}

	function resolveScrollToPos(cm) {
		var range = cm.curOp.scrollToPos;
		if (range) {
			cm.curOp.scrollToPos = null;
			var from = estimateCoords(cm, range.from),
				to = estimateCoords(cm, range.to);
			scrollToCoordsRange(cm, from, to, range.margin)
		}
	}

	function scrollToCoordsRange(cm, from, to, margin) {
		var sPos = calculateScrollPos(cm, {
			left: Math.min(from.left, to.left),
			top: Math.min(from.top, to.top) - margin,
			right: Math.max(from.right, to.right),
			bottom: Math.max(from.bottom, to.bottom) + margin
		});
		scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop)
	}

	function updateScrollTop(cm, val) {
		Math.abs(cm.doc.scrollTop - val) < 2 || (gecko || updateDisplaySimple(cm, {
			top: val
		}), setScrollTop(cm, val, !0), gecko && updateDisplaySimple(cm), startWorker(cm, 100))
	}

	function setScrollTop(cm, val, forceScroll) {
		val = Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val), (cm.display.scroller.scrollTop != val || forceScroll) && (cm.doc.scrollTop = val, cm.display.scrollbars.setScrollTop(val), cm.display.scroller.scrollTop != val && (cm.display.scroller.scrollTop = val))
	}

	function setScrollLeft(cm, val, isScroller, forceScroll) {
		val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth), (!(isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) || forceScroll) && (cm.doc.scrollLeft = val, alignHorizontally(cm), cm.display.scroller.scrollLeft != val && (cm.display.scroller.scrollLeft = val), cm.display.scrollbars.setScrollLeft(val))
	}

	function measureForScrollbars(cm) {
		var d = cm.display,
			gutterW = d.gutters.offsetWidth,
			docH = Math.round(cm.doc.height + paddingVert(cm.display));
		return {
			clientHeight: d.scroller.clientHeight,
			viewHeight: d.wrapper.clientHeight,
			scrollWidth: d.scroller.scrollWidth,
			clientWidth: d.scroller.clientWidth,
			viewWidth: d.wrapper.clientWidth,
			barLeft: cm.options.fixedGutter ? gutterW : 0,
			docHeight: docH,
			scrollHeight: docH + scrollGap(cm) + d.barHeight,
			nativeBarWidth: d.nativeBarWidth,
			gutterWidth: gutterW
		}
	}

	function updateScrollbars(cm, measure) {
		measure || (measure = measureForScrollbars(cm));
		var startWidth = cm.display.barWidth,
			startHeight = cm.display.barHeight;
		updateScrollbarsInner(cm, measure);
		for (var i = 0; 4 > i && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) startWidth != cm.display.barWidth && cm.options.lineWrapping && updateHeightsInViewport(cm), updateScrollbarsInner(cm, measureForScrollbars(cm)), startWidth = cm.display.barWidth, startHeight = cm.display.barHeight
	}

	function updateScrollbarsInner(cm, measure) {
		var d = cm.display,
			sizes = d.scrollbars.update(measure);
		d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px", d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px", d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent", sizes.right && sizes.bottom ? (d.scrollbarFiller.style.display = "block", d.scrollbarFiller.style.height = sizes.bottom + "px", d.scrollbarFiller.style.width = sizes.right + "px") : d.scrollbarFiller.style.display = "", sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter ? (d.gutterFiller.style.display = "block", d.gutterFiller.style.height = sizes.bottom + "px", d.gutterFiller.style.width = measure.gutterWidth + "px") : d.gutterFiller.style.display = ""
	}

	function initScrollbars(cm) {
		cm.display.scrollbars && (cm.display.scrollbars.clear(), cm.display.scrollbars.addClass && rmClass(cm.display.wrapper, cm.display.scrollbars.addClass)), cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function(node) {
			cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller), on(node, "mousedown", function() {
				cm.state.focused && setTimeout(function() {
					return cm.display.input.focus()
				}, 0)
			}), node.setAttribute("cm-not-content", "true")
		}, function(pos, axis) {
			"horizontal" == axis ? setScrollLeft(cm, pos) : updateScrollTop(cm, pos)
		}, cm), cm.display.scrollbars.addClass && addClass(cm.display.wrapper, cm.display.scrollbars.addClass)
	}

	function startOperation(cm) {
		cm.curOp = {
			cm: cm,
			viewChanged: !1,
			startHeight: cm.doc.height,
			forceUpdate: !1,
			updateInput: null,
			typing: !1,
			changeObjs: null,
			cursorActivityHandlers: null,
			cursorActivityCalled: 0,
			selectionChanged: !1,
			updateMaxLine: !1,
			scrollLeft: null,
			scrollTop: null,
			scrollToPos: null,
			focus: !1,
			id: ++nextOpId
		}, pushOperation(cm.curOp)
	}

	function endOperation(cm) {
		var op = cm.curOp;
		finishOperation(op, function(group) {
			for (var i = 0; i < group.ops.length; i++) group.ops[i].cm.curOp = null;
			endOperations(group)
		})
	}

	function endOperations(group) {
		for (var ops = group.ops, i = 0; i < ops.length; i++) endOperation_R1(ops[i]);
		for (var i$1 = 0; i$1 < ops.length; i$1++) endOperation_W1(ops[i$1]);
		for (var i$2 = 0; i$2 < ops.length; i$2++) endOperation_R2(ops[i$2]);
		for (var i$3 = 0; i$3 < ops.length; i$3++) endOperation_W2(ops[i$3]);
		for (var i$4 = 0; i$4 < ops.length; i$4++) endOperation_finish(ops[i$4])
	}

	function endOperation_R1(op) {
		var cm = op.cm,
			display = cm.display;
		maybeClipScrollbars(cm), op.updateMaxLine && findMaxLine(cm), op.mustUpdate = op.viewChanged || op.forceUpdate || null != op.scrollTop || op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom || op.scrollToPos.to.line >= display.viewTo) || display.maxLineChanged && cm.options.lineWrapping, op.update = op.mustUpdate && new DisplayUpdate(cm, op.mustUpdate && {
			top: op.scrollTop,
			ensure: op.scrollToPos
		}, op.forceUpdate)
	}

	function endOperation_W1(op) {
		op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update)
	}

	function endOperation_R2(op) {
		var cm = op.cm,
			display = cm.display;
		op.updatedDisplay && updateHeightsInViewport(cm), op.barMeasure = measureForScrollbars(cm), display.maxLineChanged && !cm.options.lineWrapping && (op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3, cm.display.sizerWidth = op.adjustWidthTo, op.barMeasure.scrollWidth = Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth), op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm))), (op.updatedDisplay || op.selectionChanged) && (op.preparedSelection = display.input.prepareSelection())
	}

	function endOperation_W2(op) {
		var cm = op.cm;
		null != op.adjustWidthTo && (cm.display.sizer.style.minWidth = op.adjustWidthTo + "px", op.maxScrollLeft < cm.doc.scrollLeft && setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), !0), cm.display.maxLineChanged = !1);
		var takeFocus = op.focus && op.focus == activeElt();
		op.preparedSelection && cm.display.input.showSelection(op.preparedSelection, takeFocus), (op.updatedDisplay || op.startHeight != cm.doc.height) && updateScrollbars(cm, op.barMeasure), op.updatedDisplay && setDocumentHeight(cm, op.barMeasure), op.selectionChanged && restartBlink(cm), cm.state.focused && op.updateInput && cm.display.input.reset(op.typing), takeFocus && ensureFocus(op.cm)
	}

	function endOperation_finish(op) {
		var cm = op.cm,
			display = cm.display,
			doc = cm.doc;
		if (op.updatedDisplay && postUpdateDisplay(cm, op.update), null == display.wheelStartX || null == op.scrollTop && null == op.scrollLeft && !op.scrollToPos || (display.wheelStartX = display.wheelStartY = null), null != op.scrollTop && setScrollTop(cm, op.scrollTop, op.forceScroll), null != op.scrollLeft && setScrollLeft(cm, op.scrollLeft, !0, !0), op.scrollToPos) {
			var rect = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from), clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
			maybeScrollWindow(cm, rect)
		}
		var hidden = op.maybeHiddenMarkers,
			unhidden = op.maybeUnhiddenMarkers;
		if (hidden)
			for (var i = 0; i < hidden.length; ++i) hidden[i].lines.length || signal(hidden[i], "hide");
		if (unhidden)
			for (var i$1 = 0; i$1 < unhidden.length; ++i$1) unhidden[i$1].lines.length && signal(unhidden[i$1], "unhide");
		display.wrapper.offsetHeight && (doc.scrollTop = cm.display.scroller.scrollTop), op.changeObjs && signal(cm, "changes", cm, op.changeObjs), op.update && op.update.finish()
	}

	function runInOp(cm, f) {
		if (cm.curOp) return f();
		startOperation(cm);
		try {
			return f()
		} finally {
			endOperation(cm)
		}
	}

	function operation(cm, f) {
		return function() {
			if (cm.curOp) return f.apply(cm, arguments);
			startOperation(cm);
			try {
				return f.apply(cm, arguments)
			} finally {
				endOperation(cm)
			}
		}
	}

	function methodOp(f) {
		return function() {
			if (this.curOp) return f.apply(this, arguments);
			startOperation(this);
			try {
				return f.apply(this, arguments)
			} finally {
				endOperation(this)
			}
		}
	}

	function docMethodOp(f) {
		return function() {
			var cm = this.cm;
			if (!cm || cm.curOp) return f.apply(this, arguments);
			startOperation(cm);
			try {
				return f.apply(this, arguments)
			} finally {
				endOperation(cm)
			}
		}
	}

	function regChange(cm, from, to, lendiff) {
		null == from && (from = cm.doc.first), null == to && (to = cm.doc.first + cm.doc.size), lendiff || (lendiff = 0);
		var display = cm.display;
		if (lendiff && to < display.viewTo && (null == display.updateLineNumbers || display.updateLineNumbers > from) && (display.updateLineNumbers = from), cm.curOp.viewChanged = !0, from >= display.viewTo) sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo && resetView(cm);
		else if (to <= display.viewFrom) sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom ? resetView(cm) : (display.viewFrom += lendiff, display.viewTo += lendiff);
		else if (from <= display.viewFrom && to >= display.viewTo) resetView(cm);
		else if (from <= display.viewFrom) {
			var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
			cut ? (display.view = display.view.slice(cut.index), display.viewFrom = cut.lineN, display.viewTo += lendiff) : resetView(cm)
		} else if (to >= display.viewTo) {
			var cut$1 = viewCuttingPoint(cm, from, from, -1);
			cut$1 ? (display.view = display.view.slice(0, cut$1.index), display.viewTo = cut$1.lineN) : resetView(cm)
		} else {
			var cutTop = viewCuttingPoint(cm, from, from, -1),
				cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
			cutTop && cutBot ? (display.view = display.view.slice(0, cutTop.index).concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN)).concat(display.view.slice(cutBot.index)), display.viewTo += lendiff) : resetView(cm)
		}
		var ext = display.externalMeasured;
		ext && (to < ext.lineN ? ext.lineN += lendiff : from < ext.lineN + ext.size && (display.externalMeasured = null))
	}

	function regLineChange(cm, line, type) {
		cm.curOp.viewChanged = !0;
		var display = cm.display,
			ext = cm.display.externalMeasured;
		if (ext && line >= ext.lineN && line < ext.lineN + ext.size && (display.externalMeasured = null), !(line < display.viewFrom || line >= display.viewTo)) {
			var lineView = display.view[findViewIndex(cm, line)];
			if (null != lineView.node) {
				var arr = lineView.changes || (lineView.changes = []); - 1 == indexOf(arr, type) && arr.push(type)
			}
		}
	}

	function resetView(cm) {
		cm.display.viewFrom = cm.display.viewTo = cm.doc.first, cm.display.view = [], cm.display.viewOffset = 0
	}

	function viewCuttingPoint(cm, oldN, newN, dir) {
		var diff, index = findViewIndex(cm, oldN),
			view = cm.display.view;
		if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size) return {
			index: index,
			lineN: newN
		};
		for (var n = cm.display.viewFrom, i = 0; index > i; i++) n += view[i].size;
		if (n != oldN) {
			if (dir > 0) {
				if (index == view.length - 1) return null;
				diff = n + view[index].size - oldN, index++
			} else diff = n - oldN;
			oldN += diff, newN += diff
		}
		for (; visualLineNo(cm.doc, newN) != newN;) {
			if (index == (0 > dir ? 0 : view.length - 1)) return null;
			newN += dir * view[index - (0 > dir ? 1 : 0)].size, index += dir
		}
		return {
			index: index,
			lineN: newN
		}
	}

	function adjustView(cm, from, to) {
		var display = cm.display,
			view = display.view;
		0 == view.length || from >= display.viewTo || to <= display.viewFrom ? (display.view = buildViewArray(cm, from, to), display.viewFrom = from) : (display.viewFrom > from ? display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view) : display.viewFrom < from && (display.view = display.view.slice(findViewIndex(cm, from))), display.viewFrom = from, display.viewTo < to ? display.view = display.view.concat(buildViewArray(cm, display.viewTo, to)) : display.viewTo > to && (display.view = display.view.slice(0, findViewIndex(cm, to)))), display.viewTo = to
	}

	function countDirtyView(cm) {
		for (var view = cm.display.view, dirty = 0, i = 0; i < view.length; i++) {
			var lineView = view[i];
			lineView.hidden || lineView.node && !lineView.changes || ++dirty
		}
		return dirty
	}

	function startWorker(cm, time) {
		cm.doc.highlightFrontier < cm.display.viewTo && cm.state.highlight.set(time, bind(highlightWorker, cm))
	}

	function highlightWorker(cm) {
		var doc = cm.doc;
		if (!(doc.highlightFrontier >= cm.display.viewTo)) {
			var end = +new Date + cm.options.workTime,
				context = getContextBefore(cm, doc.highlightFrontier),
				changedLines = [];
			doc.iter(context.line, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function(line) {
				if (context.line >= cm.display.viewFrom) {
					var oldStyles = line.styles,
						resetState = line.text.length > cm.options.maxHighlightLength ? copyState(doc.mode, context.state) : null,
						highlighted = highlightLine(cm, line, context, !0);
					resetState && (context.state = resetState), line.styles = highlighted.styles;
					var oldCls = line.styleClasses,
						newCls = highlighted.classes;
					newCls ? line.styleClasses = newCls : oldCls && (line.styleClasses = null);
					for (var ischange = !oldStyles || oldStyles.length != line.styles.length || oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass), i = 0; !ischange && i < oldStyles.length; ++i) ischange = oldStyles[i] != line.styles[i];
					ischange && changedLines.push(context.line), line.stateAfter = context.save(), context.nextLine()
				} else line.text.length <= cm.options.maxHighlightLength && processLine(cm, line.text, context), line.stateAfter = context.line % 5 == 0 ? context.save() : null, context.nextLine();
				return +new Date > end ? (startWorker(cm, cm.options.workDelay), !0) : void 0
			}), doc.highlightFrontier = context.line, doc.modeFrontier = Math.max(doc.modeFrontier, context.line), changedLines.length && runInOp(cm, function() {
				for (var i = 0; i < changedLines.length; i++) regLineChange(cm, changedLines[i], "text")
			})
		}
	}

	function maybeClipScrollbars(cm) {
		var display = cm.display;
		!display.scrollbarsClipped && display.scroller.offsetWidth && (display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth, display.heightForcer.style.height = scrollGap(cm) + "px", display.sizer.style.marginBottom = -display.nativeBarWidth + "px", display.sizer.style.borderRightWidth = scrollGap(cm) + "px", display.scrollbarsClipped = !0)
	}

	function selectionSnapshot(cm) {
		if (cm.hasFocus()) return null;
		var active = activeElt();
		if (!active || !contains(cm.display.lineDiv, active)) return null;
		var result = {
			activeElt: active
		};
		if (window.getSelection) {
			var sel = window.getSelection();
			sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode) && (result.anchorNode = sel.anchorNode, result.anchorOffset = sel.anchorOffset, result.focusNode = sel.focusNode, result.focusOffset = sel.focusOffset)
		}
		return result
	}

	function restoreSelection(snapshot) {
		if (snapshot && snapshot.activeElt && snapshot.activeElt != activeElt() && (snapshot.activeElt.focus(), snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode))) {
			var sel = window.getSelection(),
				range = document.createRange();
			range.setEnd(snapshot.anchorNode, snapshot.anchorOffset), range.collapse(!1), sel.removeAllRanges(), sel.addRange(range), sel.extend(snapshot.focusNode, snapshot.focusOffset)
		}
	}

	function updateDisplayIfNeeded(cm, update) {
		var display = cm.display,
			doc = cm.doc;
		if (update.editorIsHidden) return resetView(cm), !1;
		if (!update.force && update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo && (null == display.updateLineNumbers || display.updateLineNumbers >= display.viewTo) && display.renderedView == display.view && 0 == countDirtyView(cm)) return !1;
		maybeUpdateLineNumberWidth(cm) && (resetView(cm), update.dims = getDimensions(cm));
		var end = doc.first + doc.size,
			from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first),
			to = Math.min(end, update.visible.to + cm.options.viewportMargin);
		display.viewFrom < from && from - display.viewFrom < 20 && (from = Math.max(doc.first, display.viewFrom)), display.viewTo > to && display.viewTo - to < 20 && (to = Math.min(end, display.viewTo)), sawCollapsedSpans && (from = visualLineNo(cm.doc, from), to = visualLineEndNo(cm.doc, to));
		var different = from != display.viewFrom || to != display.viewTo || display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
		adjustView(cm, from, to), display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom)), cm.display.mover.style.top = display.viewOffset + "px";
		var toUpdate = countDirtyView(cm);
		if (!different && 0 == toUpdate && !update.force && display.renderedView == display.view && (null == display.updateLineNumbers || display.updateLineNumbers >= display.viewTo)) return !1;
		var selSnapshot = selectionSnapshot(cm);
		return toUpdate > 4 && (display.lineDiv.style.display = "none"), patchDisplay(cm, display.updateLineNumbers, update.dims), toUpdate > 4 && (display.lineDiv.style.display = ""), display.renderedView = display.view, restoreSelection(selSnapshot), removeChildren(display.cursorDiv), removeChildren(display.selectionDiv), display.gutters.style.height = display.sizer.style.minHeight = 0, different && (display.lastWrapHeight = update.wrapperHeight, display.lastWrapWidth = update.wrapperWidth, startWorker(cm, 400)), display.updateLineNumbers = null, !0
	}

	function postUpdateDisplay(cm, update) {
		for (var viewport = update.viewport, first = !0;
			(first && cm.options.lineWrapping && update.oldDisplayWidth != displayWidth(cm) || (viewport && null != viewport.top && (viewport = {
				top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)
			}), update.visible = visibleLines(cm.display, cm.doc, viewport), !(update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo))) && updateDisplayIfNeeded(cm, update); first = !1) {
			updateHeightsInViewport(cm);
			var barMeasure = measureForScrollbars(cm);
			updateSelection(cm), updateScrollbars(cm, barMeasure), setDocumentHeight(cm, barMeasure), update.force = !1
		}
		update.signal(cm, "update", cm), (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) && (update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo), cm.display.reportedViewFrom = cm.display.viewFrom, cm.display.reportedViewTo = cm.display.viewTo)
	}

	function updateDisplaySimple(cm, viewport) {
		var update = new DisplayUpdate(cm, viewport);
		if (updateDisplayIfNeeded(cm, update)) {
			updateHeightsInViewport(cm), postUpdateDisplay(cm, update);
			var barMeasure = measureForScrollbars(cm);
			updateSelection(cm), updateScrollbars(cm, barMeasure), setDocumentHeight(cm, barMeasure), update.finish()
		}
	}

	function patchDisplay(cm, updateNumbersFrom, dims) {
		function rm(node) {
			var next = node.nextSibling;
			return webkit && mac && cm.display.currentWheelTarget == node ? node.style.display = "none" : node.parentNode.removeChild(node), next
		}
		for (var display = cm.display, lineNumbers = cm.options.lineNumbers, container = display.lineDiv, cur = container.firstChild, view = display.view, lineN = display.viewFrom, i = 0; i < view.length; i++) {
			var lineView = view[i];
			if (lineView.hidden);
			else if (lineView.node && lineView.node.parentNode == container) {
				for (; cur != lineView.node;) cur = rm(cur);
				var updateNumber = lineNumbers && null != updateNumbersFrom && lineN >= updateNumbersFrom && lineView.lineNumber;
				lineView.changes && (indexOf(lineView.changes, "gutter") > -1 && (updateNumber = !1), updateLineForChanges(cm, lineView, lineN, dims)), updateNumber && (removeChildren(lineView.lineNumber), lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)))), cur = lineView.node.nextSibling
			} else {
				var node = buildLineElement(cm, lineView, lineN, dims);
				container.insertBefore(node, cur)
			}
			lineN += lineView.size
		}
		for (; cur;) cur = rm(cur)
	}

	function updateGutterSpace(cm) {
		var width = cm.display.gutters.offsetWidth;
		cm.display.sizer.style.marginLeft = width + "px"
	}

	function setDocumentHeight(cm, measure) {
		cm.display.sizer.style.minHeight = measure.docHeight + "px", cm.display.heightForcer.style.top = measure.docHeight + "px", cm.display.gutters.style.height = measure.docHeight + cm.display.barHeight + scrollGap(cm) + "px"
	}

	function updateGutters(cm) {
		var gutters = cm.display.gutters,
			specs = cm.options.gutters;
		removeChildren(gutters);
		for (var i = 0; i < specs.length; ++i) {
			var gutterClass = specs[i],
				gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
			"CodeMirror-linenumbers" == gutterClass && (cm.display.lineGutter = gElt, gElt.style.width = (cm.display.lineNumWidth || 1) + "px")
		}
		gutters.style.display = i ? "" : "none", updateGutterSpace(cm)
	}

	function setGuttersForLineNumbers(options) {
		var found = indexOf(options.gutters, "CodeMirror-linenumbers"); - 1 == found && options.lineNumbers ? options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]) : found > -1 && !options.lineNumbers && (options.gutters = options.gutters.slice(0), options.gutters.splice(found, 1))
	}

	function wheelEventDelta(e) {
		var dx = e.wheelDeltaX,
			dy = e.wheelDeltaY;
		return null == dx && e.detail && e.axis == e.HORIZONTAL_AXIS && (dx = e.detail), null == dy && e.detail && e.axis == e.VERTICAL_AXIS ? dy = e.detail : null == dy && (dy = e.wheelDelta), {
			x: dx,
			y: dy
		}
	}

	function wheelEventPixels(e) {
		var delta = wheelEventDelta(e);
		return delta.x *= wheelPixelsPerUnit, delta.y *= wheelPixelsPerUnit, delta
	}

	function onScrollWheel(cm, e) {
		var delta = wheelEventDelta(e),
			dx = delta.x,
			dy = delta.y,
			display = cm.display,
			scroll = display.scroller,
			canScrollX = scroll.scrollWidth > scroll.clientWidth,
			canScrollY = scroll.scrollHeight > scroll.clientHeight;
		if (dx && canScrollX || dy && canScrollY) {
			if (dy && mac && webkit) outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode)
				for (var i = 0; i < view.length; i++)
					if (view[i].node == cur) {
						cm.display.currentWheelTarget = cur;
						break outer
					}
			if (dx && !gecko && !presto && null != wheelPixelsPerUnit) return dy && canScrollY && updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * wheelPixelsPerUnit)), setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * wheelPixelsPerUnit)), (!dy || dy && canScrollY) && e_preventDefault(e), void(display.wheelStartX = null);
			if (dy && null != wheelPixelsPerUnit) {
				var pixels = dy * wheelPixelsPerUnit,
					top = cm.doc.scrollTop,
					bot = top + display.wrapper.clientHeight;
				0 > pixels ? top = Math.max(0, top + pixels - 50) : bot = Math.min(cm.doc.height, bot + pixels + 50), updateDisplaySimple(cm, {
					top: top,
					bottom: bot
				})
			}
			20 > wheelSamples && (null == display.wheelStartX ? (display.wheelStartX = scroll.scrollLeft, display.wheelStartY = scroll.scrollTop, display.wheelDX = dx, display.wheelDY = dy, setTimeout(function() {
				if (null != display.wheelStartX) {
					var movedX = scroll.scrollLeft - display.wheelStartX,
						movedY = scroll.scrollTop - display.wheelStartY,
						sample = movedY && display.wheelDY && movedY / display.wheelDY || movedX && display.wheelDX && movedX / display.wheelDX;
					display.wheelStartX = display.wheelStartY = null, sample && (wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1), ++wheelSamples)
				}
			}, 200)) : (display.wheelDX += dx, display.wheelDY += dy))
		}
	}

	function normalizeSelection(ranges, primIndex) {
		var prim = ranges[primIndex];
		ranges.sort(function(a, b) {
			return cmp(a.from(), b.from())
		}), primIndex = indexOf(ranges, prim);
		for (var i = 1; i < ranges.length; i++) {
			var cur = ranges[i],
				prev = ranges[i - 1];
			if (cmp(prev.to(), cur.from()) >= 0) {
				var from = minPos(prev.from(), cur.from()),
					to = maxPos(prev.to(), cur.to()),
					inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
				primIndex >= i && --primIndex, ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to))
			}
		}
		return new Selection(ranges, primIndex)
	}

	function simpleSelection(anchor, head) {
		return new Selection([new Range(anchor, head || anchor)], 0)
	}

	function changeEnd(change) {
		return change.text ? Pos(change.from.line + change.text.length - 1, lst(change.text).length + (1 == change.text.length ? change.from.ch : 0)) : change.to
	}

	function adjustForChange(pos, change) {
		if (cmp(pos, change.from) < 0) return pos;
		if (cmp(pos, change.to) <= 0) return changeEnd(change);
		var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1,
			ch = pos.ch;
		return pos.line == change.to.line && (ch += changeEnd(change).ch - change.to.ch), Pos(line, ch)
	}

	function computeSelAfterChange(doc, change) {
		for (var out = [], i = 0; i < doc.sel.ranges.length; i++) {
			var range = doc.sel.ranges[i];
			out.push(new Range(adjustForChange(range.anchor, change), adjustForChange(range.head, change)))
		}
		return normalizeSelection(out, doc.sel.primIndex)
	}

	function offsetPos(pos, old, nw) {
		return pos.line == old.line ? Pos(nw.line, pos.ch - old.ch + nw.ch) : Pos(nw.line + (pos.line - old.line), pos.ch)
	}

	function computeReplacedSel(doc, changes, hint) {
		for (var out = [], oldPrev = Pos(doc.first, 0), newPrev = oldPrev, i = 0; i < changes.length; i++) {
			var change = changes[i],
				from = offsetPos(change.from, oldPrev, newPrev),
				to = offsetPos(changeEnd(change), oldPrev, newPrev);
			if (oldPrev = change.to, newPrev = to, "around" == hint) {
				var range = doc.sel.ranges[i],
					inv = cmp(range.head, range.anchor) < 0;
				out[i] = new Range(inv ? to : from, inv ? from : to)
			} else out[i] = new Range(from, from)
		}
		return new Selection(out, doc.sel.primIndex)
	}

	function loadMode(cm) {
		cm.doc.mode = getMode(cm.options, cm.doc.modeOption), resetModeState(cm)
	}

	function resetModeState(cm) {
		cm.doc.iter(function(line) {
			line.stateAfter && (line.stateAfter = null), line.styles && (line.styles = null)
		}), cm.doc.modeFrontier = cm.doc.highlightFrontier = cm.doc.first, startWorker(cm, 100), cm.state.modeGen++, cm.curOp && regChange(cm)
	}

	function isWholeLineUpdate(doc, change) {
		return 0 == change.from.ch && 0 == change.to.ch && "" == lst(change.text) && (!doc.cm || doc.cm.options.wholeLineUpdateBefore)
	}

	function updateDoc(doc, change, markedSpans, estimateHeight) {
		function spansFor(n) {
			return markedSpans ? markedSpans[n] : null
		}

		function update(line, text, spans) {
			updateLine(line, text, spans, estimateHeight), signalLater(line, "change", line, change)
		}

		function linesFor(start, end) {
			for (var result = [], i = start; end > i; ++i) result.push(new Line(text[i], spansFor(i), estimateHeight));
			return result
		}
		var from = change.from,
			to = change.to,
			text = change.text,
			firstLine = getLine(doc, from.line),
			lastLine = getLine(doc, to.line),
			lastText = lst(text),
			lastSpans = spansFor(text.length - 1),
			nlines = to.line - from.line;
		if (change.full) doc.insert(0, linesFor(0, text.length)), doc.remove(text.length, doc.size - text.length);
		else if (isWholeLineUpdate(doc, change)) {
			var added = linesFor(0, text.length - 1);
			update(lastLine, lastLine.text, lastSpans), nlines && doc.remove(from.line, nlines), added.length && doc.insert(from.line, added)
		} else if (firstLine == lastLine)
			if (1 == text.length) update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
			else {
				var added$1 = linesFor(1, text.length - 1);
				added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight)), update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0)), doc.insert(from.line + 1, added$1)
			}
		else if (1 == text.length) update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0)), doc.remove(from.line + 1, nlines);
		else {
			update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0)), update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
			var added$2 = linesFor(1, text.length - 1);
			nlines > 1 && doc.remove(from.line + 1, nlines - 1), doc.insert(from.line + 1, added$2)
		}
		signalLater(doc, "change", doc, change)
	}

	function linkedDocs(doc, f, sharedHistOnly) {
		function propagate(doc, skip, sharedHist) {
			if (doc.linked)
				for (var i = 0; i < doc.linked.length; ++i) {
					var rel = doc.linked[i];
					if (rel.doc != skip) {
						var shared = sharedHist && rel.sharedHist;
						(!sharedHistOnly || shared) && (f(rel.doc, shared), propagate(rel.doc, doc, shared))
					}
				}
		}
		propagate(doc, null, !0)
	}

	function attachDoc(cm, doc) {
		if (doc.cm) throw new Error("This document is already in use.");
		cm.doc = doc, doc.cm = cm, estimateLineHeights(cm), loadMode(cm), setDirectionClass(cm), cm.options.lineWrapping || findMaxLine(cm), cm.options.mode = doc.modeOption, regChange(cm)
	}

	function setDirectionClass(cm) {
		("rtl" == cm.doc.direction ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl")
	}

	function directionChanged(cm) {
		runInOp(cm, function() {
			setDirectionClass(cm), regChange(cm)
		})
	}

	function History(startGen) {
		this.done = [], this.undone = [], this.undoDepth = 1 / 0, this.lastModTime = this.lastSelTime = 0, this.lastOp = this.lastSelOp = null, this.lastOrigin = this.lastSelOrigin = null, this.generation = this.maxGeneration = startGen || 1
	}

	function historyChangeFromChange(doc, change) {
		var histChange = {
			from: copyPos(change.from),
			to: changeEnd(change),
			text: getBetween(doc, change.from, change.to)
		};
		return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1), linkedDocs(doc, function(doc) {
			return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1)
		}, !0), histChange
	}

	function clearSelectionEvents(array) {
		for (; array.length;) {
			var last = lst(array);
			if (!last.ranges) break;
			array.pop()
		}
	}

	function lastChangeEvent(hist, force) {
		return force ? (clearSelectionEvents(hist.done), lst(hist.done)) : hist.done.length && !lst(hist.done).ranges ? lst(hist.done) : hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges ? (hist.done.pop(), lst(hist.done)) : void 0
	}

	function addChangeToHistory(doc, change, selAfter, opId) {
		var hist = doc.history;
		hist.undone.length = 0;
		var cur, last, time = +new Date;
		if ((hist.lastOp == opId || hist.lastOrigin == change.origin && change.origin && ("+" == change.origin.charAt(0) && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay || "*" == change.origin.charAt(0))) && (cur = lastChangeEvent(hist, hist.lastOp == opId))) last = lst(cur.changes), 0 == cmp(change.from, change.to) && 0 == cmp(change.from, last.to) ? last.to = changeEnd(change) : cur.changes.push(historyChangeFromChange(doc, change));
		else {
			var before = lst(hist.done);
			for (before && before.ranges || pushSelectionToHistory(doc.sel, hist.done), cur = {
					changes: [historyChangeFromChange(doc, change)],
					generation: hist.generation
				}, hist.done.push(cur); hist.done.length > hist.undoDepth;) hist.done.shift(), hist.done[0].ranges || hist.done.shift()
		}
		hist.done.push(selAfter), hist.generation = ++hist.maxGeneration, hist.lastModTime = hist.lastSelTime = time, hist.lastOp = hist.lastSelOp = opId, hist.lastOrigin = hist.lastSelOrigin = change.origin, last || signal(doc, "historyAdded")
	}

	function selectionEventCanBeMerged(doc, origin, prev, sel) {
		var ch = origin.charAt(0);
		return "*" == ch || "+" == ch && prev.ranges.length == sel.ranges.length && prev.somethingSelected() == sel.somethingSelected() && new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500)
	}

	function addSelectionToHistory(doc, sel, opId, options) {
		var hist = doc.history,
			origin = options && options.origin;
		opId == hist.lastSelOp || origin && hist.lastSelOrigin == origin && (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin || selectionEventCanBeMerged(doc, origin, lst(hist.done), sel)) ? hist.done[hist.done.length - 1] = sel : pushSelectionToHistory(sel, hist.done), hist.lastSelTime = +new Date, hist.lastSelOrigin = origin, hist.lastSelOp = opId, options && options.clearRedo !== !1 && clearSelectionEvents(hist.undone)
	}

	function pushSelectionToHistory(sel, dest) {
		var top = lst(dest);
		top && top.ranges && top.equals(sel) || dest.push(sel)
	}

	function attachLocalSpans(doc, change, from, to) {
		var existing = change["spans_" + doc.id],
			n = 0;
		doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function(line) {
			line.markedSpans && ((existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans), ++n
		})
	}

	function removeClearedSpans(spans) {
		if (!spans) return null;
		for (var out, i = 0; i < spans.length; ++i) spans[i].marker.explicitlyCleared ? out || (out = spans.slice(0, i)) : out && out.push(spans[i]);
		return out ? out.length ? out : null : spans
	}

	function getOldSpans(doc, change) {
		var found = change["spans_" + doc.id];
		if (!found) return null;
		for (var nw = [], i = 0; i < change.text.length; ++i) nw.push(removeClearedSpans(found[i]));
		return nw
	}

	function mergeOldSpans(doc, change) {
		var old = getOldSpans(doc, change),
			stretched = stretchSpansOverChange(doc, change);
		if (!old) return stretched;
		if (!stretched) return old;
		for (var i = 0; i < old.length; ++i) {
			var oldCur = old[i],
				stretchCur = stretched[i];
			if (oldCur && stretchCur) spans: for (var j = 0; j < stretchCur.length; ++j) {
				for (var span = stretchCur[j], k = 0; k < oldCur.length; ++k)
					if (oldCur[k].marker == span.marker) continue spans;
				oldCur.push(span)
			} else stretchCur && (old[i] = stretchCur)
		}
		return old
	}

	function copyHistoryArray(events, newGroup, instantiateSel) {
		for (var copy = [], i = 0; i < events.length; ++i) {
			var event = events[i];
			if (event.ranges) copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
			else {
				var changes = event.changes,
					newChanges = [];
				copy.push({
					changes: newChanges
				});
				for (var j = 0; j < changes.length; ++j) {
					var change = changes[j],
						m = void 0;
					if (newChanges.push({
							from: change.from,
							to: change.to,
							text: change.text
						}), newGroup)
						for (var prop in change)(m = prop.match(/^spans_(\d+)$/)) && indexOf(newGroup, Number(m[1])) > -1 && (lst(newChanges)[prop] = change[prop], delete change[prop])
				}
			}
		}
		return copy
	}

	function extendRange(range, head, other, extend) {
		if (extend) {
			var anchor = range.anchor;
			if (other) {
				var posBefore = cmp(head, anchor) < 0;
				posBefore != cmp(other, anchor) < 0 ? (anchor = head, head = other) : posBefore != cmp(head, other) < 0 && (head = other)
			}
			return new Range(anchor, head)
		}
		return new Range(other || head, head)
	}

	function extendSelection(doc, head, other, options, extend) {
		null == extend && (extend = doc.cm && (doc.cm.display.shift || doc.extend)), setSelection(doc, new Selection([extendRange(doc.sel.primary(), head, other, extend)], 0), options)
	}

	function extendSelections(doc, heads, options) {
		for (var out = [], extend = doc.cm && (doc.cm.display.shift || doc.extend), i = 0; i < doc.sel.ranges.length; i++) out[i] = extendRange(doc.sel.ranges[i], heads[i], null, extend);
		var newSel = normalizeSelection(out, doc.sel.primIndex);
		setSelection(doc, newSel, options)
	}

	function replaceOneSelection(doc, i, range, options) {
		var ranges = doc.sel.ranges.slice(0);
		ranges[i] = range, setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options)
	}

	function setSimpleSelection(doc, anchor, head, options) {
		setSelection(doc, simpleSelection(anchor, head), options)
	}

	function filterSelectionChange(doc, sel, options) {
		var obj = {
			ranges: sel.ranges,
			update: function(ranges) {
				var this$1 = this;
				this.ranges = [];
				for (var i = 0; i < ranges.length; i++) this$1.ranges[i] = new Range(clipPos(doc, ranges[i].anchor), clipPos(doc, ranges[i].head))
			},
			origin: options && options.origin
		};
		return signal(doc, "beforeSelectionChange", doc, obj), doc.cm && signal(doc.cm, "beforeSelectionChange", doc.cm, obj), obj.ranges != sel.ranges ? normalizeSelection(obj.ranges, obj.ranges.length - 1) : sel
	}

	function setSelectionReplaceHistory(doc, sel, options) {
		var done = doc.history.done,
			last = lst(done);
		last && last.ranges ? (done[done.length - 1] = sel, setSelectionNoUndo(doc, sel, options)) : setSelection(doc, sel, options)
	}

	function setSelection(doc, sel, options) {
		setSelectionNoUndo(doc, sel, options), addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : 0 / 0, options)
	}

	function setSelectionNoUndo(doc, sel, options) {
		(hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange")) && (sel = filterSelectionChange(doc, sel, options));
		var bias = options && options.bias || (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
		setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, !0)), options && options.scroll === !1 || !doc.cm || ensureCursorVisible(doc.cm)
	}

	function setSelectionInner(doc, sel) {
		sel.equals(doc.sel) || (doc.sel = sel, doc.cm && (doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = !0, signalCursorActivity(doc.cm)), signalLater(doc, "cursorActivity", doc))
	}

	function reCheckSelection(doc) {
		setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, !1))
	}

	function skipAtomicInSelection(doc, sel, bias, mayClear) {
		for (var out, i = 0; i < sel.ranges.length; i++) {
			var range = sel.ranges[i],
				old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i],
				newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear),
				newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);
			(out || newAnchor != range.anchor || newHead != range.head) && (out || (out = sel.ranges.slice(0, i)), out[i] = new Range(newAnchor, newHead))
		}
		return out ? normalizeSelection(out, sel.primIndex) : sel
	}

	function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
		var line = getLine(doc, pos.line);
		if (line.markedSpans)
			for (var i = 0; i < line.markedSpans.length; ++i) {
				var sp = line.markedSpans[i],
					m = sp.marker;
				if ((null == sp.from || (m.inclusiveLeft ? sp.from <= pos.ch : sp.from < pos.ch)) && (null == sp.to || (m.inclusiveRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
					if (mayClear && (signal(m, "beforeCursorEnter"), m.explicitlyCleared)) {
						if (line.markedSpans) {
							--i;
							continue
						}
						break
					}
					if (!m.atomic) continue;
					if (oldPos) {
						var near = m.find(0 > dir ? 1 : -1),
							diff = void 0;
						if ((0 > dir ? m.inclusiveRight : m.inclusiveLeft) && (near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null)), near && near.line == pos.line && (diff = cmp(near, oldPos)) && (0 > dir ? 0 > diff : diff > 0)) return skipAtomicInner(doc, near, pos, dir, mayClear)
					}
					var far = m.find(0 > dir ? -1 : 1);
					return (0 > dir ? m.inclusiveLeft : m.inclusiveRight) && (far = movePos(doc, far, dir, far.line == pos.line ? line : null)), far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null
				}
			}
		return pos
	}

	function skipAtomic(doc, pos, oldPos, bias, mayClear) {
		var dir = bias || 1,
			found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, dir, !0) || skipAtomicInner(doc, pos, oldPos, -dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, -dir, !0);
		return found ? found : (doc.cantEdit = !0, Pos(doc.first, 0))
	}

	function movePos(doc, pos, dir, line) {
		return 0 > dir && 0 == pos.ch ? pos.line > doc.first ? clipPos(doc, Pos(pos.line - 1)) : null : dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length ? pos.line < doc.first + doc.size - 1 ? Pos(pos.line + 1, 0) : null : new Pos(pos.line, pos.ch + dir)
	}

	function selectAll(cm) {
		cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll)
	}

	function filterChange(doc, change, update) {
		var obj = {
			canceled: !1,
			from: change.from,
			to: change.to,
			text: change.text,
			origin: change.origin,
			cancel: function() {
				return obj.canceled = !0
			}
		};
		return update && (obj.update = function(from, to, text, origin) {
			from && (obj.from = clipPos(doc, from)), to && (obj.to = clipPos(doc, to)), text && (obj.text = text), void 0 !== origin && (obj.origin = origin)
		}), signal(doc, "beforeChange", doc, obj), doc.cm && signal(doc.cm, "beforeChange", doc.cm, obj), obj.canceled ? null : {
			from: obj.from,
			to: obj.to,
			text: obj.text,
			origin: obj.origin
		}
	}

	function makeChange(doc, change, ignoreReadOnly) {
		if (doc.cm) {
			if (!doc.cm.curOp) return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
			if (doc.cm.state.suppressEdits) return
		}
		if (!(hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) || (change = filterChange(doc, change, !0))) {
			var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
			if (split)
				for (var i = split.length - 1; i >= 0; --i) makeChangeInner(doc, {
					from: split[i].from,
					to: split[i].to,
					text: i ? [""] : change.text,
					origin: change.origin
				});
			else makeChangeInner(doc, change)
		}
	}

	function makeChangeInner(doc, change) {
		if (1 != change.text.length || "" != change.text[0] || 0 != cmp(change.from, change.to)) {
			var selAfter = computeSelAfterChange(doc, change);
			addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : 0 / 0), makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
			var rebased = [];
			linkedDocs(doc, function(doc, sharedHist) {
				sharedHist || -1 != indexOf(rebased, doc.history) || (rebaseHist(doc.history, change), rebased.push(doc.history)), makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change))
			})
		}
	}

	function makeChangeFromHistory(doc, type, allowSelectionOnly) {
		var suppress = doc.cm && doc.cm.state.suppressEdits;
		if (!suppress || allowSelectionOnly) {
			for (var event, hist = doc.history, selAfter = doc.sel, source = "undo" == type ? hist.done : hist.undone, dest = "undo" == type ? hist.undone : hist.done, i = 0; i < source.length && (event = source[i], allowSelectionOnly ? !event.ranges || event.equals(doc.sel) : event.ranges); i++);
			if (i != source.length) {
				for (hist.lastOrigin = hist.lastSelOrigin = null;;) {
					if (event = source.pop(), !event.ranges) {
						if (suppress) return void source.push(event);
						break
					}
					if (pushSelectionToHistory(event, dest), allowSelectionOnly && !event.equals(doc.sel)) return void setSelection(doc, event, {
						clearRedo: !1
					});
					selAfter = event
				}
				var antiChanges = [];
				pushSelectionToHistory(selAfter, dest), dest.push({
					changes: antiChanges,
					generation: hist.generation
				}), hist.generation = event.generation || ++hist.maxGeneration;
				for (var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange"), loop = function(i) {
						var change = event.changes[i];
						if (change.origin = type, filter && !filterChange(doc, change, !1)) return source.length = 0, {};
						antiChanges.push(historyChangeFromChange(doc, change));
						var after = i ? computeSelAfterChange(doc, change) : lst(source);
						makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change)), !i && doc.cm && doc.cm.scrollIntoView({
							from: change.from,
							to: changeEnd(change)
						});
						var rebased = [];
						linkedDocs(doc, function(doc, sharedHist) {
							sharedHist || -1 != indexOf(rebased, doc.history) || (rebaseHist(doc.history, change), rebased.push(doc.history)), makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change))
						})
					}, i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
					var returned = loop(i$1);
					if (returned) return returned.v
				}
			}
		}
	}

	function shiftDoc(doc, distance) {
		if (0 != distance && (doc.first += distance, doc.sel = new Selection(map(doc.sel.ranges, function(range) {
				return new Range(Pos(range.anchor.line + distance, range.anchor.ch), Pos(range.head.line + distance, range.head.ch))
			}), doc.sel.primIndex), doc.cm)) {
			regChange(doc.cm, doc.first, doc.first - distance, distance);
			for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++) regLineChange(doc.cm, l, "gutter")
		}
	}

	function makeChangeSingleDoc(doc, change, selAfter, spans) {
		if (doc.cm && !doc.cm.curOp) return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);
		if (change.to.line < doc.first) return void shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
		if (!(change.from.line > doc.lastLine())) {
			if (change.from.line < doc.first) {
				var shift = change.text.length - 1 - (doc.first - change.from.line);
				shiftDoc(doc, shift), change = {
					from: Pos(doc.first, 0),
					to: Pos(change.to.line + shift, change.to.ch),
					text: [lst(change.text)],
					origin: change.origin
				}
			}
			var last = doc.lastLine();
			change.to.line > last && (change = {
				from: change.from,
				to: Pos(last, getLine(doc, last).text.length),
				text: [change.text[0]],
				origin: change.origin
			}), change.removed = getBetween(doc, change.from, change.to), selAfter || (selAfter = computeSelAfterChange(doc, change)), doc.cm ? makeChangeSingleDocInEditor(doc.cm, change, spans) : updateDoc(doc, change, spans), setSelectionNoUndo(doc, selAfter, sel_dontScroll)
		}
	}

	function makeChangeSingleDocInEditor(cm, change, spans) {
		var doc = cm.doc,
			display = cm.display,
			from = change.from,
			to = change.to,
			recomputeMaxLength = !1,
			checkWidthStart = from.line;
		cm.options.lineWrapping || (checkWidthStart = lineNo(visualLine(getLine(doc, from.line))), doc.iter(checkWidthStart, to.line + 1, function(line) {
			return line == display.maxLine ? (recomputeMaxLength = !0, !0) : void 0
		})), doc.sel.contains(change.from, change.to) > -1 && signalCursorActivity(cm), updateDoc(doc, change, spans, estimateHeight(cm)), cm.options.lineWrapping || (doc.iter(checkWidthStart, from.line + change.text.length, function(line) {
			var len = lineLength(line);
			len > display.maxLineLength && (display.maxLine = line, display.maxLineLength = len, display.maxLineChanged = !0, recomputeMaxLength = !1)
		}), recomputeMaxLength && (cm.curOp.updateMaxLine = !0)), retreatFrontier(doc, from.line), startWorker(cm, 400);
		var lendiff = change.text.length - (to.line - from.line) - 1;
		change.full ? regChange(cm) : from.line != to.line || 1 != change.text.length || isWholeLineUpdate(cm.doc, change) ? regChange(cm, from.line, to.line + 1, lendiff) : regLineChange(cm, from.line, "text");
		var changesHandler = hasHandler(cm, "changes"),
			changeHandler = hasHandler(cm, "change");
		if (changeHandler || changesHandler) {
			var obj = {
				from: from,
				to: to,
				text: change.text,
				removed: change.removed,
				origin: change.origin
			};
			changeHandler && signalLater(cm, "change", cm, obj), changesHandler && (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj)
		}
		cm.display.selForContextMenu = null
	}

	function replaceRange(doc, code, from, to, origin) {
		if (to || (to = from), cmp(to, from) < 0) {
			var assign;
			assign = [to, from], from = assign[0], to = assign[1], assign
		}
		"string" == typeof code && (code = doc.splitLines(code)), makeChange(doc, {
			from: from,
			to: to,
			text: code,
			origin: origin
		})
	}

	function rebaseHistSelSingle(pos, from, to, diff) {
		to < pos.line ? pos.line += diff : from < pos.line && (pos.line = from, pos.ch = 0)
	}

	function rebaseHistArray(array, from, to, diff) {
		for (var i = 0; i < array.length; ++i) {
			var sub = array[i],
				ok = !0;
			if (sub.ranges) {
				sub.copied || (sub = array[i] = sub.deepCopy(), sub.copied = !0);
				for (var j = 0; j < sub.ranges.length; j++) rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff), rebaseHistSelSingle(sub.ranges[j].head, from, to, diff)
			} else {
				for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
					var cur = sub.changes[j$1];
					if (to < cur.from.line) cur.from = Pos(cur.from.line + diff, cur.from.ch), cur.to = Pos(cur.to.line + diff, cur.to.ch);
					else if (from <= cur.to.line) {
						ok = !1;
						break
					}
				}
				ok || (array.splice(0, i + 1), i = 0)
			}
		}
	}

	function rebaseHist(hist, change) {
		var from = change.from.line,
			to = change.to.line,
			diff = change.text.length - (to - from) - 1;
		rebaseHistArray(hist.done, from, to, diff), rebaseHistArray(hist.undone, from, to, diff)
	}

	function changeLine(doc, handle, changeType, op) {
		var no = handle,
			line = handle;
		return "number" == typeof handle ? line = getLine(doc, clipLine(doc, handle)) : no = lineNo(handle), null == no ? null : (op(line, no) && doc.cm && regLineChange(doc.cm, no, changeType), line)
	}

	function LeafChunk(lines) {
		var this$1 = this;
		this.lines = lines, this.parent = null;
		for (var height = 0, i = 0; i < lines.length; ++i) lines[i].parent = this$1, height += lines[i].height;
		this.height = height
	}

	function BranchChunk(children) {
		var this$1 = this;
		this.children = children;
		for (var size = 0, height = 0, i = 0; i < children.length; ++i) {
			var ch = children[i];
			size += ch.chunkSize(), height += ch.height, ch.parent = this$1
		}
		this.size = size, this.height = height, this.parent = null
	}

	function adjustScrollWhenAboveVisible(cm, line, diff) {
		heightAtLine(line) < (cm.curOp && cm.curOp.scrollTop || cm.doc.scrollTop) && addToScrollTop(cm, diff)
	}

	function addLineWidget(doc, handle, node, options) {
		var widget = new LineWidget(doc, node, options),
			cm = doc.cm;
		return cm && widget.noHScroll && (cm.display.alignWidgets = !0), changeLine(doc, handle, "widget", function(line) {
			var widgets = line.widgets || (line.widgets = []);
			if (null == widget.insertAt ? widgets.push(widget) : widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget), widget.line = line, cm && !lineIsHidden(doc, line)) {
				var aboveVisible = heightAtLine(line) < doc.scrollTop;
				updateLineHeight(line, line.height + widgetHeight(widget)), aboveVisible && addToScrollTop(cm, widget.height), cm.curOp.forceUpdate = !0
			}
			return !0
		}), cm && signalLater(cm, "lineWidgetAdded", cm, widget, "number" == typeof handle ? handle : lineNo(handle)), widget
	}

	function markText(doc, from, to, options, type) {
		if (options && options.shared) return markTextShared(doc, from, to, options, type);
		if (doc.cm && !doc.cm.curOp) return operation(doc.cm, markText)(doc, from, to, options, type);
		var marker = new TextMarker(doc, type),
			diff = cmp(from, to);
		if (options && copyObj(options, marker, !1), diff > 0 || 0 == diff && marker.clearWhenEmpty !== !1) return marker;
		if (marker.replacedWith && (marker.collapsed = !0, marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget"), options.handleMouseEvents || marker.widgetNode.setAttribute("cm-ignore-events", "true"), options.insertLeft && (marker.widgetNode.insertLeft = !0)), marker.collapsed) {
			if (conflictingCollapsedRange(doc, from.line, from, to, marker) || from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker)) throw new Error("Inserting collapsed marker partially overlapping an existing one");
			seeCollapsedSpans()
		}
		marker.addToHistory && addChangeToHistory(doc, {
			from: from,
			to: to,
			origin: "markText"
		}, doc.sel, 0 / 0);
		var updateMaxLine, curLine = from.line,
			cm = doc.cm;
		if (doc.iter(curLine, to.line + 1, function(line) {
				cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine && (updateMaxLine = !0), marker.collapsed && curLine != from.line && updateLineHeight(line, 0), addMarkedSpan(line, new MarkedSpan(marker, curLine == from.line ? from.ch : null, curLine == to.line ? to.ch : null)), ++curLine
			}), marker.collapsed && doc.iter(from.line, to.line + 1, function(line) {
				lineIsHidden(doc, line) && updateLineHeight(line, 0)
			}), marker.clearOnEnter && on(marker, "beforeCursorEnter", function() {
				return marker.clear()
			}), marker.readOnly && (seeReadOnlySpans(), (doc.history.done.length || doc.history.undone.length) && doc.clearHistory()), marker.collapsed && (marker.id = ++nextMarkerId, marker.atomic = !0), cm) {
			if (updateMaxLine && (cm.curOp.updateMaxLine = !0), marker.collapsed) regChange(cm, from.line, to.line + 1);
			else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css)
				for (var i = from.line; i <= to.line; i++) regLineChange(cm, i, "text");
			marker.atomic && reCheckSelection(cm.doc), signalLater(cm, "markerAdded", cm, marker)
		}
		return marker
	}

	function markTextShared(doc, from, to, options, type) {
		options = copyObj(options), options.shared = !1;
		var markers = [markText(doc, from, to, options, type)],
			primary = markers[0],
			widget = options.widgetNode;
		return linkedDocs(doc, function(doc) {
			widget && (options.widgetNode = widget.cloneNode(!0)), markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
			for (var i = 0; i < doc.linked.length; ++i)
				if (doc.linked[i].isParent) return;
			primary = lst(markers)
		}), new SharedTextMarker(markers, primary)
	}

	function findSharedMarkers(doc) {
		return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function(m) {
			return m.parent
		})
	}

	function copySharedMarkers(doc, markers) {
		for (var i = 0; i < markers.length; i++) {
			var marker = markers[i],
				pos = marker.find(),
				mFrom = doc.clipPos(pos.from),
				mTo = doc.clipPos(pos.to);
			if (cmp(mFrom, mTo)) {
				var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
				marker.markers.push(subMark), subMark.parent = marker
			}
		}
	}

	function detachSharedMarkers(markers) {
		for (var loop = function(i) {
				var marker = markers[i],
					linked = [marker.primary.doc];
				linkedDocs(marker.primary.doc, function(d) {
					return linked.push(d)
				});
				for (var j = 0; j < marker.markers.length; j++) {
					var subMarker = marker.markers[j]; - 1 == indexOf(linked, subMarker.doc) && (subMarker.parent = null, marker.markers.splice(j--, 1))
				}
			}, i = 0; i < markers.length; i++) loop(i)
	}

	function onDrop(e) {
		var cm = this;
		if (clearDragCursor(cm), !signalDOMEvent(cm, e) && !eventInWidget(cm.display, e)) {
			e_preventDefault(e), ie && (lastDrop = +new Date);
			var pos = posFromMouse(cm, e, !0),
				files = e.dataTransfer.files;
			if (pos && !cm.isReadOnly())
				if (files && files.length && window.FileReader && window.File)
					for (var n = files.length, text = Array(n), read = 0, loadFile = function(file, i) {
							if (!cm.options.allowDropFileTypes || -1 != indexOf(cm.options.allowDropFileTypes, file.type)) {
								var reader = new FileReader;
								reader.onload = operation(cm, function() {
									var content = reader.result;
									if (/[\x00-\x08\x0e-\x1f]{2}/.test(content) && (content = ""), text[i] = content, ++read == n) {
										pos = clipPos(cm.doc, pos);
										var change = {
											from: pos,
											to: pos,
											text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
											origin: "paste"
										};
										makeChange(cm.doc, change), setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)))
									}
								}), reader.readAsText(file)
							}
						}, i = 0; n > i; ++i) loadFile(files[i], i);
				else {
					if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) return cm.state.draggingText(e), void setTimeout(function() {
						return cm.display.input.focus()
					}, 20);
					try {
						var text$1 = e.dataTransfer.getData("Text");
						if (text$1) {
							var selected;
							if (cm.state.draggingText && !cm.state.draggingText.copy && (selected = cm.listSelections()), setSelectionNoUndo(cm.doc, simpleSelection(pos, pos)), selected)
								for (var i$1 = 0; i$1 < selected.length; ++i$1) replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag");
							cm.replaceSelection(text$1, "around", "paste"), cm.display.input.focus()
						}
					} catch (e) {}
				}
		}
	}

	function onDragStart(cm, e) {
		if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) return void e_stop(e);
		if (!signalDOMEvent(cm, e) && !eventInWidget(cm.display, e) && (e.dataTransfer.setData("Text", cm.getSelection()), e.dataTransfer.effectAllowed = "copyMove", e.dataTransfer.setDragImage && !safari)) {
			var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
			img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", presto && (img.width = img.height = 1, cm.display.wrapper.appendChild(img), img._top = img.offsetTop), e.dataTransfer.setDragImage(img, 0, 0), presto && img.parentNode.removeChild(img)
		}
	}

	function onDragOver(cm, e) {
		var pos = posFromMouse(cm, e);
		if (pos) {
			var frag = document.createDocumentFragment();
			drawSelectionCursor(cm, pos, frag), cm.display.dragCursor || (cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors"), cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv)), removeChildrenAndAdd(cm.display.dragCursor, frag)
		}
	}

	function clearDragCursor(cm) {
		cm.display.dragCursor && (cm.display.lineSpace.removeChild(cm.display.dragCursor), cm.display.dragCursor = null)
	}

	function forEachCodeMirror(f) {
		if (document.getElementsByClassName)
			for (var byClass = document.getElementsByClassName("CodeMirror"), i = 0; i < byClass.length; i++) {
				var cm = byClass[i].CodeMirror;
				cm && f(cm)
			}
	}

	function ensureGlobalHandlers() {
		globalsRegistered || (registerGlobalHandlers(), globalsRegistered = !0)
	}

	function registerGlobalHandlers() {
		var resizeTimer;
		on(window, "resize", function() {
			null == resizeTimer && (resizeTimer = setTimeout(function() {
				resizeTimer = null, forEachCodeMirror(onResize)
			}, 100))
		}), on(window, "blur", function() {
			return forEachCodeMirror(onBlur)
		})
	}

	function onResize(cm) {
		var d = cm.display;
		(d.lastWrapHeight != d.wrapper.clientHeight || d.lastWrapWidth != d.wrapper.clientWidth) && (d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null, d.scrollbarsClipped = !1, cm.setSize())
	}

	function normalizeKeyName(name) {
		var parts = name.split(/-(?!$)/);
		name = parts[parts.length - 1];
		for (var alt, ctrl, shift, cmd, i = 0; i < parts.length - 1; i++) {
			var mod = parts[i];
			if (/^(cmd|meta|m)$/i.test(mod)) cmd = !0;
			else if (/^a(lt)?$/i.test(mod)) alt = !0;
			else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = !0;
			else {
				if (!/^s(hift)?$/i.test(mod)) throw new Error("Unrecognized modifier name: " + mod);
				shift = !0
			}
		}
		return alt && (name = "Alt-" + name), ctrl && (name = "Ctrl-" + name), cmd && (name = "Cmd-" + name), shift && (name = "Shift-" + name), name
	}

	function normalizeKeyMap(keymap) {
		var copy = {};
		for (var keyname in keymap)
			if (keymap.hasOwnProperty(keyname)) {
				var value = keymap[keyname];
				if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) continue;
				if ("..." == value) {
					delete keymap[keyname];
					continue
				}
				for (var keys = map(keyname.split(" "), normalizeKeyName), i = 0; i < keys.length; i++) {
					var val = void 0,
						name = void 0;
					i == keys.length - 1 ? (name = keys.join(" "), val = value) : (name = keys.slice(0, i + 1).join(" "), val = "...");
					var prev = copy[name];
					if (prev) {
						if (prev != val) throw new Error("Inconsistent bindings for " + name)
					} else copy[name] = val
				}
				delete keymap[keyname]
			}
		for (var prop in copy) keymap[prop] = copy[prop];
		return keymap
	}

	function lookupKey(key, map, handle, context) {
		map = getKeyMap(map);
		var found = map.call ? map.call(key, context) : map[key];
		if (found === !1) return "nothing";
		if ("..." === found) return "multi";
		if (null != found && handle(found)) return "handled";
		if (map.fallthrough) {
			if ("[object Array]" != Object.prototype.toString.call(map.fallthrough)) return lookupKey(key, map.fallthrough, handle, context);
			for (var i = 0; i < map.fallthrough.length; i++) {
				var result = lookupKey(key, map.fallthrough[i], handle, context);
				if (result) return result
			}
		}
	}

	function isModifierKey(value) {
		var name = "string" == typeof value ? value : keyNames[value.keyCode];
		return "Ctrl" == name || "Alt" == name || "Shift" == name || "Mod" == name
	}

	function addModifierNames(name, event, noShift) {
		var base = name;
		return event.altKey && "Alt" != base && (name = "Alt-" + name), (flipCtrlCmd ? event.metaKey : event.ctrlKey) && "Ctrl" != base && (name = "Ctrl-" + name), (flipCtrlCmd ? event.ctrlKey : event.metaKey) && "Cmd" != base && (name = "Cmd-" + name), !noShift && event.shiftKey && "Shift" != base && (name = "Shift-" + name), name
	}

	function keyName(event, noShift) {
		if (presto && 34 == event.keyCode && event["char"]) return !1;
		var name = keyNames[event.keyCode];
		return null == name || event.altGraphKey ? !1 : (3 == event.keyCode && event.code && (name = event.code), addModifierNames(name, event, noShift))
	}

	function getKeyMap(val) {
		return "string" == typeof val ? keyMap[val] : val
	}

	function deleteNearSelection(cm, compute) {
		for (var ranges = cm.doc.sel.ranges, kill = [], i = 0; i < ranges.length; i++) {
			for (var toKill = compute(ranges[i]); kill.length && cmp(toKill.from, lst(kill).to) <= 0;) {
				var replaced = kill.pop();
				if (cmp(replaced.from, toKill.from) < 0) {
					toKill.from = replaced.from;
					break
				}
			}
			kill.push(toKill)
		}
		runInOp(cm, function() {
			for (var i = kill.length - 1; i >= 0; i--) replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
			ensureCursorVisible(cm)
		})
	}

	function moveCharLogically(line, ch, dir) {
		var target = skipExtendingChars(line.text, ch + dir, dir);
		return 0 > target || target > line.text.length ? null : target
	}

	function moveLogically(line, start, dir) {
		var ch = moveCharLogically(line, start.ch, dir);
		return null == ch ? null : new Pos(start.line, ch, 0 > dir ? "after" : "before")
	}

	function endOfLine(visually, cm, lineObj, lineNo, dir) {
		if (visually) {
			var order = getOrder(lineObj, cm.doc.direction);
			if (order) {
				var ch, part = 0 > dir ? lst(order) : order[0],
					moveInStorageOrder = 0 > dir == (1 == part.level),
					sticky = moveInStorageOrder ? "after" : "before";
				if (part.level > 0 || "rtl" == cm.doc.direction) {
					var prep = prepareMeasureForLine(cm, lineObj);
					ch = 0 > dir ? lineObj.text.length - 1 : 0;
					var targetTop = measureCharPrepared(cm, prep, ch).top;
					ch = findFirst(function(ch) {
						return measureCharPrepared(cm, prep, ch).top == targetTop
					}, 0 > dir == (1 == part.level) ? part.from : part.to - 1, ch), "before" == sticky && (ch = moveCharLogically(lineObj, ch, 1))
				} else ch = 0 > dir ? part.to : part.from;
				return new Pos(lineNo, ch, sticky)
			}
		}
		return new Pos(lineNo, 0 > dir ? lineObj.text.length : 0, 0 > dir ? "before" : "after")
	}

	function moveVisually(cm, line, start, dir) {
		var bidi = getOrder(line, cm.doc.direction);
		if (!bidi) return moveLogically(line, start, dir);
		start.ch >= line.text.length ? (start.ch = line.text.length, start.sticky = "before") : start.ch <= 0 && (start.ch = 0, start.sticky = "after");
		var partPos = getBidiPartAt(bidi, start.ch, start.sticky),
			part = bidi[partPos];
		if ("ltr" == cm.doc.direction && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch)) return moveLogically(line, start, dir);
		var prep, mv = function(pos, dir) {
				return moveCharLogically(line, pos instanceof Pos ? pos.ch : pos, dir)
			},
			getWrappedLineExtent = function(ch) {
				return cm.options.lineWrapping ? (prep = prep || prepareMeasureForLine(cm, line), wrappedLineExtentChar(cm, line, prep, ch)) : {
					begin: 0,
					end: line.text.length
				}
			},
			wrappedLineExtent = getWrappedLineExtent("before" == start.sticky ? mv(start, -1) : start.ch);
		if ("rtl" == cm.doc.direction || 1 == part.level) {
			var moveInStorageOrder = 1 == part.level == 0 > dir,
				ch = mv(start, moveInStorageOrder ? 1 : -1);
			if (null != ch && (moveInStorageOrder ? ch <= part.to && ch <= wrappedLineExtent.end : ch >= part.from && ch >= wrappedLineExtent.begin)) {
				var sticky = moveInStorageOrder ? "before" : "after";
				return new Pos(start.line, ch, sticky)
			}
		}
		var searchInVisualLine = function(partPos, dir, wrappedLineExtent) {
				for (var getRes = function(ch, moveInStorageOrder) {
						return moveInStorageOrder ? new Pos(start.line, mv(ch, 1), "before") : new Pos(start.line, ch, "after")
					}; partPos >= 0 && partPos < bidi.length; partPos += dir) {
					var part = bidi[partPos],
						moveInStorageOrder = dir > 0 == (1 != part.level),
						ch = moveInStorageOrder ? wrappedLineExtent.begin : mv(wrappedLineExtent.end, -1);
					if (part.from <= ch && ch < part.to) return getRes(ch, moveInStorageOrder);
					if (ch = moveInStorageOrder ? part.from : mv(part.to, -1), wrappedLineExtent.begin <= ch && ch < wrappedLineExtent.end) return getRes(ch, moveInStorageOrder)
				}
			},
			res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent);
		if (res) return res;
		var nextCh = dir > 0 ? wrappedLineExtent.end : mv(wrappedLineExtent.begin, -1);
		return null == nextCh || dir > 0 && nextCh == line.text.length || !(res = searchInVisualLine(dir > 0 ? 0 : bidi.length - 1, dir, getWrappedLineExtent(nextCh))) ? null : res
	}

	function lineStart(cm, lineN) {
		var line = getLine(cm.doc, lineN),
			visual = visualLine(line);
		return visual != line && (lineN = lineNo(visual)), endOfLine(!0, cm, visual, lineN, 1)
	}

	function lineEnd(cm, lineN) {
		var line = getLine(cm.doc, lineN),
			visual = visualLineEnd(line);
		return visual != line && (lineN = lineNo(visual)), endOfLine(!0, cm, line, lineN, -1)
	}

	function lineStartSmart(cm, pos) {
		var start = lineStart(cm, pos.line),
			line = getLine(cm.doc, start.line),
			order = getOrder(line, cm.doc.direction);
		if (!order || 0 == order[0].level) {
			var firstNonWS = Math.max(0, line.text.search(/\S/)),
				inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
			return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky)
		}
		return start
	}

	function doHandleBinding(cm, bound, dropShift) {
		if ("string" == typeof bound && (bound = commands[bound], !bound)) return !1;
		cm.display.input.ensurePolled();
		var prevShift = cm.display.shift,
			done = !1;
		try {
			cm.isReadOnly() && (cm.state.suppressEdits = !0), dropShift && (cm.display.shift = !1), done = bound(cm) != Pass
		} finally {
			cm.display.shift = prevShift, cm.state.suppressEdits = !1
		}
		return done
	}

	function lookupKeyForEditor(cm, name, handle) {
		for (var i = 0; i < cm.state.keyMaps.length; i++) {
			var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
			if (result) return result
		}
		return cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm) || lookupKey(name, cm.options.keyMap, handle, cm)
	}

	function dispatchKey(cm, name, e, handle) {
		var seq = cm.state.keySeq;
		if (seq) {
			if (isModifierKey(name)) return "handled";
			if (/\'$/.test(name) ? cm.state.keySeq = null : stopSeq.set(50, function() {
					cm.state.keySeq == seq && (cm.state.keySeq = null, cm.display.input.reset())
				}), dispatchKeyInner(cm, seq + " " + name, e, handle)) return !0
		}
		return dispatchKeyInner(cm, name, e, handle)
	}

	function dispatchKeyInner(cm, name, e, handle) {
		var result = lookupKeyForEditor(cm, name, handle);
		return "multi" == result && (cm.state.keySeq = name), "handled" == result && signalLater(cm, "keyHandled", cm, name, e), ("handled" == result || "multi" == result) && (e_preventDefault(e), restartBlink(cm)), !!result
	}

	function handleKeyBinding(cm, e) {
		var name = keyName(e, !0);
		return name ? e.shiftKey && !cm.state.keySeq ? dispatchKey(cm, "Shift-" + name, e, function(b) {
			return doHandleBinding(cm, b, !0)
		}) || dispatchKey(cm, name, e, function(b) {
			return ("string" == typeof b ? /^go[A-Z]/.test(b) : b.motion) ? doHandleBinding(cm, b) : void 0
		}) : dispatchKey(cm, name, e, function(b) {
			return doHandleBinding(cm, b)
		}) : !1
	}

	function handleCharBinding(cm, e, ch) {
		return dispatchKey(cm, "'" + ch + "'", e, function(b) {
			return doHandleBinding(cm, b, !0)
		})
	}

	function onKeyDown(e) {
		var cm = this;
		if (cm.curOp.focus = activeElt(), !signalDOMEvent(cm, e)) {
			ie && 11 > ie_version && 27 == e.keyCode && (e.returnValue = !1);
			var code = e.keyCode;
			cm.display.shift = 16 == code || e.shiftKey;
			var handled = handleKeyBinding(cm, e);
			presto && (lastStoppedKey = handled ? code : null, !handled && 88 == code && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey) && cm.replaceSelection("", null, "cut")), 18 != code || /\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className) || showCrossHair(cm)
		}
	}

	function showCrossHair(cm) {
		function up(e) {
			18 != e.keyCode && e.altKey || (rmClass(lineDiv, "CodeMirror-crosshair"), off(document, "keyup", up), off(document, "mouseover", up))
		}
		var lineDiv = cm.display.lineDiv;
		addClass(lineDiv, "CodeMirror-crosshair"), on(document, "keyup", up), on(document, "mouseover", up)
	}

	function onKeyUp(e) {
		16 == e.keyCode && (this.doc.sel.shift = !1), signalDOMEvent(this, e)
	}

	function onKeyPress(e) {
		var cm = this;
		if (!(eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey)) {
			var keyCode = e.keyCode,
				charCode = e.charCode;
			if (presto && keyCode == lastStoppedKey) return lastStoppedKey = null, void e_preventDefault(e);
			if (!presto || e.which && !(e.which < 10) || !handleKeyBinding(cm, e)) {
				var ch = String.fromCharCode(null == charCode ? keyCode : charCode);
				"\b" != ch && (handleCharBinding(cm, e, ch) || cm.display.input.onKeyPress(e))
			}
		}
	}

	function clickRepeat(pos, button) {
		var now = +new Date;
		return lastDoubleClick && lastDoubleClick.compare(now, pos, button) ? (lastClick = lastDoubleClick = null, "triple") : lastClick && lastClick.compare(now, pos, button) ? (lastDoubleClick = new PastClick(now, pos, button), lastClick = null, "double") : (lastClick = new PastClick(now, pos, button), lastDoubleClick = null, "single")
	}

	function onMouseDown(e) {
		var cm = this,
			display = cm.display;
		if (!(signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch())) {
			if (display.input.ensurePolled(), display.shift = e.shiftKey, eventInWidget(display, e)) return void(webkit || (display.scroller.draggable = !1, setTimeout(function() {
				return display.scroller.draggable = !0
			}, 100)));
			if (!clickInGutter(cm, e)) {
				var pos = posFromMouse(cm, e),
					button = e_button(e),
					repeat = pos ? clickRepeat(pos, button) : "single";
				window.focus(), 1 == button && cm.state.selectingText && cm.state.selectingText(e), pos && handleMappedButton(cm, button, pos, repeat, e) || (1 == button ? pos ? leftButtonDown(cm, pos, repeat, e) : e_target(e) == display.scroller && e_preventDefault(e) : 2 == button ? (pos && extendSelection(cm.doc, pos), setTimeout(function() {
					return display.input.focus()
				}, 20)) : 3 == button && (captureRightClick ? onContextMenu(cm, e) : delayBlurEvent(cm)))
			}
		}
	}

	function handleMappedButton(cm, button, pos, repeat, event) {
		var name = "Click";
		return "double" == repeat ? name = "Double" + name : "triple" == repeat && (name = "Triple" + name), name = (1 == button ? "Left" : 2 == button ? "Middle" : "Right") + name, dispatchKey(cm, addModifierNames(name, event), event, function(bound) {
			if ("string" == typeof bound && (bound = commands[bound]), !bound) return !1;
			var done = !1;
			try {
				cm.isReadOnly() && (cm.state.suppressEdits = !0), done = bound(cm, pos) != Pass
			} finally {
				cm.state.suppressEdits = !1
			}
			return done
		})
	}

	function configureMouse(cm, repeat, event) {
		var option = cm.getOption("configureMouse"),
			value = option ? option(cm, repeat, event) : {};
		if (null == value.unit) {
			var rect = chromeOS ? event.shiftKey && event.metaKey : event.altKey;
			value.unit = rect ? "rectangle" : "single" == repeat ? "char" : "double" == repeat ? "word" : "line"
		}
		return (null == value.extend || cm.doc.extend) && (value.extend = cm.doc.extend || event.shiftKey), null == value.addNew && (value.addNew = mac ? event.metaKey : event.ctrlKey), null == value.moveOnDrag && (value.moveOnDrag = !(mac ? event.altKey : event.ctrlKey)), value
	}

	function leftButtonDown(cm, pos, repeat, event) {
		ie ? setTimeout(bind(ensureFocus, cm), 0) : cm.curOp.focus = activeElt();
		var contained, behavior = configureMouse(cm, repeat, event),
			sel = cm.doc.sel;
		cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() && "single" == repeat && (contained = sel.contains(pos)) > -1 && (cmp((contained = sel.ranges[contained]).from(), pos) < 0 || pos.xRel > 0) && (cmp(contained.to(), pos) > 0 || pos.xRel < 0) ? leftButtonStartDrag(cm, event, pos, behavior) : leftButtonSelect(cm, event, pos, behavior)
	}

	function leftButtonStartDrag(cm, event, pos, behavior) {
		var display = cm.display,
			moved = !1,
			dragEnd = operation(cm, function(e) {
				webkit && (display.scroller.draggable = !1), cm.state.draggingText = !1, off(document, "mouseup", dragEnd), off(document, "mousemove", mouseMove), off(display.scroller, "dragstart", dragStart), off(display.scroller, "drop", dragEnd), moved || (e_preventDefault(e), behavior.addNew || extendSelection(cm.doc, pos, null, null, behavior.extend), webkit || ie && 9 == ie_version ? setTimeout(function() {
					document.body.focus(), display.input.focus()
				}, 20) : display.input.focus())
			}),
			mouseMove = function(e2) {
				moved = moved || Math.abs(event.clientX - e2.clientX) + Math.abs(event.clientY - e2.clientY) >= 10
			},
			dragStart = function() {
				return moved = !0
			};
		webkit && (display.scroller.draggable = !0), cm.state.draggingText = dragEnd, dragEnd.copy = !behavior.moveOnDrag, display.scroller.dragDrop && display.scroller.dragDrop(), on(document, "mouseup", dragEnd), on(document, "mousemove", mouseMove), on(display.scroller, "dragstart", dragStart), on(display.scroller, "drop", dragEnd), delayBlurEvent(cm), setTimeout(function() {
			return display.input.focus()
		}, 20)
	}

	function rangeForUnit(cm, pos, unit) {
		if ("char" == unit) return new Range(pos, pos);
		if ("word" == unit) return cm.findWordAt(pos);
		if ("line" == unit) return new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0)));
		var result = unit(cm, pos);
		return new Range(result.from, result.to)
	}

	function leftButtonSelect(cm, event, start, behavior) {
		function extendTo(pos) {
			if (0 != cmp(lastPos, pos))
				if (lastPos = pos, "rectangle" == behavior.unit) {
					for (var ranges = [], tabSize = cm.options.tabSize, startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize), posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize), left = Math.min(startCol, posCol), right = Math.max(startCol, posCol), line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line)); end >= line; line++) {
						var text = getLine(doc, line).text,
							leftPos = findColumn(text, left, tabSize);
						left == right ? ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos))) : text.length > leftPos && ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))))
					}
					ranges.length || ranges.push(new Range(start, start)), setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex), {
						origin: "*mouse",
						scroll: !1
					}), cm.scrollIntoView(pos)
				} else {
					var head, oldRange = ourRange,
						range = rangeForUnit(cm, pos, behavior.unit),
						anchor = oldRange.anchor;
					cmp(range.anchor, anchor) > 0 ? (head = range.head, anchor = minPos(oldRange.from(), range.anchor)) : (head = range.anchor, anchor = maxPos(oldRange.to(), range.head));
					var ranges$1 = startSel.ranges.slice(0);
					ranges$1[ourIndex] = bidiSimplify(cm, new Range(clipPos(doc, anchor), head)), setSelection(doc, normalizeSelection(ranges$1, ourIndex), sel_mouse)
				}
		}

		function extend(e) {
			var curCount = ++counter,
				cur = posFromMouse(cm, e, !0, "rectangle" == behavior.unit);
			if (cur)
				if (0 != cmp(cur, lastPos)) {
					cm.curOp.focus = activeElt(), extendTo(cur);
					var visible = visibleLines(display, doc);
					(cur.line >= visible.to || cur.line < visible.from) && setTimeout(operation(cm, function() {
						counter == curCount && extend(e)
					}), 150)
				} else {
					var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
					outside && setTimeout(operation(cm, function() {
						counter == curCount && (display.scroller.scrollTop += outside, extend(e))
					}), 50)
				}
		}

		function done(e) {
			cm.state.selectingText = !1, counter = 1 / 0, e_preventDefault(e), display.input.focus(), off(document, "mousemove", move), off(document, "mouseup", up), doc.history.lastSelOrigin = null
		}
		var display = cm.display,
			doc = cm.doc;
		e_preventDefault(event);
		var ourRange, ourIndex, startSel = doc.sel,
			ranges = startSel.ranges;
		if (behavior.addNew && !behavior.extend ? (ourIndex = doc.sel.contains(start), ourRange = ourIndex > -1 ? ranges[ourIndex] : new Range(start, start)) : (ourRange = doc.sel.primary(), ourIndex = doc.sel.primIndex), "rectangle" == behavior.unit) behavior.addNew || (ourRange = new Range(start, start)), start = posFromMouse(cm, event, !0, !0), ourIndex = -1;
		else {
			var range = rangeForUnit(cm, start, behavior.unit);
			ourRange = behavior.extend ? extendRange(ourRange, range.anchor, range.head, behavior.extend) : range
		}
		behavior.addNew ? -1 == ourIndex ? (ourIndex = ranges.length, setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex), {
			scroll: !1,
			origin: "*mouse"
		})) : ranges.length > 1 && ranges[ourIndex].empty() && "char" == behavior.unit && !behavior.extend ? (setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0), {
			scroll: !1,
			origin: "*mouse"
		}), startSel = doc.sel) : replaceOneSelection(doc, ourIndex, ourRange, sel_mouse) : (ourIndex = 0, setSelection(doc, new Selection([ourRange], 0), sel_mouse), startSel = doc.sel);
		var lastPos = start,
			editorSize = display.wrapper.getBoundingClientRect(),
			counter = 0,
			move = operation(cm, function(e) {
				e_button(e) ? extend(e) : done(e)
			}),
			up = operation(cm, done);
		cm.state.selectingText = up, on(document, "mousemove", move), on(document, "mouseup", up)
	}

	function bidiSimplify(cm, range) {
		var anchor = range.anchor,
			head = range.head,
			anchorLine = getLine(cm.doc, anchor.line);
		if (0 == cmp(anchor, head) && anchor.sticky == head.sticky) return range;
		var order = getOrder(anchorLine);
		if (!order) return range;
		var index = getBidiPartAt(order, anchor.ch, anchor.sticky),
			part = order[index];
		if (part.from != anchor.ch && part.to != anchor.ch) return range;
		var boundary = index + (part.from == anchor.ch == (1 != part.level) ? 0 : 1);
		if (0 == boundary || boundary == order.length) return range;
		var leftSide;
		if (head.line != anchor.line) leftSide = (head.line - anchor.line) * ("ltr" == cm.doc.direction ? 1 : -1) > 0;
		else {
			var headIndex = getBidiPartAt(order, head.ch, head.sticky),
				dir = headIndex - index || (head.ch - anchor.ch) * (1 == part.level ? -1 : 1);
			leftSide = headIndex == boundary - 1 || headIndex == boundary ? 0 > dir : dir > 0
		}
		var usePart = order[boundary + (leftSide ? -1 : 0)],
			from = leftSide == (1 == usePart.level),
			ch = from ? usePart.from : usePart.to,
			sticky = from ? "after" : "before";
		return anchor.ch == ch && anchor.sticky == sticky ? range : new Range(new Pos(anchor.line, ch, sticky), head)
	}

	function gutterEvent(cm, e, type, prevent) {
		var mX, mY;
		if (e.touches) mX = e.touches[0].clientX, mY = e.touches[0].clientY;
		else try {
			mX = e.clientX, mY = e.clientY
		} catch (e) {
			return !1
		}
		if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) return !1;
		prevent && e_preventDefault(e);
		var display = cm.display,
			lineBox = display.lineDiv.getBoundingClientRect();
		if (mY > lineBox.bottom || !hasHandler(cm, type)) return e_defaultPrevented(e);
		mY -= lineBox.top - display.viewOffset;
		for (var i = 0; i < cm.options.gutters.length; ++i) {
			var g = display.gutters.childNodes[i];
			if (g && g.getBoundingClientRect().right >= mX) {
				var line = lineAtHeight(cm.doc, mY),
					gutter = cm.options.gutters[i];
				return signal(cm, type, cm, line, gutter, e), e_defaultPrevented(e)
			}
		}
	}

	function clickInGutter(cm, e) {
		return gutterEvent(cm, e, "gutterClick", !0)
	}

	function onContextMenu(cm, e) {
		eventInWidget(cm.display, e) || contextMenuInGutter(cm, e) || signalDOMEvent(cm, e, "contextmenu") || cm.display.input.onContextMenu(e)
	}

	function contextMenuInGutter(cm, e) {
		return hasHandler(cm, "gutterContextMenu") ? gutterEvent(cm, e, "gutterContextMenu", !1) : !1
	}

	function themeChanged(cm) {
		cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-"), clearCaches(cm)
	}

	function defineOptions(CodeMirror) {
		function option(name, deflt, handle, notOnInit) {
			CodeMirror.defaults[name] = deflt, handle && (optionHandlers[name] = notOnInit ? function(cm, val, old) {
				old != Init && handle(cm, val, old)
			} : handle)
		}
		var optionHandlers = CodeMirror.optionHandlers;
		CodeMirror.defineOption = option, CodeMirror.Init = Init, option("value", "", function(cm, val) {
			return cm.setValue(val)
		}, !0), option("mode", null, function(cm, val) {
			cm.doc.modeOption = val, loadMode(cm)
		}, !0), option("indentUnit", 2, loadMode, !0), option("indentWithTabs", !1), option("smartIndent", !0), option("tabSize", 4, function(cm) {
			resetModeState(cm), clearCaches(cm), regChange(cm)
		}, !0), option("lineSeparator", null, function(cm, val) {
			if (cm.doc.lineSep = val, val) {
				var newBreaks = [],
					lineNo = cm.doc.first;
				cm.doc.iter(function(line) {
					for (var pos = 0;;) {
						var found = line.text.indexOf(val, pos);
						if (-1 == found) break;
						pos = found + val.length, newBreaks.push(Pos(lineNo, found))
					}
					lineNo++
				});
				for (var i = newBreaks.length - 1; i >= 0; i--) replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length))
			}
		}), option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function(cm, val, old) {
			cm.state.specialChars = new RegExp(val.source + (val.test("	") ? "" : "|	"), "g"), old != Init && cm.refresh()
		}), option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function(cm) {
			return cm.refresh()
		}, !0), option("electricChars", !0), option("inputStyle", mobile ? "contenteditable" : "textarea", function() {
			throw new Error("inputStyle can not (yet) be changed in a running editor")
		}, !0), option("spellcheck", !1, function(cm, val) {
			return cm.getInputField().spellcheck = val
		}, !0), option("rtlMoveVisually", !windows), option("wholeLineUpdateBefore", !0), option("theme", "default", function(cm) {
			themeChanged(cm), guttersChanged(cm)
		}, !0), option("keyMap", "default", function(cm, val, old) {
			var next = getKeyMap(val),
				prev = old != Init && getKeyMap(old);
			prev && prev.detach && prev.detach(cm, next), next.attach && next.attach(cm, prev || null)
		}), option("extraKeys", null), option("configureMouse", null), option("lineWrapping", !1, wrappingChanged, !0), option("gutters", [], function(cm) {
			setGuttersForLineNumbers(cm.options), guttersChanged(cm)
		}, !0), option("fixedGutter", !0, function(cm, val) {
			cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0", cm.refresh()
		}, !0), option("coverGutterNextToScrollbar", !1, function(cm) {
			return updateScrollbars(cm)
		}, !0), option("scrollbarStyle", "native", function(cm) {
			initScrollbars(cm), updateScrollbars(cm), cm.display.scrollbars.setScrollTop(cm.doc.scrollTop), cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft)
		}, !0), option("lineNumbers", !1, function(cm) {
			setGuttersForLineNumbers(cm.options), guttersChanged(cm)
		}, !0), option("firstLineNumber", 1, guttersChanged, !0), option("lineNumberFormatter", function(integer) {
			return integer
		}, guttersChanged, !0), option("showCursorWhenSelecting", !1, updateSelection, !0), option("resetSelectionOnContextMenu", !0), option("lineWiseCopyCut", !0), option("pasteLinesPerSelection", !0), option("readOnly", !1, function(cm, val) {
			"nocursor" == val && (onBlur(cm), cm.display.input.blur()), cm.display.input.readOnlyChanged(val)
		}), option("disableInput", !1, function(cm, val) {
			val || cm.display.input.reset()
		}, !0), option("dragDrop", !0, dragDropChanged), option("allowDropFileTypes", null), option("cursorBlinkRate", 530), option("cursorScrollMargin", 0), option("cursorHeight", 1, updateSelection, !0), option("singleCursorHeightPerLine", !0, updateSelection, !0), option("workTime", 100), option("workDelay", 100), option("flattenSpans", !0, resetModeState, !0), option("addModeClass", !1, resetModeState, !0), option("pollInterval", 100), option("undoDepth", 200, function(cm, val) {
			return cm.doc.history.undoDepth = val
		}), option("historyEventDelay", 1250), option("viewportMargin", 10, function(cm) {
			return cm.refresh()
		}, !0), option("maxHighlightLength", 1e4, resetModeState, !0), option("moveInputWithCursor", !0, function(cm, val) {
			val || cm.display.input.resetPosition()
		}), option("tabindex", null, function(cm, val) {
			return cm.display.input.getField().tabIndex = val || ""
		}), option("autofocus", null), option("direction", "ltr", function(cm, val) {
			return cm.doc.setDirection(val)
		}, !0)
	}

	function guttersChanged(cm) {
		updateGutters(cm), regChange(cm), alignHorizontally(cm)
	}

	function dragDropChanged(cm, value, old) {
		var wasOn = old && old != Init;
		if (!value != !wasOn) {
			var funcs = cm.display.dragFunctions,
				toggle = value ? on : off;
			toggle(cm.display.scroller, "dragstart", funcs.start), toggle(cm.display.scroller, "dragenter", funcs.enter), toggle(cm.display.scroller, "dragover", funcs.over), toggle(cm.display.scroller, "dragleave", funcs.leave), toggle(cm.display.scroller, "drop", funcs.drop)
		}
	}

	function wrappingChanged(cm) {
		cm.options.lineWrapping ? (addClass(cm.display.wrapper, "CodeMirror-wrap"), cm.display.sizer.style.minWidth = "", cm.display.sizerWidth = null) : (rmClass(cm.display.wrapper, "CodeMirror-wrap"), findMaxLine(cm)), estimateLineHeights(cm), regChange(cm), clearCaches(cm), setTimeout(function() {
			return updateScrollbars(cm)
		}, 100)
	}

	function CodeMirror(place, options) {
		var this$1 = this;
		if (!(this instanceof CodeMirror)) return new CodeMirror(place, options);
		this.options = options = options ? copyObj(options) : {}, copyObj(defaults, options, !1), setGuttersForLineNumbers(options);
		var doc = options.value;
		"string" == typeof doc && (doc = new Doc(doc, options.mode, null, options.lineSeparator, options.direction)), this.doc = doc;
		var input = new CodeMirror.inputStyles[options.inputStyle](this),
			display = this.display = new Display(place, doc, input);
		display.wrapper.CodeMirror = this, updateGutters(this), themeChanged(this), options.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"), initScrollbars(this), this.state = {
			keyMaps: [],
			overlays: [],
			modeGen: 0,
			overwrite: !1,
			delayingBlurEvent: !1,
			focused: !1,
			suppressEdits: !1,
			pasteIncoming: !1,
			cutIncoming: !1,
			selectingText: !1,
			draggingText: !1,
			highlight: new Delayed,
			keySeq: null,
			specialChars: null
		}, options.autofocus && !mobile && display.input.focus(), ie && 11 > ie_version && setTimeout(function() {
			return this$1.display.input.reset(!0)
		}, 20), registerEventHandlers(this), ensureGlobalHandlers(), startOperation(this), this.curOp.forceUpdate = !0, attachDoc(this, doc), options.autofocus && !mobile || this.hasFocus() ? setTimeout(bind(onFocus, this), 20) : onBlur(this);
		for (var opt in optionHandlers) optionHandlers.hasOwnProperty(opt) && optionHandlers[opt](this$1, options[opt], Init);
		maybeUpdateLineNumberWidth(this), options.finishInit && options.finishInit(this);
		for (var i = 0; i < initHooks.length; ++i) initHooks[i](this$1);
		endOperation(this), webkit && options.lineWrapping && "optimizelegibility" == getComputedStyle(display.lineDiv).textRendering && (display.lineDiv.style.textRendering = "auto")
	}

	function registerEventHandlers(cm) {
		function finishTouch() {
			d.activeTouch && (touchFinished = setTimeout(function() {
				return d.activeTouch = null
			}, 1e3), prevTouch = d.activeTouch, prevTouch.end = +new Date)
		}

		function isMouseLikeTouchEvent(e) {
			if (1 != e.touches.length) return !1;
			var touch = e.touches[0];
			return touch.radiusX <= 1 && touch.radiusY <= 1
		}

		function farAway(touch, other) {
			if (null == other.left) return !0;
			var dx = other.left - touch.left,
				dy = other.top - touch.top;
			return dx * dx + dy * dy > 400
		}
		var d = cm.display;
		on(d.scroller, "mousedown", operation(cm, onMouseDown)), ie && 11 > ie_version ? on(d.scroller, "dblclick", operation(cm, function(e) {
			if (!signalDOMEvent(cm, e)) {
				var pos = posFromMouse(cm, e);
				if (pos && !clickInGutter(cm, e) && !eventInWidget(cm.display, e)) {
					e_preventDefault(e);
					var word = cm.findWordAt(pos);
					extendSelection(cm.doc, word.anchor, word.head)
				}
			}
		})) : on(d.scroller, "dblclick", function(e) {
			return signalDOMEvent(cm, e) || e_preventDefault(e)
		}), captureRightClick || on(d.scroller, "contextmenu", function(e) {
			return onContextMenu(cm, e)
		});
		var touchFinished, prevTouch = {
			end: 0
		};
		on(d.scroller, "touchstart", function(e) {
			if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e) && !clickInGutter(cm, e)) {
				d.input.ensurePolled(), clearTimeout(touchFinished);
				var now = +new Date;
				d.activeTouch = {
					start: now,
					moved: !1,
					prev: now - prevTouch.end <= 300 ? prevTouch : null
				}, 1 == e.touches.length && (d.activeTouch.left = e.touches[0].pageX, d.activeTouch.top = e.touches[0].pageY)
			}
		}), on(d.scroller, "touchmove", function() {
			d.activeTouch && (d.activeTouch.moved = !0)
		}), on(d.scroller, "touchend", function(e) {
			var touch = d.activeTouch;
			if (touch && !eventInWidget(d, e) && null != touch.left && !touch.moved && new Date - touch.start < 300) {
				var range, pos = cm.coordsChar(d.activeTouch, "page");
				range = !touch.prev || farAway(touch, touch.prev) ? new Range(pos, pos) : !touch.prev.prev || farAway(touch, touch.prev.prev) ? cm.findWordAt(pos) : new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0))), cm.setSelection(range.anchor, range.head), cm.focus(), e_preventDefault(e)
			}
			finishTouch()
		}), on(d.scroller, "touchcancel", finishTouch), on(d.scroller, "scroll", function() {
			d.scroller.clientHeight && (updateScrollTop(cm, d.scroller.scrollTop), setScrollLeft(cm, d.scroller.scrollLeft, !0), signal(cm, "scroll", cm))
		}), on(d.scroller, "mousewheel", function(e) {
			return onScrollWheel(cm, e)
		}), on(d.scroller, "DOMMouseScroll", function(e) {
			return onScrollWheel(cm, e)
		}), on(d.wrapper, "scroll", function() {
			return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0
		}), d.dragFunctions = {
			enter: function(e) {
				signalDOMEvent(cm, e) || e_stop(e)
			},
			over: function(e) {
				signalDOMEvent(cm, e) || (onDragOver(cm, e), e_stop(e))
			},
			start: function(e) {
				return onDragStart(cm, e)
			},
			drop: operation(cm, onDrop),
			leave: function(e) {
				signalDOMEvent(cm, e) || clearDragCursor(cm)
			}
		};
		var inp = d.input.getField();
		on(inp, "keyup", function(e) {
			return onKeyUp.call(cm, e)
		}), on(inp, "keydown", operation(cm, onKeyDown)), on(inp, "keypress", operation(cm, onKeyPress)), on(inp, "focus", function(e) {
			return onFocus(cm, e)
		}), on(inp, "blur", function(e) {
			return onBlur(cm, e)
		})
	}

	function indentLine(cm, n, how, aggressive) {
		var state, doc = cm.doc;
		null == how && (how = "add"), "smart" == how && (doc.mode.indent ? state = getContextBefore(cm, n).state : how = "prev");
		var tabSize = cm.options.tabSize,
			line = getLine(doc, n),
			curSpace = countColumn(line.text, null, tabSize);
		line.stateAfter && (line.stateAfter = null);
		var indentation, curSpaceString = line.text.match(/^\s*/)[0];
		if (aggressive || /\S/.test(line.text)) {
			if ("smart" == how && (indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text), indentation == Pass || indentation > 150)) {
				if (!aggressive) return;
				how = "prev"
			}
		} else indentation = 0, how = "not";
		"prev" == how ? indentation = n > doc.first ? countColumn(getLine(doc, n - 1).text, null, tabSize) : 0 : "add" == how ? indentation = curSpace + cm.options.indentUnit : "subtract" == how ? indentation = curSpace - cm.options.indentUnit : "number" == typeof how && (indentation = curSpace + how), indentation = Math.max(0, indentation);
		var indentString = "",
			pos = 0;
		if (cm.options.indentWithTabs)
			for (var i = Math.floor(indentation / tabSize); i; --i) pos += tabSize, indentString += "	";
		if (indentation > pos && (indentString += spaceStr(indentation - pos)), indentString != curSpaceString) return replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input"), line.stateAfter = null, !0;
		for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
			var range = doc.sel.ranges[i$1];
			if (range.head.line == n && range.head.ch < curSpaceString.length) {
				var pos$1 = Pos(n, curSpaceString.length);
				replaceOneSelection(doc, i$1, new Range(pos$1, pos$1));
				break
			}
		}
	}

	function setLastCopied(newLastCopied) {
		lastCopied = newLastCopied
	}

	function applyTextInput(cm, inserted, deleted, sel, origin) {
		var doc = cm.doc;
		cm.display.shift = !1, sel || (sel = doc.sel);
		var paste = cm.state.pasteIncoming || "paste" == origin,
			textLines = splitLinesAuto(inserted),
			multiPaste = null;
		if (paste && sel.ranges.length > 1)
			if (lastCopied && lastCopied.text.join("\n") == inserted) {
				if (sel.ranges.length % lastCopied.text.length == 0) {
					multiPaste = [];
					for (var i = 0; i < lastCopied.text.length; i++) multiPaste.push(doc.splitLines(lastCopied.text[i]))
				}
			} else textLines.length == sel.ranges.length && cm.options.pasteLinesPerSelection && (multiPaste = map(textLines, function(l) {
				return [l]
			}));
		for (var updateInput, i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
			var range = sel.ranges[i$1],
				from = range.from(),
				to = range.to();
			range.empty() && (deleted && deleted > 0 ? from = Pos(from.line, from.ch - deleted) : cm.state.overwrite && !paste ? to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length)) : lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted && (from = to = Pos(from.line, 0))), updateInput = cm.curOp.updateInput;
			var changeEvent = {
				from: from,
				to: to,
				text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
				origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input")
			};
			makeChange(cm.doc, changeEvent), signalLater(cm, "inputRead", cm, changeEvent)
		}
		inserted && !paste && triggerElectric(cm, inserted), ensureCursorVisible(cm), cm.curOp.updateInput = updateInput, cm.curOp.typing = !0, cm.state.pasteIncoming = cm.state.cutIncoming = !1
	}

	function handlePaste(e, cm) {
		var pasted = e.clipboardData && e.clipboardData.getData("Text");
		return pasted ? (e.preventDefault(), cm.isReadOnly() || cm.options.disableInput || runInOp(cm, function() {
			return applyTextInput(cm, pasted, 0, null, "paste")
		}), !0) : void 0
	}

	function triggerElectric(cm, inserted) {
		if (cm.options.electricChars && cm.options.smartIndent)
			for (var sel = cm.doc.sel, i = sel.ranges.length - 1; i >= 0; i--) {
				var range = sel.ranges[i];
				if (!(range.head.ch > 100 || i && sel.ranges[i - 1].head.line == range.head.line)) {
					var mode = cm.getModeAt(range.head),
						indented = !1;
					if (mode.electricChars) {
						for (var j = 0; j < mode.electricChars.length; j++)
							if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
								indented = indentLine(cm, range.head.line, "smart");
								break
							}
					} else mode.electricInput && mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch)) && (indented = indentLine(cm, range.head.line, "smart"));
					indented && signalLater(cm, "electricInput", cm, range.head.line)
				}
			}
	}

	function copyableRanges(cm) {
		for (var text = [], ranges = [], i = 0; i < cm.doc.sel.ranges.length; i++) {
			var line = cm.doc.sel.ranges[i].head.line,
				lineRange = {
					anchor: Pos(line, 0),
					head: Pos(line + 1, 0)
				};
			ranges.push(lineRange), text.push(cm.getRange(lineRange.anchor, lineRange.head))
		}
		return {
			text: text,
			ranges: ranges
		}
	}

	function disableBrowserMagic(field, spellcheck) {
		field.setAttribute("autocorrect", "off"), field.setAttribute("autocapitalize", "off"), field.setAttribute("spellcheck", !!spellcheck)
	}

	function hiddenTextarea() {
		var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none"),
			div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
		return webkit ? te.style.width = "1000px" : te.setAttribute("wrap", "off"), ios && (te.style.border = "1px solid black"), disableBrowserMagic(te), div
	}

	function addEditorMethods(CodeMirror) {
		var optionHandlers = CodeMirror.optionHandlers,
			helpers = CodeMirror.helpers = {};
		CodeMirror.prototype = {
			constructor: CodeMirror,
			focus: function() {
				window.focus(), this.display.input.focus()
			},
			setOption: function(option, value) {
				var options = this.options,
					old = options[option];
				(options[option] != value || "mode" == option) && (options[option] = value, optionHandlers.hasOwnProperty(option) && operation(this, optionHandlers[option])(this, value, old), signal(this, "optionChange", this, option))
			},
			getOption: function(option) {
				return this.options[option]
			},
			getDoc: function() {
				return this.doc
			},
			addKeyMap: function(map, bottom) {
				this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map))
			},
			removeKeyMap: function(map) {
				for (var maps = this.state.keyMaps, i = 0; i < maps.length; ++i)
					if (maps[i] == map || maps[i].name == map) return maps.splice(i, 1), !0
			},
			addOverlay: methodOp(function(spec, options) {
				var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
				if (mode.startState) throw new Error("Overlays may not be stateful.");
				insertSorted(this.state.overlays, {
					mode: mode,
					modeSpec: spec,
					opaque: options && options.opaque,
					priority: options && options.priority || 0
				}, function(overlay) {
					return overlay.priority
				}), this.state.modeGen++, regChange(this)
			}),
			removeOverlay: methodOp(function(spec) {
				for (var this$1 = this, overlays = this.state.overlays, i = 0; i < overlays.length; ++i) {
					var cur = overlays[i].modeSpec;
					if (cur == spec || "string" == typeof spec && cur.name == spec) return overlays.splice(i, 1), this$1.state.modeGen++, void regChange(this$1)
				}
			}),
			indentLine: methodOp(function(n, dir, aggressive) {
				"string" != typeof dir && "number" != typeof dir && (dir = null == dir ? this.options.smartIndent ? "smart" : "prev" : dir ? "add" : "subtract"), isLine(this.doc, n) && indentLine(this, n, dir, aggressive)
			}),
			indentSelection: methodOp(function(how) {
				for (var this$1 = this, ranges = this.doc.sel.ranges, end = -1, i = 0; i < ranges.length; i++) {
					var range = ranges[i];
					if (range.empty()) range.head.line > end && (indentLine(this$1, range.head.line, how, !0), end = range.head.line, i == this$1.doc.sel.primIndex && ensureCursorVisible(this$1));
					else {
						var from = range.from(),
							to = range.to(),
							start = Math.max(end, from.line);
						end = Math.min(this$1.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
						for (var j = start; end > j; ++j) indentLine(this$1, j, how);
						var newRanges = this$1.doc.sel.ranges;
						0 == from.ch && ranges.length == newRanges.length && newRanges[i].from().ch > 0 && replaceOneSelection(this$1.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll)
					}
				}
			}),
			getTokenAt: function(pos, precise) {
				return takeToken(this, pos, precise)
			},
			getLineTokens: function(line, precise) {
				return takeToken(this, Pos(line), precise, !0)
			},
			getTokenTypeAt: function(pos) {
				pos = clipPos(this.doc, pos);
				var type, styles = getLineStyles(this, getLine(this.doc, pos.line)),
					before = 0,
					after = (styles.length - 1) / 2,
					ch = pos.ch;
				if (0 == ch) type = styles[2];
				else
					for (;;) {
						var mid = before + after >> 1;
						if ((mid ? styles[2 * mid - 1] : 0) >= ch) after = mid;
						else {
							if (!(styles[2 * mid + 1] < ch)) {
								type = styles[2 * mid + 2];
								break
							}
							before = mid + 1
						}
					}
				var cut = type ? type.indexOf("overlay ") : -1;
				return 0 > cut ? type : 0 == cut ? null : type.slice(0, cut - 1)
			},
			getModeAt: function(pos) {
				var mode = this.doc.mode;
				return mode.innerMode ? CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode : mode
			},
			getHelper: function(pos, type) {
				return this.getHelpers(pos, type)[0]
			},
			getHelpers: function(pos, type) {
				var this$1 = this,
					found = [];
				if (!helpers.hasOwnProperty(type)) return found;
				var help = helpers[type],
					mode = this.getModeAt(pos);
				if ("string" == typeof mode[type]) help[mode[type]] && found.push(help[mode[type]]);
				else if (mode[type])
					for (var i = 0; i < mode[type].length; i++) {
						var val = help[mode[type][i]];
						val && found.push(val)
					} else mode.helperType && help[mode.helperType] ? found.push(help[mode.helperType]) : help[mode.name] && found.push(help[mode.name]);
				for (var i$1 = 0; i$1 < help._global.length; i$1++) {
					var cur = help._global[i$1];
					cur.pred(mode, this$1) && -1 == indexOf(found, cur.val) && found.push(cur.val)
				}
				return found
			},
			getStateAfter: function(line, precise) {
				var doc = this.doc;
				return line = clipLine(doc, null == line ? doc.first + doc.size - 1 : line), getContextBefore(this, line + 1, precise).state
			},
			cursorCoords: function(start, mode) {
				var pos, range = this.doc.sel.primary();
				return pos = null == start ? range.head : "object" == typeof start ? clipPos(this.doc, start) : start ? range.from() : range.to(), cursorCoords(this, pos, mode || "page")
			},
			charCoords: function(pos, mode) {
				return charCoords(this, clipPos(this.doc, pos), mode || "page")
			},
			coordsChar: function(coords, mode) {
				return coords = fromCoordSystem(this, coords, mode || "page"), coordsChar(this, coords.left, coords.top)
			},
			lineAtHeight: function(height, mode) {
				return height = fromCoordSystem(this, {
					top: height,
					left: 0
				}, mode || "page").top, lineAtHeight(this.doc, height + this.display.viewOffset)
			},
			heightAtLine: function(line, mode, includeWidgets) {
				var lineObj, end = !1;
				if ("number" == typeof line) {
					var last = this.doc.first + this.doc.size - 1;
					line < this.doc.first ? line = this.doc.first : line > last && (line = last, end = !0), lineObj = getLine(this.doc, line)
				} else lineObj = line;
				return intoCoordSystem(this, lineObj, {
					top: 0,
					left: 0
				}, mode || "page", includeWidgets || end).top + (end ? this.doc.height - heightAtLine(lineObj) : 0)
			},
			defaultTextHeight: function() {
				return textHeight(this.display)
			},
			defaultCharWidth: function() {
				return charWidth(this.display)
			},
			getViewport: function() {
				return {
					from: this.display.viewFrom,
					to: this.display.viewTo
				}
			},
			addWidget: function(pos, node, scroll, vert, horiz) {
				var display = this.display;
				pos = cursorCoords(this, clipPos(this.doc, pos));
				var top = pos.bottom,
					left = pos.left;
				if (node.style.position = "absolute", node.setAttribute("cm-ignore-events", "true"), this.display.input.setUneditable(node), display.sizer.appendChild(node), "over" == vert) top = pos.top;
				else if ("above" == vert || "near" == vert) {
					var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
						hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
					("above" == vert || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight ? top = pos.top - node.offsetHeight : pos.bottom + node.offsetHeight <= vspace && (top = pos.bottom), left + node.offsetWidth > hspace && (left = hspace - node.offsetWidth)
				}
				node.style.top = top + "px", node.style.left = node.style.right = "", "right" == horiz ? (left = display.sizer.clientWidth - node.offsetWidth, node.style.right = "0px") : ("left" == horiz ? left = 0 : "middle" == horiz && (left = (display.sizer.clientWidth - node.offsetWidth) / 2), node.style.left = left + "px"), scroll && scrollIntoView(this, {
					left: left,
					top: top,
					right: left + node.offsetWidth,
					bottom: top + node.offsetHeight
				})
			},
			triggerOnKeyDown: methodOp(onKeyDown),
			triggerOnKeyPress: methodOp(onKeyPress),
			triggerOnKeyUp: onKeyUp,
			triggerOnMouseDown: methodOp(onMouseDown),
			execCommand: function(cmd) {
				return commands.hasOwnProperty(cmd) ? commands[cmd].call(null, this) : void 0
			},
			triggerElectric: methodOp(function(text) {
				triggerElectric(this, text)
			}),
			findPosH: function(from, amount, unit, visually) {
				var this$1 = this,
					dir = 1;
				0 > amount && (dir = -1, amount = -amount);
				for (var cur = clipPos(this.doc, from), i = 0; amount > i && (cur = findPosH(this$1.doc, cur, dir, unit, visually), !cur.hitSide); ++i);
				return cur
			},
			moveH: methodOp(function(dir, unit) {
				var this$1 = this;
				this.extendSelectionsBy(function(range) {
					return this$1.display.shift || this$1.doc.extend || range.empty() ? findPosH(this$1.doc, range.head, dir, unit, this$1.options.rtlMoveVisually) : 0 > dir ? range.from() : range.to()
				}, sel_move)
			}),
			deleteH: methodOp(function(dir, unit) {
				var sel = this.doc.sel,
					doc = this.doc;
				sel.somethingSelected() ? doc.replaceSelection("", null, "+delete") : deleteNearSelection(this, function(range) {
					var other = findPosH(doc, range.head, dir, unit, !1);
					return 0 > dir ? {
						from: other,
						to: range.head
					} : {
						from: range.head,
						to: other
					}
				})
			}),
			findPosV: function(from, amount, unit, goalColumn) {
				var this$1 = this,
					dir = 1,
					x = goalColumn;
				0 > amount && (dir = -1, amount = -amount);
				for (var cur = clipPos(this.doc, from), i = 0; amount > i; ++i) {
					var coords = cursorCoords(this$1, cur, "div");
					if (null == x ? x = coords.left : coords.left = x, cur = findPosV(this$1, coords, dir, unit), cur.hitSide) break
				}
				return cur
			},
			moveV: methodOp(function(dir, unit) {
				var this$1 = this,
					doc = this.doc,
					goals = [],
					collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
				if (doc.extendSelectionsBy(function(range) {
						if (collapse) return 0 > dir ? range.from() : range.to();
						var headPos = cursorCoords(this$1, range.head, "div");
						null != range.goalColumn && (headPos.left = range.goalColumn), goals.push(headPos.left);
						var pos = findPosV(this$1, headPos, dir, unit);
						return "page" == unit && range == doc.sel.primary() && addToScrollTop(this$1, charCoords(this$1, pos, "div").top - headPos.top), pos
					}, sel_move), goals.length)
					for (var i = 0; i < doc.sel.ranges.length; i++) doc.sel.ranges[i].goalColumn = goals[i]
			}),
			findWordAt: function(pos) {
				var doc = this.doc,
					line = getLine(doc, pos.line).text,
					start = pos.ch,
					end = pos.ch;
				if (line) {
					var helper = this.getHelper(pos, "wordChars");
					"before" != pos.sticky && end != line.length || !start ? ++end : --start;
					for (var startChar = line.charAt(start), check = isWordChar(startChar, helper) ? function(ch) {
							return isWordChar(ch, helper)
						} : /\s/.test(startChar) ? function(ch) {
							return /\s/.test(ch)
						} : function(ch) {
							return !/\s/.test(ch) && !isWordChar(ch)
						}; start > 0 && check(line.charAt(start - 1));) --start;
					for (; end < line.length && check(line.charAt(end));) ++end
				}
				return new Range(Pos(pos.line, start), Pos(pos.line, end))
			},
			toggleOverwrite: function(value) {
				(null == value || value != this.state.overwrite) && ((this.state.overwrite = !this.state.overwrite) ? addClass(this.display.cursorDiv, "CodeMirror-overwrite") : rmClass(this.display.cursorDiv, "CodeMirror-overwrite"), signal(this, "overwriteToggle", this, this.state.overwrite))
			},
			hasFocus: function() {
				return this.display.input.getField() == activeElt()
			},
			isReadOnly: function() {
				return !(!this.options.readOnly && !this.doc.cantEdit)
			},
			scrollTo: methodOp(function(x, y) {
				scrollToCoords(this, x, y)
			}),
			getScrollInfo: function() {
				var scroller = this.display.scroller;
				return {
					left: scroller.scrollLeft,
					top: scroller.scrollTop,
					height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
					width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
					clientHeight: displayHeight(this),
					clientWidth: displayWidth(this)
				}
			},
			scrollIntoView: methodOp(function(range, margin) {
				null == range ? (range = {
					from: this.doc.sel.primary().head,
					to: null
				}, null == margin && (margin = this.options.cursorScrollMargin)) : "number" == typeof range ? range = {
					from: Pos(range, 0),
					to: null
				} : null == range.from && (range = {
					from: range,
					to: null
				}), range.to || (range.to = range.from), range.margin = margin || 0, null != range.from.line ? scrollToRange(this, range) : scrollToCoordsRange(this, range.from, range.to, range.margin)
			}),
			setSize: methodOp(function(width, height) {
				var this$1 = this,
					interpret = function(val) {
						return "number" == typeof val || /^\d+$/.test(String(val)) ? val + "px" : val
					};
				null != width && (this.display.wrapper.style.width = interpret(width)), null != height && (this.display.wrapper.style.height = interpret(height)), this.options.lineWrapping && clearLineMeasurementCache(this);
				var lineNo = this.display.viewFrom;
				this.doc.iter(lineNo, this.display.viewTo, function(line) {
					if (line.widgets)
						for (var i = 0; i < line.widgets.length; i++)
							if (line.widgets[i].noHScroll) {
								regLineChange(this$1, lineNo, "widget");
								break
							}++lineNo
				}), this.curOp.forceUpdate = !0, signal(this, "refresh", this)
			}),
			operation: function(f) {
				return runInOp(this, f)
			},
			startOperation: function() {
				return startOperation(this)
			},
			endOperation: function() {
				return endOperation(this)
			},
			refresh: methodOp(function() {
				var oldHeight = this.display.cachedTextHeight;
				regChange(this), this.curOp.forceUpdate = !0, clearCaches(this), scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop), updateGutterSpace(this), (null == oldHeight || Math.abs(oldHeight - textHeight(this.display)) > .5) && estimateLineHeights(this), signal(this, "refresh", this)
			}),
			swapDoc: methodOp(function(doc) {
				var old = this.doc;
				return old.cm = null, attachDoc(this, doc), clearCaches(this), this.display.input.reset(), scrollToCoords(this, doc.scrollLeft, doc.scrollTop), this.curOp.forceScroll = !0, signalLater(this, "swapDoc", this, old), old
			}),
			getInputField: function() {
				return this.display.input.getField()
			},
			getWrapperElement: function() {
				return this.display.wrapper
			},
			getScrollerElement: function() {
				return this.display.scroller
			},
			getGutterElement: function() {
				return this.display.gutters
			}
		}, eventMixin(CodeMirror), CodeMirror.registerHelper = function(type, name, value) {
			helpers.hasOwnProperty(type) || (helpers[type] = CodeMirror[type] = {
				_global: []
			}), helpers[type][name] = value
		}, CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
			CodeMirror.registerHelper(type, name, value), helpers[type]._global.push({
				pred: predicate,
				val: value
			})
		}
	}

	function findPosH(doc, pos, dir, unit, visually) {
		function findNextLine() {
			var l = pos.line + dir;
			return l < doc.first || l >= doc.first + doc.size ? !1 : (pos = new Pos(l, pos.ch, pos.sticky), lineObj = getLine(doc, l))
		}

		function moveOnce(boundToLine) {
			var next;
			if (next = visually ? moveVisually(doc.cm, lineObj, pos, dir) : moveLogically(lineObj, pos, dir), null == next) {
				if (boundToLine || !findNextLine()) return !1;
				pos = endOfLine(visually, doc.cm, lineObj, pos.line, dir)
			} else pos = next;
			return !0
		}
		var oldPos = pos,
			origDir = dir,
			lineObj = getLine(doc, pos.line);
		if ("char" == unit) moveOnce();
		else if ("column" == unit) moveOnce(!0);
		else if ("word" == unit || "group" == unit)
			for (var sawType = null, group = "group" == unit, helper = doc.cm && doc.cm.getHelper(pos, "wordChars"), first = !0; !(0 > dir) || moveOnce(!first); first = !1) {
				var cur = lineObj.text.charAt(pos.ch) || "\n",
					type = isWordChar(cur, helper) ? "w" : group && "\n" == cur ? "n" : !group || /\s/.test(cur) ? null : "p";
				if (!group || first || type || (type = "s"), sawType && sawType != type) {
					0 > dir && (dir = 1, moveOnce(), pos.sticky = "after");
					break
				}
				if (type && (sawType = type), dir > 0 && !moveOnce(!first)) break
			}
		var result = skipAtomic(doc, pos, oldPos, origDir, !0);
		return equalCursorPos(oldPos, result) && (result.hitSide = !0), result
	}

	function findPosV(cm, pos, dir, unit) {
		var y, doc = cm.doc,
			x = pos.left;
		if ("page" == unit) {
			var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight),
				moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
			y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount
		} else "line" == unit && (y = dir > 0 ? pos.bottom + 3 : pos.top - 3);
		for (var target; target = coordsChar(cm, x, y), target.outside;) {
			if (0 > dir ? 0 >= y : y >= doc.height) {
				target.hitSide = !0;
				break
			}
			y += 5 * dir
		}
		return target
	}

	function posToDOM(cm, pos) {
		var view = findViewForLine(cm, pos.line);
		if (!view || view.hidden) return null;
		var line = getLine(cm.doc, pos.line),
			info = mapFromLineView(view, line, pos.line),
			order = getOrder(line, cm.doc.direction),
			side = "left";
		if (order) {
			var partPos = getBidiPartAt(order, pos.ch);
			side = partPos % 2 ? "right" : "left"
		}
		var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
		return result.offset = "right" == result.collapse ? result.end : result.start, result
	}

	function isInGutter(node) {
		for (var scan = node; scan; scan = scan.parentNode)
			if (/CodeMirror-gutter-wrapper/.test(scan.className)) return !0;
		return !1
	}

	function badPos(pos, bad) {
		return bad && (pos.bad = !0), pos
	}

	function domTextBetween(cm, from, to, fromLine, toLine) {
		function recognizeMarker(id) {
			return function(marker) {
				return marker.id == id
			}
		}

		function close() {
			closing && (text += lineSep, closing = !1)
		}

		function addText(str) {
			str && (close(), text += str)
		}

		function walk(node) {
			if (1 == node.nodeType) {
				var cmText = node.getAttribute("cm-text");
				if (null != cmText) return void addText(cmText || node.textContent.replace(/\u200b/g, ""));
				var range, markerID = node.getAttribute("cm-marker");
				if (markerID) {
					var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
					return void(found.length && (range = found[0].find(0)) && addText(getBetween(cm.doc, range.from, range.to).join(lineSep)))
				}
				if ("false" == node.getAttribute("contenteditable")) return;
				var isBlock = /^(pre|div|p)$/i.test(node.nodeName);
				isBlock && close();
				for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
				isBlock && (closing = !0)
			} else 3 == node.nodeType && addText(node.nodeValue)
		}
		for (var text = "", closing = !1, lineSep = cm.doc.lineSeparator(); walk(from), from != to;) from = from.nextSibling;
		return text
	}

	function domToPos(cm, node, offset) {
		var lineNode;
		if (node == cm.display.lineDiv) {
			if (lineNode = cm.display.lineDiv.childNodes[offset], !lineNode) return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), !0);
			node = null, offset = 0
		} else
			for (lineNode = node;; lineNode = lineNode.parentNode) {
				if (!lineNode || lineNode == cm.display.lineDiv) return null;
				if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) break
			}
		for (var i = 0; i < cm.display.view.length; i++) {
			var lineView = cm.display.view[i];
			if (lineView.node == lineNode) return locateNodeInLineView(lineView, node, offset)
		}
	}

	function locateNodeInLineView(lineView, node, offset) {
		function find(textNode, topNode, offset) {
			for (var i = -1; i < (maps ? maps.length : 0); i++)
				for (var map = 0 > i ? measure.map : maps[i], j = 0; j < map.length; j += 3) {
					var curNode = map[j + 2];
					if (curNode == textNode || curNode == topNode) {
						var line = lineNo(0 > i ? lineView.line : lineView.rest[i]),
							ch = map[j] + offset;
						return (0 > offset || curNode != textNode) && (ch = map[j + (offset ? 1 : 0)]), Pos(line, ch)
					}
				}
		}
		var wrapper = lineView.text.firstChild,
			bad = !1;
		if (!node || !contains(wrapper, node)) return badPos(Pos(lineNo(lineView.line), 0), !0);
		if (node == wrapper && (bad = !0, node = wrapper.childNodes[offset], offset = 0, !node)) {
			var line = lineView.rest ? lst(lineView.rest) : lineView.line;
			return badPos(Pos(lineNo(line), line.text.length), bad)
		}
		var textNode = 3 == node.nodeType ? node : null,
			topNode = node;
		for (textNode || 1 != node.childNodes.length || 3 != node.firstChild.nodeType || (textNode = node.firstChild, offset && (offset = textNode.nodeValue.length)); topNode.parentNode != wrapper;) topNode = topNode.parentNode;
		var measure = lineView.measure,
			maps = measure.maps,
			found = find(textNode, topNode, offset);
		if (found) return badPos(found, bad);
		for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
			if (found = find(after, after.firstChild, 0)) return badPos(Pos(found.line, found.ch - dist), bad);
			dist += after.textContent.length
		}
		for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
			if (found = find(before, before.firstChild, -1)) return badPos(Pos(found.line, found.ch + dist$1), bad);
			dist$1 += before.textContent.length
		}
	}

	function fromTextArea(textarea, options) {
		function save() {
			textarea.value = cm.getValue()
		}
		if (options = options ? copyObj(options) : {}, options.value = textarea.value, !options.tabindex && textarea.tabIndex && (options.tabindex = textarea.tabIndex), !options.placeholder && textarea.placeholder && (options.placeholder = textarea.placeholder), null == options.autofocus) {
			var hasFocus = activeElt();
			options.autofocus = hasFocus == textarea || null != textarea.getAttribute("autofocus") && hasFocus == document.body
		}
		var realSubmit;
		if (textarea.form && (on(textarea.form, "submit", save), !options.leaveSubmitMethodAlone)) {
			var form = textarea.form;
			realSubmit = form.submit;
			try {
				var wrappedSubmit = form.submit = function() {
					save(), form.submit = realSubmit, form.submit(), form.submit = wrappedSubmit
				}
			} catch (e) {}
		}
		options.finishInit = function(cm) {
			cm.save = save, cm.getTextArea = function() {
				return textarea
			}, cm.toTextArea = function() {
				cm.toTextArea = isNaN, save(), textarea.parentNode.removeChild(cm.getWrapperElement()), textarea.style.display = "", textarea.form && (off(textarea.form, "submit", save), "function" == typeof textarea.form.submit && (textarea.form.submit = realSubmit))
			}
		}, textarea.style.display = "none";
		var cm = CodeMirror(function(node) {
			return textarea.parentNode.insertBefore(node, textarea.nextSibling)
		}, options);
		return cm
	}

	function addLegacyProps(CodeMirror) {
		CodeMirror.off = off, CodeMirror.on = on, CodeMirror.wheelEventPixels = wheelEventPixels, CodeMirror.Doc = Doc, CodeMirror.splitLines = splitLinesAuto, CodeMirror.countColumn = countColumn, CodeMirror.findColumn = findColumn, CodeMirror.isWordChar = isWordCharBasic, CodeMirror.Pass = Pass, CodeMirror.signal = signal, CodeMirror.Line = Line, CodeMirror.changeEnd = changeEnd, CodeMirror.scrollbarModel = scrollbarModel, CodeMirror.Pos = Pos, CodeMirror.cmpPos = cmp, CodeMirror.modes = modes, CodeMirror.mimeModes = mimeModes, CodeMirror.resolveMode = resolveMode, CodeMirror.getMode = getMode, CodeMirror.modeExtensions = modeExtensions, CodeMirror.extendMode = extendMode, CodeMirror.copyState = copyState, CodeMirror.startState = startState, CodeMirror.innerMode = innerMode, CodeMirror.commands = commands, CodeMirror.keyMap = keyMap, CodeMirror.keyName = keyName, CodeMirror.isModifierKey = isModifierKey, CodeMirror.lookupKey = lookupKey, CodeMirror.normalizeKeyMap = normalizeKeyMap, CodeMirror.StringStream = StringStream, CodeMirror.SharedTextMarker = SharedTextMarker, CodeMirror.TextMarker = TextMarker, CodeMirror.LineWidget = LineWidget, CodeMirror.e_preventDefault = e_preventDefault, CodeMirror.e_stopPropagation = e_stopPropagation, CodeMirror.e_stop = e_stop, CodeMirror.addClass = addClass, CodeMirror.contains = contains, CodeMirror.rmClass = rmClass, CodeMirror.keyNames = keyNames
	}
	var userAgent = navigator.userAgent,
		platform = navigator.platform,
		gecko = /gecko\/\d/i.test(userAgent),
		ie_upto10 = /MSIE \d/.test(userAgent),
		ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent),
		edge = /Edge\/(\d+)/.exec(userAgent),
		ie = ie_upto10 || ie_11up || edge,
		ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]),
		webkit = !edge && /WebKit\//.test(userAgent),
		qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent),
		chrome = !edge && /Chrome\//.test(userAgent),
		presto = /Opera\//.test(userAgent),
		safari = /Apple Computer/.test(navigator.vendor),
		mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent),
		phantom = /PhantomJS/.test(userAgent),
		ios = !edge && /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent),
		android = /Android/.test(userAgent),
		mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent),
		mac = ios || /Mac/.test(platform),
		chromeOS = /\bCrOS\b/.test(userAgent),
		windows = /win/i.test(platform),
		presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
	presto_version && (presto_version = Number(presto_version[1])), presto_version && presto_version >= 15 && (presto = !1, webkit = !0);
	var range, flipCtrlCmd = mac && (qtwebkit || presto && (null == presto_version || 12.11 > presto_version)),
		captureRightClick = gecko || ie && ie_version >= 9,
		rmClass = function(node, cls) {
			var current = node.className,
				match = classTest(cls).exec(current);
			if (match) {
				var after = current.slice(match.index + match[0].length);
				node.className = current.slice(0, match.index) + (after ? match[1] + after : "")
			}
		};
	range = document.createRange ? function(node, start, end, endNode) {
		var r = document.createRange();
		return r.setEnd(endNode || node, end), r.setStart(node, start), r
	} : function(node, start, end) {
		var r = document.body.createTextRange();
		try {
			r.moveToElementText(node.parentNode)
		} catch (e) {
			return r
		}
		return r.collapse(!0), r.moveEnd("character", end), r.moveStart("character", start), r
	};
	var selectInput = function(node) {
		node.select()
	};
	ios ? selectInput = function(node) {
		node.selectionStart = 0, node.selectionEnd = node.value.length
	} : ie && (selectInput = function(node) {
		try {
			node.select()
		} catch (_e) {}
	});
	var Delayed = function() {
		this.id = null
	};
	Delayed.prototype.set = function(ms, f) {
		clearTimeout(this.id), this.id = setTimeout(f, ms)
	};
	var zwspSupported, badBidiRects, scrollerGap = 30,
		Pass = {
			toString: function() {
				return "CodeMirror.Pass"
			}
		},
		sel_dontScroll = {
			scroll: !1
		},
		sel_mouse = {
			origin: "*mouse"
		},
		sel_move = {
			origin: "+move"
		},
		spaceStrs = [""],
		nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/,
		extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/,
		sawReadOnlySpans = !1,
		sawCollapsedSpans = !1,
		bidiOther = null,
		bidiOrdering = function() {
			function charType(code) {
				return 247 >= code ? lowTypes.charAt(code) : code >= 1424 && 1524 >= code ? "R" : code >= 1536 && 1785 >= code ? arabicTypes.charAt(code - 1536) : code >= 1774 && 2220 >= code ? "r" : code >= 8192 && 8203 >= code ? "w" : 8204 == code ? "b" : "L"
			}

			function BidiSpan(level, from, to) {
				this.level = level, this.from = from, this.to = to
			}
			var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
				arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111",
				bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,
				isNeutral = /[stwN]/,
				isStrong = /[LRr]/,
				countsAsLeft = /[Lb1n]/,
				countsAsNum = /[1n]/;
			return function(str, direction) {
				var outerType = "ltr" == direction ? "L" : "R";
				if (0 == str.length || "ltr" == direction && !bidiRE.test(str)) return !1;
				for (var len = str.length, types = [], i = 0; len > i; ++i) types.push(charType(str.charCodeAt(i)));
				for (var i$1 = 0, prev = outerType; len > i$1; ++i$1) {
					var type = types[i$1];
					"m" == type ? types[i$1] = prev : prev = type
				}
				for (var i$2 = 0, cur = outerType; len > i$2; ++i$2) {
					var type$1 = types[i$2];
					"1" == type$1 && "r" == cur ? types[i$2] = "n" : isStrong.test(type$1) && (cur = type$1, "r" == type$1 && (types[i$2] = "R"))
				}
				for (var i$3 = 1, prev$1 = types[0]; len - 1 > i$3; ++i$3) {
					var type$2 = types[i$3];
					"+" == type$2 && "1" == prev$1 && "1" == types[i$3 + 1] ? types[i$3] = "1" : "," != type$2 || prev$1 != types[i$3 + 1] || "1" != prev$1 && "n" != prev$1 || (types[i$3] = prev$1), prev$1 = type$2
				}
				for (var i$4 = 0; len > i$4; ++i$4) {
					var type$3 = types[i$4];
					if ("," == type$3) types[i$4] = "N";
					else if ("%" == type$3) {
						var end = void 0;
						for (end = i$4 + 1; len > end && "%" == types[end]; ++end);
						for (var replace = i$4 && "!" == types[i$4 - 1] || len > end && "1" == types[end] ? "1" : "N", j = i$4; end > j; ++j) types[j] = replace;
						i$4 = end - 1
					}
				}
				for (var i$5 = 0, cur$1 = outerType; len > i$5; ++i$5) {
					var type$4 = types[i$5];
					"L" == cur$1 && "1" == type$4 ? types[i$5] = "L" : isStrong.test(type$4) && (cur$1 = type$4)
				}
				for (var i$6 = 0; len > i$6; ++i$6)
					if (isNeutral.test(types[i$6])) {
						var end$1 = void 0;
						for (end$1 = i$6 + 1; len > end$1 && isNeutral.test(types[end$1]); ++end$1);
						for (var before = "L" == (i$6 ? types[i$6 - 1] : outerType), after = "L" == (len > end$1 ? types[end$1] : outerType), replace$1 = before == after ? before ? "L" : "R" : outerType, j$1 = i$6; end$1 > j$1; ++j$1) types[j$1] = replace$1;
						i$6 = end$1 - 1
					}
				for (var m, order = [], i$7 = 0; len > i$7;)
					if (countsAsLeft.test(types[i$7])) {
						var start = i$7;
						for (++i$7; len > i$7 && countsAsLeft.test(types[i$7]); ++i$7);
						order.push(new BidiSpan(0, start, i$7))
					} else {
						var pos = i$7,
							at = order.length;
						for (++i$7; len > i$7 && "L" != types[i$7]; ++i$7);
						for (var j$2 = pos; i$7 > j$2;)
							if (countsAsNum.test(types[j$2])) {
								j$2 > pos && order.splice(at, 0, new BidiSpan(1, pos, j$2));
								var nstart = j$2;
								for (++j$2; i$7 > j$2 && countsAsNum.test(types[j$2]); ++j$2);
								order.splice(at, 0, new BidiSpan(2, nstart, j$2)), pos = j$2
							} else ++j$2;
						i$7 > pos && order.splice(at, 0, new BidiSpan(1, pos, i$7))
					}
				return "ltr" == direction && (1 == order[0].level && (m = str.match(/^\s+/)) && (order[0].from = m[0].length, order.unshift(new BidiSpan(0, 0, m[0].length))), 1 == lst(order).level && (m = str.match(/\s+$/)) && (lst(order).to -= m[0].length, order.push(new BidiSpan(0, len - m[0].length, len)))), "rtl" == direction ? order.reverse() : order
			}
		}(),
		noHandlers = [],
		on = function(emitter, type, f) {
			if (emitter.addEventListener) emitter.addEventListener(type, f, !1);
			else if (emitter.attachEvent) emitter.attachEvent("on" + type, f);
			else {
				var map = emitter._handlers || (emitter._handlers = {});
				map[type] = (map[type] || noHandlers).concat(f)
			}
		},
		dragAndDrop = function() {
			if (ie && 9 > ie_version) return !1;
			var div = elt("div");
			return "draggable" in div || "dragDrop" in div
		}(),
		splitLinesAuto = 3 != "\n\nb".split(/\n/).length ? function(string) {
			for (var pos = 0, result = [], l = string.length; l >= pos;) {
				var nl = string.indexOf("\n", pos); - 1 == nl && (nl = string.length);
				var line = string.slice(pos, "\r" == string.charAt(nl - 1) ? nl - 1 : nl),
					rt = line.indexOf("\r"); - 1 != rt ? (result.push(line.slice(0, rt)), pos += rt + 1) : (result.push(line), pos = nl + 1)
			}
			return result
		} : function(string) {
			return string.split(/\r\n?|\n/)
		},
		hasSelection = window.getSelection ? function(te) {
			try {
				return te.selectionStart != te.selectionEnd
			} catch (e) {
				return !1
			}
		} : function(te) {
			var range;
			try {
				range = te.ownerDocument.selection.createRange()
			} catch (e) {}
			return range && range.parentElement() == te ? 0 != range.compareEndPoints("StartToEnd", range) : !1
		},
		hasCopyEvent = function() {
			var e = elt("div");
			return "oncopy" in e ? !0 : (e.setAttribute("oncopy", "return;"), "function" == typeof e.oncopy)
		}(),
		badZoomedRects = null,
		modes = {},
		mimeModes = {},
		modeExtensions = {},
		StringStream = function(string, tabSize, lineOracle) {
			this.pos = this.start = 0, this.string = string, this.tabSize = tabSize || 8, this.lastColumnPos = this.lastColumnValue = 0, this.lineStart = 0, this.lineOracle = lineOracle
		};
	StringStream.prototype.eol = function() {
		return this.pos >= this.string.length
	}, StringStream.prototype.sol = function() {
		return this.pos == this.lineStart
	}, StringStream.prototype.peek = function() {
		return this.string.charAt(this.pos) || void 0
	}, StringStream.prototype.next = function() {
		return this.pos < this.string.length ? this.string.charAt(this.pos++) : void 0
	}, StringStream.prototype.eat = function(match) {
		var ok, ch = this.string.charAt(this.pos);
		return ok = "string" == typeof match ? ch == match : ch && (match.test ? match.test(ch) : match(ch)), ok ? (++this.pos, ch) : void 0
	}, StringStream.prototype.eatWhile = function(match) {
		for (var start = this.pos; this.eat(match););
		return this.pos > start
	}, StringStream.prototype.eatSpace = function() {
		for (var this$1 = this, start = this.pos;
			/[\s\u00a0]/.test(this.string.charAt(this.pos));) ++this$1.pos;
		return this.pos > start
	}, StringStream.prototype.skipToEnd = function() {
		this.pos = this.string.length
	}, StringStream.prototype.skipTo = function(ch) {
		var found = this.string.indexOf(ch, this.pos);
		return found > -1 ? (this.pos = found, !0) : void 0
	}, StringStream.prototype.backUp = function(n) {
		this.pos -= n
	}, StringStream.prototype.column = function() {
		return this.lastColumnPos < this.start && (this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
	}, StringStream.prototype.indentation = function() {
		return countColumn(this.string, null, this.tabSize) - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0)
	}, StringStream.prototype.match = function(pattern, consume, caseInsensitive) {
		if ("string" != typeof pattern) {
			var match = this.string.slice(this.pos).match(pattern);
			return match && match.index > 0 ? null : (match && consume !== !1 && (this.pos += match[0].length), match)
		}
		var cased = function(str) {
				return caseInsensitive ? str.toLowerCase() : str
			},
			substr = this.string.substr(this.pos, pattern.length);
		return cased(substr) == cased(pattern) ? (consume !== !1 && (this.pos += pattern.length), !0) : void 0
	}, StringStream.prototype.current = function() {
		return this.string.slice(this.start, this.pos)
	}, StringStream.prototype.hideFirstChars = function(n, inner) {
		this.lineStart += n;
		try {
			return inner()
		} finally {
			this.lineStart -= n
		}
	}, StringStream.prototype.lookAhead = function(n) {
		var oracle = this.lineOracle;
		return oracle && oracle.lookAhead(n)
	}, StringStream.prototype.baseToken = function() {
		var oracle = this.lineOracle;
		return oracle && oracle.baseToken(this.pos)
	};
	var SavedContext = function(state, lookAhead) {
			this.state = state, this.lookAhead = lookAhead
		},
		Context = function(doc, state, line, lookAhead) {
			this.state = state, this.doc = doc, this.line = line, this.maxLookAhead = lookAhead || 0, this.baseTokens = null, this.baseTokenPos = 1
		};
	Context.prototype.lookAhead = function(n) {
		var line = this.doc.getLine(this.line + n);
		return null != line && n > this.maxLookAhead && (this.maxLookAhead = n), line
	}, Context.prototype.baseToken = function(n) {
		var this$1 = this;
		if (!this.baseTokens) return null;
		for (; this.baseTokens[this.baseTokenPos] <= n;) this$1.baseTokenPos += 2;
		var type = this.baseTokens[this.baseTokenPos + 1];
		return {
			type: type && type.replace(/( |^)overlay .*/, ""),
			size: this.baseTokens[this.baseTokenPos] - n
		}
	}, Context.prototype.nextLine = function() {
		this.line++, this.maxLookAhead > 0 && this.maxLookAhead--
	}, Context.fromSaved = function(doc, saved, line) {
		return saved instanceof SavedContext ? new Context(doc, copyState(doc.mode, saved.state), line, saved.lookAhead) : new Context(doc, copyState(doc.mode, saved), line)
	}, Context.prototype.save = function(copy) {
		var state = copy !== !1 ? copyState(this.doc.mode, this.state) : this.state;
		return this.maxLookAhead > 0 ? new SavedContext(state, this.maxLookAhead) : state
	};
	var Token = function(stream, type, state) {
			this.start = stream.start, this.end = stream.pos, this.string = stream.current(), this.type = type || null, this.state = state
		},
		Line = function(text, markedSpans, estimateHeight) {
			this.text = text, attachMarkedSpans(this, markedSpans), this.height = estimateHeight ? estimateHeight(this) : 1
		};
	Line.prototype.lineNo = function() {
		return lineNo(this)
	}, eventMixin(Line);
	var measureText, styleToClassCache = {},
		styleToClassCacheWithMode = {},
		operationGroup = null,
		orphanDelayedCallbacks = null,
		nullRect = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		},
		NativeScrollbars = function(place, scroll, cm) {
			this.cm = cm;
			var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar"),
				horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
			place(vert), place(horiz), on(vert, "scroll", function() {
				vert.clientHeight && scroll(vert.scrollTop, "vertical")
			}), on(horiz, "scroll", function() {
				horiz.clientWidth && scroll(horiz.scrollLeft, "horizontal")
			}), this.checkedZeroWidth = !1, ie && 8 > ie_version && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px")
		};
	NativeScrollbars.prototype.update = function(measure) {
		var needsH = measure.scrollWidth > measure.clientWidth + 1,
			needsV = measure.scrollHeight > measure.clientHeight + 1,
			sWidth = measure.nativeBarWidth;
		if (needsV) {
			this.vert.style.display = "block", this.vert.style.bottom = needsH ? sWidth + "px" : "0";
			var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
			this.vert.firstChild.style.height = Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px"
		} else this.vert.style.display = "", this.vert.firstChild.style.height = "0";
		if (needsH) {
			this.horiz.style.display = "block", this.horiz.style.right = needsV ? sWidth + "px" : "0", this.horiz.style.left = measure.barLeft + "px";
			var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
			this.horiz.firstChild.style.width = Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px"
		} else this.horiz.style.display = "", this.horiz.firstChild.style.width = "0";
		return !this.checkedZeroWidth && measure.clientHeight > 0 && (0 == sWidth && this.zeroWidthHack(), this.checkedZeroWidth = !0), {
			right: needsV ? sWidth : 0,
			bottom: needsH ? sWidth : 0
		}
	}, NativeScrollbars.prototype.setScrollLeft = function(pos) {
		this.horiz.scrollLeft != pos && (this.horiz.scrollLeft = pos), this.disableHoriz && this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz")
	}, NativeScrollbars.prototype.setScrollTop = function(pos) {
		this.vert.scrollTop != pos && (this.vert.scrollTop = pos), this.disableVert && this.enableZeroWidthBar(this.vert, this.disableVert, "vert")
	}, NativeScrollbars.prototype.zeroWidthHack = function() {
		var w = mac && !mac_geMountainLion ? "12px" : "18px";
		this.horiz.style.height = this.vert.style.width = w, this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none", this.disableHoriz = new Delayed, this.disableVert = new Delayed
	}, NativeScrollbars.prototype.enableZeroWidthBar = function(bar, delay, type) {
		function maybeDisable() {
			var box = bar.getBoundingClientRect(),
				elt = "vert" == type ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2) : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);
			elt != bar ? bar.style.pointerEvents = "none" : delay.set(1e3, maybeDisable)
		}
		bar.style.pointerEvents = "auto", delay.set(1e3, maybeDisable)
	}, NativeScrollbars.prototype.clear = function() {
		var parent = this.horiz.parentNode;
		parent.removeChild(this.horiz), parent.removeChild(this.vert)
	};
	var NullScrollbars = function() {};
	NullScrollbars.prototype.update = function() {
		return {
			bottom: 0,
			right: 0
		}
	}, NullScrollbars.prototype.setScrollLeft = function() {}, NullScrollbars.prototype.setScrollTop = function() {}, NullScrollbars.prototype.clear = function() {};
	var scrollbarModel = {
			"native": NativeScrollbars,
			"null": NullScrollbars
		},
		nextOpId = 0,
		DisplayUpdate = function(cm, viewport, force) {
			var display = cm.display;
			this.viewport = viewport, this.visible = visibleLines(display, cm.doc, viewport), this.editorIsHidden = !display.wrapper.offsetWidth, this.wrapperHeight = display.wrapper.clientHeight, this.wrapperWidth = display.wrapper.clientWidth, this.oldDisplayWidth = displayWidth(cm), this.force = force, this.dims = getDimensions(cm), this.events = []
		};
	DisplayUpdate.prototype.signal = function(emitter, type) {
		hasHandler(emitter, type) && this.events.push(arguments)
	}, DisplayUpdate.prototype.finish = function() {
		for (var this$1 = this, i = 0; i < this.events.length; i++) signal.apply(null, this$1.events[i])
	};
	var wheelSamples = 0,
		wheelPixelsPerUnit = null;
	ie ? wheelPixelsPerUnit = -.53 : gecko ? wheelPixelsPerUnit = 15 : chrome ? wheelPixelsPerUnit = -.7 : safari && (wheelPixelsPerUnit = -1 / 3);
	var Selection = function(ranges, primIndex) {
		this.ranges = ranges, this.primIndex = primIndex
	};
	Selection.prototype.primary = function() {
		return this.ranges[this.primIndex]
	}, Selection.prototype.equals = function(other) {
		var this$1 = this;
		if (other == this) return !0;
		if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) return !1;
		for (var i = 0; i < this.ranges.length; i++) {
			var here = this$1.ranges[i],
				there = other.ranges[i];
			if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head)) return !1
		}
		return !0
	}, Selection.prototype.deepCopy = function() {
		for (var this$1 = this, out = [], i = 0; i < this.ranges.length; i++) out[i] = new Range(copyPos(this$1.ranges[i].anchor), copyPos(this$1.ranges[i].head));
		return new Selection(out, this.primIndex)
	}, Selection.prototype.somethingSelected = function() {
		for (var this$1 = this, i = 0; i < this.ranges.length; i++)
			if (!this$1.ranges[i].empty()) return !0;
		return !1
	}, Selection.prototype.contains = function(pos, end) {
		var this$1 = this;
		end || (end = pos);
		for (var i = 0; i < this.ranges.length; i++) {
			var range = this$1.ranges[i];
			if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0) return i
		}
		return -1
	};
	var Range = function(anchor, head) {
		this.anchor = anchor, this.head = head
	};
	Range.prototype.from = function() {
		return minPos(this.anchor, this.head)
	}, Range.prototype.to = function() {
		return maxPos(this.anchor, this.head)
	}, Range.prototype.empty = function() {
		return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
	}, LeafChunk.prototype = {
		chunkSize: function() {
			return this.lines.length
		},
		removeInner: function(at, n) {
			for (var this$1 = this, i = at, e = at + n; e > i; ++i) {
				var line = this$1.lines[i];
				this$1.height -= line.height, cleanUpLine(line), signalLater(line, "delete")
			}
			this.lines.splice(at, n)
		},
		collapse: function(lines) {
			lines.push.apply(lines, this.lines)
		},
		insertInner: function(at, lines, height) {
			var this$1 = this;
			this.height += height, this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
			for (var i = 0; i < lines.length; ++i) lines[i].parent = this$1
		},
		iterN: function(at, n, op) {
			for (var this$1 = this, e = at + n; e > at; ++at)
				if (op(this$1.lines[at])) return !0
		}
	}, BranchChunk.prototype = {
		chunkSize: function() {
			return this.size
		},
		removeInner: function(at, n) {
			var this$1 = this;
			this.size -= n;
			for (var i = 0; i < this.children.length; ++i) {
				var child = this$1.children[i],
					sz = child.chunkSize();
				if (sz > at) {
					var rm = Math.min(n, sz - at),
						oldHeight = child.height;
					if (child.removeInner(at, rm), this$1.height -= oldHeight - child.height, sz == rm && (this$1.children.splice(i--, 1), child.parent = null), 0 == (n -= rm)) break;
					at = 0
				} else at -= sz
			}
			if (this.size - n < 25 && (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
				var lines = [];
				this.collapse(lines), this.children = [new LeafChunk(lines)], this.children[0].parent = this
			}
		},
		collapse: function(lines) {
			for (var this$1 = this, i = 0; i < this.children.length; ++i) this$1.children[i].collapse(lines)
		},
		insertInner: function(at, lines, height) {
			var this$1 = this;
			this.size += lines.length, this.height += height;
			for (var i = 0; i < this.children.length; ++i) {
				var child = this$1.children[i],
					sz = child.chunkSize();
				if (sz >= at) {
					if (child.insertInner(at, lines, height), child.lines && child.lines.length > 50) {
						for (var remaining = child.lines.length % 25 + 25, pos = remaining; pos < child.lines.length;) {
							var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
							child.height -= leaf.height, this$1.children.splice(++i, 0, leaf), leaf.parent = this$1
						}
						child.lines = child.lines.slice(0, remaining), this$1.maybeSpill()
					}
					break
				}
				at -= sz
			}
		},
		maybeSpill: function() {
			if (!(this.children.length <= 10)) {
				var me = this;
				do {
					var spilled = me.children.splice(me.children.length - 5, 5),
						sibling = new BranchChunk(spilled);
					if (me.parent) {
						me.size -= sibling.size, me.height -= sibling.height;
						var myIndex = indexOf(me.parent.children, me);
						me.parent.children.splice(myIndex + 1, 0, sibling)
					} else {
						var copy = new BranchChunk(me.children);
						copy.parent = me, me.children = [copy, sibling], me = copy
					}
					sibling.parent = me.parent
				} while (me.children.length > 10);
				me.parent.maybeSpill()
			}
		},
		iterN: function(at, n, op) {
			for (var this$1 = this, i = 0; i < this.children.length; ++i) {
				var child = this$1.children[i],
					sz = child.chunkSize();
				if (sz > at) {
					var used = Math.min(n, sz - at);
					if (child.iterN(at, used, op)) return !0;
					if (0 == (n -= used)) break;
					at = 0
				} else at -= sz
			}
		}
	};
	var LineWidget = function(doc, node, options) {
		var this$1 = this;
		if (options)
			for (var opt in options) options.hasOwnProperty(opt) && (this$1[opt] = options[opt]);
		this.doc = doc, this.node = node
	};
	LineWidget.prototype.clear = function() {
		var this$1 = this,
			cm = this.doc.cm,
			ws = this.line.widgets,
			line = this.line,
			no = lineNo(line);
		if (null != no && ws) {
			for (var i = 0; i < ws.length; ++i) ws[i] == this$1 && ws.splice(i--, 1);
			ws.length || (line.widgets = null);
			var height = widgetHeight(this);
			updateLineHeight(line, Math.max(0, line.height - height)), cm && (runInOp(cm, function() {
				adjustScrollWhenAboveVisible(cm, line, -height), regLineChange(cm, no, "widget")
			}), signalLater(cm, "lineWidgetCleared", cm, this, no))
		}
	}, LineWidget.prototype.changed = function() {
		var this$1 = this,
			oldH = this.height,
			cm = this.doc.cm,
			line = this.line;
		this.height = null;
		var diff = widgetHeight(this) - oldH;
		diff && (updateLineHeight(line, line.height + diff), cm && runInOp(cm, function() {
			cm.curOp.forceUpdate = !0, adjustScrollWhenAboveVisible(cm, line, diff), signalLater(cm, "lineWidgetChanged", cm, this$1, lineNo(line))
		}))
	}, eventMixin(LineWidget);
	var nextMarkerId = 0,
		TextMarker = function(doc, type) {
			this.lines = [], this.type = type, this.doc = doc, this.id = ++nextMarkerId
		};
	TextMarker.prototype.clear = function() {
		var this$1 = this;
		if (!this.explicitlyCleared) {
			var cm = this.doc.cm,
				withOp = cm && !cm.curOp;
			if (withOp && startOperation(cm), hasHandler(this, "clear")) {
				var found = this.find();
				found && signalLater(this, "clear", found.from, found.to)
			}
			for (var min = null, max = null, i = 0; i < this.lines.length; ++i) {
				var line = this$1.lines[i],
					span = getMarkedSpanFor(line.markedSpans, this$1);
				cm && !this$1.collapsed ? regLineChange(cm, lineNo(line), "text") : cm && (null != span.to && (max = lineNo(line)), null != span.from && (min = lineNo(line))), line.markedSpans = removeMarkedSpan(line.markedSpans, span), null == span.from && this$1.collapsed && !lineIsHidden(this$1.doc, line) && cm && updateLineHeight(line, textHeight(cm.display))
			}
			if (cm && this.collapsed && !cm.options.lineWrapping)
				for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
					var visual = visualLine(this$1.lines[i$1]),
						len = lineLength(visual);
					len > cm.display.maxLineLength && (cm.display.maxLine = visual, cm.display.maxLineLength = len, cm.display.maxLineChanged = !0)
				}
			null != min && cm && this.collapsed && regChange(cm, min, max + 1), this.lines.length = 0, this.explicitlyCleared = !0, this.atomic && this.doc.cantEdit && (this.doc.cantEdit = !1, cm && reCheckSelection(cm.doc)), cm && signalLater(cm, "markerCleared", cm, this, min, max), withOp && endOperation(cm), this.parent && this.parent.clear()
		}
	}, TextMarker.prototype.find = function(side, lineObj) {
		var this$1 = this;
		null == side && "bookmark" == this.type && (side = 1);
		for (var from, to, i = 0; i < this.lines.length; ++i) {
			var line = this$1.lines[i],
				span = getMarkedSpanFor(line.markedSpans, this$1);
			if (null != span.from && (from = Pos(lineObj ? line : lineNo(line), span.from), -1 == side)) return from;
			if (null != span.to && (to = Pos(lineObj ? line : lineNo(line), span.to), 1 == side)) return to
		}
		return from && {
			from: from,
			to: to
		}
	}, TextMarker.prototype.changed = function() {
		var this$1 = this,
			pos = this.find(-1, !0),
			widget = this,
			cm = this.doc.cm;
		pos && cm && runInOp(cm, function() {
			var line = pos.line,
				lineN = lineNo(pos.line),
				view = findViewForLine(cm, lineN);
			if (view && (clearLineMeasurementCacheFor(view), cm.curOp.selectionChanged = cm.curOp.forceUpdate = !0), cm.curOp.updateMaxLine = !0, !lineIsHidden(widget.doc, line) && null != widget.height) {
				var oldHeight = widget.height;
				widget.height = null;
				var dHeight = widgetHeight(widget) - oldHeight;
				dHeight && updateLineHeight(line, line.height + dHeight)
			}
			signalLater(cm, "markerChanged", cm, this$1)
		})
	}, TextMarker.prototype.attachLine = function(line) {
		if (!this.lines.length && this.doc.cm) {
			var op = this.doc.cm.curOp;
			op.maybeHiddenMarkers && -1 != indexOf(op.maybeHiddenMarkers, this) || (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this)
		}
		this.lines.push(line)
	}, TextMarker.prototype.detachLine = function(line) {
		if (this.lines.splice(indexOf(this.lines, line), 1), !this.lines.length && this.doc.cm) {
			var op = this.doc.cm.curOp;
			(op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this)
		}
	}, eventMixin(TextMarker);
	var SharedTextMarker = function(markers, primary) {
		var this$1 = this;
		this.markers = markers, this.primary = primary;
		for (var i = 0; i < markers.length; ++i) markers[i].parent = this$1
	};
	SharedTextMarker.prototype.clear = function() {
		var this$1 = this;
		if (!this.explicitlyCleared) {
			this.explicitlyCleared = !0;
			for (var i = 0; i < this.markers.length; ++i) this$1.markers[i].clear();
			signalLater(this, "clear")
		}
	}, SharedTextMarker.prototype.find = function(side, lineObj) {
		return this.primary.find(side, lineObj)
	}, eventMixin(SharedTextMarker);
	var nextDocId = 0,
		Doc = function(text, mode, firstLine, lineSep, direction) {
			if (!(this instanceof Doc)) return new Doc(text, mode, firstLine, lineSep, direction);
			null == firstLine && (firstLine = 0), BranchChunk.call(this, [new LeafChunk([new Line("", null)])]), this.first = firstLine, this.scrollTop = this.scrollLeft = 0, this.cantEdit = !1, this.cleanGeneration = 1, this.modeFrontier = this.highlightFrontier = firstLine;
			var start = Pos(firstLine, 0);
			this.sel = simpleSelection(start), this.history = new History(null), this.id = ++nextDocId, this.modeOption = mode, this.lineSep = lineSep, this.direction = "rtl" == direction ? "rtl" : "ltr", this.extend = !1, "string" == typeof text && (text = this.splitLines(text)), updateDoc(this, {
				from: start,
				to: start,
				text: text
			}), setSelection(this, simpleSelection(start), sel_dontScroll)
		};
	Doc.prototype = createObj(BranchChunk.prototype, {
		constructor: Doc,
		iter: function(from, to, op) {
			op ? this.iterN(from - this.first, to - from, op) : this.iterN(this.first, this.first + this.size, from)
		},
		insert: function(at, lines) {
			for (var height = 0, i = 0; i < lines.length; ++i) height += lines[i].height;
			this.insertInner(at - this.first, lines, height)
		},
		remove: function(at, n) {
			this.removeInner(at - this.first, n)
		},
		getValue: function(lineSep) {
			var lines = getLines(this, this.first, this.first + this.size);
			return lineSep === !1 ? lines : lines.join(lineSep || this.lineSeparator())
		},
		setValue: docMethodOp(function(code) {
			var top = Pos(this.first, 0),
				last = this.first + this.size - 1;
			makeChange(this, {
				from: top,
				to: Pos(last, getLine(this, last).text.length),
				text: this.splitLines(code),
				origin: "setValue",
				full: !0
			}, !0), this.cm && scrollToCoords(this.cm, 0, 0), setSelection(this, simpleSelection(top), sel_dontScroll)
		}),
		replaceRange: function(code, from, to, origin) {
			from = clipPos(this, from), to = to ? clipPos(this, to) : from, replaceRange(this, code, from, to, origin)
		},
		getRange: function(from, to, lineSep) {
			var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
			return lineSep === !1 ? lines : lines.join(lineSep || this.lineSeparator())
		},
		getLine: function(line) {
			var l = this.getLineHandle(line);
			return l && l.text
		},
		getLineHandle: function(line) {
			return isLine(this, line) ? getLine(this, line) : void 0
		},
		getLineNumber: function(line) {
			return lineNo(line)
		},
		getLineHandleVisualStart: function(line) {
			return "number" == typeof line && (line = getLine(this, line)), visualLine(line)
		},
		lineCount: function() {
			return this.size
		},
		firstLine: function() {
			return this.first
		},
		lastLine: function() {
			return this.first + this.size - 1
		},
		clipPos: function(pos) {
			return clipPos(this, pos)
		},
		getCursor: function(start) {
			var pos, range = this.sel.primary();
			return pos = null == start || "head" == start ? range.head : "anchor" == start ? range.anchor : "end" == start || "to" == start || start === !1 ? range.to() : range.from()
		},
		listSelections: function() {
			return this.sel.ranges
		},
		somethingSelected: function() {
			return this.sel.somethingSelected()
		},
		setCursor: docMethodOp(function(line, ch, options) {
			setSimpleSelection(this, clipPos(this, "number" == typeof line ? Pos(line, ch || 0) : line), null, options)
		}),
		setSelection: docMethodOp(function(anchor, head, options) {
			setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options)
		}),
		extendSelection: docMethodOp(function(head, other, options) {
			extendSelection(this, clipPos(this, head), other && clipPos(this, other), options)
		}),
		extendSelections: docMethodOp(function(heads, options) {
			extendSelections(this, clipPosArray(this, heads), options)
		}),
		extendSelectionsBy: docMethodOp(function(f, options) {
			var heads = map(this.sel.ranges, f);
			extendSelections(this, clipPosArray(this, heads), options)
		}),
		setSelections: docMethodOp(function(ranges, primary, options) {
			var this$1 = this;
			if (ranges.length) {
				for (var out = [], i = 0; i < ranges.length; i++) out[i] = new Range(clipPos(this$1, ranges[i].anchor), clipPos(this$1, ranges[i].head));
				null == primary && (primary = Math.min(ranges.length - 1, this.sel.primIndex)), setSelection(this, normalizeSelection(out, primary), options)
			}
		}),
		addSelection: docMethodOp(function(anchor, head, options) {
			var ranges = this.sel.ranges.slice(0);
			ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor))), setSelection(this, normalizeSelection(ranges, ranges.length - 1), options)
		}),
		getSelection: function(lineSep) {
			for (var lines, this$1 = this, ranges = this.sel.ranges, i = 0; i < ranges.length; i++) {
				var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
				lines = lines ? lines.concat(sel) : sel
			}
			return lineSep === !1 ? lines : lines.join(lineSep || this.lineSeparator())
		},
		getSelections: function(lineSep) {
			for (var this$1 = this, parts = [], ranges = this.sel.ranges, i = 0; i < ranges.length; i++) {
				var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
				lineSep !== !1 && (sel = sel.join(lineSep || this$1.lineSeparator())), parts[i] = sel
			}
			return parts
		},
		replaceSelection: function(code, collapse, origin) {
			for (var dup = [], i = 0; i < this.sel.ranges.length; i++) dup[i] = code;
			this.replaceSelections(dup, collapse, origin || "+input")
		},
		replaceSelections: docMethodOp(function(code, collapse, origin) {
			for (var this$1 = this, changes = [], sel = this.sel, i = 0; i < sel.ranges.length; i++) {
				var range = sel.ranges[i];
				changes[i] = {
					from: range.from(),
					to: range.to(),
					text: this$1.splitLines(code[i]),
					origin: origin
				}
			}
			for (var newSel = collapse && "end" != collapse && computeReplacedSel(this, changes, collapse), i$1 = changes.length - 1; i$1 >= 0; i$1--) makeChange(this$1, changes[i$1]);
			newSel ? setSelectionReplaceHistory(this, newSel) : this.cm && ensureCursorVisible(this.cm)
		}),
		undo: docMethodOp(function() {
			makeChangeFromHistory(this, "undo")
		}),
		redo: docMethodOp(function() {
			makeChangeFromHistory(this, "redo")
		}),
		undoSelection: docMethodOp(function() {
			makeChangeFromHistory(this, "undo", !0)
		}),
		redoSelection: docMethodOp(function() {
			makeChangeFromHistory(this, "redo", !0)
		}),
		setExtending: function(val) {
			this.extend = val
		},
		getExtending: function() {
			return this.extend
		},
		historySize: function() {
			for (var hist = this.history, done = 0, undone = 0, i = 0; i < hist.done.length; i++) hist.done[i].ranges || ++done;
			for (var i$1 = 0; i$1 < hist.undone.length; i$1++) hist.undone[i$1].ranges || ++undone;
			return {
				undo: done,
				redo: undone
			}
		},
		clearHistory: function() {
			this.history = new History(this.history.maxGeneration)
		},
		markClean: function() {
			this.cleanGeneration = this.changeGeneration(!0)
		},
		changeGeneration: function(forceSplit) {
			return forceSplit && (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null), this.history.generation
		},
		isClean: function(gen) {
			return this.history.generation == (gen || this.cleanGeneration)
		},
		getHistory: function() {
			return {
				done: copyHistoryArray(this.history.done),
				undone: copyHistoryArray(this.history.undone)
			}
		},
		setHistory: function(histData) {
			var hist = this.history = new History(this.history.maxGeneration);
			hist.done = copyHistoryArray(histData.done.slice(0), null, !0), hist.undone = copyHistoryArray(histData.undone.slice(0), null, !0)
		},
		setGutterMarker: docMethodOp(function(line, gutterID, value) {
			return changeLine(this, line, "gutter", function(line) {
				var markers = line.gutterMarkers || (line.gutterMarkers = {});
				return markers[gutterID] = value, !value && isEmpty(markers) && (line.gutterMarkers = null), !0
			})
		}),
		clearGutter: docMethodOp(function(gutterID) {
			var this$1 = this;
			this.iter(function(line) {
				line.gutterMarkers && line.gutterMarkers[gutterID] && changeLine(this$1, line, "gutter", function() {
					return line.gutterMarkers[gutterID] = null, isEmpty(line.gutterMarkers) && (line.gutterMarkers = null), !0
				})
			})
		}),
		lineInfo: function(line) {
			var n;
			if ("number" == typeof line) {
				if (!isLine(this, line)) return null;
				if (n = line, line = getLine(this, line), !line) return null
			} else if (n = lineNo(line), null == n) return null;
			return {
				line: n,
				handle: line,
				text: line.text,
				gutterMarkers: line.gutterMarkers,
				textClass: line.textClass,
				bgClass: line.bgClass,
				wrapClass: line.wrapClass,
				widgets: line.widgets
			}
		},
		addLineClass: docMethodOp(function(handle, where, cls) {
			return changeLine(this, handle, "gutter" == where ? "gutter" : "class", function(line) {
				var prop = "text" == where ? "textClass" : "background" == where ? "bgClass" : "gutter" == where ? "gutterClass" : "wrapClass";
				if (line[prop]) {
					if (classTest(cls).test(line[prop])) return !1;
					line[prop] += " " + cls
				} else line[prop] = cls;
				return !0
			})
		}),
		removeLineClass: docMethodOp(function(handle, where, cls) {
			return changeLine(this, handle, "gutter" == where ? "gutter" : "class", function(line) {
				var prop = "text" == where ? "textClass" : "background" == where ? "bgClass" : "gutter" == where ? "gutterClass" : "wrapClass",
					cur = line[prop];
				if (!cur) return !1;
				if (null == cls) line[prop] = null;
				else {
					var found = cur.match(classTest(cls));
					if (!found) return !1;
					var end = found.index + found[0].length;
					line[prop] = cur.slice(0, found.index) + (found.index && end != cur.length ? " " : "") + cur.slice(end) || null
				}
				return !0
			})
		}),
		addLineWidget: docMethodOp(function(handle, node, options) {
			return addLineWidget(this, handle, node, options)
		}),
		removeLineWidget: function(widget) {
			widget.clear()
		},
		markText: function(from, to, options) {
			return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range")
		},
		setBookmark: function(pos, options) {
			var realOpts = {
				replacedWith: options && (null == options.nodeType ? options.widget : options),
				insertLeft: options && options.insertLeft,
				clearWhenEmpty: !1,
				shared: options && options.shared,
				handleMouseEvents: options && options.handleMouseEvents
			};
			return pos = clipPos(this, pos), markText(this, pos, pos, realOpts, "bookmark")
		},
		findMarksAt: function(pos) {
			pos = clipPos(this, pos);
			var markers = [],
				spans = getLine(this, pos.line).markedSpans;
			if (spans)
				for (var i = 0; i < spans.length; ++i) {
					var span = spans[i];
					(null == span.from || span.from <= pos.ch) && (null == span.to || span.to >= pos.ch) && markers.push(span.marker.parent || span.marker)
				}
			return markers
		},
		findMarks: function(from, to, filter) {
			from = clipPos(this, from), to = clipPos(this, to);
			var found = [],
				lineNo = from.line;
			return this.iter(from.line, to.line + 1, function(line) {
				var spans = line.markedSpans;
				if (spans)
					for (var i = 0; i < spans.length; i++) {
						var span = spans[i];
						null != span.to && lineNo == from.line && from.ch >= span.to || null == span.from && lineNo != from.line || null != span.from && lineNo == to.line && span.from >= to.ch || filter && !filter(span.marker) || found.push(span.marker.parent || span.marker)
					}++lineNo
			}), found
		},
		getAllMarks: function() {
			var markers = [];
			return this.iter(function(line) {
				var sps = line.markedSpans;
				if (sps)
					for (var i = 0; i < sps.length; ++i) null != sps[i].from && markers.push(sps[i].marker)
			}), markers
		},
		posFromIndex: function(off) {
			var ch, lineNo = this.first,
				sepSize = this.lineSeparator().length;
			return this.iter(function(line) {
				var sz = line.text.length + sepSize;
				return sz > off ? (ch = off, !0) : (off -= sz, void++lineNo)
			}), clipPos(this, Pos(lineNo, ch))
		},
		indexFromPos: function(coords) {
			coords = clipPos(this, coords);
			var index = coords.ch;
			if (coords.line < this.first || coords.ch < 0) return 0;
			var sepSize = this.lineSeparator().length;
			return this.iter(this.first, coords.line, function(line) {
				index += line.text.length + sepSize
			}), index
		},
		copy: function(copyHistory) {
			var doc = new Doc(getLines(this, this.first, this.first + this.size), this.modeOption, this.first, this.lineSep, this.direction);
			return doc.scrollTop = this.scrollTop, doc.scrollLeft = this.scrollLeft, doc.sel = this.sel, doc.extend = !1, copyHistory && (doc.history.undoDepth = this.history.undoDepth, doc.setHistory(this.getHistory())), doc
		},
		linkedDoc: function(options) {
			options || (options = {});
			var from = this.first,
				to = this.first + this.size;
			null != options.from && options.from > from && (from = options.from), null != options.to && options.to < to && (to = options.to);
			var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep, this.direction);
			return options.sharedHist && (copy.history = this.history), (this.linked || (this.linked = [])).push({
				doc: copy,
				sharedHist: options.sharedHist
			}), copy.linked = [{
				doc: this,
				isParent: !0,
				sharedHist: options.sharedHist
			}], copySharedMarkers(copy, findSharedMarkers(this)), copy
		},
		unlinkDoc: function(other) {
			var this$1 = this;
			if (other instanceof CodeMirror && (other = other.doc), this.linked)
				for (var i = 0; i < this.linked.length; ++i) {
					var link = this$1.linked[i];
					if (link.doc == other) {
						this$1.linked.splice(i, 1), other.unlinkDoc(this$1), detachSharedMarkers(findSharedMarkers(this$1));
						break
					}
				}
			if (other.history == this.history) {
				var splitIds = [other.id];
				linkedDocs(other, function(doc) {
					return splitIds.push(doc.id)
				}, !0), other.history = new History(null), other.history.done = copyHistoryArray(this.history.done, splitIds), other.history.undone = copyHistoryArray(this.history.undone, splitIds)
			}
		},
		iterLinkedDocs: function(f) {
			linkedDocs(this, f)
		},
		getMode: function() {
			return this.mode
		},
		getEditor: function() {
			return this.cm
		},
		splitLines: function(str) {
			return this.lineSep ? str.split(this.lineSep) : splitLinesAuto(str)
		},
		lineSeparator: function() {
			return this.lineSep || "\n"
		},
		setDirection: docMethodOp(function(dir) {
			"rtl" != dir && (dir = "ltr"), dir != this.direction && (this.direction = dir, this.iter(function(line) {
				return line.order = null
			}), this.cm && directionChanged(this.cm))
		})
	}), Doc.prototype.eachLine = Doc.prototype.iter;
	for (var lastDrop = 0, globalsRegistered = !1, keyNames = {
			3: "Pause",
			8: "Backspace",
			9: "Tab",
			13: "Enter",
			16: "Shift",
			17: "Ctrl",
			18: "Alt",
			19: "Pause",
			20: "CapsLock",
			27: "Esc",
			32: "Space",
			33: "PageUp",
			34: "PageDown",
			35: "End",
			36: "Home",
			37: "Left",
			38: "Up",
			39: "Right",
			40: "Down",
			44: "PrintScrn",
			45: "Insert",
			46: "Delete",
			59: ";",
			61: "=",
			91: "Mod",
			92: "Mod",
			93: "Mod",
			106: "*",
			107: "=",
			109: "-",
			110: ".",
			111: "/",
			127: "Delete",
			145: "ScrollLock",
			173: "-",
			186: ";",
			187: "=",
			188: ",",
			189: "-",
			190: ".",
			191: "/",
			192: "`",
			219: "[",
			220: "\\",
			221: "]",
			222: "'",
			63232: "Up",
			63233: "Down",
			63234: "Left",
			63235: "Right",
			63272: "Delete",
			63273: "Home",
			63275: "End",
			63276: "PageUp",
			63277: "PageDown",
			63302: "Insert"
		}, i = 0; 10 > i; i++) keyNames[i + 48] = keyNames[i + 96] = String(i);
	for (var i$1 = 65; 90 >= i$1; i$1++) keyNames[i$1] = String.fromCharCode(i$1);
	for (var i$2 = 1; 12 >= i$2; i$2++) keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2;
	var keyMap = {};
	keyMap.basic = {
		Left: "goCharLeft",
		Right: "goCharRight",
		Up: "goLineUp",
		Down: "goLineDown",
		End: "goLineEnd",
		Home: "goLineStartSmart",
		PageUp: "goPageUp",
		PageDown: "goPageDown",
		Delete: "delCharAfter",
		Backspace: "delCharBefore",
		"Shift-Backspace": "delCharBefore",
		Tab: "defaultTab",
		"Shift-Tab": "indentAuto",
		Enter: "newlineAndIndent",
		Insert: "toggleOverwrite",
		Esc: "singleSelection"
	}, keyMap.pcDefault = {
		"Ctrl-A": "selectAll",
		"Ctrl-D": "deleteLine",
		"Ctrl-Z": "undo",
		"Shift-Ctrl-Z": "redo",
		"Ctrl-Y": "redo",
		"Ctrl-Home": "goDocStart",
		"Ctrl-End": "goDocEnd",
		"Ctrl-Up": "goLineUp",
		"Ctrl-Down": "goLineDown",
		"Ctrl-Left": "goGroupLeft",
		"Ctrl-Right": "goGroupRight",
		"Alt-Left": "goLineStart",
		"Alt-Right": "goLineEnd",
		"Ctrl-Backspace": "delGroupBefore",
		"Ctrl-Delete": "delGroupAfter",
		"Ctrl-S": "save",
		"Ctrl-F": "find",
		"Ctrl-G": "findNext",
		"Shift-Ctrl-G": "findPrev",
		"Shift-Ctrl-F": "replace",
		"Shift-Ctrl-R": "replaceAll",
		"Ctrl-[": "indentLess",
		"Ctrl-]": "indentMore",
		"Ctrl-U": "undoSelection",
		"Shift-Ctrl-U": "redoSelection",
		"Alt-U": "redoSelection",
		fallthrough: "basic"
	}, keyMap.emacsy = {
		"Ctrl-F": "goCharRight",
		"Ctrl-B": "goCharLeft",
		"Ctrl-P": "goLineUp",
		"Ctrl-N": "goLineDown",
		"Alt-F": "goWordRight",
		"Alt-B": "goWordLeft",
		"Ctrl-A": "goLineStart",
		"Ctrl-E": "goLineEnd",
		"Ctrl-V": "goPageDown",
		"Shift-Ctrl-V": "goPageUp",
		"Ctrl-D": "delCharAfter",
		"Ctrl-H": "delCharBefore",
		"Alt-D": "delWordAfter",
		"Alt-Backspace": "delWordBefore",
		"Ctrl-K": "killLine",
		"Ctrl-T": "transposeChars",
		"Ctrl-O": "openLine"
	}, keyMap.macDefault = {
		"Cmd-A": "selectAll",
		"Cmd-D": "deleteLine",
		"Cmd-Z": "undo",
		"Shift-Cmd-Z": "redo",
		"Cmd-Y": "redo",
		"Cmd-Home": "goDocStart",
		"Cmd-Up": "goDocStart",
		"Cmd-End": "goDocEnd",
		"Cmd-Down": "goDocEnd",
		"Alt-Left": "goGroupLeft",
		"Alt-Right": "goGroupRight",
		"Cmd-Left": "goLineLeft",
		"Cmd-Right": "goLineRight",
		"Alt-Backspace": "delGroupBefore",
		"Ctrl-Alt-Backspace": "delGroupAfter",
		"Alt-Delete": "delGroupAfter",
		"Cmd-S": "save",
		"Cmd-F": "find",
		"Cmd-G": "findNext",
		"Shift-Cmd-G": "findPrev",
		"Cmd-Alt-F": "replace",
		"Shift-Cmd-Alt-F": "replaceAll",
		"Cmd-[": "indentLess",
		"Cmd-]": "indentMore",
		"Cmd-Backspace": "delWrappedLineLeft",
		"Cmd-Delete": "delWrappedLineRight",
		"Cmd-U": "undoSelection",
		"Shift-Cmd-U": "redoSelection",
		"Ctrl-Up": "goDocStart",
		"Ctrl-Down": "goDocEnd",
		fallthrough: ["basic", "emacsy"]
	}, keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;
	var commands = {
			selectAll: selectAll,
			singleSelection: function(cm) {
				return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll)
			},
			killLine: function(cm) {
				return deleteNearSelection(cm, function(range) {
					if (range.empty()) {
						var len = getLine(cm.doc, range.head.line).text.length;
						return range.head.ch == len && range.head.line < cm.lastLine() ? {
							from: range.head,
							to: Pos(range.head.line + 1, 0)
						} : {
							from: range.head,
							to: Pos(range.head.line, len)
						}
					}
					return {
						from: range.from(),
						to: range.to()
					}
				})
			},
			deleteLine: function(cm) {
				return deleteNearSelection(cm, function(range) {
					return {
						from: Pos(range.from().line, 0),
						to: clipPos(cm.doc, Pos(range.to().line + 1, 0))
					}
				})
			},
			delLineLeft: function(cm) {
				return deleteNearSelection(cm, function(range) {
					return {
						from: Pos(range.from().line, 0),
						to: range.from()
					}
				})
			},
			delWrappedLineLeft: function(cm) {
				return deleteNearSelection(cm, function(range) {
					var top = cm.charCoords(range.head, "div").top + 5,
						leftPos = cm.coordsChar({
							left: 0,
							top: top
						}, "div");
					return {
						from: leftPos,
						to: range.from()
					}
				})
			},
			delWrappedLineRight: function(cm) {
				return deleteNearSelection(cm, function(range) {
					var top = cm.charCoords(range.head, "div").top + 5,
						rightPos = cm.coordsChar({
							left: cm.display.lineDiv.offsetWidth + 100,
							top: top
						}, "div");
					return {
						from: range.from(),
						to: rightPos
					}
				})
			},
			undo: function(cm) {
				return cm.undo()
			},
			redo: function(cm) {
				return cm.redo()
			},
			undoSelection: function(cm) {
				return cm.undoSelection()
			},
			redoSelection: function(cm) {
				return cm.redoSelection()
			},
			goDocStart: function(cm) {
				return cm.extendSelection(Pos(cm.firstLine(), 0))
			},
			goDocEnd: function(cm) {
				return cm.extendSelection(Pos(cm.lastLine()))
			},
			goLineStart: function(cm) {
				return cm.extendSelectionsBy(function(range) {
					return lineStart(cm, range.head.line)
				}, {
					origin: "+move",
					bias: 1
				})
			},
			goLineStartSmart: function(cm) {
				return cm.extendSelectionsBy(function(range) {
					return lineStartSmart(cm, range.head)
				}, {
					origin: "+move",
					bias: 1
				})
			},
			goLineEnd: function(cm) {
				return cm.extendSelectionsBy(function(range) {
					return lineEnd(cm, range.head.line)
				}, {
					origin: "+move",
					bias: -1
				})
			},
			goLineRight: function(cm) {
				return cm.extendSelectionsBy(function(range) {
					var top = cm.cursorCoords(range.head, "div").top + 5;
					return cm.coordsChar({
						left: cm.display.lineDiv.offsetWidth + 100,
						top: top
					}, "div")
				}, sel_move)
			},
			goLineLeft: function(cm) {
				return cm.extendSelectionsBy(function(range) {
					var top = cm.cursorCoords(range.head, "div").top + 5;
					return cm.coordsChar({
						left: 0,
						top: top
					}, "div")
				}, sel_move)
			},
			goLineLeftSmart: function(cm) {
				return cm.extendSelectionsBy(function(range) {
					var top = cm.cursorCoords(range.head, "div").top + 5,
						pos = cm.coordsChar({
							left: 0,
							top: top
						}, "div");
					return pos.ch < cm.getLine(pos.line).search(/\S/) ? lineStartSmart(cm, range.head) : pos
				}, sel_move)
			},
			goLineUp: function(cm) {
				return cm.moveV(-1, "line")
			},
			goLineDown: function(cm) {
				return cm.moveV(1, "line")
			},
			goPageUp: function(cm) {
				return cm.moveV(-1, "page")
			},
			goPageDown: function(cm) {
				return cm.moveV(1, "page")
			},
			goCharLeft: function(cm) {
				return cm.moveH(-1, "char")
			},
			goCharRight: function(cm) {
				return cm.moveH(1, "char")
			},
			goColumnLeft: function(cm) {
				return cm.moveH(-1, "column")
			},
			goColumnRight: function(cm) {
				return cm.moveH(1, "column")
			},
			goWordLeft: function(cm) {
				return cm.moveH(-1, "word")
			},
			goGroupRight: function(cm) {
				return cm.moveH(1, "group")
			},
			goGroupLeft: function(cm) {
				return cm.moveH(-1, "group")
			},
			goWordRight: function(cm) {
				return cm.moveH(1, "word")
			},
			delCharBefore: function(cm) {
				return cm.deleteH(-1, "char")
			},
			delCharAfter: function(cm) {
				return cm.deleteH(1, "char")
			},
			delWordBefore: function(cm) {
				return cm.deleteH(-1, "word")
			},
			delWordAfter: function(cm) {
				return cm.deleteH(1, "word")
			},
			delGroupBefore: function(cm) {
				return cm.deleteH(-1, "group")
			},
			delGroupAfter: function(cm) {
				return cm.deleteH(1, "group")
			},
			indentAuto: function(cm) {
				return cm.indentSelection("smart")
			},
			indentMore: function(cm) {
				return cm.indentSelection("add")
			},
			indentLess: function(cm) {
				return cm.indentSelection("subtract")
			},
			insertTab: function(cm) {
				return cm.replaceSelection("	")
			},
			insertSoftTab: function(cm) {
				for (var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize, i = 0; i < ranges.length; i++) {
					var pos = ranges[i].from(),
						col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
					spaces.push(spaceStr(tabSize - col % tabSize))
				}
				cm.replaceSelections(spaces)
			},
			defaultTab: function(cm) {
				cm.somethingSelected() ? cm.indentSelection("add") : cm.execCommand("insertTab")
			},
			transposeChars: function(cm) {
				return runInOp(cm, function() {
					for (var ranges = cm.listSelections(), newSel = [], i = 0; i < ranges.length; i++)
						if (ranges[i].empty()) {
							var cur = ranges[i].head,
								line = getLine(cm.doc, cur.line).text;
							if (line)
								if (cur.ch == line.length && (cur = new Pos(cur.line, cur.ch - 1)), cur.ch > 0) cur = new Pos(cur.line, cur.ch + 1), cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2), Pos(cur.line, cur.ch - 2), cur, "+transpose");
								else if (cur.line > cm.doc.first) {
								var prev = getLine(cm.doc, cur.line - 1).text;
								prev && (cur = new Pos(cur.line, 1), cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() + prev.charAt(prev.length - 1), Pos(cur.line - 1, prev.length - 1), cur, "+transpose"))
							}
							newSel.push(new Range(cur, cur))
						}
					cm.setSelections(newSel)
				})
			},
			newlineAndIndent: function(cm) {
				return runInOp(cm, function() {
					for (var sels = cm.listSelections(), i = sels.length - 1; i >= 0; i--) cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input");
					sels = cm.listSelections();
					for (var i$1 = 0; i$1 < sels.length; i$1++) cm.indentLine(sels[i$1].from().line, null, !0);
					ensureCursorVisible(cm)
				})
			},
			openLine: function(cm) {
				return cm.replaceSelection("\n", "start")
			},
			toggleOverwrite: function(cm) {
				return cm.toggleOverwrite()
			}
		},
		stopSeq = new Delayed,
		lastStoppedKey = null,
		DOUBLECLICK_DELAY = 400,
		PastClick = function(time, pos, button) {
			this.time = time, this.pos = pos, this.button = button
		};
	PastClick.prototype.compare = function(time, pos, button) {
		return this.time + DOUBLECLICK_DELAY > time && 0 == cmp(pos, this.pos) && button == this.button
	};
	var lastClick, lastDoubleClick, Init = {
			toString: function() {
				return "CodeMirror.Init"
			}
		},
		defaults = {},
		optionHandlers = {};
	CodeMirror.defaults = defaults, CodeMirror.optionHandlers = optionHandlers;
	var initHooks = [];
	CodeMirror.defineInitHook = function(f) {
		return initHooks.push(f)
	};
	var lastCopied = null,
		ContentEditableInput = function(cm) {
			this.cm = cm, this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null, this.polling = new Delayed, this.composing = null, this.gracePeriod = !1, this.readDOMTimeout = null
		};
	ContentEditableInput.prototype.init = function(display) {
		function onCopyCut(e) {
			if (!signalDOMEvent(cm, e)) {
				if (cm.somethingSelected()) setLastCopied({
					lineWise: !1,
					text: cm.getSelections()
				}), "cut" == e.type && cm.replaceSelection("", null, "cut");
				else {
					if (!cm.options.lineWiseCopyCut) return;
					var ranges = copyableRanges(cm);
					setLastCopied({
						lineWise: !0,
						text: ranges.text
					}), "cut" == e.type && cm.operation(function() {
						cm.setSelections(ranges.ranges, 0, sel_dontScroll), cm.replaceSelection("", null, "cut")
					})
				}
				if (e.clipboardData) {
					e.clipboardData.clearData();
					var content = lastCopied.text.join("\n");
					if (e.clipboardData.setData("Text", content), e.clipboardData.getData("Text") == content) return void e.preventDefault()
				}
				var kludge = hiddenTextarea(),
					te = kludge.firstChild;
				cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild), te.value = lastCopied.text.join("\n");
				var hadFocus = document.activeElement;
				selectInput(te), setTimeout(function() {
					cm.display.lineSpace.removeChild(kludge), hadFocus.focus(), hadFocus == div && input.showPrimarySelection()
				}, 50)
			}
		}
		var this$1 = this,
			input = this,
			cm = input.cm,
			div = input.div = display.lineDiv;
		disableBrowserMagic(div, cm.options.spellcheck), on(div, "paste", function(e) {
			signalDOMEvent(cm, e) || handlePaste(e, cm) || 11 >= ie_version && setTimeout(operation(cm, function() {
				return this$1.updateFromDOM()
			}), 20)
		}), on(div, "compositionstart", function(e) {
			this$1.composing = {
				data: e.data,
				done: !1
			}
		}), on(div, "compositionupdate", function(e) {
			this$1.composing || (this$1.composing = {
				data: e.data,
				done: !1
			})
		}), on(div, "compositionend", function(e) {
			this$1.composing && (e.data != this$1.composing.data && this$1.readFromDOMSoon(), this$1.composing.done = !0)
		}), on(div, "touchstart", function() {
			return input.forceCompositionEnd()
		}), on(div, "input", function() {
			this$1.composing || this$1.readFromDOMSoon()
		}), on(div, "copy", onCopyCut), on(div, "cut", onCopyCut)
	}, ContentEditableInput.prototype.prepareSelection = function() {
		var result = prepareSelection(this.cm, !1);
		return result.focus = this.cm.state.focused, result
	}, ContentEditableInput.prototype.showSelection = function(info, takeFocus) {
		info && this.cm.display.view.length && ((info.focus || takeFocus) && this.showPrimarySelection(), this.showMultipleSelections(info))
	}, ContentEditableInput.prototype.showPrimarySelection = function() {
		var sel = window.getSelection(),
			cm = this.cm,
			prim = cm.doc.sel.primary(),
			from = prim.from(),
			to = prim.to();
		if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) return void sel.removeAllRanges();
		var curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset),
			curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);
		if (!curAnchor || curAnchor.bad || !curFocus || curFocus.bad || 0 != cmp(minPos(curAnchor, curFocus), from) || 0 != cmp(maxPos(curAnchor, curFocus), to)) {
			var view = cm.display.view,
				start = from.line >= cm.display.viewFrom && posToDOM(cm, from) || {
					node: view[0].measure.map[2],
					offset: 0
				},
				end = to.line < cm.display.viewTo && posToDOM(cm, to);
			if (!end) {
				var measure = view[view.length - 1].measure,
					map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
				end = {
					node: map[map.length - 1],
					offset: map[map.length - 2] - map[map.length - 3]
				}
			}
			if (!start || !end) return void sel.removeAllRanges();
			var rng, old = sel.rangeCount && sel.getRangeAt(0);
			try {
				rng = range(start.node, start.offset, end.offset, end.node)
			} catch (e) {}
			rng && (!gecko && cm.state.focused ? (sel.collapse(start.node, start.offset), rng.collapsed || (sel.removeAllRanges(), sel.addRange(rng))) : (sel.removeAllRanges(), sel.addRange(rng)), old && null == sel.anchorNode ? sel.addRange(old) : gecko && this.startGracePeriod()), this.rememberSelection()
		}
	}, ContentEditableInput.prototype.startGracePeriod = function() {
		var this$1 = this;
		clearTimeout(this.gracePeriod), this.gracePeriod = setTimeout(function() {
			this$1.gracePeriod = !1, this$1.selectionChanged() && this$1.cm.operation(function() {
				return this$1.cm.curOp.selectionChanged = !0
			})
		}, 20)
	}, ContentEditableInput.prototype.showMultipleSelections = function(info) {
		removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors), removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection)
	}, ContentEditableInput.prototype.rememberSelection = function() {
		var sel = window.getSelection();
		this.lastAnchorNode = sel.anchorNode, this.lastAnchorOffset = sel.anchorOffset, this.lastFocusNode = sel.focusNode, this.lastFocusOffset = sel.focusOffset
	}, ContentEditableInput.prototype.selectionInEditor = function() {
		var sel = window.getSelection();
		if (!sel.rangeCount) return !1;
		var node = sel.getRangeAt(0).commonAncestorContainer;
		return contains(this.div, node)
	}, ContentEditableInput.prototype.focus = function() {
		"nocursor" != this.cm.options.readOnly && (this.selectionInEditor() || this.showSelection(this.prepareSelection(), !0), this.div.focus())
	}, ContentEditableInput.prototype.blur = function() {
		this.div.blur()
	}, ContentEditableInput.prototype.getField = function() {
		return this.div
	}, ContentEditableInput.prototype.supportsTouch = function() {
		return !0
	}, ContentEditableInput.prototype.receivedFocus = function() {
		function poll() {
			input.cm.state.focused && (input.pollSelection(), input.polling.set(input.cm.options.pollInterval, poll))
		}
		var input = this;
		this.selectionInEditor() ? this.pollSelection() : runInOp(this.cm, function() {
			return input.cm.curOp.selectionChanged = !0
		}), this.polling.set(this.cm.options.pollInterval, poll)
	}, ContentEditableInput.prototype.selectionChanged = function() {
		var sel = window.getSelection();
		return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset || sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset
	}, ContentEditableInput.prototype.pollSelection = function() {
		if (null == this.readDOMTimeout && !this.gracePeriod && this.selectionChanged()) {
			var sel = window.getSelection(),
				cm = this.cm;
			if (android && chrome && this.cm.options.gutters.length && isInGutter(sel.anchorNode)) return this.cm.triggerOnKeyDown({
				type: "keydown",
				keyCode: 8,
				preventDefault: Math.abs
			}), this.blur(), void this.focus();
			if (!this.composing) {
				this.rememberSelection();
				var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset),
					head = domToPos(cm, sel.focusNode, sel.focusOffset);
				anchor && head && runInOp(cm, function() {
					setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll), (anchor.bad || head.bad) && (cm.curOp.selectionChanged = !0)
				})
			}
		}
	}, ContentEditableInput.prototype.pollContent = function() {
		null != this.readDOMTimeout && (clearTimeout(this.readDOMTimeout), this.readDOMTimeout = null);
		var cm = this.cm,
			display = cm.display,
			sel = cm.doc.sel.primary(),
			from = sel.from(),
			to = sel.to();
		if (0 == from.ch && from.line > cm.firstLine() && (from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length)), to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine() && (to = Pos(to.line + 1, 0)), from.line < display.viewFrom || to.line > display.viewTo - 1) return !1;
		var fromIndex, fromLine, fromNode;
		from.line == display.viewFrom || 0 == (fromIndex = findViewIndex(cm, from.line)) ? (fromLine = lineNo(display.view[0].line), fromNode = display.view[0].node) : (fromLine = lineNo(display.view[fromIndex].line), fromNode = display.view[fromIndex - 1].node.nextSibling);
		var toLine, toNode, toIndex = findViewIndex(cm, to.line);
		if (toIndex == display.view.length - 1 ? (toLine = display.viewTo - 1, toNode = display.lineDiv.lastChild) : (toLine = lineNo(display.view[toIndex + 1].line) - 1, toNode = display.view[toIndex + 1].node.previousSibling), !fromNode) return !1;
		for (var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine)), oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length)); newText.length > 1 && oldText.length > 1;)
			if (lst(newText) == lst(oldText)) newText.pop(), oldText.pop(), toLine--;
			else {
				if (newText[0] != oldText[0]) break;
				newText.shift(), oldText.shift(), fromLine++
			}
		for (var cutFront = 0, cutEnd = 0, newTop = newText[0], oldTop = oldText[0], maxCutFront = Math.min(newTop.length, oldTop.length); maxCutFront > cutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront);) ++cutFront;
		for (var newBot = lst(newText), oldBot = lst(oldText), maxCutEnd = Math.min(newBot.length - (1 == newText.length ? cutFront : 0), oldBot.length - (1 == oldText.length ? cutFront : 0)); maxCutEnd > cutEnd && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1);) ++cutEnd;
		if (1 == newText.length && 1 == oldText.length && fromLine == from.line)
			for (; cutFront && cutFront > from.ch && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1);) cutFront--, cutEnd++;
		newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, ""), newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");
		var chFrom = Pos(fromLine, cutFront),
			chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
		return newText.length > 1 || newText[0] || cmp(chFrom, chTo) ? (replaceRange(cm.doc, newText, chFrom, chTo, "+input"), !0) : void 0
	}, ContentEditableInput.prototype.ensurePolled = function() {
		this.forceCompositionEnd()
	}, ContentEditableInput.prototype.reset = function() {
		this.forceCompositionEnd()
	}, ContentEditableInput.prototype.forceCompositionEnd = function() {
		this.composing && (clearTimeout(this.readDOMTimeout), this.composing = null, this.updateFromDOM(), this.div.blur(), this.div.focus())
	}, ContentEditableInput.prototype.readFromDOMSoon = function() {
		var this$1 = this;
		null == this.readDOMTimeout && (this.readDOMTimeout = setTimeout(function() {
			if (this$1.readDOMTimeout = null, this$1.composing) {
				if (!this$1.composing.done) return;
				this$1.composing = null
			}
			this$1.updateFromDOM()
		}, 80))
	}, ContentEditableInput.prototype.updateFromDOM = function() {
		var this$1 = this;
		(this.cm.isReadOnly() || !this.pollContent()) && runInOp(this.cm, function() {
			return regChange(this$1.cm)
		})
	}, ContentEditableInput.prototype.setUneditable = function(node) {
		node.contentEditable = "false"
	}, ContentEditableInput.prototype.onKeyPress = function(e) {
		0 != e.charCode && (e.preventDefault(), this.cm.isReadOnly() || operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode), 0))
	}, ContentEditableInput.prototype.readOnlyChanged = function(val) {
		this.div.contentEditable = String("nocursor" != val)
	}, ContentEditableInput.prototype.onContextMenu = function() {}, ContentEditableInput.prototype.resetPosition = function() {}, ContentEditableInput.prototype.needsContentAttribute = !0;
	var TextareaInput = function(cm) {
		this.cm = cm, this.prevInput = "", this.pollingFast = !1, this.polling = new Delayed, this.hasSelection = !1, this.composing = null
	};
	TextareaInput.prototype.init = function(display) {
		function prepareCopyCut(e) {
			if (!signalDOMEvent(cm, e)) {
				if (cm.somethingSelected()) setLastCopied({
					lineWise: !1,
					text: cm.getSelections()
				});
				else {
					if (!cm.options.lineWiseCopyCut) return;
					var ranges = copyableRanges(cm);
					setLastCopied({
						lineWise: !0,
						text: ranges.text
					}), "cut" == e.type ? cm.setSelections(ranges.ranges, null, sel_dontScroll) : (input.prevInput = "", te.value = ranges.text.join("\n"), selectInput(te))
				}
				"cut" == e.type && (cm.state.cutIncoming = !0)
			}
		}
		var this$1 = this,
			input = this,
			cm = this.cm,
			div = this.wrapper = hiddenTextarea(),
			te = this.textarea = div.firstChild;
		display.wrapper.insertBefore(div, display.wrapper.firstChild), ios && (te.style.width = "0px"), on(te, "input", function() {
			ie && ie_version >= 9 && this$1.hasSelection && (this$1.hasSelection = null), input.poll()
		}), on(te, "paste", function(e) {
			signalDOMEvent(cm, e) || handlePaste(e, cm) || (cm.state.pasteIncoming = !0, input.fastPoll())
		}), on(te, "cut", prepareCopyCut), on(te, "copy", prepareCopyCut), on(display.scroller, "paste", function(e) {
			eventInWidget(display, e) || signalDOMEvent(cm, e) || (cm.state.pasteIncoming = !0, input.focus())
		}), on(display.lineSpace, "selectstart", function(e) {
			eventInWidget(display, e) || e_preventDefault(e)
		}), on(te, "compositionstart", function() {
			var start = cm.getCursor("from");
			input.composing && input.composing.range.clear(), input.composing = {
				start: start,
				range: cm.markText(start, cm.getCursor("to"), {
					className: "CodeMirror-composing"
				})
			}
		}), on(te, "compositionend", function() {
			input.composing && (input.poll(), input.composing.range.clear(), input.composing = null)
		})
	}, TextareaInput.prototype.prepareSelection = function() {
		var cm = this.cm,
			display = cm.display,
			doc = cm.doc,
			result = prepareSelection(cm);
		if (cm.options.moveInputWithCursor) {
			var headPos = cursorCoords(cm, doc.sel.primary().head, "div"),
				wrapOff = display.wrapper.getBoundingClientRect(),
				lineOff = display.lineDiv.getBoundingClientRect();
			result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10, headPos.top + lineOff.top - wrapOff.top)), result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10, headPos.left + lineOff.left - wrapOff.left))
		}
		return result
	}, TextareaInput.prototype.showSelection = function(drawn) {
		var cm = this.cm,
			display = cm.display;
		removeChildrenAndAdd(display.cursorDiv, drawn.cursors), removeChildrenAndAdd(display.selectionDiv, drawn.selection), null != drawn.teTop && (this.wrapper.style.top = drawn.teTop + "px", this.wrapper.style.left = drawn.teLeft + "px")
	}, TextareaInput.prototype.reset = function(typing) {
		if (!this.contextMenuPending && !this.composing) {
			var cm = this.cm;
			if (cm.somethingSelected()) {
				this.prevInput = "";
				var content = cm.getSelection();
				this.textarea.value = content, cm.state.focused && selectInput(this.textarea), ie && ie_version >= 9 && (this.hasSelection = content)
			} else typing || (this.prevInput = this.textarea.value = "", ie && ie_version >= 9 && (this.hasSelection = null))
		}
	}, TextareaInput.prototype.getField = function() {
		return this.textarea
	}, TextareaInput.prototype.supportsTouch = function() {
		return !1
	}, TextareaInput.prototype.focus = function() {
		if ("nocursor" != this.cm.options.readOnly && (!mobile || activeElt() != this.textarea)) try {
			this.textarea.focus()
		} catch (e) {}
	}, TextareaInput.prototype.blur = function() {
		this.textarea.blur()
	}, TextareaInput.prototype.resetPosition = function() {
		this.wrapper.style.top = this.wrapper.style.left = 0
	}, TextareaInput.prototype.receivedFocus = function() {
		this.slowPoll()
	}, TextareaInput.prototype.slowPoll = function() {
		var this$1 = this;
		this.pollingFast || this.polling.set(this.cm.options.pollInterval, function() {
			this$1.poll(), this$1.cm.state.focused && this$1.slowPoll()
		})
	}, TextareaInput.prototype.fastPoll = function() {
		function p() {
			var changed = input.poll();
			changed || missed ? (input.pollingFast = !1, input.slowPoll()) : (missed = !0, input.polling.set(60, p))
		}
		var missed = !1,
			input = this;
		input.pollingFast = !0, input.polling.set(20, p)
	}, TextareaInput.prototype.poll = function() {
		var this$1 = this,
			cm = this.cm,
			input = this.textarea,
			prevInput = this.prevInput;
		if (this.contextMenuPending || !cm.state.focused || hasSelection(input) && !prevInput && !this.composing || cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq) return !1;
		var text = input.value;
		if (text == prevInput && !cm.somethingSelected()) return !1;
		if (ie && ie_version >= 9 && this.hasSelection === text || mac && /[\uf700-\uf7ff]/.test(text)) return cm.display.input.reset(), !1;
		if (cm.doc.sel == cm.display.selForContextMenu) {
			var first = text.charCodeAt(0);
			if (8203 != first || prevInput || (prevInput = "​"), 8666 == first) return this.reset(), this.cm.execCommand("undo")
		}
		for (var same = 0, l = Math.min(prevInput.length, text.length); l > same && prevInput.charCodeAt(same) == text.charCodeAt(same);) ++same;
		return runInOp(cm, function() {
			applyTextInput(cm, text.slice(same), prevInput.length - same, null, this$1.composing ? "*compose" : null), text.length > 1e3 || text.indexOf("\n") > -1 ? input.value = this$1.prevInput = "" : this$1.prevInput = text, this$1.composing && (this$1.composing.range.clear(), this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"), {
				className: "CodeMirror-composing"
			}))
		}), !0
	}, TextareaInput.prototype.ensurePolled = function() {
		this.pollingFast && this.poll() && (this.pollingFast = !1)
	}, TextareaInput.prototype.onKeyPress = function() {
		ie && ie_version >= 9 && (this.hasSelection = null), this.fastPoll()
	}, TextareaInput.prototype.onContextMenu = function(e) {
		function prepareSelectAllHack() {
			if (null != te.selectionStart) {
				var selected = cm.somethingSelected(),
					extval = "​" + (selected ? te.value : "");
				te.value = "⇚", te.value = extval, input.prevInput = selected ? "" : "​", te.selectionStart = 1, te.selectionEnd = extval.length, display.selForContextMenu = cm.doc.sel
			}
		}

		function rehide() {
			if (input.contextMenuPending = !1, input.wrapper.style.cssText = oldWrapperCSS, te.style.cssText = oldCSS, ie && 9 > ie_version && display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos), null != te.selectionStart) {
				(!ie || ie && 9 > ie_version) && prepareSelectAllHack();
				var i = 0,
					poll = function() {
						display.selForContextMenu == cm.doc.sel && 0 == te.selectionStart && te.selectionEnd > 0 && "​" == input.prevInput ? operation(cm, selectAll)(cm) : i++ < 10 ? display.detectingSelectAll = setTimeout(poll, 500) : (display.selForContextMenu = null, display.input.reset())
					};
				display.detectingSelectAll = setTimeout(poll, 200)
			}
		}
		var input = this,
			cm = input.cm,
			display = cm.display,
			te = input.textarea,
			pos = posFromMouse(cm, e),
			scrollPos = display.scroller.scrollTop;
		if (pos && !presto) {
			var reset = cm.options.resetSelectionOnContextMenu;
			reset && -1 == cm.doc.sel.contains(pos) && operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);
			var oldCSS = te.style.cssText,
				oldWrapperCSS = input.wrapper.style.cssText;
			input.wrapper.style.cssText = "position: absolute";
			var wrapperBox = input.wrapper.getBoundingClientRect();
			te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
			var oldScrollY;
			if (webkit && (oldScrollY = window.scrollY), display.input.focus(), webkit && window.scrollTo(null, oldScrollY), display.input.reset(), cm.somethingSelected() || (te.value = input.prevInput = " "), input.contextMenuPending = !0, display.selForContextMenu = cm.doc.sel, clearTimeout(display.detectingSelectAll), ie && ie_version >= 9 && prepareSelectAllHack(), captureRightClick) {
				e_stop(e);
				var mouseup = function() {
					off(window, "mouseup", mouseup), setTimeout(rehide, 20)
				};
				on(window, "mouseup", mouseup)
			} else setTimeout(rehide, 50)
		}
	}, TextareaInput.prototype.readOnlyChanged = function(val) {
		val || this.reset(), this.textarea.disabled = "nocursor" == val
	}, TextareaInput.prototype.setUneditable = function() {}, TextareaInput.prototype.needsContentAttribute = !1, defineOptions(CodeMirror), addEditorMethods(CodeMirror);
	var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
	for (var prop in Doc.prototype) Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0 && (CodeMirror.prototype[prop] = function(method) {
		return function() {
			return method.apply(this.doc, arguments)
		}
	}(Doc.prototype[prop]));
	return eventMixin(Doc), CodeMirror.inputStyles = {
		textarea: TextareaInput,
		contenteditable: ContentEditableInput
	}, CodeMirror.defineMode = function(name) {
		CodeMirror.defaults.mode || "null" == name || (CodeMirror.defaults.mode = name), defineMode.apply(this, arguments)
	}, CodeMirror.defineMIME = defineMIME, CodeMirror.defineMode("null", function() {
		return {
			token: function(stream) {
				return stream.skipToEnd()
			}
		}
	}), CodeMirror.defineMIME("text/plain", "null"), CodeMirror.defineExtension = function(name, func) {
		CodeMirror.prototype[name] = func
	}, CodeMirror.defineDocExtension = function(name, func) {
		Doc.prototype[name] = func
	}, CodeMirror.fromTextArea = fromTextArea, addLegacyProps(CodeMirror), CodeMirror.version = "5.35.0", CodeMirror
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";
	var htmlConfig = {
			autoSelfClosers: {
				area: !0,
				base: !0,
				br: !0,
				col: !0,
				command: !0,
				embed: !0,
				frame: !0,
				hr: !0,
				img: !0,
				input: !0,
				keygen: !0,
				link: !0,
				meta: !0,
				param: !0,
				source: !0,
				track: !0,
				wbr: !0,
				menuitem: !0
			},
			implicitlyClosed: {
				dd: !0,
				li: !0,
				optgroup: !0,
				option: !0,
				p: !0,
				rp: !0,
				rt: !0,
				tbody: !0,
				td: !0,
				tfoot: !0,
				th: !0,
				tr: !0
			},
			contextGrabbers: {
				dd: {
					dd: !0,
					dt: !0
				},
				dt: {
					dd: !0,
					dt: !0
				},
				li: {
					li: !0
				},
				option: {
					option: !0,
					optgroup: !0
				},
				optgroup: {
					optgroup: !0
				},
				p: {
					address: !0,
					article: !0,
					aside: !0,
					blockquote: !0,
					dir: !0,
					div: !0,
					dl: !0,
					fieldset: !0,
					footer: !0,
					form: !0,
					h1: !0,
					h2: !0,
					h3: !0,
					h4: !0,
					h5: !0,
					h6: !0,
					header: !0,
					hgroup: !0,
					hr: !0,
					menu: !0,
					nav: !0,
					ol: !0,
					p: !0,
					pre: !0,
					section: !0,
					table: !0,
					ul: !0
				},
				rp: {
					rp: !0,
					rt: !0
				},
				rt: {
					rp: !0,
					rt: !0
				},
				tbody: {
					tbody: !0,
					tfoot: !0
				},
				td: {
					td: !0,
					th: !0
				},
				tfoot: {
					tbody: !0
				},
				th: {
					td: !0,
					th: !0
				},
				thead: {
					tbody: !0,
					tfoot: !0
				},
				tr: {
					tr: !0
				}
			},
			doNotIndent: {
				pre: !0
			},
			allowUnquoted: !0,
			allowMissing: !0,
			caseFold: !0
		},
		xmlConfig = {
			autoSelfClosers: {},
			implicitlyClosed: {},
			contextGrabbers: {},
			doNotIndent: {},
			allowUnquoted: !1,
			allowMissing: !1,
			allowMissingTagName: !1,
			caseFold: !1
		};
	CodeMirror.defineMode("xml", function(editorConf, config_) {
		function inText(stream, state) {
			function chain(parser) {
				return state.tokenize = parser, parser(stream, state)
			}
			var ch = stream.next();
			if ("<" == ch) return stream.eat("!") ? stream.eat("[") ? stream.match("CDATA[") ? chain(inBlock("atom", "]]>")) : null : stream.match("--") ? chain(inBlock("comment", "-->")) : stream.match("DOCTYPE", !0, !0) ? (stream.eatWhile(/[\w\._\-]/), chain(doctype(1))) : null : stream.eat("?") ? (stream.eatWhile(/[\w\._\-]/), state.tokenize = inBlock("meta", "?>"), "meta") : (type = stream.eat("/") ? "closeTag" : "openTag", state.tokenize = inTag, "tag bracket");
			if ("&" == ch) {
				var ok;
				return ok = stream.eat("#") ? stream.eat("x") ? stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";") : stream.eatWhile(/[\d]/) && stream.eat(";") : stream.eatWhile(/[\w\.\-:]/) && stream.eat(";"), ok ? "atom" : "error"
			}
			return stream.eatWhile(/[^&<]/), null
		}

		function inTag(stream, state) {
			var ch = stream.next();
			if (">" == ch || "/" == ch && stream.eat(">")) return state.tokenize = inText, type = ">" == ch ? "endTag" : "selfcloseTag", "tag bracket";
			if ("=" == ch) return type = "equals", null;
			if ("<" == ch) {
				state.tokenize = inText, state.state = baseState, state.tagName = state.tagStart = null;
				var next = state.tokenize(stream, state);
				return next ? next + " tag error" : "tag error"
			}
			return /[\'\"]/.test(ch) ? (state.tokenize = inAttribute(ch), state.stringStartCol = stream.column(), state.tokenize(stream, state)) : (stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/), "word")
		}

		function inAttribute(quote) {
			var closure = function(stream, state) {
				for (; !stream.eol();)
					if (stream.next() == quote) {
						state.tokenize = inTag;
						break
					}
				return "string"
			};
			return closure.isInAttribute = !0, closure
		}

		function inBlock(style, terminator) {
			return function(stream, state) {
				for (; !stream.eol();) {
					if (stream.match(terminator)) {
						state.tokenize = inText;
						break
					}
					stream.next()
				}
				return style
			}
		}

		function doctype(depth) {
			return function(stream, state) {
				for (var ch; null != (ch = stream.next());) {
					if ("<" == ch) return state.tokenize = doctype(depth + 1), state.tokenize(stream, state);
					if (">" == ch) {
						if (1 == depth) {
							state.tokenize = inText;
							break
						}
						return state.tokenize = doctype(depth - 1), state.tokenize(stream, state)
					}
				}
				return "meta"
			}
		}

		function Context(state, tagName, startOfLine) {
			this.prev = state.context, this.tagName = tagName, this.indent = state.indented, this.startOfLine = startOfLine, (config.doNotIndent.hasOwnProperty(tagName) || state.context && state.context.noIndent) && (this.noIndent = !0)
		}

		function popContext(state) {
			state.context && (state.context = state.context.prev)
		}

		function maybePopContext(state, nextTagName) {
			for (var parentTagName;;) {
				if (!state.context) return;
				if (parentTagName = state.context.tagName, !config.contextGrabbers.hasOwnProperty(parentTagName) || !config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) return;
				popContext(state)
			}
		}

		function baseState(type, stream, state) {
			return "openTag" == type ? (state.tagStart = stream.column(), tagNameState) : "closeTag" == type ? closeTagNameState : baseState
		}

		function tagNameState(type, stream, state) {
			return "word" == type ? (state.tagName = stream.current(), setStyle = "tag", attrState) : config.allowMissingTagName && "endTag" == type ? (setStyle = "tag bracket", attrState(type, stream, state)) : (setStyle = "error", tagNameState)
		}

		function closeTagNameState(type, stream, state) {
			if ("word" == type) {
				var tagName = stream.current();
				return state.context && state.context.tagName != tagName && config.implicitlyClosed.hasOwnProperty(state.context.tagName) && popContext(state), state.context && state.context.tagName == tagName || config.matchClosing === !1 ? (setStyle = "tag", closeState) : (setStyle = "tag error", closeStateErr)
			}
			return config.allowMissingTagName && "endTag" == type ? (setStyle = "tag bracket", closeState(type, stream, state)) : (setStyle = "error", closeStateErr)
		}

		function closeState(type, _stream, state) {
			return "endTag" != type ? (setStyle = "error", closeState) : (popContext(state), baseState)
		}

		function closeStateErr(type, stream, state) {
			return setStyle = "error", closeState(type, stream, state)
		}

		function attrState(type, _stream, state) {
			if ("word" == type) return setStyle = "attribute", attrEqState;
			if ("endTag" == type || "selfcloseTag" == type) {
				var tagName = state.tagName,
					tagStart = state.tagStart;
				return state.tagName = state.tagStart = null, "selfcloseTag" == type || config.autoSelfClosers.hasOwnProperty(tagName) ? maybePopContext(state, tagName) : (maybePopContext(state, tagName), state.context = new Context(state, tagName, tagStart == state.indented)), baseState
			}
			return setStyle = "error", attrState
		}

		function attrEqState(type, stream, state) {
			return "equals" == type ? attrValueState : (config.allowMissing || (setStyle = "error"), attrState(type, stream, state))
		}

		function attrValueState(type, stream, state) {
			return "string" == type ? attrContinuedState : "word" == type && config.allowUnquoted ? (setStyle = "string", attrState) : (setStyle = "error", attrState(type, stream, state))
		}

		function attrContinuedState(type, stream, state) {
			return "string" == type ? attrContinuedState : attrState(type, stream, state)
		}
		var indentUnit = editorConf.indentUnit,
			config = {},
			defaults = config_.htmlMode ? htmlConfig : xmlConfig;
		for (var prop in defaults) config[prop] = defaults[prop];
		for (var prop in config_) config[prop] = config_[prop];
		var type, setStyle;
		return inText.isInText = !0, {
			startState: function(baseIndent) {
				var state = {
					tokenize: inText,
					state: baseState,
					indented: baseIndent || 0,
					tagName: null,
					tagStart: null,
					context: null
				};
				return null != baseIndent && (state.baseIndent = baseIndent), state
			},
			token: function(stream, state) {
				if (!state.tagName && stream.sol() && (state.indented = stream.indentation()), stream.eatSpace()) return null;
				type = null;
				var style = state.tokenize(stream, state);
				return (style || type) && "comment" != style && (setStyle = null, state.state = state.state(type || style, stream, state), setStyle && (style = "error" == setStyle ? style + " error" : setStyle)), style
			},
			indent: function(state, textAfter, fullLine) {
				var context = state.context;
				if (state.tokenize.isInAttribute) return state.tagStart == state.indented ? state.stringStartCol + 1 : state.indented + indentUnit;
				if (context && context.noIndent) return CodeMirror.Pass;
				if (state.tokenize != inTag && state.tokenize != inText) return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
				if (state.tagName) return config.multilineTagIndentPastTag !== !1 ? state.tagStart + state.tagName.length + 2 : state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
				if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
				var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
				if (tagAfter && tagAfter[1])
					for (; context;) {
						if (context.tagName == tagAfter[2]) {
							context = context.prev;
							break
						}
						if (!config.implicitlyClosed.hasOwnProperty(context.tagName)) break;
						context = context.prev
					} else if (tagAfter)
						for (; context;) {
							var grabbers = config.contextGrabbers[context.tagName];
							if (!grabbers || !grabbers.hasOwnProperty(tagAfter[2])) break;
							context = context.prev
						}
				for (; context && context.prev && !context.startOfLine;) context = context.prev;
				return context ? context.indent + indentUnit : state.baseIndent || 0
			},
			electricInput: /<\/[\s\w:]+>$/,
			blockCommentStart: "<!--",
			blockCommentEnd: "-->",
			configuration: config.htmlMode ? "html" : "xml",
			helperType: config.htmlMode ? "html" : "xml",
			skipAttribute: function(state) {
				state.state == attrValueState && (state.state = attrState)
			}
		}
	}), CodeMirror.defineMIME("text/xml", "xml"), CodeMirror.defineMIME("application/xml", "xml"), CodeMirror.mimeModes.hasOwnProperty("text/html") || CodeMirror.defineMIME("text/html", {
		name: "xml",
		htmlMode: !0
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";
	var htmlConfig = {
			autoSelfClosers: {
				area: !0,
				base: !0,
				br: !0,
				col: !0,
				command: !0,
				embed: !0,
				frame: !0,
				hr: !0,
				img: !0,
				input: !0,
				keygen: !0,
				link: !0,
				meta: !0,
				param: !0,
				source: !0,
				track: !0,
				wbr: !0,
				menuitem: !0
			},
			implicitlyClosed: {
				dd: !0,
				li: !0,
				optgroup: !0,
				option: !0,
				p: !0,
				rp: !0,
				rt: !0,
				tbody: !0,
				td: !0,
				tfoot: !0,
				th: !0,
				tr: !0
			},
			contextGrabbers: {
				dd: {
					dd: !0,
					dt: !0
				},
				dt: {
					dd: !0,
					dt: !0
				},
				li: {
					li: !0
				},
				option: {
					option: !0,
					optgroup: !0
				},
				optgroup: {
					optgroup: !0
				},
				p: {
					address: !0,
					article: !0,
					aside: !0,
					blockquote: !0,
					dir: !0,
					div: !0,
					dl: !0,
					fieldset: !0,
					footer: !0,
					form: !0,
					h1: !0,
					h2: !0,
					h3: !0,
					h4: !0,
					h5: !0,
					h6: !0,
					header: !0,
					hgroup: !0,
					hr: !0,
					menu: !0,
					nav: !0,
					ol: !0,
					p: !0,
					pre: !0,
					section: !0,
					table: !0,
					ul: !0
				},
				rp: {
					rp: !0,
					rt: !0
				},
				rt: {
					rp: !0,
					rt: !0
				},
				tbody: {
					tbody: !0,
					tfoot: !0
				},
				td: {
					td: !0,
					th: !0
				},
				tfoot: {
					tbody: !0
				},
				th: {
					td: !0,
					th: !0
				},
				thead: {
					tbody: !0,
					tfoot: !0
				},
				tr: {
					tr: !0
				}
			},
			doNotIndent: {
				pre: !0
			},
			allowUnquoted: !0,
			allowMissing: !0,
			caseFold: !0
		},
		xmlConfig = {
			autoSelfClosers: {},
			implicitlyClosed: {},
			contextGrabbers: {},
			doNotIndent: {},
			allowUnquoted: !1,
			allowMissing: !1,
			allowMissingTagName: !1,
			caseFold: !1
		};
	CodeMirror.defineMode("xml", function(editorConf, config_) {
		function inText(stream, state) {
			function chain(parser) {
				return state.tokenize = parser, parser(stream, state)
			}
			var ch = stream.next();
			if ("<" == ch) return stream.eat("!") ? stream.eat("[") ? stream.match("CDATA[") ? chain(inBlock("atom", "]]>")) : null : stream.match("--") ? chain(inBlock("comment", "-->")) : stream.match("DOCTYPE", !0, !0) ? (stream.eatWhile(/[\w\._\-]/), chain(doctype(1))) : null : stream.eat("?") ? (stream.eatWhile(/[\w\._\-]/), state.tokenize = inBlock("meta", "?>"), "meta") : (type = stream.eat("/") ? "closeTag" : "openTag", state.tokenize = inTag, "tag bracket");
			if ("&" == ch) {
				var ok;
				return ok = stream.eat("#") ? stream.eat("x") ? stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";") : stream.eatWhile(/[\d]/) && stream.eat(";") : stream.eatWhile(/[\w\.\-:]/) && stream.eat(";"), ok ? "atom" : "error"
			}
			return stream.eatWhile(/[^&<]/), null
		}

		function inTag(stream, state) {
			var ch = stream.next();
			if (">" == ch || "/" == ch && stream.eat(">")) return state.tokenize = inText, type = ">" == ch ? "endTag" : "selfcloseTag", "tag bracket";
			if ("=" == ch) return type = "equals", null;
			if ("<" == ch) {
				state.tokenize = inText, state.state = baseState, state.tagName = state.tagStart = null;
				var next = state.tokenize(stream, state);
				return next ? next + " tag error" : "tag error"
			}
			return /[\'\"]/.test(ch) ? (state.tokenize = inAttribute(ch), state.stringStartCol = stream.column(), state.tokenize(stream, state)) : (stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/), "word")
		}

		function inAttribute(quote) {
			var closure = function(stream, state) {
				for (; !stream.eol();)
					if (stream.next() == quote) {
						state.tokenize = inTag;
						break
					}
				return "string"
			};
			return closure.isInAttribute = !0, closure
		}

		function inBlock(style, terminator) {
			return function(stream, state) {
				for (; !stream.eol();) {
					if (stream.match(terminator)) {
						state.tokenize = inText;
						break
					}
					stream.next()
				}
				return style
			}
		}

		function doctype(depth) {
			return function(stream, state) {
				for (var ch; null != (ch = stream.next());) {
					if ("<" == ch) return state.tokenize = doctype(depth + 1), state.tokenize(stream, state);
					if (">" == ch) {
						if (1 == depth) {
							state.tokenize = inText;
							break
						}
						return state.tokenize = doctype(depth - 1), state.tokenize(stream, state)
					}
				}
				return "meta"
			}
		}

		function Context(state, tagName, startOfLine) {
			this.prev = state.context, this.tagName = tagName, this.indent = state.indented, this.startOfLine = startOfLine, (config.doNotIndent.hasOwnProperty(tagName) || state.context && state.context.noIndent) && (this.noIndent = !0)
		}

		function popContext(state) {
			state.context && (state.context = state.context.prev)
		}

		function maybePopContext(state, nextTagName) {
			for (var parentTagName;;) {
				if (!state.context) return;
				if (parentTagName = state.context.tagName, !config.contextGrabbers.hasOwnProperty(parentTagName) || !config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) return;
				popContext(state)
			}
		}

		function baseState(type, stream, state) {
			return "openTag" == type ? (state.tagStart = stream.column(), tagNameState) : "closeTag" == type ? closeTagNameState : baseState
		}

		function tagNameState(type, stream, state) {
			return "word" == type ? (state.tagName = stream.current(), setStyle = "tag", attrState) : config.allowMissingTagName && "endTag" == type ? (setStyle = "tag bracket", attrState(type, stream, state)) : (setStyle = "error", tagNameState)
		}

		function closeTagNameState(type, stream, state) {
			if ("word" == type) {
				var tagName = stream.current();
				return state.context && state.context.tagName != tagName && config.implicitlyClosed.hasOwnProperty(state.context.tagName) && popContext(state), state.context && state.context.tagName == tagName || config.matchClosing === !1 ? (setStyle = "tag", closeState) : (setStyle = "tag error", closeStateErr)
			}
			return config.allowMissingTagName && "endTag" == type ? (setStyle = "tag bracket", closeState(type, stream, state)) : (setStyle = "error", closeStateErr)
		}

		function closeState(type, _stream, state) {
			return "endTag" != type ? (setStyle = "error", closeState) : (popContext(state), baseState)
		}

		function closeStateErr(type, stream, state) {
			return setStyle = "error", closeState(type, stream, state)
		}

		function attrState(type, _stream, state) {
			if ("word" == type) return setStyle = "attribute", attrEqState;
			if ("endTag" == type || "selfcloseTag" == type) {
				var tagName = state.tagName,
					tagStart = state.tagStart;
				return state.tagName = state.tagStart = null, "selfcloseTag" == type || config.autoSelfClosers.hasOwnProperty(tagName) ? maybePopContext(state, tagName) : (maybePopContext(state, tagName), state.context = new Context(state, tagName, tagStart == state.indented)), baseState
			}
			return setStyle = "error", attrState
		}

		function attrEqState(type, stream, state) {
			return "equals" == type ? attrValueState : (config.allowMissing || (setStyle = "error"), attrState(type, stream, state))
		}

		function attrValueState(type, stream, state) {
			return "string" == type ? attrContinuedState : "word" == type && config.allowUnquoted ? (setStyle = "string", attrState) : (setStyle = "error", attrState(type, stream, state))
		}

		function attrContinuedState(type, stream, state) {
			return "string" == type ? attrContinuedState : attrState(type, stream, state)
		}
		var indentUnit = editorConf.indentUnit,
			config = {},
			defaults = config_.htmlMode ? htmlConfig : xmlConfig;
		for (var prop in defaults) config[prop] = defaults[prop];
		for (var prop in config_) config[prop] = config_[prop];
		var type, setStyle;
		return inText.isInText = !0, {
			startState: function(baseIndent) {
				var state = {
					tokenize: inText,
					state: baseState,
					indented: baseIndent || 0,
					tagName: null,
					tagStart: null,
					context: null
				};
				return null != baseIndent && (state.baseIndent = baseIndent), state
			},
			token: function(stream, state) {
				if (!state.tagName && stream.sol() && (state.indented = stream.indentation()), stream.eatSpace()) return null;
				type = null;
				var style = state.tokenize(stream, state);
				return (style || type) && "comment" != style && (setStyle = null, state.state = state.state(type || style, stream, state), setStyle && (style = "error" == setStyle ? style + " error" : setStyle)), style
			},
			indent: function(state, textAfter, fullLine) {
				var context = state.context;
				if (state.tokenize.isInAttribute) return state.tagStart == state.indented ? state.stringStartCol + 1 : state.indented + indentUnit;
				if (context && context.noIndent) return CodeMirror.Pass;
				if (state.tokenize != inTag && state.tokenize != inText) return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
				if (state.tagName) return config.multilineTagIndentPastTag !== !1 ? state.tagStart + state.tagName.length + 2 : state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
				if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
				var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
				if (tagAfter && tagAfter[1])
					for (; context;) {
						if (context.tagName == tagAfter[2]) {
							context = context.prev;
							break
						}
						if (!config.implicitlyClosed.hasOwnProperty(context.tagName)) break;
						context = context.prev
					} else if (tagAfter)
						for (; context;) {
							var grabbers = config.contextGrabbers[context.tagName];
							if (!grabbers || !grabbers.hasOwnProperty(tagAfter[2])) break;
							context = context.prev
						}
				for (; context && context.prev && !context.startOfLine;) context = context.prev;
				return context ? context.indent + indentUnit : state.baseIndent || 0
			},
			electricInput: /<\/[\s\w:]+>$/,
			blockCommentStart: "<!--",
			blockCommentEnd: "-->",
			configuration: config.htmlMode ? "html" : "xml",
			helperType: config.htmlMode ? "html" : "xml",
			skipAttribute: function(state) {
				state.state == attrValueState && (state.state = attrState)
			}
		}
	}), CodeMirror.defineMIME("text/xml", "xml"), CodeMirror.defineMIME("application/xml", "xml"), CodeMirror.mimeModes.hasOwnProperty("text/html") || CodeMirror.defineMIME("text/html", {
		name: "xml",
		htmlMode: !0
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"), require("../css/css")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../xml/xml", "../javascript/javascript", "../css/css"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function maybeBackup(stream, pat, style) {
		var cur = stream.current(),
			close = cur.search(pat);
		return close > -1 ? stream.backUp(cur.length - close) : cur.match(/<\/?$/) && (stream.backUp(cur.length), stream.match(pat, !1) || stream.match(cur)), style
	}

	function getAttrRegexp(attr) {
		var regexp = attrRegexpCache[attr];
		return regexp ? regexp : attrRegexpCache[attr] = new RegExp("\\s+" + attr + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*")
	}

	function getAttrValue(text, attr) {
		var match = text.match(getAttrRegexp(attr));
		return match ? /^\s*(.*?)\s*$/.exec(match[2])[1] : ""
	}

	function getTagRegexp(tagName, anchored) {
		return new RegExp((anchored ? "^" : "") + "</s*" + tagName + "s*>", "i")
	}

	function addTags(from, to) {
		for (var tag in from)
			for (var dest = to[tag] || (to[tag] = []), source = from[tag], i = source.length - 1; i >= 0; i--) dest.unshift(source[i])
	}

	function findMatchingMode(tagInfo, tagText) {
		for (var i = 0; i < tagInfo.length; i++) {
			var spec = tagInfo[i];
			if (!spec[0] || spec[1].test(getAttrValue(tagText, spec[0]))) return spec[2]
		}
	}
	var defaultTags = {
			script: [
				["lang", /(javascript|babel)/i, "javascript"],
				["type", /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i, "javascript"],
				["type", /./, "text/plain"],
				[null, null, "javascript"]
			],
			style: [
				["lang", /^css$/i, "css"],
				["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"],
				["type", /./, "text/plain"],
				[null, null, "css"]
			]
		},
		attrRegexpCache = {};
	CodeMirror.defineMode("htmlmixed", function(config, parserConfig) {
		function html(stream, state) {
			var tagName, style = htmlMode.token(stream, state.htmlState),
				tag = /\btag\b/.test(style);
			if (tag && !/[<>\s\/]/.test(stream.current()) && (tagName = state.htmlState.tagName && state.htmlState.tagName.toLowerCase()) && tags.hasOwnProperty(tagName)) state.inTag = tagName + " ";
			else if (state.inTag && tag && />$/.test(stream.current())) {
				var inTag = /^([\S]+) (.*)/.exec(state.inTag);
				state.inTag = null;
				var modeSpec = ">" == stream.current() && findMatchingMode(tags[inTag[1]], inTag[2]),
					mode = CodeMirror.getMode(config, modeSpec),
					endTagA = getTagRegexp(inTag[1], !0),
					endTag = getTagRegexp(inTag[1], !1);
				state.token = function(stream, state) {
					return stream.match(endTagA, !1) ? (state.token = html, state.localState = state.localMode = null, null) : maybeBackup(stream, endTag, state.localMode.token(stream, state.localState))
				}, state.localMode = mode, state.localState = CodeMirror.startState(mode, htmlMode.indent(state.htmlState, ""))
			} else state.inTag && (state.inTag += stream.current(), stream.eol() && (state.inTag += " "));
			return style
		}
		var htmlMode = CodeMirror.getMode(config, {
				name: "xml",
				htmlMode: !0,
				multilineTagIndentFactor: parserConfig.multilineTagIndentFactor,
				multilineTagIndentPastTag: parserConfig.multilineTagIndentPastTag
			}),
			tags = {},
			configTags = parserConfig && parserConfig.tags,
			configScript = parserConfig && parserConfig.scriptTypes;
		if (addTags(defaultTags, tags), configTags && addTags(configTags, tags), configScript)
			for (var i = configScript.length - 1; i >= 0; i--) tags.script.unshift(["type", configScript[i].matches, configScript[i].mode]);
		return {
			startState: function() {
				var state = CodeMirror.startState(htmlMode);
				return {
					token: html,
					inTag: null,
					localMode: null,
					localState: null,
					htmlState: state
				}
			},
			copyState: function(state) {
				var local;
				return state.localState && (local = CodeMirror.copyState(state.localMode, state.localState)), {
					token: state.token,
					inTag: state.inTag,
					localMode: state.localMode,
					localState: local,
					htmlState: CodeMirror.copyState(htmlMode, state.htmlState)
				}
			},
			token: function(stream, state) {
				return state.token(stream, state)
			},
			indent: function(state, textAfter, line) {
				return !state.localMode || /^\s*<\//.test(textAfter) ? htmlMode.indent(state.htmlState, textAfter) : state.localMode.indent ? state.localMode.indent(state.localState, textAfter, line) : CodeMirror.Pass
			},
			innerMode: function(state) {
				return {
					state: state.localState || state.htmlState,
					mode: state.localMode || htmlMode
				}
			}
		}
	}, "xml", "javascript", "css"), CodeMirror.defineMIME("text/html", "htmlmixed")
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";
	CodeMirror.defineMode("javascript", function(config, parserConfig) {
		function readRegexp(stream) {
			for (var next, escaped = !1, inSet = !1; null != (next = stream.next());) {
				if (!escaped) {
					if ("/" == next && !inSet) return;
					"[" == next ? inSet = !0 : inSet && "]" == next && (inSet = !1)
				}
				escaped = !escaped && "\\" == next
			}
		}

		function ret(tp, style, cont) {
			return type = tp, content = cont, style
		}

		function tokenBase(stream, state) {
			var ch = stream.next();
			if ('"' == ch || "'" == ch) return state.tokenize = tokenString(ch), state.tokenize(stream, state);
			if ("." == ch && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) return ret("number", "number");
			if ("." == ch && stream.match("..")) return ret("spread", "meta");
			if (/[\[\]{}\(\),;\:\.]/.test(ch)) return ret(ch);
			if ("=" == ch && stream.eat(">")) return ret("=>", "operator");
			if ("0" == ch && stream.eat(/x/i)) return stream.eatWhile(/[\da-f]/i), ret("number", "number");
			if ("0" == ch && stream.eat(/o/i)) return stream.eatWhile(/[0-7]/i), ret("number", "number");
			if ("0" == ch && stream.eat(/b/i)) return stream.eatWhile(/[01]/i), ret("number", "number");
			if (/\d/.test(ch)) return stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/), ret("number", "number");
			if ("/" == ch) return stream.eat("*") ? (state.tokenize = tokenComment, tokenComment(stream, state)) : stream.eat("/") ? (stream.skipToEnd(), ret("comment", "comment")) : expressionAllowed(stream, state, 1) ? (readRegexp(stream), stream.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/), ret("regexp", "string-2")) : (stream.eat("="), ret("operator", "operator", stream.current()));
			if ("`" == ch) return state.tokenize = tokenQuasi, tokenQuasi(stream, state);
			if ("#" == ch) return stream.skipToEnd(), ret("error", "error");
			if (isOperatorChar.test(ch)) return ">" == ch && state.lexical && ">" == state.lexical.type || (stream.eat("=") ? ("!" == ch || "=" == ch) && stream.eat("=") : /[<>*+\-]/.test(ch) && (stream.eat(ch), ">" == ch && stream.eat(ch))), ret("operator", "operator", stream.current());
			if (wordRE.test(ch)) {
				stream.eatWhile(wordRE);
				var word = stream.current();
				if ("." != state.lastType) {
					if (keywords.propertyIsEnumerable(word)) {
						var kw = keywords[word];
						return ret(kw.type, kw.style, word)
					}
					if ("async" == word && stream.match(/^(\s|\/\*.*?\*\/)*[\(\w]/, !1)) return ret("async", "keyword", word)
				}
				return ret("variable", "variable", word)
			}
		}

		function tokenString(quote) {
			return function(stream, state) {
				var next, escaped = !1;
				if (jsonldMode && "@" == stream.peek() && stream.match(isJsonldKeyword)) return state.tokenize = tokenBase, ret("jsonld-keyword", "meta");
				for (; null != (next = stream.next()) && (next != quote || escaped);) escaped = !escaped && "\\" == next;
				return escaped || (state.tokenize = tokenBase), ret("string", "string")
			}
		}

		function tokenComment(stream, state) {
			for (var ch, maybeEnd = !1; ch = stream.next();) {
				if ("/" == ch && maybeEnd) {
					state.tokenize = tokenBase;
					break
				}
				maybeEnd = "*" == ch
			}
			return ret("comment", "comment")
		}

		function tokenQuasi(stream, state) {
			for (var next, escaped = !1; null != (next = stream.next());) {
				if (!escaped && ("`" == next || "$" == next && stream.eat("{"))) {
					state.tokenize = tokenBase;
					break
				}
				escaped = !escaped && "\\" == next
			}
			return ret("quasi", "string-2", stream.current())
		}

		function findFatArrow(stream, state) {
			state.fatArrowAt && (state.fatArrowAt = null);
			var arrow = stream.string.indexOf("=>", stream.start);
			if (!(0 > arrow)) {
				if (isTS) {
					var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow));
					m && (arrow = m.index)
				}
				for (var depth = 0, sawSomething = !1, pos = arrow - 1; pos >= 0; --pos) {
					var ch = stream.string.charAt(pos),
						bracket = brackets.indexOf(ch);
					if (bracket >= 0 && 3 > bracket) {
						if (!depth) {
							++pos;
							break
						}
						if (0 == --depth) {
							"(" == ch && (sawSomething = !0);
							break
						}
					} else if (bracket >= 3 && 6 > bracket) ++depth;
					else if (wordRE.test(ch)) sawSomething = !0;
					else {
						if (/["'\/]/.test(ch)) return;
						if (sawSomething && !depth) {
							++pos;
							break
						}
					}
				}
				sawSomething && !depth && (state.fatArrowAt = pos)
			}
		}

		function JSLexical(indented, column, type, align, prev, info) {
			this.indented = indented, this.column = column, this.type = type, this.prev = prev, this.info = info, null != align && (this.align = align)
		}

		function inScope(state, varname) {
			for (var v = state.localVars; v; v = v.next)
				if (v.name == varname) return !0;
			for (var cx = state.context; cx; cx = cx.prev)
				for (var v = cx.vars; v; v = v.next)
					if (v.name == varname) return !0
		}

		function parseJS(state, style, type, content, stream) {
			var cc = state.cc;
			for (cx.state = state, cx.stream = stream, cx.marked = null, cx.cc = cc, cx.style = style, state.lexical.hasOwnProperty("align") || (state.lexical.align = !0);;) {
				var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
				if (combinator(type, content)) {
					for (; cc.length && cc[cc.length - 1].lex;) cc.pop()();
					return cx.marked ? cx.marked : "variable" == type && inScope(state, content) ? "variable-2" : style
				}
			}
		}

		function pass() {
			for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i])
		}

		function cont() {
			return pass.apply(null, arguments), !0
		}

		function register(varname) {
			function inList(list) {
				for (var v = list; v; v = v.next)
					if (v.name == varname) return !0;
				return !1
			}
			var state = cx.state;
			if (cx.marked = "def", state.context) {
				if (inList(state.localVars)) return;
				state.localVars = {
					name: varname,
					next: state.localVars
				}
			} else {
				if (inList(state.globalVars)) return;
				parserConfig.globalVars && (state.globalVars = {
					name: varname,
					next: state.globalVars
				})
			}
		}

		function isModifier(name) {
			return "public" == name || "private" == name || "protected" == name || "abstract" == name || "readonly" == name
		}

		function pushcontext() {
			cx.state.context = {
				prev: cx.state.context,
				vars: cx.state.localVars
			}, cx.state.localVars = defaultVars
		}

		function popcontext() {
			cx.state.localVars = cx.state.context.vars, cx.state.context = cx.state.context.prev
		}

		function pushlex(type, info) {
			var result = function() {
				var state = cx.state,
					indent = state.indented;
				if ("stat" == state.lexical.type) indent = state.lexical.indented;
				else
					for (var outer = state.lexical; outer && ")" == outer.type && outer.align; outer = outer.prev) indent = outer.indented;
				state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info)
			};
			return result.lex = !0, result
		}

		function poplex() {
			var state = cx.state;
			state.lexical.prev && (")" == state.lexical.type && (state.indented = state.lexical.indented), state.lexical = state.lexical.prev)
		}

		function expect(wanted) {
			function exp(type) {
				return type == wanted ? cont() : ";" == wanted ? pass() : cont(exp)
			}
			return exp
		}

		function statement(type, value) {
			return "var" == type ? cont(pushlex("vardef", value.length), vardef, expect(";"), poplex) : "keyword a" == type ? cont(pushlex("form"), parenExpr, statement, poplex) : "keyword b" == type ? cont(pushlex("form"), statement, poplex) : "keyword d" == type ? cx.stream.match(/^\s*$/, !1) ? cont() : cont(pushlex("stat"), maybeexpression, expect(";"), poplex) : "debugger" == type ? cont(expect(";")) : "{" == type ? cont(pushlex("}"), block, poplex) : ";" == type ? cont() : "if" == type ? ("else" == cx.state.lexical.info && cx.state.cc[cx.state.cc.length - 1] == poplex && cx.state.cc.pop()(), cont(pushlex("form"), parenExpr, statement, poplex, maybeelse)) : "function" == type ? cont(functiondef) : "for" == type ? cont(pushlex("form"), forspec, statement, poplex) : "class" == type || isTS && "interface" == value ? (cx.marked = "keyword", cont(pushlex("form"), className, poplex)) : "variable" == type ? isTS && "declare" == value ? (cx.marked = "keyword", cont(statement)) : isTS && ("module" == value || "enum" == value || "type" == value) && cx.stream.match(/^\s*\w/, !1) ? (cx.marked = "keyword", "enum" == value ? cont(enumdef) : "type" == value ? cont(typeexpr, expect("operator"), typeexpr, expect(";")) : cont(pushlex("form"), pattern, expect("{"), pushlex("}"), block, poplex, poplex)) : isTS && "namespace" == value ? (cx.marked = "keyword", cont(pushlex("form"), expression, block, poplex)) : cont(pushlex("stat"), maybelabel) : "switch" == type ? cont(pushlex("form"), parenExpr, expect("{"), pushlex("}", "switch"), block, poplex, poplex) : "case" == type ? cont(expression, expect(":")) : "default" == type ? cont(expect(":")) : "catch" == type ? cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"), statement, poplex, popcontext) : "export" == type ? cont(pushlex("stat"), afterExport, poplex) : "import" == type ? cont(pushlex("stat"), afterImport, poplex) : "async" == type ? cont(statement) : "@" == value ? cont(expression, statement) : pass(pushlex("stat"), expression, expect(";"), poplex)
		}

		function expression(type, value) {
			return expressionInner(type, value, !1)
		}

		function expressionNoComma(type, value) {
			return expressionInner(type, value, !0)
		}

		function parenExpr(type) {
			return "(" != type ? pass() : cont(pushlex(")"), expression, expect(")"), poplex)
		}

		function expressionInner(type, value, noComma) {
			if (cx.state.fatArrowAt == cx.stream.start) {
				var body = noComma ? arrowBodyNoComma : arrowBody;
				if ("(" == type) return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, expect("=>"), body, popcontext);
				if ("variable" == type) return pass(pushcontext, pattern, expect("=>"), body, popcontext)
			}
			var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
			return atomicTypes.hasOwnProperty(type) ? cont(maybeop) : "function" == type ? cont(functiondef, maybeop) : "class" == type || isTS && "interface" == value ? (cx.marked = "keyword", cont(pushlex("form"), classExpression, poplex)) : "keyword c" == type || "async" == type ? cont(noComma ? expressionNoComma : expression) : "(" == type ? cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop) : "operator" == type || "spread" == type ? cont(noComma ? expressionNoComma : expression) : "[" == type ? cont(pushlex("]"), arrayLiteral, poplex, maybeop) : "{" == type ? contCommasep(objprop, "}", null, maybeop) : "quasi" == type ? pass(quasi, maybeop) : "new" == type ? cont(maybeTarget(noComma)) : "import" == type ? cont(expression) : cont()
		}

		function maybeexpression(type) {
			return type.match(/[;\}\)\],]/) ? pass() : pass(expression)
		}

		function maybeoperatorComma(type, value) {
			return "," == type ? cont(expression) : maybeoperatorNoComma(type, value, !1)
		}

		function maybeoperatorNoComma(type, value, noComma) {
			var me = 0 == noComma ? maybeoperatorComma : maybeoperatorNoComma,
				expr = 0 == noComma ? expression : expressionNoComma;
			return "=>" == type ? cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext) : "operator" == type ? /\+\+|--/.test(value) || isTS && "!" == value ? cont(me) : isTS && "<" == value && cx.stream.match(/^([^>]|<.*?>)*>\s*\(/, !1) ? cont(pushlex(">"), commasep(typeexpr, ">"), poplex, me) : "?" == value ? cont(expression, expect(":"), expr) : cont(expr) : "quasi" == type ? pass(quasi, me) : ";" != type ? "(" == type ? contCommasep(expressionNoComma, ")", "call", me) : "." == type ? cont(property, me) : "[" == type ? cont(pushlex("]"), maybeexpression, expect("]"), poplex, me) : isTS && "as" == value ? (cx.marked = "keyword", cont(typeexpr, me)) : "regexp" == type ? (cx.state.lastType = cx.marked = "operator", cx.stream.backUp(cx.stream.pos - cx.stream.start - 1), cont(expr)) : void 0 : void 0
		}

		function quasi(type, value) {
			return "quasi" != type ? pass() : "${" != value.slice(value.length - 2) ? cont(quasi) : cont(expression, continueQuasi)
		}

		function continueQuasi(type) {
			return "}" == type ? (cx.marked = "string-2", cx.state.tokenize = tokenQuasi, cont(quasi)) : void 0
		}

		function arrowBody(type) {
			return findFatArrow(cx.stream, cx.state), pass("{" == type ? statement : expression)
		}

		function arrowBodyNoComma(type) {
			return findFatArrow(cx.stream, cx.state), pass("{" == type ? statement : expressionNoComma)
		}

		function maybeTarget(noComma) {
			return function(type) {
				return "." == type ? cont(noComma ? targetNoComma : target) : "variable" == type && isTS ? cont(maybeTypeArgs, noComma ? maybeoperatorNoComma : maybeoperatorComma) : pass(noComma ? expressionNoComma : expression)
			}
		}

		function target(_, value) {
			return "target" == value ? (cx.marked = "keyword", cont(maybeoperatorComma)) : void 0
		}

		function targetNoComma(_, value) {
			return "target" == value ? (cx.marked = "keyword", cont(maybeoperatorNoComma)) : void 0
		}

		function maybelabel(type) {
			return ":" == type ? cont(poplex, statement) : pass(maybeoperatorComma, expect(";"), poplex)
		}

		function property(type) {
			return "variable" == type ? (cx.marked = "property", cont()) : void 0
		}

		function objprop(type, value) {
			if ("async" == type) return cx.marked = "property", cont(objprop);
			if ("variable" == type || "keyword" == cx.style) {
				if (cx.marked = "property", "get" == value || "set" == value) return cont(getterSetter);
				var m;
				return isTS && cx.state.fatArrowAt == cx.stream.start && (m = cx.stream.match(/^\s*:\s*/, !1)) && (cx.state.fatArrowAt = cx.stream.pos + m[0].length), cont(afterprop)
			}
			return "number" == type || "string" == type ? (cx.marked = jsonldMode ? "property" : cx.style + " property", cont(afterprop)) : "jsonld-keyword" == type ? cont(afterprop) : isTS && isModifier(value) ? (cx.marked = "keyword", cont(objprop)) : "[" == type ? cont(expression, maybetype, expect("]"), afterprop) : "spread" == type ? cont(expressionNoComma, afterprop) : "*" == value ? (cx.marked = "keyword", cont(objprop)) : ":" == type ? pass(afterprop) : void 0
		}

		function getterSetter(type) {
			return "variable" != type ? pass(afterprop) : (cx.marked = "property", cont(functiondef))
		}

		function afterprop(type) {
			return ":" == type ? cont(expressionNoComma) : "(" == type ? pass(functiondef) : void 0
		}

		function commasep(what, end, sep) {
			function proceed(type, value) {
				if (sep ? sep.indexOf(type) > -1 : "," == type) {
					var lex = cx.state.lexical;
					return "call" == lex.info && (lex.pos = (lex.pos || 0) + 1), cont(function(type, value) {
						return type == end || value == end ? pass() : pass(what)
					}, proceed)
				}
				return type == end || value == end ? cont() : cont(expect(end))
			}
			return function(type, value) {
				return type == end || value == end ? cont() : pass(what, proceed)
			}
		}

		function contCommasep(what, end, info) {
			for (var i = 3; i < arguments.length; i++) cx.cc.push(arguments[i]);
			return cont(pushlex(end, info), commasep(what, end), poplex)
		}

		function block(type) {
			return "}" == type ? cont() : pass(statement, block)
		}

		function maybetype(type, value) {
			if (isTS) {
				if (":" == type) return cont(typeexpr);
				if ("?" == value) return cont(maybetype)
			}
		}

		function mayberettype(type) {
			return isTS && ":" == type ? cx.stream.match(/^\s*\w+\s+is\b/, !1) ? cont(expression, isKW, typeexpr) : cont(typeexpr) : void 0
		}

		function isKW(_, value) {
			return "is" == value ? (cx.marked = "keyword", cont()) : void 0
		}

		function typeexpr(type, value) {
			return "variable" == type || "void" == value ? "keyof" == value ? (cx.marked = "keyword", cont(typeexpr)) : (cx.marked = "type", cont(afterType)) : "string" == type || "number" == type || "atom" == type ? cont(afterType) : "[" == type ? cont(pushlex("]"), commasep(typeexpr, "]", ","), poplex, afterType) : "{" == type ? cont(pushlex("}"), commasep(typeprop, "}", ",;"), poplex, afterType) : "(" == type ? cont(commasep(typearg, ")"), maybeReturnType) : void 0
		}

		function maybeReturnType(type) {
			return "=>" == type ? cont(typeexpr) : void 0
		}

		function typeprop(type, value) {
			return "variable" == type || "keyword" == cx.style ? (cx.marked = "property", cont(typeprop)) : "?" == value ? cont(typeprop) : ":" == type ? cont(typeexpr) : "[" == type ? cont(expression, maybetype, expect("]"), typeprop) : void 0
		}

		function typearg(type) {
			return "variable" == type ? cont(typearg) : ":" == type ? cont(typeexpr) : void 0
		}

		function afterType(type, value) {
			return "<" == value ? cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType) : "|" == value || "." == type || "&" == value ? cont(typeexpr) : "[" == type ? cont(expect("]"), afterType) : "extends" == value || "implements" == value ? (cx.marked = "keyword", cont(typeexpr)) : void 0
		}

		function maybeTypeArgs(_, value) {
			return "<" == value ? cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType) : void 0
		}

		function typeparam() {
			return pass(typeexpr, maybeTypeDefault)
		}

		function maybeTypeDefault(_, value) {
			return "=" == value ? cont(typeexpr) : void 0
		}

		function vardef(_, value) {
			return "enum" == value ? (cx.marked = "keyword", cont(enumdef)) : pass(pattern, maybetype, maybeAssign, vardefCont)
		}

		function pattern(type, value) {
			return isTS && isModifier(value) ? (cx.marked = "keyword", cont(pattern)) : "variable" == type ? (register(value), cont()) : "spread" == type ? cont(pattern) : "[" == type ? contCommasep(pattern, "]") : "{" == type ? contCommasep(proppattern, "}") : void 0
		}

		function proppattern(type, value) {
			return "variable" != type || cx.stream.match(/^\s*:/, !1) ? ("variable" == type && (cx.marked = "property"), "spread" == type ? cont(pattern) : "}" == type ? pass() : cont(expect(":"), pattern, maybeAssign)) : (register(value), cont(maybeAssign))
		}

		function maybeAssign(_type, value) {
			return "=" == value ? cont(expressionNoComma) : void 0
		}

		function vardefCont(type) {
			return "," == type ? cont(vardef) : void 0
		}

		function maybeelse(type, value) {
			return "keyword b" == type && "else" == value ? cont(pushlex("form", "else"), statement, poplex) : void 0
		}

		function forspec(type, value) {
			return "await" == value ? cont(forspec) : "(" == type ? cont(pushlex(")"), forspec1, expect(")"), poplex) : void 0
		}

		function forspec1(type) {
			return "var" == type ? cont(vardef, expect(";"), forspec2) : ";" == type ? cont(forspec2) : "variable" == type ? cont(formaybeinof) : pass(expression, expect(";"), forspec2)
		}

		function formaybeinof(_type, value) {
			return "in" == value || "of" == value ? (cx.marked = "keyword", cont(expression)) : cont(maybeoperatorComma, forspec2)
		}

		function forspec2(type, value) {
			return ";" == type ? cont(forspec3) : "in" == value || "of" == value ? (cx.marked = "keyword", cont(expression)) : pass(expression, expect(";"), forspec3)
		}

		function forspec3(type) {
			")" != type && cont(expression)
		}

		function functiondef(type, value) {
			return "*" == value ? (cx.marked = "keyword", cont(functiondef)) : "variable" == type ? (register(value), cont(functiondef)) : "(" == type ? cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, statement, popcontext) : isTS && "<" == value ? cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondef) : void 0
		}

		function funarg(type, value) {
			return "@" == value && cont(expression, funarg), "spread" == type ? cont(funarg) : isTS && isModifier(value) ? (cx.marked = "keyword", cont(funarg)) : pass(pattern, maybetype, maybeAssign)
		}

		function classExpression(type, value) {
			return "variable" == type ? className(type, value) : classNameAfter(type, value)
		}

		function className(type, value) {
			return "variable" == type ? (register(value), cont(classNameAfter)) : void 0
		}

		function classNameAfter(type, value) {
			return "<" == value ? cont(pushlex(">"), commasep(typeparam, ">"), poplex, classNameAfter) : "extends" == value || "implements" == value || isTS && "," == type ? ("implements" == value && (cx.marked = "keyword"), cont(isTS ? typeexpr : expression, classNameAfter)) : "{" == type ? cont(pushlex("}"), classBody, poplex) : void 0
		}

		function classBody(type, value) {
			return "async" == type || "variable" == type && ("static" == value || "get" == value || "set" == value || isTS && isModifier(value)) && cx.stream.match(/^\s+[\w$\xa1-\uffff]/, !1) ? (cx.marked = "keyword", cont(classBody)) : "variable" == type || "keyword" == cx.style ? (cx.marked = "property", cont(isTS ? classfield : functiondef, classBody)) : "[" == type ? cont(expression, maybetype, expect("]"), isTS ? classfield : functiondef, classBody) : "*" == value ? (cx.marked = "keyword", cont(classBody)) : ";" == type ? cont(classBody) : "}" == type ? cont() : "@" == value ? cont(expression, classBody) : void 0
		}

		function classfield(type, value) {
			return "?" == value ? cont(classfield) : ":" == type ? cont(typeexpr, maybeAssign) : "=" == value ? cont(expressionNoComma) : pass(functiondef)
		}

		function afterExport(type, value) {
			return "*" == value ? (cx.marked = "keyword", cont(maybeFrom, expect(";"))) : "default" == value ? (cx.marked = "keyword", cont(expression, expect(";"))) : "{" == type ? cont(commasep(exportField, "}"), maybeFrom, expect(";")) : pass(statement)
		}

		function exportField(type, value) {
			return "as" == value ? (cx.marked = "keyword", cont(expect("variable"))) : "variable" == type ? pass(expressionNoComma, exportField) : void 0
		}

		function afterImport(type) {
			return "string" == type ? cont() : "(" == type ? pass(expression) : pass(importSpec, maybeMoreImports, maybeFrom)
		}

		function importSpec(type, value) {
			return "{" == type ? contCommasep(importSpec, "}") : ("variable" == type && register(value), "*" == value && (cx.marked = "keyword"), cont(maybeAs))
		}

		function maybeMoreImports(type) {
			return "," == type ? cont(importSpec, maybeMoreImports) : void 0
		}

		function maybeAs(_type, value) {
			return "as" == value ? (cx.marked = "keyword", cont(importSpec)) : void 0
		}

		function maybeFrom(_type, value) {
			return "from" == value ? (cx.marked = "keyword", cont(expression)) : void 0
		}

		function arrayLiteral(type) {
			return "]" == type ? cont() : pass(commasep(expressionNoComma, "]"))
		}

		function enumdef() {
			return pass(pushlex("form"), pattern, expect("{"), pushlex("}"), commasep(enummember, "}"), poplex, poplex)
		}

		function enummember() {
			return pass(pattern, maybeAssign)
		}

		function isContinuedStatement(state, textAfter) {
			return "operator" == state.lastType || "," == state.lastType || isOperatorChar.test(textAfter.charAt(0)) || /[,.]/.test(textAfter.charAt(0))
		}

		function expressionAllowed(stream, state, backUp) {
			return state.tokenize == tokenBase && /^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[\[{}\(,;:]|=>)$/.test(state.lastType) || "quasi" == state.lastType && /\{\s*$/.test(stream.string.slice(0, stream.pos - (backUp || 0)))
		}
		var type, content, indentUnit = config.indentUnit,
			statementIndent = parserConfig.statementIndent,
			jsonldMode = parserConfig.jsonld,
			jsonMode = parserConfig.json || jsonldMode,
			isTS = parserConfig.typescript,
			wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/,
			keywords = function() {
				function kw(type) {
					return {
						type: type,
						style: "keyword"
					}
				}
				var A = kw("keyword a"),
					B = kw("keyword b"),
					C = kw("keyword c"),
					D = kw("keyword d"),
					operator = kw("operator"),
					atom = {
						type: "atom",
						style: "atom"
					};
				return {
					"if": kw("if"),
					"while": A,
					"with": A,
					"else": B,
					"do": B,
					"try": B,
					"finally": B,
					"return": D,
					"break": D,
					"continue": D,
					"new": kw("new"),
					"delete": C,
					"void": C,
					"throw": C,
					"debugger": kw("debugger"),
					"var": kw("var"),
					"const": kw("var"),
					let: kw("var"),
					"function": kw("function"),
					"catch": kw("catch"),
					"for": kw("for"),
					"switch": kw("switch"),
					"case": kw("case"),
					"default": kw("default"),
					"in": operator,
					"typeof": operator,
					"instanceof": operator,
					"true": atom,
					"false": atom,
					"null": atom,
					undefined: atom,
					NaN: atom,
					Infinity: atom,
					"this": kw("this"),
					"class": kw("class"),
					"super": kw("atom"),
					"yield": C,
					"export": kw("export"),
					"import": kw("import"),
					"extends": C,
					await: C
				}
			}(),
			isOperatorChar = /[+\-*&%=<>!?|~^@]/,
			isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/,
			brackets = "([{}])",
			atomicTypes = {
				atom: !0,
				number: !0,
				variable: !0,
				string: !0,
				regexp: !0,
				"this": !0,
				"jsonld-keyword": !0
			},
			cx = {
				state: null,
				column: null,
				marked: null,
				cc: null
			},
			defaultVars = {
				name: "this",
				next: {
					name: "arguments"
				}
			};
		return poplex.lex = !0, {
			startState: function(basecolumn) {
				var state = {
					tokenize: tokenBase,
					lastType: "sof",
					cc: [],
					lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", !1),
					localVars: parserConfig.localVars,
					context: parserConfig.localVars && {
						vars: parserConfig.localVars
					},
					indented: basecolumn || 0
				};
				return parserConfig.globalVars && "object" == typeof parserConfig.globalVars && (state.globalVars = parserConfig.globalVars), state
			},
			token: function(stream, state) {
				if (stream.sol() && (state.lexical.hasOwnProperty("align") || (state.lexical.align = !1), state.indented = stream.indentation(), findFatArrow(stream, state)), state.tokenize != tokenComment && stream.eatSpace()) return null;
				var style = state.tokenize(stream, state);
				return "comment" == type ? style : (state.lastType = "operator" != type || "++" != content && "--" != content ? type : "incdec", parseJS(state, style, type, content, stream))
			},
			indent: function(state, textAfter) {
				if (state.tokenize == tokenComment) return CodeMirror.Pass;
				if (state.tokenize != tokenBase) return 0;
				var top, firstChar = textAfter && textAfter.charAt(0),
					lexical = state.lexical;
				if (!/^\s*else\b/.test(textAfter))
					for (var i = state.cc.length - 1; i >= 0; --i) {
						var c = state.cc[i];
						if (c == poplex) lexical = lexical.prev;
						else if (c != maybeelse) break
					}
				for (; !("stat" != lexical.type && "form" != lexical.type || "}" != firstChar && (!(top = state.cc[state.cc.length - 1]) || top != maybeoperatorComma && top != maybeoperatorNoComma || /^[,\.=+\-*:?[\(]/.test(textAfter)));) lexical = lexical.prev;
				statementIndent && ")" == lexical.type && "stat" == lexical.prev.type && (lexical = lexical.prev);
				var type = lexical.type,
					closing = firstChar == type;
				return "vardef" == type ? lexical.indented + ("operator" == state.lastType || "," == state.lastType ? lexical.info + 1 : 0) : "form" == type && "{" == firstChar ? lexical.indented : "form" == type ? lexical.indented + indentUnit : "stat" == type ? lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0) : "switch" != lexical.info || closing || 0 == parserConfig.doubleIndentSwitch ? lexical.align ? lexical.column + (closing ? 0 : 1) : lexical.indented + (closing ? 0 : indentUnit) : lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit)
			},
			electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
			blockCommentStart: jsonMode ? null : "/*",
			blockCommentEnd: jsonMode ? null : "*/",
			blockCommentContinue: jsonMode ? null : " * ",
			lineComment: jsonMode ? null : "//",
			fold: "brace",
			closeBrackets: "()[]{}''\"\"``",
			helperType: jsonMode ? "json" : "javascript",
			jsonldMode: jsonldMode,
			jsonMode: jsonMode,
			expressionAllowed: expressionAllowed,
			skipExpression: function(state) {
				var top = state.cc[state.cc.length - 1];
				(top == expression || top == expressionNoComma) && state.cc.pop()
			}
		}
	}), CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/), CodeMirror.defineMIME("text/javascript", "javascript"), CodeMirror.defineMIME("text/ecmascript", "javascript"), CodeMirror.defineMIME("application/javascript", "javascript"), CodeMirror.defineMIME("application/x-javascript", "javascript"), CodeMirror.defineMIME("application/ecmascript", "javascript"), CodeMirror.defineMIME("application/json", {
		name: "javascript",
		json: !0
	}), CodeMirror.defineMIME("application/x-json", {
		name: "javascript",
		json: !0
	}), CodeMirror.defineMIME("application/ld+json", {
		name: "javascript",
		jsonld: !0
	}), CodeMirror.defineMIME("text/typescript", {
		name: "javascript",
		typescript: !0
	}), CodeMirror.defineMIME("application/typescript", {
		name: "javascript",
		typescript: !0
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function keySet(array) {
		for (var keys = {}, i = 0; i < array.length; ++i) keys[array[i].toLowerCase()] = !0;
		return keys
	}

	function tokenCComment(stream, state) {
		for (var ch, maybeEnd = !1; null != (ch = stream.next());) {
			if (maybeEnd && "/" == ch) {
				state.tokenize = null;
				break
			}
			maybeEnd = "*" == ch
		}
		return ["comment", "comment"]
	}
	CodeMirror.defineMode("css", function(config, parserConfig) {
		function ret(style, tp) {
			return type = tp, style
		}

		function tokenBase(stream, state) {
			var ch = stream.next();
			if (tokenHooks[ch]) {
				var result = tokenHooks[ch](stream, state);
				if (result !== !1) return result
			}
			return "@" == ch ? (stream.eatWhile(/[\w\\\-]/), ret("def", stream.current())) : "=" == ch || ("~" == ch || "|" == ch) && stream.eat("=") ? ret(null, "compare") : '"' == ch || "'" == ch ? (state.tokenize = tokenString(ch), state.tokenize(stream, state)) : "#" == ch ? (stream.eatWhile(/[\w\\\-]/), ret("atom", "hash")) : "!" == ch ? (stream.match(/^\s*\w*/), ret("keyword", "important")) : /\d/.test(ch) || "." == ch && stream.eat(/\d/) ? (stream.eatWhile(/[\w.%]/), ret("number", "unit")) : "-" !== ch ? /[,+>*\/]/.test(ch) ? ret(null, "select-op") : "." == ch && stream.match(/^-?[_a-z][_a-z0-9-]*/i) ? ret("qualifier", "qualifier") : /[:;{}\[\]\(\)]/.test(ch) ? ret(null, ch) : ("u" == ch || "U" == ch) && stream.match(/rl(-prefix)?\(/i) || ("d" == ch || "D" == ch) && stream.match("omain(", !0, !0) || ("r" == ch || "R" == ch) && stream.match("egexp(", !0, !0) ? (stream.backUp(1), state.tokenize = tokenParenthesized, ret("property", "word")) : /[\w\\\-]/.test(ch) ? (stream.eatWhile(/[\w\\\-]/), ret("property", "word")) : ret(null, null) : /[\d.]/.test(stream.peek()) ? (stream.eatWhile(/[\w.%]/), ret("number", "unit")) : stream.match(/^-[\w\\\-]+/) ? (stream.eatWhile(/[\w\\\-]/), stream.match(/^\s*:/, !1) ? ret("variable-2", "variable-definition") : ret("variable-2", "variable")) : stream.match(/^\w+-/) ? ret("meta", "meta") : void 0
		}

		function tokenString(quote) {
			return function(stream, state) {
				for (var ch, escaped = !1; null != (ch = stream.next());) {
					if (ch == quote && !escaped) {
						")" == quote && stream.backUp(1);
						break
					}
					escaped = !escaped && "\\" == ch
				}
				return (ch == quote || !escaped && ")" != quote) && (state.tokenize = null), ret("string", "string")
			}
		}

		function tokenParenthesized(stream, state) {
			return stream.next(), state.tokenize = stream.match(/\s*[\"\')]/, !1) ? null : tokenString(")"), ret(null, "(")
		}

		function Context(type, indent, prev) {
			this.type = type, this.indent = indent, this.prev = prev
		}

		function pushContext(state, stream, type, indent) {
			return state.context = new Context(type, stream.indentation() + (indent === !1 ? 0 : indentUnit), state.context), type
		}

		function popContext(state) {
			return state.context.prev && (state.context = state.context.prev), state.context.type
		}

		function pass(type, stream, state) {
			return states[state.context.type](type, stream, state)
		}

		function popAndPass(type, stream, state, n) {
			for (var i = n || 1; i > 0; i--) state.context = state.context.prev;
			return pass(type, stream, state)
		}

		function wordAsValue(stream) {
			var word = stream.current().toLowerCase();
			override = valueKeywords.hasOwnProperty(word) ? "atom" : colorKeywords.hasOwnProperty(word) ? "keyword" : "variable"
		}
		var inline = parserConfig.inline;
		parserConfig.propertyKeywords || (parserConfig = CodeMirror.resolveMode("text/css"));
		var type, override, indentUnit = config.indentUnit,
			tokenHooks = parserConfig.tokenHooks,
			documentTypes = parserConfig.documentTypes || {},
			mediaTypes = parserConfig.mediaTypes || {},
			mediaFeatures = parserConfig.mediaFeatures || {},
			mediaValueKeywords = parserConfig.mediaValueKeywords || {},
			propertyKeywords = parserConfig.propertyKeywords || {},
			nonStandardPropertyKeywords = parserConfig.nonStandardPropertyKeywords || {},
			fontProperties = parserConfig.fontProperties || {},
			counterDescriptors = parserConfig.counterDescriptors || {},
			colorKeywords = parserConfig.colorKeywords || {},
			valueKeywords = parserConfig.valueKeywords || {},
			allowNested = parserConfig.allowNested,
			lineComment = parserConfig.lineComment,
			supportsAtComponent = parserConfig.supportsAtComponent === !0,
			states = {};
		return states.top = function(type, stream, state) {
			if ("{" == type) return pushContext(state, stream, "block");
			if ("}" == type && state.context.prev) return popContext(state);
			if (supportsAtComponent && /@component/i.test(type)) return pushContext(state, stream, "atComponentBlock");
			if (/^@(-moz-)?document$/i.test(type)) return pushContext(state, stream, "documentTypes");
			if (/^@(media|supports|(-moz-)?document|import)$/i.test(type)) return pushContext(state, stream, "atBlock");
			if (/^@(font-face|counter-style)/i.test(type)) return state.stateArg = type, "restricted_atBlock_before";
			if (/^@(-(moz|ms|o|webkit)-)?keyframes$/i.test(type)) return "keyframes";
			if (type && "@" == type.charAt(0)) return pushContext(state, stream, "at");
			if ("hash" == type) override = "builtin";
			else if ("word" == type) override = "tag";
			else {
				if ("variable-definition" == type) return "maybeprop";
				if ("interpolation" == type) return pushContext(state, stream, "interpolation");
				if (":" == type) return "pseudo";
				if (allowNested && "(" == type) return pushContext(state, stream, "parens")
			}
			return state.context.type
		}, states.block = function(type, stream, state) {
			if ("word" == type) {
				var word = stream.current().toLowerCase();
				return propertyKeywords.hasOwnProperty(word) ? (override = "property", "maybeprop") : nonStandardPropertyKeywords.hasOwnProperty(word) ? (override = "string-2", "maybeprop") : allowNested ? (override = stream.match(/^\s*:(?:\s|$)/, !1) ? "property" : "tag", "block") : (override += " error", "maybeprop")
			}
			return "meta" == type ? "block" : allowNested || "hash" != type && "qualifier" != type ? states.top(type, stream, state) : (override = "error", "block")
		}, states.maybeprop = function(type, stream, state) {
			return ":" == type ? pushContext(state, stream, "prop") : pass(type, stream, state)
		}, states.prop = function(type, stream, state) {
			if (";" == type) return popContext(state);
			if ("{" == type && allowNested) return pushContext(state, stream, "propBlock");
			if ("}" == type || "{" == type) return popAndPass(type, stream, state);
			if ("(" == type) return pushContext(state, stream, "parens");
			if ("hash" != type || /^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(stream.current())) {
				if ("word" == type) wordAsValue(stream);
				else if ("interpolation" == type) return pushContext(state, stream, "interpolation")
			} else override += " error";
			return "prop"
		}, states.propBlock = function(type, _stream, state) {
			return "}" == type ? popContext(state) : "word" == type ? (override = "property", "maybeprop") : state.context.type
		}, states.parens = function(type, stream, state) {
			return "{" == type || "}" == type ? popAndPass(type, stream, state) : ")" == type ? popContext(state) : "(" == type ? pushContext(state, stream, "parens") : "interpolation" == type ? pushContext(state, stream, "interpolation") : ("word" == type && wordAsValue(stream), "parens")
		}, states.pseudo = function(type, stream, state) {
			return "meta" == type ? "pseudo" : "word" == type ? (override = "variable-3", state.context.type) : pass(type, stream, state)
		}, states.documentTypes = function(type, stream, state) {
			return "word" == type && documentTypes.hasOwnProperty(stream.current()) ? (override = "tag", state.context.type) : states.atBlock(type, stream, state)
		}, states.atBlock = function(type, stream, state) {
			if ("(" == type) return pushContext(state, stream, "atBlock_parens");
			if ("}" == type || ";" == type) return popAndPass(type, stream, state);
			if ("{" == type) return popContext(state) && pushContext(state, stream, allowNested ? "block" : "top");
			if ("interpolation" == type) return pushContext(state, stream, "interpolation");
			if ("word" == type) {
				var word = stream.current().toLowerCase();
				override = "only" == word || "not" == word || "and" == word || "or" == word ? "keyword" : mediaTypes.hasOwnProperty(word) ? "attribute" : mediaFeatures.hasOwnProperty(word) ? "property" : mediaValueKeywords.hasOwnProperty(word) ? "keyword" : propertyKeywords.hasOwnProperty(word) ? "property" : nonStandardPropertyKeywords.hasOwnProperty(word) ? "string-2" : valueKeywords.hasOwnProperty(word) ? "atom" : colorKeywords.hasOwnProperty(word) ? "keyword" : "error"
			}
			return state.context.type
		}, states.atComponentBlock = function(type, stream, state) {
			return "}" == type ? popAndPass(type, stream, state) : "{" == type ? popContext(state) && pushContext(state, stream, allowNested ? "block" : "top", !1) : ("word" == type && (override = "error"), state.context.type)
		}, states.atBlock_parens = function(type, stream, state) {
			return ")" == type ? popContext(state) : "{" == type || "}" == type ? popAndPass(type, stream, state, 2) : states.atBlock(type, stream, state)
		}, states.restricted_atBlock_before = function(type, stream, state) {
			return "{" == type ? pushContext(state, stream, "restricted_atBlock") : "word" == type && "@counter-style" == state.stateArg ? (override = "variable", "restricted_atBlock_before") : pass(type, stream, state)
		}, states.restricted_atBlock = function(type, stream, state) {
			return "}" == type ? (state.stateArg = null, popContext(state)) : "word" == type ? (override = "@font-face" == state.stateArg && !fontProperties.hasOwnProperty(stream.current().toLowerCase()) || "@counter-style" == state.stateArg && !counterDescriptors.hasOwnProperty(stream.current().toLowerCase()) ? "error" : "property", "maybeprop") : "restricted_atBlock"
		}, states.keyframes = function(type, stream, state) {
			return "word" == type ? (override = "variable", "keyframes") : "{" == type ? pushContext(state, stream, "top") : pass(type, stream, state)
		}, states.at = function(type, stream, state) {
			return ";" == type ? popContext(state) : "{" == type || "}" == type ? popAndPass(type, stream, state) : ("word" == type ? override = "tag" : "hash" == type && (override = "builtin"), "at")
		}, states.interpolation = function(type, stream, state) {
			return "}" == type ? popContext(state) : "{" == type || ";" == type ? popAndPass(type, stream, state) : ("word" == type ? override = "variable" : "variable" != type && "(" != type && ")" != type && (override = "error"), "interpolation")
		}, {
			startState: function(base) {
				return {
					tokenize: null,
					state: inline ? "block" : "top",
					stateArg: null,
					context: new Context(inline ? "block" : "top", base || 0, null)
				}
			},
			token: function(stream, state) {
				if (!state.tokenize && stream.eatSpace()) return null;
				var style = (state.tokenize || tokenBase)(stream, state);
				return style && "object" == typeof style && (type = style[1], style = style[0]), override = style, "comment" != type && (state.state = states[state.state](type, stream, state)), override
			},
			indent: function(state, textAfter) {
				var cx = state.context,
					ch = textAfter && textAfter.charAt(0),
					indent = cx.indent;
				return "prop" != cx.type || "}" != ch && ")" != ch || (cx = cx.prev), cx.prev && ("}" != ch || "block" != cx.type && "top" != cx.type && "interpolation" != cx.type && "restricted_atBlock" != cx.type ? (")" == ch && ("parens" == cx.type || "atBlock_parens" == cx.type) || "{" == ch && ("at" == cx.type || "atBlock" == cx.type)) && (indent = Math.max(0, cx.indent - indentUnit)) : (cx = cx.prev, indent = cx.indent)), indent
			},
			electricChars: "}",
			blockCommentStart: "/*",
			blockCommentEnd: "*/",
			blockCommentContinue: " * ",
			lineComment: lineComment,
			fold: "brace"
		}
	});
	var documentTypes_ = ["domain", "regexp", "url", "url-prefix"],
		documentTypes = keySet(documentTypes_),
		mediaTypes_ = ["all", "aural", "braille", "handheld", "print", "projection", "screen", "tty", "tv", "embossed"],
		mediaTypes = keySet(mediaTypes_),
		mediaFeatures_ = ["width", "min-width", "max-width", "height", "min-height", "max-height", "device-width", "min-device-width", "max-device-width", "device-height", "min-device-height", "max-device-height", "aspect-ratio", "min-aspect-ratio", "max-aspect-ratio", "device-aspect-ratio", "min-device-aspect-ratio", "max-device-aspect-ratio", "color", "min-color", "max-color", "color-index", "min-color-index", "max-color-index", "monochrome", "min-monochrome", "max-monochrome", "resolution", "min-resolution", "max-resolution", "scan", "grid", "orientation", "device-pixel-ratio", "min-device-pixel-ratio", "max-device-pixel-ratio", "pointer", "any-pointer", "hover", "any-hover"],
		mediaFeatures = keySet(mediaFeatures_),
		mediaValueKeywords_ = ["landscape", "portrait", "none", "coarse", "fine", "on-demand", "hover", "interlace", "progressive"],
		mediaValueKeywords = keySet(mediaValueKeywords_),
		propertyKeywords_ = ["align-content", "align-items", "align-self", "alignment-adjust", "alignment-baseline", "anchor-point", "animation", "animation-delay", "animation-direction", "animation-duration", "animation-fill-mode", "animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function", "appearance", "azimuth", "backface-visibility", "background", "background-attachment", "background-blend-mode", "background-clip", "background-color", "background-image", "background-origin", "background-position", "background-repeat", "background-size", "baseline-shift", "binding", "bleed", "bookmark-label", "bookmark-level", "bookmark-state", "bookmark-target", "border", "border-bottom", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", "border-collapse", "border-color", "border-image", "border-image-outset", "border-image-repeat", "border-image-slice", "border-image-source", "border-image-width", "border-left", "border-left-color", "border-left-style", "border-left-width", "border-radius", "border-right", "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-style", "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width", "border-width", "bottom", "box-decoration-break", "box-shadow", "box-sizing", "break-after", "break-before", "break-inside", "caption-side", "caret-color", "clear", "clip", "color", "color-profile", "column-count", "column-fill", "column-gap", "column-rule", "column-rule-color", "column-rule-style", "column-rule-width", "column-span", "column-width", "columns", "content", "counter-increment", "counter-reset", "crop", "cue", "cue-after", "cue-before", "cursor", "direction", "display", "dominant-baseline", "drop-initial-after-adjust", "drop-initial-after-align", "drop-initial-before-adjust", "drop-initial-before-align", "drop-initial-size", "drop-initial-value", "elevation", "empty-cells", "fit", "fit-position", "flex", "flex-basis", "flex-direction", "flex-flow", "flex-grow", "flex-shrink", "flex-wrap", "float", "float-offset", "flow-from", "flow-into", "font", "font-feature-settings", "font-family", "font-kerning", "font-language-override", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-synthesis", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric", "font-variant-position", "font-weight", "grid", "grid-area", "grid-auto-columns", "grid-auto-flow", "grid-auto-rows", "grid-column", "grid-column-end", "grid-column-gap", "grid-column-start", "grid-gap", "grid-row", "grid-row-end", "grid-row-gap", "grid-row-start", "grid-template", "grid-template-areas", "grid-template-columns", "grid-template-rows", "hanging-punctuation", "height", "hyphens", "icon", "image-orientation", "image-rendering", "image-resolution", "inline-box-align", "justify-content", "justify-items", "justify-self", "left", "letter-spacing", "line-break", "line-height", "line-stacking", "line-stacking-ruby", "line-stacking-shift", "line-stacking-strategy", "list-style", "list-style-image", "list-style-position", "list-style-type", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "marks", "marquee-direction", "marquee-loop", "marquee-play-count", "marquee-speed", "marquee-style", "max-height", "max-width", "min-height", "min-width", "move-to", "nav-down", "nav-index", "nav-left", "nav-right", "nav-up", "object-fit", "object-position", "opacity", "order", "orphans", "outline", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow", "overflow-style", "overflow-wrap", "overflow-x", "overflow-y", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "page", "page-break-after", "page-break-before", "page-break-inside", "page-policy", "pause", "pause-after", "pause-before", "perspective", "perspective-origin", "pitch", "pitch-range", "place-content", "place-items", "place-self", "play-during", "position", "presentation-level", "punctuation-trim", "quotes", "region-break-after", "region-break-before", "region-break-inside", "region-fragment", "rendering-intent", "resize", "rest", "rest-after", "rest-before", "richness", "right", "rotation", "rotation-point", "ruby-align", "ruby-overhang", "ruby-position", "ruby-span", "shape-image-threshold", "shape-inside", "shape-margin", "shape-outside", "size", "speak", "speak-as", "speak-header", "speak-numeral", "speak-punctuation", "speech-rate", "stress", "string-set", "tab-size", "table-layout", "target", "target-name", "target-new", "target-position", "text-align", "text-align-last", "text-decoration", "text-decoration-color", "text-decoration-line", "text-decoration-skip", "text-decoration-style", "text-emphasis", "text-emphasis-color", "text-emphasis-position", "text-emphasis-style", "text-height", "text-indent", "text-justify", "text-outline", "text-overflow", "text-shadow", "text-size-adjust", "text-space-collapse", "text-transform", "text-underline-position", "text-wrap", "top", "transform", "transform-origin", "transform-style", "transition", "transition-delay", "transition-duration", "transition-property", "transition-timing-function", "unicode-bidi", "user-select", "vertical-align", "visibility", "voice-balance", "voice-duration", "voice-family", "voice-pitch", "voice-range", "voice-rate", "voice-stress", "voice-volume", "volume", "white-space", "widows", "width", "will-change", "word-break", "word-spacing", "word-wrap", "z-index", "clip-path", "clip-rule", "mask", "enable-background", "filter", "flood-color", "flood-opacity", "lighting-color", "stop-color", "stop-opacity", "pointer-events", "color-interpolation", "color-interpolation-filters", "color-rendering", "fill", "fill-opacity", "fill-rule", "image-rendering", "marker", "marker-end", "marker-mid", "marker-start", "shape-rendering", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "text-rendering", "baseline-shift", "dominant-baseline", "glyph-orientation-horizontal", "glyph-orientation-vertical", "text-anchor", "writing-mode"],
		propertyKeywords = keySet(propertyKeywords_),
		nonStandardPropertyKeywords_ = ["scrollbar-arrow-color", "scrollbar-base-color", "scrollbar-dark-shadow-color", "scrollbar-face-color", "scrollbar-highlight-color", "scrollbar-shadow-color", "scrollbar-3d-light-color", "scrollbar-track-color", "shape-inside", "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button", "searchfield-results-decoration", "zoom"],
		nonStandardPropertyKeywords = keySet(nonStandardPropertyKeywords_),
		fontProperties_ = ["font-family", "src", "unicode-range", "font-variant", "font-feature-settings", "font-stretch", "font-weight", "font-style"],
		fontProperties = keySet(fontProperties_),
		counterDescriptors_ = ["additive-symbols", "fallback", "negative", "pad", "prefix", "range", "speak-as", "suffix", "symbols", "system"],
		counterDescriptors = keySet(counterDescriptors_),
		colorKeywords_ = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"],
		colorKeywords = keySet(colorKeywords_),
		valueKeywords_ = ["above", "absolute", "activeborder", "additive", "activecaption", "afar", "after-white-space", "ahead", "alias", "all", "all-scroll", "alphabetic", "alternate", "always", "amharic", "amharic-abegede", "antialiased", "appworkspace", "arabic-indic", "armenian", "asterisks", "attr", "auto", "auto-flow", "avoid", "avoid-column", "avoid-page", "avoid-region", "background", "backwards", "baseline", "below", "bidi-override", "binary", "bengali", "blink", "block", "block-axis", "bold", "bolder", "border", "border-box", "both", "bottom", "break", "break-all", "break-word", "bullets", "button", "button-bevel", "buttonface", "buttonhighlight", "buttonshadow", "buttontext", "calc", "cambodian", "capitalize", "caps-lock-indicator", "caption", "captiontext", "caret", "cell", "center", "checkbox", "circle", "cjk-decimal", "cjk-earthly-branch", "cjk-heavenly-stem", "cjk-ideographic", "clear", "clip", "close-quote", "col-resize", "collapse", "color", "color-burn", "color-dodge", "column", "column-reverse", "compact", "condensed", "contain", "content", "contents", "content-box", "context-menu", "continuous", "copy", "counter", "counters", "cover", "crop", "cross", "crosshair", "currentcolor", "cursive", "cyclic", "darken", "dashed", "decimal", "decimal-leading-zero", "default", "default-button", "dense", "destination-atop", "destination-in", "destination-out", "destination-over", "devanagari", "difference", "disc", "discard", "disclosure-closed", "disclosure-open", "document", "dot-dash", "dot-dot-dash", "dotted", "double", "down", "e-resize", "ease", "ease-in", "ease-in-out", "ease-out", "element", "ellipse", "ellipsis", "embed", "end", "ethiopic", "ethiopic-abegede", "ethiopic-abegede-am-et", "ethiopic-abegede-gez", "ethiopic-abegede-ti-er", "ethiopic-abegede-ti-et", "ethiopic-halehame-aa-er", "ethiopic-halehame-aa-et", "ethiopic-halehame-am-et", "ethiopic-halehame-gez", "ethiopic-halehame-om-et", "ethiopic-halehame-sid-et", "ethiopic-halehame-so-et", "ethiopic-halehame-ti-er", "ethiopic-halehame-ti-et", "ethiopic-halehame-tig", "ethiopic-numeric", "ew-resize", "exclusion", "expanded", "extends", "extra-condensed", "extra-expanded", "fantasy", "fast", "fill", "fixed", "flat", "flex", "flex-end", "flex-start", "footnotes", "forwards", "from", "geometricPrecision", "georgian", "graytext", "grid", "groove", "gujarati", "gurmukhi", "hand", "hangul", "hangul-consonant", "hard-light", "hebrew", "help", "hidden", "hide", "higher", "highlight", "highlighttext", "hiragana", "hiragana-iroha", "horizontal", "hsl", "hsla", "hue", "icon", "ignore", "inactiveborder", "inactivecaption", "inactivecaptiontext", "infinite", "infobackground", "infotext", "inherit", "initial", "inline", "inline-axis", "inline-block", "inline-flex", "inline-grid", "inline-table", "inset", "inside", "intrinsic", "invert", "italic", "japanese-formal", "japanese-informal", "justify", "kannada", "katakana", "katakana-iroha", "keep-all", "khmer", "korean-hangul-formal", "korean-hanja-formal", "korean-hanja-informal", "landscape", "lao", "large", "larger", "left", "level", "lighter", "lighten", "line-through", "linear", "linear-gradient", "lines", "list-item", "listbox", "listitem", "local", "logical", "loud", "lower", "lower-alpha", "lower-armenian", "lower-greek", "lower-hexadecimal", "lower-latin", "lower-norwegian", "lower-roman", "lowercase", "ltr", "luminosity", "malayalam", "match", "matrix", "matrix3d", "media-controls-background", "media-current-time-display", "media-fullscreen-button", "media-mute-button", "media-play-button", "media-return-to-realtime-button", "media-rewind-button", "media-seek-back-button", "media-seek-forward-button", "media-slider", "media-sliderthumb", "media-time-remaining-display", "media-volume-slider", "media-volume-slider-container", "media-volume-sliderthumb", "medium", "menu", "menulist", "menulist-button", "menulist-text", "menulist-textfield", "menutext", "message-box", "middle", "min-intrinsic", "mix", "mongolian", "monospace", "move", "multiple", "multiply", "myanmar", "n-resize", "narrower", "ne-resize", "nesw-resize", "no-close-quote", "no-drop", "no-open-quote", "no-repeat", "none", "normal", "not-allowed", "nowrap", "ns-resize", "numbers", "numeric", "nw-resize", "nwse-resize", "oblique", "octal", "opacity", "open-quote", "optimizeLegibility", "optimizeSpeed", "oriya", "oromo", "outset", "outside", "outside-shape", "overlay", "overline", "padding", "padding-box", "painted", "page", "paused", "persian", "perspective", "plus-darker", "plus-lighter", "pointer", "polygon", "portrait", "pre", "pre-line", "pre-wrap", "preserve-3d", "progress", "push-button", "radial-gradient", "radio", "read-only", "read-write", "read-write-plaintext-only", "rectangle", "region", "relative", "repeat", "repeating-linear-gradient", "repeating-radial-gradient", "repeat-x", "repeat-y", "reset", "reverse", "rgb", "rgba", "ridge", "right", "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ", "round", "row", "row-resize", "row-reverse", "rtl", "run-in", "running", "s-resize", "sans-serif", "saturation", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "screen", "scroll", "scrollbar", "scroll-position", "se-resize", "searchfield", "searchfield-cancel-button", "searchfield-decoration", "searchfield-results-button", "searchfield-results-decoration", "self-start", "self-end", "semi-condensed", "semi-expanded", "separate", "serif", "show", "sidama", "simp-chinese-formal", "simp-chinese-informal", "single", "skew", "skewX", "skewY", "skip-white-space", "slide", "slider-horizontal", "slider-vertical", "sliderthumb-horizontal", "sliderthumb-vertical", "slow", "small", "small-caps", "small-caption", "smaller", "soft-light", "solid", "somali", "source-atop", "source-in", "source-out", "source-over", "space", "space-around", "space-between", "space-evenly", "spell-out", "square", "square-button", "start", "static", "status-bar", "stretch", "stroke", "sub", "subpixel-antialiased", "super", "sw-resize", "symbolic", "symbols", "system-ui", "table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row", "table-row-group", "tamil", "telugu", "text", "text-bottom", "text-top", "textarea", "textfield", "thai", "thick", "thin", "threeddarkshadow", "threedface", "threedhighlight", "threedlightshadow", "threedshadow", "tibetan", "tigre", "tigrinya-er", "tigrinya-er-abegede", "tigrinya-et", "tigrinya-et-abegede", "to", "top", "trad-chinese-formal", "trad-chinese-informal", "transform", "translate", "translate3d", "translateX", "translateY", "translateZ", "transparent", "ultra-condensed", "ultra-expanded", "underline", "unset", "up", "upper-alpha", "upper-armenian", "upper-greek", "upper-hexadecimal", "upper-latin", "upper-norwegian", "upper-roman", "uppercase", "urdu", "url", "var", "vertical", "vertical-text", "visible", "visibleFill", "visiblePainted", "visibleStroke", "visual", "w-resize", "wait", "wave", "wider", "window", "windowframe", "windowtext", "words", "wrap", "wrap-reverse", "x-large", "x-small", "xor", "xx-large", "xx-small"],
		valueKeywords = keySet(valueKeywords_),
		allWords = documentTypes_.concat(mediaTypes_).concat(mediaFeatures_).concat(mediaValueKeywords_).concat(propertyKeywords_).concat(nonStandardPropertyKeywords_).concat(colorKeywords_).concat(valueKeywords_);
	CodeMirror.registerHelper("hintWords", "css", allWords), CodeMirror.defineMIME("text/css", {
		documentTypes: documentTypes,
		mediaTypes: mediaTypes,
		mediaFeatures: mediaFeatures,
		mediaValueKeywords: mediaValueKeywords,
		propertyKeywords: propertyKeywords,
		nonStandardPropertyKeywords: nonStandardPropertyKeywords,
		fontProperties: fontProperties,
		counterDescriptors: counterDescriptors,
		colorKeywords: colorKeywords,
		valueKeywords: valueKeywords,
		tokenHooks: {
			"/": function(stream, state) {
				return stream.eat("*") ? (state.tokenize = tokenCComment, tokenCComment(stream, state)) : !1
			}
		},
		name: "css"
	}), CodeMirror.defineMIME("text/x-scss", {
		mediaTypes: mediaTypes,
		mediaFeatures: mediaFeatures,
		mediaValueKeywords: mediaValueKeywords,
		propertyKeywords: propertyKeywords,
		nonStandardPropertyKeywords: nonStandardPropertyKeywords,
		colorKeywords: colorKeywords,
		valueKeywords: valueKeywords,
		fontProperties: fontProperties,
		allowNested: !0,
		lineComment: "//",
		tokenHooks: {
			"/": function(stream, state) {
				return stream.eat("/") ? (stream.skipToEnd(), ["comment", "comment"]) : stream.eat("*") ? (state.tokenize = tokenCComment, tokenCComment(stream, state)) : ["operator", "operator"]
			},
			":": function(stream) {
				return stream.match(/\s*\{/, !1) ? [null, null] : !1
			},
			$: function(stream) {
				return stream.match(/^[\w-]+/), stream.match(/^\s*:/, !1) ? ["variable-2", "variable-definition"] : ["variable-2", "variable"]
			},
			"#": function(stream) {
				return stream.eat("{") ? [null, "interpolation"] : !1
			}
		},
		name: "css",
		helperType: "scss"
	}), CodeMirror.defineMIME("text/x-less", {
		mediaTypes: mediaTypes,
		mediaFeatures: mediaFeatures,
		mediaValueKeywords: mediaValueKeywords,
		propertyKeywords: propertyKeywords,
		nonStandardPropertyKeywords: nonStandardPropertyKeywords,
		colorKeywords: colorKeywords,
		valueKeywords: valueKeywords,
		fontProperties: fontProperties,
		allowNested: !0,
		lineComment: "//",
		tokenHooks: {
			"/": function(stream, state) {
				return stream.eat("/") ? (stream.skipToEnd(), ["comment", "comment"]) : stream.eat("*") ? (state.tokenize = tokenCComment, tokenCComment(stream, state)) : ["operator", "operator"]
			},
			"@": function(stream) {
				return stream.eat("{") ? [null, "interpolation"] : stream.match(/^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/i, !1) ? !1 : (stream.eatWhile(/[\w\\\-]/), stream.match(/^\s*:/, !1) ? ["variable-2", "variable-definition"] : ["variable-2", "variable"])
			},
			"&": function() {
				return ["atom", "atom"]
			}
		},
		name: "css",
		helperType: "less"
	}), CodeMirror.defineMIME("text/x-gss", {
		documentTypes: documentTypes,
		mediaTypes: mediaTypes,
		mediaFeatures: mediaFeatures,
		propertyKeywords: propertyKeywords,
		nonStandardPropertyKeywords: nonStandardPropertyKeywords,
		fontProperties: fontProperties,
		counterDescriptors: counterDescriptors,
		colorKeywords: colorKeywords,
		valueKeywords: valueKeywords,
		supportsAtComponent: !0,
		tokenHooks: {
			"/": function(stream, state) {
				return stream.eat("*") ? (state.tokenize = tokenCComment, tokenCComment(stream, state)) : !1
			}
		},
		name: "css",
		helperType: "gss"
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("../fold/xml-fold")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../fold/xml-fold"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	function autoCloseGT(cm) {
		if (cm.getOption("disableInput")) return CodeMirror.Pass;
		for (var ranges = cm.listSelections(), replacements = [], opt = cm.getOption("autoCloseTags"), i = 0; i < ranges.length; i++) {
			if (!ranges[i].empty()) return CodeMirror.Pass;
			var pos = ranges[i].head,
				tok = cm.getTokenAt(pos),
				inner = CodeMirror.innerMode(cm.getMode(), tok.state),
				state = inner.state;
			if ("xml" != inner.mode.name || !state.tagName) return CodeMirror.Pass;
			var html = "html" == inner.mode.configuration,
				dontCloseTags = "object" == typeof opt && opt.dontCloseTags || html && htmlDontClose,
				indentTags = "object" == typeof opt && opt.indentTags || html && htmlIndent,
				tagName = state.tagName;
			tok.end > pos.ch && (tagName = tagName.slice(0, tagName.length - tok.end + pos.ch));
			var lowerTagName = tagName.toLowerCase();
			if (!tagName || "string" == tok.type && (tok.end != pos.ch || !/[\"\']/.test(tok.string.charAt(tok.string.length - 1)) || 1 == tok.string.length) || "tag" == tok.type && "closeTag" == state.type || tok.string.indexOf("/") == tok.string.length - 1 || dontCloseTags && indexOf(dontCloseTags, lowerTagName) > -1 || closingTagExists(cm, tagName, pos, state, !0)) return CodeMirror.Pass;
			var indent = indentTags && indexOf(indentTags, lowerTagName) > -1;
			replacements[i] = {
				indent: indent,
				text: ">" + (indent ? "\n\n" : "") + "</" + tagName + ">",
				newPos: indent ? CodeMirror.Pos(pos.line + 1, 0) : CodeMirror.Pos(pos.line, pos.ch + 1)
			}
		}
		for (var dontIndentOnAutoClose = "object" == typeof opt && opt.dontIndentOnAutoClose, i = ranges.length - 1; i >= 0; i--) {
			var info = replacements[i];
			cm.replaceRange(info.text, ranges[i].head, ranges[i].anchor, "+insert");
			var sel = cm.listSelections().slice(0);
			sel[i] = {
				head: info.newPos,
				anchor: info.newPos
			}, cm.setSelections(sel), !dontIndentOnAutoClose && info.indent && (cm.indentLine(info.newPos.line, null, !0), cm.indentLine(info.newPos.line + 1, null, !0))
		}
	}

	function autoCloseCurrent(cm, typingSlash) {
		for (var ranges = cm.listSelections(), replacements = [], head = typingSlash ? "/" : "</", opt = cm.getOption("autoCloseTags"), dontIndentOnAutoClose = "object" == typeof opt && opt.dontIndentOnSlash, i = 0; i < ranges.length; i++) {
			if (!ranges[i].empty()) return CodeMirror.Pass;
			var pos = ranges[i].head,
				tok = cm.getTokenAt(pos),
				inner = CodeMirror.innerMode(cm.getMode(), tok.state),
				state = inner.state;
			if (typingSlash && ("string" == tok.type || "<" != tok.string.charAt(0) || tok.start != pos.ch - 1)) return CodeMirror.Pass;
			var replacement;
			if ("xml" != inner.mode.name)
				if ("htmlmixed" == cm.getMode().name && "javascript" == inner.mode.name) replacement = head + "script";
				else {
					if ("htmlmixed" != cm.getMode().name || "css" != inner.mode.name) return CodeMirror.Pass;
					replacement = head + "style"
				}
			else {
				if (!state.context || !state.context.tagName || closingTagExists(cm, state.context.tagName, pos, state)) return CodeMirror.Pass;
				replacement = head + state.context.tagName
			}
			">" != cm.getLine(pos.line).charAt(tok.end) && (replacement += ">"), replacements[i] = replacement
		}
		if (cm.replaceSelections(replacements), ranges = cm.listSelections(), !dontIndentOnAutoClose)
			for (var i = 0; i < ranges.length; i++)(i == ranges.length - 1 || ranges[i].head.line < ranges[i + 1].head.line) && cm.indentLine(ranges[i].head.line)
	}

	function autoCloseSlash(cm) {
		return cm.getOption("disableInput") ? CodeMirror.Pass : autoCloseCurrent(cm, !0)
	}

	function indexOf(collection, elt) {
		if (collection.indexOf) return collection.indexOf(elt);
		for (var i = 0, e = collection.length; e > i; ++i)
			if (collection[i] == elt) return i;
		return -1
	}

	function closingTagExists(cm, tagName, pos, state, newTag) {
		if (!CodeMirror.scanForClosingTag) return !1;
		var end = Math.min(cm.lastLine() + 1, pos.line + 500),
			nextClose = CodeMirror.scanForClosingTag(cm, pos, null, end);
		if (!nextClose || nextClose.tag != tagName) return !1;
		for (var cx = state.context, onCx = newTag ? 1 : 0; cx && cx.tagName == tagName; cx = cx.prev) ++onCx;
		pos = nextClose.to;
		for (var i = 1; onCx > i; i++) {
			var next = CodeMirror.scanForClosingTag(cm, pos, null, end);
			if (!next || next.tag != tagName) return !1;
			pos = next.to
		}
		return !0
	}
	CodeMirror.defineOption("autoCloseTags", !1, function(cm, val, old) {
		if (old != CodeMirror.Init && old && cm.removeKeyMap("autoCloseTags"), val) {
			var map = {
				name: "autoCloseTags"
			};
			("object" != typeof val || val.whenClosing) && (map["'/'"] = function(cm) {
				return autoCloseSlash(cm)
			}), ("object" != typeof val || val.whenOpening) && (map["'>'"] = function(cm) {
				return autoCloseGT(cm)
			}), cm.addKeyMap(map)
		}
	});
	var htmlDontClose = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"],
		htmlIndent = ["applet", "blockquote", "body", "button", "div", "dl", "fieldset", "form", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "html", "iframe", "layer", "legend", "object", "ol", "p", "select", "table", "ul"];
	CodeMirror.commands.closeTag = function(cm) {
		return autoCloseCurrent(cm)
	}
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("../fold/xml-fold")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../fold/xml-fold"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function clear(cm) {
		cm.state.tagHit && cm.state.tagHit.clear(), cm.state.tagOther && cm.state.tagOther.clear(), cm.state.tagHit = cm.state.tagOther = null
	}

	function doMatchTags(cm) {
		cm.state.failedTagMatch = !1, cm.operation(function() {
			if (clear(cm), !cm.somethingSelected()) {
				var cur = cm.getCursor(),
					range = cm.getViewport();
				range.from = Math.min(range.from, cur.line), range.to = Math.max(cur.line + 1, range.to);
				var match = CodeMirror.findMatchingTag(cm, cur, range);
				if (match) {
					if ($(".cursor-place .line")[0].innerHTML = htmlEditor.getCursor().line + 1, $(".cursor-place .ch")[0].innerHTML = htmlEditor.getCursor().ch + 1, cm.state.matchBothTags) {
						var hit = "open" == match.at ? match.open : match.close;
						hit && (cm.state.tagHit = cm.markText(hit.from, hit.to, {
							className: "CodeMirror-matchingtag"
						}))
					}
					var other = "close" == match.at ? match.open : match.close;
					other ? cm.state.tagOther = cm.markText(other.from, other.to, {
						className: "CodeMirror-matchingtag"
					}) : cm.state.failedTagMatch = !0
				}
			}
		})
	}

	function maybeUpdateMatch(cm) {
		cm.state.failedTagMatch && doMatchTags(cm)
	}
	CodeMirror.defineOption("matchTags", !1, function(cm, val, old) {
		old && old != CodeMirror.Init && (cm.off("cursorActivity", doMatchTags), cm.off("viewportChange", maybeUpdateMatch), clear(cm)), val && (cm.state.matchBothTags = "object" == typeof val && val.bothTags, cm.on("cursorActivity", doMatchTags), cm.on("viewportChange", maybeUpdateMatch), doMatchTags(cm))
	}), CodeMirror.commands.toMatchingTag = function(cm) {
		var found = CodeMirror.findMatchingTag(cm, cm.getCursor());
		if (found) {
			var other = "close" == found.at ? found.open : found.close;
			other && cm.extendSelection(other.to, other.from)
		}
	}
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	function dialogDiv(cm, template, bottom) {
		var dialog, wrap = cm.getWrapperElement();
		return dialog = wrap.appendChild(document.createElement("div")), dialog.className = bottom ? "CodeMirror-dialog CodeMirror-dialog-bottom" : "CodeMirror-dialog CodeMirror-dialog-top", "string" == typeof template ? dialog.innerHTML = template : dialog.appendChild(template), dialog
	}

	function closeNotification(cm, newVal) {
		cm.state.currentNotificationClose && cm.state.currentNotificationClose(), cm.state.currentNotificationClose = newVal
	}
	CodeMirror.defineExtension("openDialog", function(template, callback, options) {
		function close(newVal) {
			if ("string" == typeof newVal) inp.value = newVal;
			else {
				if (closed) return;
				closed = !0, dialog.parentNode.removeChild(dialog), me.focus(), options.onClose && options.onClose(dialog)
			}
		}
		options || (options = {}), closeNotification(this, null);
		var button, dialog = dialogDiv(this, template, options.bottom),
			closed = !1,
			me = this,
			inp = dialog.getElementsByTagName("input")[0];
		return inp ? (inp.focus(), options.value && (inp.value = options.value, options.selectValueOnOpen !== !1 && inp.select()), options.onInput && CodeMirror.on(inp, "input", function(e) {
			options.onInput(e, inp.value, close)
		}), options.onKeyUp && CodeMirror.on(inp, "keyup", function(e) {
			options.onKeyUp(e, inp.value, close)
		}), CodeMirror.on(inp, "keydown", function(e) {
			options && options.onKeyDown && options.onKeyDown(e, inp.value, close) || ((27 == e.keyCode || options.closeOnEnter !== !1 && 13 == e.keyCode) && (inp.blur(), CodeMirror.e_stop(e), close()), 13 == e.keyCode && callback(inp.value, e))
		}), options.closeOnBlur !== !1 && CodeMirror.on(inp, "blur", close)) : (button = dialog.getElementsByTagName("button")[0]) && (CodeMirror.on(button, "click", function() {
			close(), me.focus()
		}), options.closeOnBlur !== !1 && CodeMirror.on(button, "blur", close), button.focus()), close
	}), CodeMirror.defineExtension("openConfirm", function(template, callbacks, options) {
		function close() {
			closed || (closed = !0, dialog.parentNode.removeChild(dialog), me.focus())
		}
		closeNotification(this, null);
		var dialog = dialogDiv(this, template, options && options.bottom),
			buttons = dialog.getElementsByTagName("button"),
			closed = !1,
			me = this,
			blurring = 1;
		buttons[0].focus();
		for (var i = 0; i < buttons.length; ++i) {
			var b = buttons[i];
			! function(callback) {
				CodeMirror.on(b, "click", function(e) {
					CodeMirror.e_preventDefault(e), close(), callback && callback(me)
				})
			}(callbacks[i]), CodeMirror.on(b, "blur", function() {
				--blurring, setTimeout(function() {
					0 >= blurring && close()
				}, 200)
			}), CodeMirror.on(b, "focus", function() {
				++blurring
			})
		}
	}), CodeMirror.defineExtension("openNotification", function(template, options) {
		function close() {
			closed || (closed = !0, clearTimeout(doneTimer), dialog.parentNode.removeChild(dialog))
		}
		closeNotification(this, close);
		var doneTimer, dialog = dialogDiv(this, template, options && options.bottom),
			closed = !1,
			duration = options && "undefined" != typeof options.duration ? options.duration : 5e3;
		return CodeMirror.on(dialog, "click", function(e) {
			CodeMirror.e_preventDefault(e), close()
		}), duration && (doneTimer = setTimeout(close, duration)), close
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function regexpFlags(regexp) {
		var flags = regexp.flags;
		return null != flags ? flags : (regexp.ignoreCase ? "i" : "") + (regexp.global ? "g" : "") + (regexp.multiline ? "m" : "")
	}

	function ensureFlags(regexp, flags) {
		for (var current = regexpFlags(regexp), target = current, i = 0; i < flags.length; i++) - 1 == target.indexOf(flags.charAt(i)) && (target += flags.charAt(i));
		return current == target ? regexp : new RegExp(regexp.source, target)
	}

	function maybeMultiline(regexp) {
		return /\\s|\\n|\n|\\W|\\D|\[\^/.test(regexp.source)
	}

	function searchRegexpForward(doc, regexp, start) {
		regexp = ensureFlags(regexp, "g");
		for (var line = start.line, ch = start.ch, last = doc.lastLine(); last >= line; line++, ch = 0) {
			regexp.lastIndex = ch;
			var string = doc.getLine(line),
				match = regexp.exec(string);
			if (match) return {
				from: Pos(line, match.index),
				to: Pos(line, match.index + match[0].length),
				match: match
			}
		}
	}

	function searchRegexpForwardMultiline(doc, regexp, start) {
		if (!maybeMultiline(regexp)) return searchRegexpForward(doc, regexp, start);
		regexp = ensureFlags(regexp, "gm");
		for (var string, chunk = 1, line = start.line, last = doc.lastLine(); last >= line;) {
			for (var i = 0; chunk > i && !(line > last); i++) {
				var curLine = doc.getLine(line++);
				string = null == string ? curLine : string + "\n" + curLine
			}
			chunk = 2 * chunk, regexp.lastIndex = start.ch;
			var match = regexp.exec(string);
			if (match) {
				var before = string.slice(0, match.index).split("\n"),
					inside = match[0].split("\n"),
					startLine = start.line + before.length - 1,
					startCh = before[before.length - 1].length;
				return {
					from: Pos(startLine, startCh),
					to: Pos(startLine + inside.length - 1, 1 == inside.length ? startCh + inside[0].length : inside[inside.length - 1].length),
					match: match
				}
			}
		}
	}

	function lastMatchIn(string, regexp) {
		for (var match, cutOff = 0;;) {
			regexp.lastIndex = cutOff;
			var newMatch = regexp.exec(string);
			if (!newMatch) return match;
			if (match = newMatch, cutOff = match.index + (match[0].length || 1), cutOff == string.length) return match
		}
	}

	function searchRegexpBackward(doc, regexp, start) {
		regexp = ensureFlags(regexp, "g");
		for (var line = start.line, ch = start.ch, first = doc.firstLine(); line >= first; line--, ch = -1) {
			var string = doc.getLine(line);
			ch > -1 && (string = string.slice(0, ch));
			var match = lastMatchIn(string, regexp);
			if (match) return {
				from: Pos(line, match.index),
				to: Pos(line, match.index + match[0].length),
				match: match
			}
		}
	}

	function searchRegexpBackwardMultiline(doc, regexp, start) {
		regexp = ensureFlags(regexp, "gm");
		for (var string, chunk = 1, line = start.line, first = doc.firstLine(); line >= first;) {
			for (var i = 0; chunk > i; i++) {
				var curLine = doc.getLine(line--);
				string = null == string ? curLine.slice(0, start.ch) : curLine + "\n" + string
			}
			chunk *= 2;
			var match = lastMatchIn(string, regexp);
			if (match) {
				var before = string.slice(0, match.index).split("\n"),
					inside = match[0].split("\n"),
					startLine = line + before.length,
					startCh = before[before.length - 1].length;
				return {
					from: Pos(startLine, startCh),
					to: Pos(startLine + inside.length - 1, 1 == inside.length ? startCh + inside[0].length : inside[inside.length - 1].length),
					match: match
				}
			}
		}
	}

	function adjustPos(orig, folded, pos, foldFunc) {
		if (orig.length == folded.length) return pos;
		for (var min = 0, max = pos + Math.max(0, orig.length - folded.length);;) {
			if (min == max) return min;
			var mid = min + max >> 1,
				len = foldFunc(orig.slice(0, mid)).length;
			if (len == pos) return mid;
			len > pos ? max = mid : min = mid + 1
		}
	}

	function searchStringForward(doc, query, start, caseFold) {
		if (!query.length) return null;
		var fold = caseFold ? doFold : noFold,
			lines = fold(query).split(/\r|\n\r?/);
		search: for (var line = start.line, ch = start.ch, last = doc.lastLine() + 1 - lines.length; last >= line; line++, ch = 0) {
			var orig = doc.getLine(line).slice(ch),
				string = fold(orig);
			if (1 == lines.length) {
				var found = string.indexOf(lines[0]);
				if (-1 == found) continue search;
				var start = adjustPos(orig, string, found, fold) + ch;
				return {
					from: Pos(line, adjustPos(orig, string, found, fold) + ch),
					to: Pos(line, adjustPos(orig, string, found + lines[0].length, fold) + ch)
				}
			}
			var cutFrom = string.length - lines[0].length;
			if (string.slice(cutFrom) == lines[0]) {
				for (var i = 1; i < lines.length - 1; i++)
					if (fold(doc.getLine(line + i)) != lines[i]) continue search;
				var end = doc.getLine(line + lines.length - 1),
					endString = fold(end),
					lastLine = lines[lines.length - 1];
				if (endString.slice(0, lastLine.length) == lastLine) return {
					from: Pos(line, adjustPos(orig, string, cutFrom, fold) + ch),
					to: Pos(line + lines.length - 1, adjustPos(end, endString, lastLine.length, fold))
				}
			}
		}
	}

	function searchStringBackward(doc, query, start, caseFold) {
		if (!query.length) return null;
		var fold = caseFold ? doFold : noFold,
			lines = fold(query).split(/\r|\n\r?/);
		search: for (var line = start.line, ch = start.ch, first = doc.firstLine() - 1 + lines.length; line >= first; line--, ch = -1) {
			var orig = doc.getLine(line);
			ch > -1 && (orig = orig.slice(0, ch));
			var string = fold(orig);
			if (1 == lines.length) {
				var found = string.lastIndexOf(lines[0]);
				if (-1 == found) continue search;
				return {
					from: Pos(line, adjustPos(orig, string, found, fold)),
					to: Pos(line, adjustPos(orig, string, found + lines[0].length, fold))
				}
			}
			var lastLine = lines[lines.length - 1];
			if (string.slice(0, lastLine.length) == lastLine) {
				for (var i = 1, start = line - lines.length + 1; i < lines.length - 1; i++)
					if (fold(doc.getLine(start + i)) != lines[i]) continue search;
				var top = doc.getLine(line + 1 - lines.length),
					topString = fold(top);
				if (topString.slice(topString.length - lines[0].length) == lines[0]) return {
					from: Pos(line + 1 - lines.length, adjustPos(top, topString, top.length - lines[0].length, fold)),
					to: Pos(line, adjustPos(orig, string, lastLine.length, fold))
				}
			}
		}
	}

	function SearchCursor(doc, query, pos, options) {
		this.atOccurrence = !1, this.doc = doc, pos = pos ? doc.clipPos(pos) : Pos(0, 0), this.pos = {
			from: pos,
			to: pos
		};
		var caseFold;
		"object" == typeof options ? caseFold = options.caseFold : (caseFold = options, options = null), "string" == typeof query ? (null == caseFold && (caseFold = !1), this.matches = function(reverse, pos) {
			return (reverse ? searchStringBackward : searchStringForward)(doc, query, pos, caseFold)
		}) : (query = ensureFlags(query, "gm"), this.matches = options && options.multiline === !1 ? function(reverse, pos) {
			return (reverse ? searchRegexpBackward : searchRegexpForward)(doc, query, pos)
		} : function(reverse, pos) {
			return (reverse ? searchRegexpBackwardMultiline : searchRegexpForwardMultiline)(doc, query, pos)
		})
	}
	var doFold, noFold, Pos = CodeMirror.Pos;
	String.prototype.normalize ? (doFold = function(str) {
		return str.normalize("NFD").toLowerCase()
	}, noFold = function(str) {
		return str.normalize("NFD")
	}) : (doFold = function(str) {
		return str.toLowerCase()
	}, noFold = function(str) {
		return str
	}), SearchCursor.prototype = {
		findNext: function() {
			return this.find(!1)
		},
		findPrevious: function() {
			return this.find(!0)
		},
		find: function(reverse) {
			for (var result = this.matches(reverse, this.doc.clipPos(reverse ? this.pos.from : this.pos.to)); result && 0 == CodeMirror.cmpPos(result.from, result.to);) reverse ? result.from.ch ? result.from = Pos(result.from.line, result.from.ch - 1) : result = result.from.line == this.doc.firstLine() ? null : this.matches(reverse, this.doc.clipPos(Pos(result.from.line - 1))) : result.to.ch < this.doc.getLine(result.to.line).length ? result.to = Pos(result.to.line, result.to.ch + 1) : result = result.to.line == this.doc.lastLine() ? null : this.matches(reverse, Pos(result.to.line + 1, 0));
			if (result) return this.pos = result, this.atOccurrence = !0, this.pos.match || !0;
			var end = Pos(reverse ? this.doc.firstLine() : this.doc.lastLine() + 1, 0);
			return this.pos = {
				from: end,
				to: end
			}, this.atOccurrence = !1
		},
		from: function() {
			return this.atOccurrence ? this.pos.from : void 0
		},
		to: function() {
			return this.atOccurrence ? this.pos.to : void 0
		},
		replace: function(newText, origin) {
			if (this.atOccurrence) {
				var lines = CodeMirror.splitLines(newText);
				this.doc.replaceRange(lines, this.pos.from, this.pos.to, origin), this.pos.to = Pos(this.pos.from.line + lines.length - 1, lines[lines.length - 1].length + (1 == lines.length ? this.pos.from.ch : 0))
			}
		}
	}, CodeMirror.defineExtension("getSearchCursor", function(query, pos, caseFold) {
		return new SearchCursor(this.doc, query, pos, caseFold)
	}), CodeMirror.defineDocExtension("getSearchCursor", function(query, pos, caseFold) {
		return new SearchCursor(this, query, pos, caseFold)
	}), CodeMirror.defineExtension("selectMatches", function(query, caseFold) {
		for (var ranges = [], cur = this.getSearchCursor(query, this.getCursor("from"), caseFold); cur.findNext() && !(CodeMirror.cmpPos(cur.to(), this.getCursor("to")) > 0);) ranges.push({
			anchor: cur.from(),
			head: cur.to()
		});
		ranges.length && this.setSelections(ranges, 0)
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	function findMatchingBracket(cm, where, config) {
		var line = cm.getLineHandle(where.line),
			pos = where.ch - 1,
			afterCursor = config && config.afterCursor;
		null == afterCursor && (afterCursor = /(^| )cm-fat-cursor($| )/.test(cm.getWrapperElement().className)), $(".cursor-place .line")[0].innerHTML = cssEditor.getCursor().line + 1, $(".cursor-place .ch")[0].innerHTML = cssEditor.getCursor().ch + 1;
		var match = !afterCursor && pos >= 0 && matching[line.text.charAt(pos)] || matching[line.text.charAt(++pos)];
		if (!match) return null;
		var dir = ">" == match.charAt(1) ? 1 : -1;
		if (config && config.strict && dir > 0 != (pos == where.ch)) return null;
		var style = cm.getTokenTypeAt(Pos(where.line, pos + 1)),
			found = scanForBracket(cm, Pos(where.line, pos + (dir > 0 ? 1 : 0)), dir, style || null, config);
		return null == found ? null : {
			from: Pos(where.line, pos),
			to: found && found.pos,
			match: found && found.ch == match.charAt(0),
			forward: dir > 0
		}
	}

	function scanForBracket(cm, where, dir, style, config) {
		for (var maxScanLen = config && config.maxScanLineLength || 1e4, maxScanLines = config && config.maxScanLines || 1e3, stack = [], re = config && config.bracketRegex ? config.bracketRegex : /[(){}[\]]/, lineEnd = dir > 0 ? Math.min(where.line + maxScanLines, cm.lastLine() + 1) : Math.max(cm.firstLine() - 1, where.line - maxScanLines), lineNo = where.line; lineNo != lineEnd; lineNo += dir) {
			var line = cm.getLine(lineNo);
			if (line) {
				var pos = dir > 0 ? 0 : line.length - 1,
					end = dir > 0 ? line.length : -1;
				if (!(line.length > maxScanLen))
					for (lineNo == where.line && (pos = where.ch - (0 > dir ? 1 : 0)); pos != end; pos += dir) {
						var ch = line.charAt(pos);
						if (re.test(ch) && (void 0 === style || cm.getTokenTypeAt(Pos(lineNo, pos + 1)) == style)) {
							var match = matching[ch];
							if (">" == match.charAt(1) == dir > 0) stack.push(ch);
							else {
								if (!stack.length) return {
									pos: Pos(lineNo, pos),
									ch: ch
								};
								stack.pop()
							}
						}
					}
			}
		}
		return lineNo - dir == (dir > 0 ? cm.lastLine() : cm.firstLine()) ? !1 : null
	}

	function matchBrackets(cm, autoclear, config) {
		for (var maxHighlightLen = cm.state.matchBrackets.maxHighlightLineLength || 1e3, marks = [], ranges = cm.listSelections(), i = 0; i < ranges.length; i++) {
			var match = ranges[i].empty() && findMatchingBracket(cm, ranges[i].head, config);
			if (match && cm.getLine(match.from.line).length <= maxHighlightLen) {
				var style = match.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
				marks.push(cm.markText(match.from, Pos(match.from.line, match.from.ch + 1), {
					className: style
				})), match.to && cm.getLine(match.to.line).length <= maxHighlightLen && marks.push(cm.markText(match.to, Pos(match.to.line, match.to.ch + 1), {
					className: style
				}))
			}
		}
		if (marks.length) {
			ie_lt8 && cm.state.focused && cm.focus();
			var clear = function() {
				cm.operation(function() {
					for (var i = 0; i < marks.length; i++) marks[i].clear()
				})
			};
			if (!autoclear) return clear;
			setTimeout(clear, 800)
		}
	}

	function doMatchBrackets(cm) {
		cm.operation(function() {
			cm.state.matchBrackets.currentlyHighlighted && (cm.state.matchBrackets.currentlyHighlighted(), cm.state.matchBrackets.currentlyHighlighted = null), cm.state.matchBrackets.currentlyHighlighted = matchBrackets(cm, !1, cm.state.matchBrackets)
		})
	}
	var ie_lt8 = /MSIE \d/.test(navigator.userAgent) && (null == document.documentMode || document.documentMode < 8),
		Pos = CodeMirror.Pos,
		matching = {
			"(": ")>",
			")": "(<",
			"[": "]>",
			"]": "[<",
			"{": "}>",
			"}": "{<"
		};
	CodeMirror.defineOption("matchBrackets", !1, function(cm, val, old) {
		old && old != CodeMirror.Init && (cm.off("cursorActivity", doMatchBrackets), cm.state.matchBrackets && cm.state.matchBrackets.currentlyHighlighted && (cm.state.matchBrackets.currentlyHighlighted(), cm.state.matchBrackets.currentlyHighlighted = null)), val && (cm.state.matchBrackets = "object" == typeof val ? val : {}, cm.on("cursorActivity", doMatchBrackets))
	}), CodeMirror.defineExtension("matchBrackets", function() {
		matchBrackets(this, !0)
	}), CodeMirror.defineExtension("findMatchingBracket", function(pos, config, oldConfig) {
		return (oldConfig || "boolean" == typeof config) && (oldConfig ? (oldConfig.strict = config, config = oldConfig) : config = config ? {
			strict: !0
		} : null), findMatchingBracket(this, pos, config)
	}), CodeMirror.defineExtension("scanForBracket", function(pos, dir, style, config) {
		return scanForBracket(this, pos, dir, style, config)
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function clearActiveLines(cm) {
		for (var i = 0; i < cm.state.activeLines.length; i++) cm.removeLineClass(cm.state.activeLines[i], "wrap", WRAP_CLASS), cm.removeLineClass(cm.state.activeLines[i], "background", BACK_CLASS), cm.removeLineClass(cm.state.activeLines[i], "gutter", GUTT_CLASS)
	}

	function sameArray(a, b) {
		if (a.length != b.length) return !1;
		for (var i = 0; i < a.length; i++)
			if (a[i] != b[i]) return !1;
		return !0
	}

	function updateActiveLines(cm, ranges) {
		for (var active = [], i = 0; i < ranges.length; i++) {
			var range = ranges[i],
				option = cm.getOption("styleActiveLine");
			if ("object" == typeof option && option.nonEmpty ? range.anchor.line == range.head.line : range.empty()) {
				var line = cm.getLineHandleVisualStart(range.head.line);
				active[active.length - 1] != line && active.push(line)
			}
		}
		sameArray(cm.state.activeLines, active) || cm.operation(function() {
			clearActiveLines(cm);
			for (var i = 0; i < active.length; i++) cm.addLineClass(active[i], "wrap", WRAP_CLASS), cm.addLineClass(active[i], "background", BACK_CLASS), cm.addLineClass(active[i], "gutter", GUTT_CLASS);
			cm.state.activeLines = active
		})
	}

	function selectionChange(cm, sel) {
		updateActiveLines(cm, sel.ranges)
	}
	var WRAP_CLASS = "CodeMirror-activeline",
		BACK_CLASS = "CodeMirror-activeline-background",
		GUTT_CLASS = "CodeMirror-activeline-gutter";
	CodeMirror.defineOption("styleActiveLine", !1, function(cm, val, old) {
		var prev = old == CodeMirror.Init ? !1 : old;
		val != prev && (prev && (cm.off("beforeSelectionChange", selectionChange), clearActiveLines(cm), delete cm.state.activeLines), val && (cm.state.activeLines = [], updateActiveLines(cm, cm.listSelections()), cm.on("beforeSelectionChange", selectionChange)))
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("./searchcursor"), require("../dialog/dialog")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./searchcursor", "../dialog/dialog"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function searchOverlay(query, caseInsensitive) {
		return "string" == typeof query ? query = new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g") : query.global || (query = new RegExp(query.source, query.ignoreCase ? "gi" : "g")), {
			token: function(stream) {
				query.lastIndex = stream.pos;
				var match = query.exec(stream.string);
				return match && match.index == stream.pos ? (stream.pos += match[0].length || 1, "searching") : void(match ? stream.pos = match.index : stream.skipToEnd())
			}
		}
	}

	function SearchState() {
		this.posFrom = this.posTo = this.lastQuery = this.query = null, this.overlay = null
	}

	function getSearchState(cm) {
		return cm.state.search || (cm.state.search = new SearchState)
	}

	function queryCaseInsensitive(query) {
		return "string" == typeof query && query == query.toLowerCase()
	}

	function getSearchCursor(cm, query, pos) {
		return cm.getSearchCursor(query, pos, {
			caseFold: queryCaseInsensitive(query),
			multiline: !0
		})
	}

	function persistentDialog(cm, text, deflt, onEnter, onKeyDown) {
		cm.openDialog(text, onEnter, {
			value: deflt,
			selectValueOnOpen: !0,
			closeOnEnter: !1,
			onClose: function() {
				clearSearch(cm)
			},
			onKeyDown: onKeyDown
		})
	}

	function dialog(cm, text, shortText, deflt, f) {
		cm.openDialog ? cm.openDialog(text, f, {
			value: deflt,
			selectValueOnOpen: !0
		}) : f(prompt(shortText, deflt))
	}

	function confirmDialog(cm, text, shortText, fs) {
		cm.openConfirm ? cm.openConfirm(text, fs) : confirm(shortText) && fs[0]()
	}

	function parseString(string) {
		return string.replace(/\\(.)/g, function(_, ch) {
			return "n" == ch ? "\n" : "r" == ch ? "\r" : ch
		})
	}

	function parseQuery(query) {
		var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
		if (isRE) try {
			query = new RegExp(isRE[1], -1 == isRE[2].indexOf("i") ? "" : "i")
		} catch (e) {} else query = parseString(query);
		return ("string" == typeof query ? "" == query : query.test("")) && (query = /x^/), query
	}

	function startSearch(cm, state, query) {
		state.queryText = query, state.query = parseQuery(query), cm.removeOverlay(state.overlay, queryCaseInsensitive(state.query)), state.overlay = searchOverlay(state.query, queryCaseInsensitive(state.query)), cm.addOverlay(state.overlay), cm.showMatchesOnScrollbar && (state.annotate && (state.annotate.clear(), state.annotate = null), state.annotate = cm.showMatchesOnScrollbar(state.query, queryCaseInsensitive(state.query)))
	}

	function doSearch(cm, rev, persistent, immediate) {
		var state = getSearchState(cm);
		if (state.query) return findNext(cm, rev);
		var q = cm.getSelection() || state.lastQuery;
		if (q instanceof RegExp && "x^" == q.source && (q = null), persistent && cm.openDialog) {
			var hiding = null,
				searchNext = function(query, event) {
					CodeMirror.e_stop(event), query && (query != state.queryText && (startSearch(cm, state, query), state.posFrom = state.posTo = cm.getCursor()), hiding && (hiding.style.opacity = 1), findNext(cm, event.shiftKey, function(_, to) {
						var dialog;
						to.line < 3 && document.querySelector && (dialog = cm.display.wrapper.querySelector(".CodeMirror-dialog")) && dialog.getBoundingClientRect().bottom - 4 > cm.cursorCoords(to, "window").top && ((hiding = dialog).style.opacity = .4)
					}))
				};
			persistentDialog(cm, queryDialog, q, searchNext, function(event, query) {
				var keyName = CodeMirror.keyName(event),
					extra = cm.getOption("extraKeys"),
					cmd = extra && extra[keyName] || CodeMirror.keyMap[cm.getOption("keyMap")][keyName];
				"findNext" == cmd || "findPrev" == cmd || "findPersistentNext" == cmd || "findPersistentPrev" == cmd ? (CodeMirror.e_stop(event), startSearch(cm, getSearchState(cm), query), cm.execCommand(cmd)) : ("find" == cmd || "findPersistent" == cmd) && (CodeMirror.e_stop(event), searchNext(query, event))
			}), immediate && q && (startSearch(cm, state, q), findNext(cm, rev))
		} else dialog(cm, queryDialog, "Search for:", q, function(query) {
			query && !state.query && cm.operation(function() {
				startSearch(cm, state, query), state.posFrom = state.posTo = cm.getCursor(), findNext(cm, rev)
			})
		})
	}

	function findNext(cm, rev, callback) {
		cm.operation(function() {
			var state = getSearchState(cm),
				cursor = getSearchCursor(cm, state.query, rev ? state.posFrom : state.posTo);
			(cursor.find(rev) || (cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0)), cursor.find(rev))) && (cm.setSelection(cursor.from(), cursor.to()), cm.scrollIntoView({
				from: cursor.from(),
				to: cursor.to()
			}, 20), state.posFrom = cursor.from(), state.posTo = cursor.to(), callback && callback(cursor.from(), cursor.to()))
		})
	}

	function clearSearch(cm) {
		cm.operation(function() {
			var state = getSearchState(cm);
			state.lastQuery = state.query, state.query && (state.query = state.queryText = null, cm.removeOverlay(state.overlay), state.annotate && (state.annotate.clear(), state.annotate = null))
		})
	}

	function replaceAll(cm, query, text) {
		cm.operation(function() {
			for (var cursor = getSearchCursor(cm, query); cursor.findNext();)
				if ("string" != typeof query) {
					var match = cm.getRange(cursor.from(), cursor.to()).match(query);
					cursor.replace(text.replace(/\$(\d)/g, function(_, i) {
						return match[i]
					}))
				} else cursor.replace(text)
		})
	}

	function replace(cm, all) {
		if (!cm.getOption("readOnly")) {
			var query = cm.getSelection() || getSearchState(cm).lastQuery,
				dialogText = '<span class="CodeMirror-search-label">' + (all ? "Replace all:" : "Replace:") + "</span>";
			dialog(cm, dialogText + replaceQueryDialog, dialogText, query, function(query) {
				query && (query = parseQuery(query), dialog(cm, replacementQueryDialog, "Replace with:", "", function(text) {
					if (text = parseString(text), all) replaceAll(cm, query, text);
					else {
						clearSearch(cm);
						var cursor = getSearchCursor(cm, query, cm.getCursor("from")),
							advance = function() {
								var match, start = cursor.from();
								!(match = cursor.findNext()) && (cursor = getSearchCursor(cm, query), !(match = cursor.findNext()) || start && cursor.from().line == start.line && cursor.from().ch == start.ch) || (cm.setSelection(cursor.from(), cursor.to()), cm.scrollIntoView({
									from: cursor.from(),
									to: cursor.to()
								}), confirmDialog(cm, doReplaceConfirm, "Replace?", [function() {
									doReplace(match)
								}, advance, function() {
									replaceAll(cm, query, text)
								}]))
							},
							doReplace = function(match) {
								cursor.replace("string" == typeof query ? text : text.replace(/\$(\d)/g, function(_, i) {
									return match[i]
								})), advance()
							};
						advance()
					}
				}))
			})
		}
	}
	var queryDialog = '<input type="text" placeholder="Search... (Use /re/ syntax for regexp search)" class="CodeMirror-search-field"/>',
		replaceQueryDialog = ' <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint"></span>',
		replacementQueryDialog = '<span class="CodeMirror-search-label">With:</span> <input type="text" style="width: 10em" class="CodeMirror-search-field"/>',
		doReplaceConfirm = '<span class="CodeMirror-search-label">Replace?</span> <button>Yes</button> <button>No</button> <button>All</button> <button>Stop</button>';
	CodeMirror.commands.find = function(cm) {
		clearSearch(cm), doSearch(cm)
	}, CodeMirror.commands.findPersistent = function(cm) {
		clearSearch(cm), doSearch(cm, !1, !0)
	}, CodeMirror.commands.findPersistentNext = function(cm) {
		doSearch(cm, !1, !0, !0)
	}, CodeMirror.commands.findPersistentPrev = function(cm) {
		doSearch(cm, !0, !0, !0)
	}, CodeMirror.commands.findNext = doSearch, CodeMirror.commands.findPrev = function(cm) {
		doSearch(cm, !0)
	}, CodeMirror.commands.clearSearch = clearSearch, CodeMirror.commands.replace = replace, CodeMirror.commands.replaceAll = function(cm) {
		replace(cm, !0)
	}
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("../dialog/dialog")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../dialog/dialog"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function dialog(cm, text, shortText, deflt, f) {
		cm.openDialog ? cm.openDialog(text, f, {
			value: deflt,
			selectValueOnOpen: !0
		}) : f(prompt(shortText, deflt))
	}

	function interpretLine(cm, string) {
		var num = Number(string);
		return /^[-+]/.test(string) ? cm.getCursor().line + num : num - 1
	}
	var jumpDialog = 'Jump to line: <input type="text" style="width: 10em" class="CodeMirror-search-field"/> <span style="color: #888" class="CodeMirror-search-hint">(Use line:column or scroll% syntax)</span>';
	CodeMirror.commands.jumpToLine = function(cm) {
		var cur = cm.getCursor();
		dialog(cm, jumpDialog, "Jump to line:", cur.line + 1 + ":" + cur.ch, function(posStr) {
			if (posStr) {
				var match;
				if (match = /^\s*([\+\-]?\d+)\s*\:\s*(\d+)\s*$/.exec(posStr)) cm.setCursor(interpretLine(cm, match[1]), Number(match[2]));
				else if (match = /^\s*([\+\-]?\d+(\.\d+)?)\%\s*/.exec(posStr)) {
					var line = Math.round(cm.lineCount() * Number(match[1]) / 100);
					/^[-+]/.test(match[1]) && (line = cur.line + line + 1), cm.setCursor(line - 1, cur.ch)
				} else(match = /^\s*\:?\s*([\+\-]?\d+)\s*/.exec(posStr)) && cm.setCursor(interpretLine(cm, match[1]), cur.ch)
			}
		})
	}, CodeMirror.keyMap["default"]["Alt-G"] = "jumpToLine"
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("./searchcursor"), require("../scroll/annotatescrollbar")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./searchcursor", "../scroll/annotatescrollbar"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function SearchAnnotation(cm, query, caseFold, options) {
		this.cm = cm, this.options = options;
		var annotateOptions = {
			listenForChanges: !1
		};
		for (var prop in options) annotateOptions[prop] = options[prop];
		annotateOptions.className || (annotateOptions.className = "CodeMirror-search-match"), this.annotation = cm.annotateScrollbar(annotateOptions), this.query = query, this.caseFold = caseFold, this.gap = {
			from: cm.firstLine(),
			to: cm.lastLine() + 1
		}, this.matches = [], this.update = null, this.findMatches(), this.annotation.update(this.matches);
		var self = this;
		cm.on("change", this.changeHandler = function(_cm, change) {
			self.onChange(change)
		})
	}

	function offsetLine(line, changeStart, sizeChange) {
		return changeStart >= line ? line : Math.max(changeStart, line + sizeChange)
	}
	CodeMirror.defineExtension("showMatchesOnScrollbar", function(query, caseFold, options) {
		return "string" == typeof options && (options = {
			className: options
		}), options || (options = {}), new SearchAnnotation(this, query, caseFold, options)
	});
	var MAX_MATCHES = 1e3;
	SearchAnnotation.prototype.findMatches = function() {
		if (this.gap) {
			for (var i = 0; i < this.matches.length; i++) {
				var match = this.matches[i];
				if (match.from.line >= this.gap.to) break;
				match.to.line >= this.gap.from && this.matches.splice(i--, 1)
			}
			for (var cursor = this.cm.getSearchCursor(this.query, CodeMirror.Pos(this.gap.from, 0), this.caseFold), maxMatches = this.options && this.options.maxMatches || MAX_MATCHES; cursor.findNext();) {
				var match = {
					from: cursor.from(),
					to: cursor.to()
				};
				if (match.from.line >= this.gap.to) break;
				if (this.matches.splice(i++, 0, match), this.matches.length > maxMatches) break
			}
			this.gap = null
		}
	}, SearchAnnotation.prototype.onChange = function(change) {
		var startLine = change.from.line,
			endLine = CodeMirror.changeEnd(change).line,
			sizeChange = endLine - change.to.line;
		if (this.gap ? (this.gap.from = Math.min(offsetLine(this.gap.from, startLine, sizeChange), change.from.line), this.gap.to = Math.max(offsetLine(this.gap.to, startLine, sizeChange), change.from.line)) : this.gap = {
				from: change.from.line,
				to: endLine + 1
			}, sizeChange)
			for (var i = 0; i < this.matches.length; i++) {
				var match = this.matches[i],
					newFrom = offsetLine(match.from.line, startLine, sizeChange);
				newFrom != match.from.line && (match.from = CodeMirror.Pos(newFrom, match.from.ch));
				var newTo = offsetLine(match.to.line, startLine, sizeChange);
				newTo != match.to.line && (match.to = CodeMirror.Pos(newTo, match.to.ch))
			}
		clearTimeout(this.update);
		var self = this;
		this.update = setTimeout(function() {
			self.updateAfterChange()
		}, 250)
	}, SearchAnnotation.prototype.updateAfterChange = function() {
		this.findMatches(), this.annotation.update(this.matches)
	}, SearchAnnotation.prototype.clear = function() {
		this.cm.off("change", this.changeHandler), this.annotation.clear()
	}
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function doFold(cm, pos, options, force) {
		function getRange(allowFolded) {
			var range = finder(cm, pos);
			if (!range || range.to.line - range.from.line < minSize) return null;
			for (var marks = cm.findMarksAt(range.from), i = 0; i < marks.length; ++i)
				if (marks[i].__isFold && "fold" !== force) {
					if (!allowFolded) return null;
					range.cleared = !0, marks[i].clear()
				}
			return range
		}
		if (options && options.call) {
			var finder = options;
			options = null
		} else var finder = getOption(cm, options, "rangeFinder");
		"number" == typeof pos && (pos = CodeMirror.Pos(pos, 0));
		var minSize = getOption(cm, options, "minFoldSize"),
			range = getRange(!0);
		if (getOption(cm, options, "scanUp"))
			for (; !range && pos.line > cm.firstLine();) pos = CodeMirror.Pos(pos.line - 1, 0), range = getRange(!1);
		if (range && !range.cleared && "unfold" !== force) {
			var myWidget = makeWidget(cm, options);
			CodeMirror.on(myWidget, "mousedown", function(e) {
				myRange.clear(), CodeMirror.e_preventDefault(e)
			});
			var myRange = cm.markText(range.from, range.to, {
				replacedWith: myWidget,
				clearOnEnter: getOption(cm, options, "clearOnEnter"),
				__isFold: !0
			});
			myRange.on("clear", function(from, to) {
				CodeMirror.signal(cm, "unfold", cm, from, to)
			}), CodeMirror.signal(cm, "fold", cm, range.from, range.to)
		}
	}

	function makeWidget(cm, options) {
		var widget = getOption(cm, options, "widget");
		if ("string" == typeof widget) {
			var text = document.createTextNode(widget);
			widget = document.createElement("span"), widget.appendChild(text), widget.className = "CodeMirror-foldmarker"
		} else widget && (widget = widget.cloneNode(!0));
		return widget
	}

	function getOption(cm, options, name) {
		if (options && void 0 !== options[name]) return options[name];
		var editorOptions = cm.options.foldOptions;
		return editorOptions && void 0 !== editorOptions[name] ? editorOptions[name] : defaultOptions[name]
	}
	CodeMirror.newFoldFunction = function(rangeFinder, widget) {
		return function(cm, pos) {
			doFold(cm, pos, {
				rangeFinder: rangeFinder,
				widget: widget
			})
		}
	}, CodeMirror.defineExtension("foldCode", function(pos, options, force) {
		doFold(this, pos, options, force)
	}), CodeMirror.defineExtension("isFolded", function(pos) {
		for (var marks = this.findMarksAt(pos), i = 0; i < marks.length; ++i)
			if (marks[i].__isFold) return !0
	}), CodeMirror.commands.toggleFold = function(cm) {
		cm.foldCode(cm.getCursor())
	}, CodeMirror.commands.fold = function(cm) {
		cm.foldCode(cm.getCursor(), null, "fold")
	}, CodeMirror.commands.unfold = function(cm) {
		cm.foldCode(cm.getCursor(), null, "unfold")
	}, CodeMirror.commands.foldAll = function(cm) {
		cm.operation(function() {
			for (var i = cm.firstLine(), e = cm.lastLine(); e >= i; i++) cm.foldCode(CodeMirror.Pos(i, 0), null, "fold")
		})
	}, CodeMirror.commands.unfoldAll = function(cm) {
		cm.operation(function() {
			for (var i = cm.firstLine(), e = cm.lastLine(); e >= i; i++) cm.foldCode(CodeMirror.Pos(i, 0), null, "unfold")
		})
	}, CodeMirror.registerHelper("fold", "combine", function() {
		var funcs = Array.prototype.slice.call(arguments, 0);
		return function(cm, start) {
			for (var i = 0; i < funcs.length; ++i) {
				var found = funcs[i](cm, start);
				if (found) return found
			}
		}
	}), CodeMirror.registerHelper("fold", "auto", function(cm, start) {
		for (var helpers = cm.getHelpers(start, "fold"), i = 0; i < helpers.length; i++) {
			var cur = helpers[i](cm, start);
			if (cur) return cur
		}
	});
	var defaultOptions = {
		rangeFinder: CodeMirror.fold.auto,
		widget: "↔",
		minFoldSize: 0,
		scanUp: !1,
		clearOnEnter: !0
	};
	CodeMirror.defineOption("foldOptions", null), CodeMirror.defineExtension("foldOption", function(options, name) {
		return getOption(this, options, name)
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("./foldcode")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./foldcode"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function State(options) {
		this.options = options, this.from = this.to = 0
	}

	function parseOptions(opts) {
		return opts === !0 && (opts = {}), null == opts.gutter && (opts.gutter = "CodeMirror-foldgutter"), null == opts.indicatorOpen && (opts.indicatorOpen = "CodeMirror-foldgutter-open"), null == opts.indicatorFolded && (opts.indicatorFolded = "CodeMirror-foldgutter-folded"), opts
	}

	function isFolded(cm, line) {
		for (var marks = cm.findMarks(Pos(line, 0), Pos(line + 1, 0)), i = 0; i < marks.length; ++i)
			if (marks[i].__isFold && marks[i].find().from.line == line) return marks[i]
	}

	function marker(spec) {
		if ("string" == typeof spec) {
			var elt = document.createElement("div");
			return elt.className = spec + " CodeMirror-guttermarker-subtle", elt
		}
		return spec.cloneNode(!0)
	}

	function updateFoldInfo(cm, from, to) {
		var opts = cm.state.foldGutter.options,
			cur = from,
			minSize = cm.foldOption(opts, "minFoldSize"),
			func = cm.foldOption(opts, "rangeFinder");
		cm.eachLine(from, to, function(line) {
			var mark = null;
			if (isFolded(cm, cur)) mark = marker(opts.indicatorFolded);
			else {
				var pos = Pos(cur, 0),
					range = func && func(cm, pos);
				range && range.to.line - range.from.line >= minSize && (mark = marker(opts.indicatorOpen))
			}
			cm.setGutterMarker(line, opts.gutter, mark), ++cur
		})
	}

	function updateInViewport(cm) {
		var vp = cm.getViewport(),
			state = cm.state.foldGutter;
		state && (cm.operation(function() {
			updateFoldInfo(cm, vp.from, vp.to)
		}), state.from = vp.from, state.to = vp.to)
	}

	function onGutterClick(cm, line, gutter) {
		var state = cm.state.foldGutter;
		if (state) {
			var opts = state.options;
			if (gutter == opts.gutter) {
				var folded = isFolded(cm, line);
				folded ? folded.clear() : cm.foldCode(Pos(line, 0), opts.rangeFinder)
			}
		}
	}

	function onChange(cm) {
		var state = cm.state.foldGutter;
		if (state) {
			var opts = state.options;
			state.from = state.to = 0, clearTimeout(state.changeUpdate), state.changeUpdate = setTimeout(function() {
				updateInViewport(cm)
			}, opts.foldOnChangeTimeSpan || 600)
		}
	}

	function onViewportChange(cm) {
		var state = cm.state.foldGutter;
		if (state) {
			var opts = state.options;
			clearTimeout(state.changeUpdate), state.changeUpdate = setTimeout(function() {
				var vp = cm.getViewport();
				state.from == state.to || vp.from - state.to > 20 || state.from - vp.to > 20 ? updateInViewport(cm) : cm.operation(function() {
					vp.from < state.from && (updateFoldInfo(cm, vp.from, state.from), state.from = vp.from), vp.to > state.to && (updateFoldInfo(cm, state.to, vp.to), state.to = vp.to)
				})
			}, opts.updateViewportTimeSpan || 400)
		}
	}

	function onFold(cm, from) {
		var state = cm.state.foldGutter;
		if (state) {
			var line = from.line;
			line >= state.from && line < state.to && updateFoldInfo(cm, line, line + 1)
		}
	}
	CodeMirror.defineOption("foldGutter", !1, function(cm, val, old) {
		old && old != CodeMirror.Init && (cm.clearGutter(cm.state.foldGutter.options.gutter), cm.state.foldGutter = null, cm.off("gutterClick", onGutterClick), cm.off("change", onChange), cm.off("viewportChange", onViewportChange), cm.off("fold", onFold), cm.off("unfold", onFold), cm.off("swapDoc", onChange)), val && (cm.state.foldGutter = new State(parseOptions(val)), updateInViewport(cm), cm.on("gutterClick", onGutterClick), cm.on("change", onChange), cm.on("viewportChange", onViewportChange), cm.on("fold", onFold), cm.on("unfold", onFold), cm.on("swapDoc", onChange))
	});
	var Pos = CodeMirror.Pos
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";
	CodeMirror.registerHelper("fold", "brace", function(cm, start) {
		function findOpening(openCh) {
			for (var at = start.ch, pass = 0;;) {
				var found = 0 >= at ? -1 : lineText.lastIndexOf(openCh, at - 1);
				if (-1 != found) {
					if (1 == pass && found < start.ch) break;
					if (tokenType = cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1)), !/^(comment|string)/.test(tokenType)) return found + 1;
					at = found - 1
				} else {
					if (1 == pass) break;
					pass = 1, at = lineText.length
				}
			}
		}
		var tokenType, line = start.line,
			lineText = cm.getLine(line),
			startToken = "{",
			endToken = "}",
			startCh = findOpening("{");
		if (null == startCh && (startToken = "[", endToken = "]", startCh = findOpening("[")), null != startCh) {
			var end, endCh, count = 1,
				lastLine = cm.lastLine();
			outer: for (var i = line; lastLine >= i; ++i)
				for (var text = cm.getLine(i), pos = i == line ? startCh : 0;;) {
					var nextOpen = text.indexOf(startToken, pos),
						nextClose = text.indexOf(endToken, pos);
					if (0 > nextOpen && (nextOpen = text.length), 0 > nextClose && (nextClose = text.length), pos = Math.min(nextOpen, nextClose), pos == text.length) break;
					if (cm.getTokenTypeAt(CodeMirror.Pos(i, pos + 1)) == tokenType)
						if (pos == nextOpen) ++count;
						else if (!--count) {
						end = i, endCh = pos;
						break outer
					}++pos
				}
			if (null != end && (line != end || endCh != startCh)) return {
				from: CodeMirror.Pos(line, startCh),
				to: CodeMirror.Pos(end, endCh)
			}
		}
	}), CodeMirror.registerHelper("fold", "import", function(cm, start) {
		function hasImport(line) {
			if (line < cm.firstLine() || line > cm.lastLine()) return null;
			var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
			if (/\S/.test(start.string) || (start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1))), "keyword" != start.type || "import" != start.string) return null;
			for (var i = line, e = Math.min(cm.lastLine(), line + 10); e >= i; ++i) {
				var text = cm.getLine(i),
					semi = text.indexOf(";");
				if (-1 != semi) return {
					startCh: start.end,
					end: CodeMirror.Pos(i, semi)
				}
			}
		}
		var prev, startLine = start.line,
			has = hasImport(startLine);
		if (!has || hasImport(startLine - 1) || (prev = hasImport(startLine - 2)) && prev.end.line == startLine - 1) return null;
		for (var end = has.end;;) {
			var next = hasImport(end.line + 1);
			if (null == next) break;
			end = next.end
		}
		return {
			from: cm.clipPos(CodeMirror.Pos(startLine, has.startCh + 1)),
			to: end
		}
	}), CodeMirror.registerHelper("fold", "include", function(cm, start) {
		function hasInclude(line) {
			if (line < cm.firstLine() || line > cm.lastLine()) return null;
			var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
			return /\S/.test(start.string) || (start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1))), "meta" == start.type && "#include" == start.string.slice(0, 8) ? start.start + 8 : void 0
		}
		var startLine = start.line,
			has = hasInclude(startLine);
		if (null == has || null != hasInclude(startLine - 1)) return null;
		for (var end = startLine;;) {
			var next = hasInclude(end + 1);
			if (null == next) break;
			++end
		}
		return {
			from: CodeMirror.Pos(startLine, has + 1),
			to: cm.clipPos(CodeMirror.Pos(end))
		}
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function cmp(a, b) {
		return a.line - b.line || a.ch - b.ch
	}

	function Iter(cm, line, ch, range) {
		this.line = line, this.ch = ch, this.cm = cm, this.text = cm.getLine(line), this.min = range ? Math.max(range.from, cm.firstLine()) : cm.firstLine(), this.max = range ? Math.min(range.to - 1, cm.lastLine()) : cm.lastLine()
	}

	function tagAt(iter, ch) {
		var type = iter.cm.getTokenTypeAt(Pos(iter.line, ch));
		return type && /\btag\b/.test(type)
	}

	function nextLine(iter) {
		return iter.line >= iter.max ? void 0 : (iter.ch = 0, iter.text = iter.cm.getLine(++iter.line), !0)
	}

	function prevLine(iter) {
		return iter.line <= iter.min ? void 0 : (iter.text = iter.cm.getLine(--iter.line), iter.ch = iter.text.length, !0)
	}

	function toTagEnd(iter) {
		for (;;) {
			var gt = iter.text.indexOf(">", iter.ch);
			if (-1 == gt) {
				if (nextLine(iter)) continue;
				return
			} {
				if (tagAt(iter, gt + 1)) {
					var lastSlash = iter.text.lastIndexOf("/", gt),
						selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
					return iter.ch = gt + 1, selfClose ? "selfClose" : "regular"
				}
				iter.ch = gt + 1
			}
		}
	}

	function toTagStart(iter) {
		for (;;) {
			var lt = iter.ch ? iter.text.lastIndexOf("<", iter.ch - 1) : -1;
			if (-1 == lt) {
				if (prevLine(iter)) continue;
				return
			}
			if (tagAt(iter, lt + 1)) {
				xmlTagStart.lastIndex = lt, iter.ch = lt;
				var match = xmlTagStart.exec(iter.text);
				if (match && match.index == lt) return match
			} else iter.ch = lt
		}
	}

	function toNextTag(iter) {
		for (;;) {
			xmlTagStart.lastIndex = iter.ch;
			var found = xmlTagStart.exec(iter.text);
			if (!found) {
				if (nextLine(iter)) continue;
				return
			} {
				if (tagAt(iter, found.index + 1)) return iter.ch = found.index + found[0].length, found;
				iter.ch = found.index + 1
			}
		}
	}

	function toPrevTag(iter) {
		for (;;) {
			var gt = iter.ch ? iter.text.lastIndexOf(">", iter.ch - 1) : -1;
			if (-1 == gt) {
				if (prevLine(iter)) continue;
				return
			} {
				if (tagAt(iter, gt + 1)) {
					var lastSlash = iter.text.lastIndexOf("/", gt),
						selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
					return iter.ch = gt + 1, selfClose ? "selfClose" : "regular"
				}
				iter.ch = gt
			}
		}
	}

	function findMatchingClose(iter, tag) {
		for (var stack = [];;) {
			var end, next = toNextTag(iter),
				startLine = iter.line,
				startCh = iter.ch - (next ? next[0].length : 0);
			if (!next || !(end = toTagEnd(iter))) return;
			if ("selfClose" != end)
				if (next[1]) {
					for (var i = stack.length - 1; i >= 0; --i)
						if (stack[i] == next[2]) {
							stack.length = i;
							break
						}
					if (0 > i && (!tag || tag == next[2])) return {
						tag: next[2],
						from: Pos(startLine, startCh),
						to: Pos(iter.line, iter.ch)
					}
				} else stack.push(next[2])
		}
	}

	function findMatchingOpen(iter, tag) {
		for (var stack = [];;) {
			var prev = toPrevTag(iter);
			if (!prev) return;
			if ("selfClose" != prev) {
				var endLine = iter.line,
					endCh = iter.ch,
					start = toTagStart(iter);
				if (!start) return;
				if (start[1]) stack.push(start[2]);
				else {
					for (var i = stack.length - 1; i >= 0; --i)
						if (stack[i] == start[2]) {
							stack.length = i;
							break
						}
					if (0 > i && (!tag || tag == start[2])) return {
						tag: start[2],
						from: Pos(iter.line, iter.ch),
						to: Pos(endLine, endCh)
					}
				}
			} else toTagStart(iter)
		}
	}
	var Pos = CodeMirror.Pos,
		nameStartChar = "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD",
		nameChar = nameStartChar + "-:.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040",
		xmlTagStart = new RegExp("<(/?)([" + nameStartChar + "][" + nameChar + "]*)", "g");
	CodeMirror.registerHelper("fold", "xml", function(cm, start) {
		for (var iter = new Iter(cm, start.line, 0);;) {
			var end, openTag = toNextTag(iter);
			if (!openTag || !(end = toTagEnd(iter)) || iter.line != start.line) return;
			if (!openTag[1] && "selfClose" != end) {
				var startPos = Pos(iter.line, iter.ch),
					endPos = findMatchingClose(iter, openTag[2]);
				return endPos && {
					from: startPos,
					to: endPos.from
				}
			}
		}
	}), CodeMirror.findMatchingTag = function(cm, pos, range) {
		var iter = new Iter(cm, pos.line, pos.ch, range);
		if (-1 != iter.text.indexOf(">") || -1 != iter.text.indexOf("<")) {
			var end = toTagEnd(iter),
				to = end && Pos(iter.line, iter.ch),
				start = end && toTagStart(iter);
			if (end && start && !(cmp(iter, pos) > 0)) {
				var here = {
					from: Pos(iter.line, iter.ch),
					to: to,
					tag: start[2]
				};
				return "selfClose" == end ? {
					open: here,
					close: null,
					at: "open"
				} : start[1] ? {
					open: findMatchingOpen(iter, start[2]),
					close: here,
					at: "close"
				} : (iter = new Iter(cm, to.line, to.ch, range), {
					open: here,
					close: findMatchingClose(iter, start[2]),
					at: "open"
				})
			}
		}
	}, CodeMirror.findEnclosingTag = function(cm, pos, range, tag) {
		for (var iter = new Iter(cm, pos.line, pos.ch, range);;) {
			var open = findMatchingOpen(iter, tag);
			if (!open) break;
			var forward = new Iter(cm, pos.line, pos.ch, range),
				close = findMatchingClose(forward, open.tag);
			if (close) return {
				open: open,
				close: close
			}
		}
	}, CodeMirror.scanForClosingTag = function(cm, pos, name, end) {
		var iter = new Iter(cm, pos.line, pos.ch, end ? {
			from: 0,
			to: end
		} : null);
		return findMatchingClose(iter, name)
	}
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function lineIndent(cm, lineNo) {
		var text = cm.getLine(lineNo),
			spaceTo = text.search(/\S/);
		return -1 == spaceTo || /\bcomment\b/.test(cm.getTokenTypeAt(CodeMirror.Pos(lineNo, spaceTo + 1))) ? -1 : CodeMirror.countColumn(text, null, cm.getOption("tabSize"))
	}
	CodeMirror.registerHelper("fold", "indent", function(cm, start) {
		var myIndent = lineIndent(cm, start.line);
		if (!(0 > myIndent)) {
			for (var lastLineInFold = null, i = start.line + 1, end = cm.lastLine(); end >= i; ++i) {
				var indent = lineIndent(cm, i);
				if (-1 == indent);
				else {
					if (!(indent > myIndent)) break;
					lastLineInFold = i
				}
			}
			return lastLineInFold ? {
				from: CodeMirror.Pos(start.line, cm.getLine(start.line).length),
				to: CodeMirror.Pos(lastLineInFold, cm.getLine(lastLineInFold).length)
			} : void 0
		}
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";
	CodeMirror.registerGlobalHelper("fold", "comment", function(mode) {
		return mode.blockCommentStart && mode.blockCommentEnd
	}, function(cm, start) {
		var mode = cm.getModeAt(start),
			startToken = mode.blockCommentStart,
			endToken = mode.blockCommentEnd;
		if (startToken && endToken) {
			for (var startCh, line = start.line, lineText = cm.getLine(line), at = start.ch, pass = 0;;) {
				var found = 0 >= at ? -1 : lineText.lastIndexOf(startToken, at - 1);
				if (-1 != found) {
					if (1 == pass && found < start.ch) return;
					if (/comment/.test(cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1))) && (0 == found || lineText.slice(found - endToken.length, found) == endToken || !/comment/.test(cm.getTokenTypeAt(CodeMirror.Pos(line, found))))) {
						startCh = found + startToken.length;
						break
					}
					at = found - 1
				} else {
					if (1 == pass) return;
					pass = 1, at = lineText.length
				}
			}
			var end, endCh, depth = 1,
				lastLine = cm.lastLine();
			outer: for (var i = line; lastLine >= i; ++i)
				for (var text = cm.getLine(i), pos = i == line ? startCh : 0;;) {
					var nextOpen = text.indexOf(startToken, pos),
						nextClose = text.indexOf(endToken, pos);
					if (0 > nextOpen && (nextOpen = text.length), 0 > nextClose && (nextClose = text.length), pos = Math.min(nextOpen, nextClose), pos == text.length) break;
					if (pos == nextOpen) ++depth;
					else if (!--depth) {
						end = i, endCh = pos;
						break outer
					}++pos
				}
			if (null != end && (line != end || endCh != startCh)) return {
				from: CodeMirror.Pos(line, startCh),
				to: CodeMirror.Pos(end, endCh)
			}
		}
	})
}),
function() {
	function in_array(what, arr) {
		for (var i = 0; i < arr.length; i += 1)
			if (arr[i] === what) return !0;
		return !1
	}

	function trim(s) {
		return s.replace(/^\s+|\s+$/g, "")
	}

	function js_beautify(js_source_text, options) {
		"use strict";
		var beautifier = new Beautifier(js_source_text, options);
		return beautifier.beautify()
	}

	function Beautifier(js_source_text, options) {
		"use strict";

		function create_flags(flags_base, mode) {
			var next_indent_level = 0;
			flags_base && (next_indent_level = flags_base.indentation_level, !output.just_added_newline() && flags_base.line_indent_level > next_indent_level && (next_indent_level = flags_base.line_indent_level));
			var next_flags = {
				mode: mode,
				parent: flags_base,
				last_text: flags_base ? flags_base.last_text : "",
				last_word: flags_base ? flags_base.last_word : "",
				declaration_statement: !1,
				declaration_assignment: !1,
				multiline_frame: !1,
				if_block: !1,
				else_block: !1,
				do_block: !1,
				do_while: !1,
				in_case_statement: !1,
				in_case: !1,
				case_body: !1,
				indentation_level: next_indent_level,
				line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
				start_line_index: output.get_line_number(),
				ternary_depth: 0
			};
			return next_flags
		}

		function handle_token(local_token) {
			var newlines = local_token.newlines,
				keep_whitespace = opt.keep_array_indentation && is_array(flags.mode);
			if (keep_whitespace)
				for (i = 0; newlines > i; i += 1) print_newline(i > 0);
			else if (opt.max_preserve_newlines && newlines > opt.max_preserve_newlines && (newlines = opt.max_preserve_newlines), opt.preserve_newlines && local_token.newlines > 1) {
				print_newline();
				for (var i = 1; newlines > i; i += 1) print_newline(!0)
			}
			current_token = local_token, handlers[current_token.type]()
		}

		function split_newlines(s) {
			s = s.replace(/\x0d/g, "");
			for (var out = [], idx = s.indexOf("\n"); - 1 !== idx;) out.push(s.substring(0, idx)), s = s.substring(idx + 1), idx = s.indexOf("\n");
			return s.length && out.push(s), out
		}

		function allow_wrap_or_preserved_newline(force_linewrap) {
			if (force_linewrap = void 0 === force_linewrap ? !1 : force_linewrap, !output.just_added_newline())
				if (opt.preserve_newlines && current_token.wanted_newline || force_linewrap) print_newline(!1, !0);
				else if (opt.wrap_line_length) {
				var proposed_line_length = output.current_line.get_character_count() + current_token.text.length + (output.space_before_token ? 1 : 0);
				proposed_line_length >= opt.wrap_line_length && print_newline(!1, !0)
			}
		}

		function print_newline(force_newline, preserve_statement_flags) {
			if (!preserve_statement_flags && ";" !== flags.last_text && "," !== flags.last_text && "=" !== flags.last_text && "TK_OPERATOR" !== last_type)
				for (; flags.mode === MODE.Statement && !flags.if_block && !flags.do_block;) restore_mode();
			output.add_new_line(force_newline) && (flags.multiline_frame = !0)
		}

		function print_token_line_indentation() {
			output.just_added_newline() && (opt.keep_array_indentation && is_array(flags.mode) && current_token.wanted_newline ? (output.current_line.push(current_token.whitespace_before), output.space_before_token = !1) : output.set_indent(flags.indentation_level) && (flags.line_indent_level = flags.indentation_level))
		}

		function print_token(printable_token) {
			printable_token = printable_token || current_token.text, print_token_line_indentation(), output.add_token(printable_token)
		}

		function indent() {
			flags.indentation_level += 1
		}

		function deindent() {
			flags.indentation_level > 0 && (!flags.parent || flags.indentation_level > flags.parent.indentation_level) && (flags.indentation_level -= 1)
		}

		function set_mode(mode) {
			flags ? (flag_store.push(flags), previous_flags = flags) : previous_flags = create_flags(null, mode), flags = create_flags(previous_flags, mode)
		}

		function is_array(mode) {
			return mode === MODE.ArrayLiteral
		}

		function is_expression(mode) {
			return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional])
		}

		function restore_mode() {
			flag_store.length > 0 && (previous_flags = flags, flags = flag_store.pop(), previous_flags.mode === MODE.Statement && output.remove_redundant_indentation(previous_flags))
		}

		function start_of_object_property() {
			return flags.parent.mode === MODE.ObjectLiteral && flags.mode === MODE.Statement && (":" === flags.last_text && 0 === flags.ternary_depth || "TK_RESERVED" === last_type && in_array(flags.last_text, ["get", "set"]))
		}

		function start_of_statement() {
			return "TK_RESERVED" === last_type && in_array(flags.last_text, ["var", "let", "const"]) && "TK_WORD" === current_token.type || "TK_RESERVED" === last_type && "do" === flags.last_text || "TK_RESERVED" === last_type && "return" === flags.last_text && !current_token.wanted_newline || "TK_RESERVED" === last_type && "else" === flags.last_text && ("TK_RESERVED" !== current_token.type || "if" !== current_token.text) || "TK_END_EXPR" === last_type && (previous_flags.mode === MODE.ForInitializer || previous_flags.mode === MODE.Conditional) || "TK_WORD" === last_type && flags.mode === MODE.BlockStatement && !flags.in_case && "--" !== current_token.text && "++" !== current_token.text && "TK_WORD" !== current_token.type && "TK_RESERVED" !== current_token.type || flags.mode === MODE.ObjectLiteral && (":" === flags.last_text && 0 === flags.ternary_depth || "TK_RESERVED" === last_type && in_array(flags.last_text, ["get", "set"])) ? (set_mode(MODE.Statement), indent(), "TK_RESERVED" === last_type && in_array(flags.last_text, ["var", "let", "const"]) && "TK_WORD" === current_token.type && (flags.declaration_statement = !0), start_of_object_property() || allow_wrap_or_preserved_newline("TK_RESERVED" === current_token.type && in_array(current_token.text, ["do", "for", "if", "while"])), !0) : !1
		}

		function all_lines_start_with(lines, c) {
			for (var i = 0; i < lines.length; i++) {
				var line = trim(lines[i]);
				if (line.charAt(0) !== c) return !1
			}
			return !0
		}

		function each_line_matches_indent(lines, indent) {
			for (var line, i = 0, len = lines.length; len > i; i++)
				if (line = lines[i], line && 0 !== line.indexOf(indent)) return !1;
			return !0
		}

		function is_special_word(word) {
			return in_array(word, ["case", "return", "do", "if", "throw", "else"])
		}

		function get_token(offset) {
			var index = token_pos + (offset || 0);
			return 0 > index || index >= tokens.length ? null : tokens[index]
		}

		function handle_start_expr() {
			start_of_statement();
			var next_mode = MODE.Expression;
			if ("[" === current_token.text) {
				if ("TK_WORD" === last_type || ")" === flags.last_text) return "TK_RESERVED" === last_type && in_array(flags.last_text, Tokenizer.line_starters) && (output.space_before_token = !0), set_mode(next_mode), print_token(), indent(), void(opt.space_in_paren && (output.space_before_token = !0));
				next_mode = MODE.ArrayLiteral, is_array(flags.mode) && ("[" === flags.last_text || "," === flags.last_text && ("]" === last_last_text || "}" === last_last_text)) && (opt.keep_array_indentation || print_newline())
			} else "TK_RESERVED" === last_type && "for" === flags.last_text ? next_mode = MODE.ForInitializer : "TK_RESERVED" === last_type && in_array(flags.last_text, ["if", "while"]) && (next_mode = MODE.Conditional);
			";" === flags.last_text || "TK_START_BLOCK" === last_type ? print_newline() : "TK_END_EXPR" === last_type || "TK_START_EXPR" === last_type || "TK_END_BLOCK" === last_type || "." === flags.last_text ? allow_wrap_or_preserved_newline(current_token.wanted_newline) : "TK_RESERVED" === last_type && "(" === current_token.text || "TK_WORD" === last_type || "TK_OPERATOR" === last_type ? "TK_RESERVED" === last_type && ("function" === flags.last_word || "typeof" === flags.last_word) || "*" === flags.last_text && "function" === last_last_text ? opt.space_after_anon_function && (output.space_before_token = !0) : "TK_RESERVED" !== last_type || !in_array(flags.last_text, Tokenizer.line_starters) && "catch" !== flags.last_text || opt.space_before_conditional && (output.space_before_token = !0) : output.space_before_token = !0, "(" === current_token.text && ("TK_EQUALS" === last_type || "TK_OPERATOR" === last_type) && (start_of_object_property() || allow_wrap_or_preserved_newline()), set_mode(next_mode), print_token(), opt.space_in_paren && (output.space_before_token = !0), indent()
		}

		function handle_end_expr() {
			for (; flags.mode === MODE.Statement;) restore_mode();
			flags.multiline_frame && allow_wrap_or_preserved_newline("]" === current_token.text && is_array(flags.mode) && !opt.keep_array_indentation), opt.space_in_paren && ("TK_START_EXPR" !== last_type || opt.space_in_empty_paren ? output.space_before_token = !0 : (output.trim(), output.space_before_token = !1)), "]" === current_token.text && opt.keep_array_indentation ? (print_token(), restore_mode()) : (restore_mode(), print_token()), output.remove_redundant_indentation(previous_flags), flags.do_while && previous_flags.mode === MODE.Conditional && (previous_flags.mode = MODE.Expression, flags.do_block = !1, flags.do_while = !1)
		}

		function handle_start_block() {
			var next_token = get_token(1),
				second_token = get_token(2);
			set_mode(second_token && (":" === second_token.text && in_array(next_token.type, ["TK_STRING", "TK_WORD", "TK_RESERVED"]) || in_array(next_token.text, ["get", "set"]) && in_array(second_token.type, ["TK_WORD", "TK_RESERVED"])) ? in_array(last_last_text, ["class", "interface"]) ? MODE.BlockStatement : MODE.ObjectLiteral : MODE.BlockStatement);
			var empty_braces = !next_token.comments_before.length && "}" === next_token.text,
				empty_anonymous_function = empty_braces && "function" === flags.last_word && "TK_END_EXPR" === last_type;
			"expand" === opt.brace_style || "none" === opt.brace_style && current_token.wanted_newline ? "TK_OPERATOR" !== last_type && (empty_anonymous_function || "TK_EQUALS" === last_type || "TK_RESERVED" === last_type && is_special_word(flags.last_text) && "else" !== flags.last_text) ? output.space_before_token = !0 : print_newline(!1, !0) : "TK_OPERATOR" !== last_type && "TK_START_EXPR" !== last_type ? "TK_START_BLOCK" === last_type ? print_newline() : output.space_before_token = !0 : is_array(previous_flags.mode) && "," === flags.last_text && ("}" === last_last_text ? output.space_before_token = !0 : print_newline()), print_token(), indent()
		}

		function handle_end_block() {
			for (; flags.mode === MODE.Statement;) restore_mode();
			var empty_braces = "TK_START_BLOCK" === last_type;
			"expand" === opt.brace_style ? empty_braces || print_newline() : empty_braces || (is_array(flags.mode) && opt.keep_array_indentation ? (opt.keep_array_indentation = !1, print_newline(), opt.keep_array_indentation = !0) : print_newline()), restore_mode(), print_token()
		}

		function handle_word() {
			if ("TK_RESERVED" === current_token.type && flags.mode !== MODE.ObjectLiteral && in_array(current_token.text, ["set", "get"]) && (current_token.type = "TK_WORD"), "TK_RESERVED" === current_token.type && flags.mode === MODE.ObjectLiteral) {
				var next_token = get_token(1);
				":" == next_token.text && (current_token.type = "TK_WORD")
			}
			if (start_of_statement() || !current_token.wanted_newline || is_expression(flags.mode) || "TK_OPERATOR" === last_type && "--" !== flags.last_text && "++" !== flags.last_text || "TK_EQUALS" === last_type || !opt.preserve_newlines && "TK_RESERVED" === last_type && in_array(flags.last_text, ["var", "let", "const", "set", "get"]) || print_newline(), flags.do_block && !flags.do_while) {
				if ("TK_RESERVED" === current_token.type && "while" === current_token.text) return output.space_before_token = !0, print_token(), output.space_before_token = !0, void(flags.do_while = !0);
				print_newline(), flags.do_block = !1
			}
			if (flags.if_block)
				if (flags.else_block || "TK_RESERVED" !== current_token.type || "else" !== current_token.text) {
					for (; flags.mode === MODE.Statement;) restore_mode();
					flags.if_block = !1, flags.else_block = !1
				} else flags.else_block = !0;
			if ("TK_RESERVED" === current_token.type && ("case" === current_token.text || "default" === current_token.text && flags.in_case_statement)) return print_newline(), (flags.case_body || opt.jslint_happy) && (deindent(), flags.case_body = !1), print_token(), flags.in_case = !0, void(flags.in_case_statement = !0);
			if ("TK_RESERVED" === current_token.type && "function" === current_token.text && ((in_array(flags.last_text, ["}", ";"]) || output.just_added_newline() && !in_array(flags.last_text, ["[", "{", ":", "=", ","])) && (output.just_added_blankline() || current_token.comments_before.length || (print_newline(), print_newline(!0))), "TK_RESERVED" === last_type || "TK_WORD" === last_type ? "TK_RESERVED" === last_type && in_array(flags.last_text, ["get", "set", "new", "return", "export"]) ? output.space_before_token = !0 : "TK_RESERVED" === last_type && "default" === flags.last_text && "export" === last_last_text ? output.space_before_token = !0 : print_newline() : "TK_OPERATOR" === last_type || "=" === flags.last_text ? output.space_before_token = !0 : (flags.multiline_frame || !is_expression(flags.mode) && !is_array(flags.mode)) && print_newline()), ("TK_COMMA" === last_type || "TK_START_EXPR" === last_type || "TK_EQUALS" === last_type || "TK_OPERATOR" === last_type) && (start_of_object_property() || allow_wrap_or_preserved_newline()), "TK_RESERVED" === current_token.type && in_array(current_token.text, ["function", "get", "set"])) return print_token(), void(flags.last_word = current_token.text);
			if (prefix = "NONE", "TK_END_BLOCK" === last_type ? "TK_RESERVED" === current_token.type && in_array(current_token.text, ["else", "catch", "finally"]) ? "expand" === opt.brace_style || "end-expand" === opt.brace_style || "none" === opt.brace_style && current_token.wanted_newline ? prefix = "NEWLINE" : (prefix = "SPACE", output.space_before_token = !0) : prefix = "NEWLINE" : "TK_SEMICOLON" === last_type && flags.mode === MODE.BlockStatement ? prefix = "NEWLINE" : "TK_SEMICOLON" === last_type && is_expression(flags.mode) ? prefix = "SPACE" : "TK_STRING" === last_type ? prefix = "NEWLINE" : "TK_RESERVED" === last_type || "TK_WORD" === last_type || "*" === flags.last_text && "function" === last_last_text ? prefix = "SPACE" : "TK_START_BLOCK" === last_type ? prefix = "NEWLINE" : "TK_END_EXPR" === last_type && (output.space_before_token = !0, prefix = "NEWLINE"), "TK_RESERVED" === current_token.type && in_array(current_token.text, Tokenizer.line_starters) && ")" !== flags.last_text && (prefix = "else" === flags.last_text || "export" === flags.last_text ? "SPACE" : "NEWLINE"), "TK_RESERVED" === current_token.type && in_array(current_token.text, ["else", "catch", "finally"]))
				if ("TK_END_BLOCK" !== last_type || "expand" === opt.brace_style || "end-expand" === opt.brace_style || "none" === opt.brace_style && current_token.wanted_newline) print_newline();
				else {
					output.trim(!0);
					var line = output.current_line;
					"}" !== line.last() && print_newline(), output.space_before_token = !0
				}
			else "NEWLINE" === prefix ? "TK_RESERVED" === last_type && is_special_word(flags.last_text) ? output.space_before_token = !0 : "TK_END_EXPR" !== last_type ? "TK_START_EXPR" === last_type && "TK_RESERVED" === current_token.type && in_array(current_token.text, ["var", "let", "const"]) || ":" === flags.last_text || ("TK_RESERVED" === current_token.type && "if" === current_token.text && "else" === flags.last_text ? output.space_before_token = !0 : print_newline()) : "TK_RESERVED" === current_token.type && in_array(current_token.text, Tokenizer.line_starters) && ")" !== flags.last_text && print_newline() : flags.multiline_frame && is_array(flags.mode) && "," === flags.last_text && "}" === last_last_text ? print_newline() : "SPACE" === prefix && (output.space_before_token = !0);
			print_token(), flags.last_word = current_token.text, "TK_RESERVED" === current_token.type && "do" === current_token.text && (flags.do_block = !0), "TK_RESERVED" === current_token.type && "if" === current_token.text && (flags.if_block = !0)
		}

		function handle_semicolon() {
			for (start_of_statement() && (output.space_before_token = !1); flags.mode === MODE.Statement && !flags.if_block && !flags.do_block;) restore_mode();
			print_token()
		}

		function handle_string() {
			start_of_statement() ? output.space_before_token = !0 : "TK_RESERVED" === last_type || "TK_WORD" === last_type ? output.space_before_token = !0 : "TK_COMMA" === last_type || "TK_START_EXPR" === last_type || "TK_EQUALS" === last_type || "TK_OPERATOR" === last_type ? start_of_object_property() || allow_wrap_or_preserved_newline() : print_newline(), print_token()
		}

		function handle_equals() {
			start_of_statement(), flags.declaration_statement && (flags.declaration_assignment = !0), output.space_before_token = !0, print_token(), output.space_before_token = !0
		}

		function handle_comma() {
			return flags.declaration_statement ? (is_expression(flags.parent.mode) && (flags.declaration_assignment = !1), print_token(), void(flags.declaration_assignment ? (flags.declaration_assignment = !1, print_newline(!1, !0)) : output.space_before_token = !0)) : (print_token(), void(flags.mode === MODE.ObjectLiteral || flags.mode === MODE.Statement && flags.parent.mode === MODE.ObjectLiteral ? (flags.mode === MODE.Statement && restore_mode(), print_newline()) : output.space_before_token = !0))
		}

		function handle_operator() {
			if (start_of_statement(), "TK_RESERVED" === last_type && is_special_word(flags.last_text)) return output.space_before_token = !0, void print_token();
			if ("*" === current_token.text && "TK_DOT" === last_type) return void print_token();
			if (":" === current_token.text && flags.in_case) return flags.case_body = !0, indent(), print_token(), print_newline(), void(flags.in_case = !1);
			if ("::" === current_token.text) return void print_token();
			!current_token.wanted_newline || "--" !== current_token.text && "++" !== current_token.text || print_newline(!1, !0), "TK_OPERATOR" === last_type && allow_wrap_or_preserved_newline();
			var space_before = !0,
				space_after = !0;
			in_array(current_token.text, ["--", "++", "!", "~"]) || in_array(current_token.text, ["-", "+"]) && (in_array(last_type, ["TK_START_BLOCK", "TK_START_EXPR", "TK_EQUALS", "TK_OPERATOR"]) || in_array(flags.last_text, Tokenizer.line_starters) || "," === flags.last_text) ? (space_before = !1, space_after = !1, ";" === flags.last_text && is_expression(flags.mode) && (space_before = !0), "TK_RESERVED" === last_type || "TK_END_EXPR" === last_type ? space_before = !0 : "TK_OPERATOR" === last_type && (space_before = in_array(current_token.text, ["--", "-"]) && in_array(flags.last_text, ["--", "-"]) || in_array(current_token.text, ["++", "+"]) && in_array(flags.last_text, ["++", "+"])), flags.mode !== MODE.BlockStatement && flags.mode !== MODE.Statement || "{" !== flags.last_text && ";" !== flags.last_text || print_newline()) : ":" === current_token.text ? 0 === flags.ternary_depth ? space_before = !1 : flags.ternary_depth -= 1 : "?" === current_token.text ? flags.ternary_depth += 1 : "*" === current_token.text && "TK_RESERVED" === last_type && "function" === flags.last_text && (space_before = !1, space_after = !1), output.space_before_token = output.space_before_token || space_before, print_token(), output.space_before_token = space_after
		}

		function handle_block_comment() {
			var j, lines = split_newlines(current_token.text),
				javadoc = !1,
				starless = !1,
				lastIndent = current_token.whitespace_before,
				lastIndentLength = lastIndent.length;
			for (print_newline(!1, !0), lines.length > 1 && (all_lines_start_with(lines.slice(1), "*") ? javadoc = !0 : each_line_matches_indent(lines.slice(1), lastIndent) && (starless = !0)), print_token(lines[0]), j = 1; j < lines.length; j++) print_newline(!1, !0), javadoc ? print_token(" " + trim(lines[j])) : starless && lines[j].length > lastIndentLength ? print_token(lines[j].substring(lastIndentLength)) : output.add_token(lines[j]);
			print_newline(!1, !0)
		}

		function handle_inline_comment() {
			output.space_before_token = !0, print_token(), output.space_before_token = !0
		}

		function handle_comment() {
			current_token.wanted_newline ? print_newline(!1, !0) : output.trim(!0), output.space_before_token = !0, print_token(), print_newline(!1, !0)
		}

		function handle_dot() {
			start_of_statement(), "TK_RESERVED" === last_type && is_special_word(flags.last_text) ? output.space_before_token = !0 : allow_wrap_or_preserved_newline(")" === flags.last_text && opt.break_chained_methods), print_token()
		}

		function handle_unknown() {
			print_token(), "\n" === current_token.text[current_token.text.length - 1] && print_newline()
		}

		function handle_eof() {
			for (; flags.mode === MODE.Statement;) restore_mode()
		}
		var output, token_pos, Tokenizer, current_token, last_type, last_last_text, indent_string, flags, previous_flags, flag_store, prefix, handlers, opt, tokens = [],
			baseIndentString = "";
		for (handlers = {
				TK_START_EXPR: handle_start_expr,
				TK_END_EXPR: handle_end_expr,
				TK_START_BLOCK: handle_start_block,
				TK_END_BLOCK: handle_end_block,
				TK_WORD: handle_word,
				TK_RESERVED: handle_word,
				TK_SEMICOLON: handle_semicolon,
				TK_STRING: handle_string,
				TK_EQUALS: handle_equals,
				TK_OPERATOR: handle_operator,
				TK_COMMA: handle_comma,
				TK_BLOCK_COMMENT: handle_block_comment,
				TK_INLINE_COMMENT: handle_inline_comment,
				TK_COMMENT: handle_comment,
				TK_DOT: handle_dot,
				TK_UNKNOWN: handle_unknown,
				TK_EOF: handle_eof
			}, options = options ? options : {}, opt = {}, void 0 !== options.braces_on_own_line && (opt.brace_style = options.braces_on_own_line ? "expand" : "collapse"), opt.brace_style = options.brace_style ? options.brace_style : opt.brace_style ? opt.brace_style : "collapse", "expand-strict" === opt.brace_style && (opt.brace_style = "expand"), opt.indent_size = options.indent_size ? parseInt(options.indent_size, 10) : 4, opt.indent_char = options.indent_char ? options.indent_char : " ", opt.preserve_newlines = void 0 === options.preserve_newlines ? !0 : options.preserve_newlines, opt.break_chained_methods = void 0 === options.break_chained_methods ? !1 : options.break_chained_methods, opt.max_preserve_newlines = void 0 === options.max_preserve_newlines ? 0 : parseInt(options.max_preserve_newlines, 10), opt.space_in_paren = void 0 === options.space_in_paren ? !1 : options.space_in_paren, opt.space_in_empty_paren = void 0 === options.space_in_empty_paren ? !1 : options.space_in_empty_paren, opt.jslint_happy = void 0 === options.jslint_happy ? !1 : options.jslint_happy, opt.space_after_anon_function = void 0 === options.space_after_anon_function ? !1 : options.space_after_anon_function, opt.keep_array_indentation = void 0 === options.keep_array_indentation ? !1 : options.keep_array_indentation, opt.space_before_conditional = void 0 === options.space_before_conditional ? !0 : options.space_before_conditional, opt.unescape_strings = void 0 === options.unescape_strings ? !1 : options.unescape_strings, opt.wrap_line_length = void 0 === options.wrap_line_length ? 0 : parseInt(options.wrap_line_length, 10), opt.e4x = void 0 === options.e4x ? !1 : options.e4x, opt.end_with_newline = void 0 === options.end_with_newline ? !1 : options.end_with_newline, opt.jslint_happy && (opt.space_after_anon_function = !0), options.indent_with_tabs && (opt.indent_char = "	", opt.indent_size = 1), indent_string = ""; opt.indent_size > 0;) indent_string += opt.indent_char, opt.indent_size -= 1;
		var preindent_index = 0;
		if (js_source_text && js_source_text.length) {
			for (;
				" " === js_source_text.charAt(preindent_index) || "	" === js_source_text.charAt(preindent_index);) baseIndentString += js_source_text.charAt(preindent_index), preindent_index += 1;
			js_source_text = js_source_text.substring(preindent_index)
		}
		last_type = "TK_START_BLOCK", last_last_text = "", output = new Output(indent_string, baseIndentString), flag_store = [], set_mode(MODE.BlockStatement), this.beautify = function() {
			var local_token, sweet_code;
			for (Tokenizer = new tokenizer(js_source_text, opt, indent_string), tokens = Tokenizer.tokenize(), token_pos = 0; local_token = get_token();) {
				for (var i = 0; i < local_token.comments_before.length; i++) handle_token(local_token.comments_before[i]);
				handle_token(local_token), last_last_text = flags.last_text, last_type = local_token.type, flags.last_text = local_token.text, token_pos += 1
			}
			return sweet_code = output.get_code(), opt.end_with_newline && (sweet_code += "\n"), sweet_code
		}
	}

	function OutputLine(parent) {
		var _character_count = 0,
			_indent_count = -1,
			_items = [],
			_empty = !0;
		this.set_indent = function(level) {
			_character_count = parent.baseIndentLength + level * parent.indent_length, _indent_count = level
		}, this.get_character_count = function() {
			return _character_count
		}, this.is_empty = function() {
			return _empty
		}, this.last = function() {
			return this._empty ? null : _items[_items.length - 1]
		}, this.push = function(input) {
			_items.push(input), _character_count += input.length, _empty = !1
		}, this.remove_indent = function() {
			_indent_count > 0 && (_indent_count -= 1, _character_count -= parent.indent_length)
		}, this.trim = function() {
			for (;
				" " === this.last();) {
				{
					_items.pop()
				}
				_character_count -= 1
			}
			_empty = 0 === _items.length
		}, this.toString = function() {
			var result = "";
			return this._empty || (_indent_count >= 0 && (result = parent.indent_cache[_indent_count]), result += _items.join("")), result
		}
	}

	function Output(indent_string, baseIndentString) {
		baseIndentString = baseIndentString || "", this.indent_cache = [baseIndentString], this.baseIndentLength = baseIndentString.length, this.indent_length = indent_string.length;
		var lines = [];
		this.baseIndentString = baseIndentString, this.indent_string = indent_string, this.current_line = null, this.space_before_token = !1, this.get_line_number = function() {
			return lines.length
		}, this.add_new_line = function(force_newline) {
			return 1 === this.get_line_number() && this.just_added_newline() ? !1 : force_newline || !this.just_added_newline() ? (this.current_line = new OutputLine(this), lines.push(this.current_line), !0) : !1
		}, this.add_new_line(!0), this.get_code = function() {
			var sweet_code = lines.join("\n").replace(/[\r\n\t ]+$/, "");
			return sweet_code
		}, this.set_indent = function(level) {
			if (lines.length > 1) {
				for (; level >= this.indent_cache.length;) this.indent_cache.push(this.indent_cache[this.indent_cache.length - 1] + this.indent_string);
				return this.current_line.set_indent(level), !0
			}
			return this.current_line.set_indent(0), !1
		}, this.add_token = function(printable_token) {
			this.add_space_before_token(), this.current_line.push(printable_token)
		}, this.add_space_before_token = function() {
			this.space_before_token && !this.just_added_newline() && this.current_line.push(" "), this.space_before_token = !1
		}, this.remove_redundant_indentation = function(frame) {
			if (!frame.multiline_frame && frame.mode !== MODE.ForInitializer && frame.mode !== MODE.Conditional)
				for (var index = frame.start_line_index, output_length = lines.length; output_length > index;) lines[index].remove_indent(), index++
		}, this.trim = function(eat_newlines) {
			for (eat_newlines = void 0 === eat_newlines ? !1 : eat_newlines, this.current_line.trim(indent_string, baseIndentString); eat_newlines && lines.length > 1 && this.current_line.is_empty();) lines.pop(), this.current_line = lines[lines.length - 1], this.current_line.trim()
		}, this.just_added_newline = function() {
			return this.current_line.is_empty()
		}, this.just_added_blankline = function() {
			if (this.just_added_newline()) {
				if (1 === lines.length) return !0;
				var line = lines[lines.length - 2];
				return line.is_empty()
			}
			return !1
		}
	}

	function tokenizer(input, opts, indent_string) {
		function tokenize_next() {
			var resulting_string, whitespace_on_this_line = [];
			if (n_newlines = 0, whitespace_before_token = "", parser_pos >= input_length) return ["", "TK_EOF"];
			var last_token;
			last_token = tokens.length ? tokens[tokens.length - 1] : new Token("TK_START_BLOCK", "{");
			var c = input.charAt(parser_pos);
			for (parser_pos += 1; in_array(c, whitespace);) {
				if ("\n" === c ? (n_newlines += 1, whitespace_on_this_line = []) : n_newlines && (c === indent_string ? whitespace_on_this_line.push(indent_string) : "\r" !== c && whitespace_on_this_line.push(" ")), parser_pos >= input_length) return ["", "TK_EOF"];
				c = input.charAt(parser_pos), parser_pos += 1
			}
			if (whitespace_on_this_line.length && (whitespace_before_token = whitespace_on_this_line.join("")), digit.test(c)) {
				var allow_decimal = !0,
					allow_e = !0,
					local_digit = digit;
				for ("0" === c && input_length > parser_pos && /[Xx]/.test(input.charAt(parser_pos)) ? (allow_decimal = !1, allow_e = !1, c += input.charAt(parser_pos), parser_pos += 1, local_digit = /[0123456789abcdefABCDEF]/) : (c = "", parser_pos -= 1); input_length > parser_pos && local_digit.test(input.charAt(parser_pos));) c += input.charAt(parser_pos), parser_pos += 1, allow_decimal && input_length > parser_pos && "." === input.charAt(parser_pos) && (c += input.charAt(parser_pos), parser_pos += 1, allow_decimal = !1), allow_e && input_length > parser_pos && /[Ee]/.test(input.charAt(parser_pos)) && (c += input.charAt(parser_pos), parser_pos += 1, input_length > parser_pos && /[+-]/.test(input.charAt(parser_pos)) && (c += input.charAt(parser_pos), parser_pos += 1), allow_e = !1, allow_decimal = !1);
				return [c, "TK_WORD"]
			}
			if (acorn.isIdentifierStart(input.charCodeAt(parser_pos - 1))) {
				if (input_length > parser_pos)
					for (; acorn.isIdentifierChar(input.charCodeAt(parser_pos)) && (c += input.charAt(parser_pos), parser_pos += 1, parser_pos !== input_length););
				return "TK_DOT" === last_token.type || "TK_RESERVED" === last_token.type && in_array(last_token.text, ["set", "get"]) || !in_array(c, reserved_words) ? [c, "TK_WORD"] : "in" === c ? [c, "TK_OPERATOR"] : [c, "TK_RESERVED"]
			}
			if ("(" === c || "[" === c) return [c, "TK_START_EXPR"];
			if (")" === c || "]" === c) return [c, "TK_END_EXPR"];
			if ("{" === c) return [c, "TK_START_BLOCK"];
			if ("}" === c) return [c, "TK_END_BLOCK"];
			if (";" === c) return [c, "TK_SEMICOLON"];
			if ("/" === c) {
				var comment = "",
					inline_comment = !0;
				if ("*" === input.charAt(parser_pos)) {
					if (parser_pos += 1, input_length > parser_pos)
						for (; input_length > parser_pos && ("*" !== input.charAt(parser_pos) || !input.charAt(parser_pos + 1) || "/" !== input.charAt(parser_pos + 1)) && (c = input.charAt(parser_pos), comment += c, ("\n" === c || "\r" === c) && (inline_comment = !1), parser_pos += 1, !(parser_pos >= input_length)););
					return parser_pos += 2, inline_comment && 0 === n_newlines ? ["/*" + comment + "*/", "TK_INLINE_COMMENT"] : ["/*" + comment + "*/", "TK_BLOCK_COMMENT"]
				}
				if ("/" === input.charAt(parser_pos)) {
					for (comment = c;
						"\r" !== input.charAt(parser_pos) && "\n" !== input.charAt(parser_pos) && (comment += input.charAt(parser_pos), parser_pos += 1, !(parser_pos >= input_length)););
					return [comment, "TK_COMMENT"]
				}
			}
			if ("`" === c || "'" === c || '"' === c || ("/" === c || opts.e4x && "<" === c && input.slice(parser_pos - 1).match(/^<([-a-zA-Z:0-9_.]+|{[^{}]*}|!\[CDATA\[[\s\S]*?\]\])\s*([-a-zA-Z:0-9_.]+=('[^']*'|"[^"]*"|{[^{}]*})\s*)*\/?\s*>/)) && ("TK_RESERVED" === last_token.type && in_array(last_token.text, ["return", "case", "throw", "else", "do", "typeof", "yield"]) || "TK_END_EXPR" === last_token.type && ")" === last_token.text && last_token.parent && "TK_RESERVED" === last_token.parent.type && in_array(last_token.parent.text, ["if", "while", "for"]) || in_array(last_token.type, ["TK_COMMENT", "TK_START_EXPR", "TK_START_BLOCK", "TK_END_BLOCK", "TK_OPERATOR", "TK_EQUALS", "TK_EOF", "TK_SEMICOLON", "TK_COMMA"]))) {
				var sep = c,
					esc = !1,
					has_char_escapes = !1;
				if (resulting_string = c, "/" === sep)
					for (var in_char_class = !1; input_length > parser_pos && (esc || in_char_class || input.charAt(parser_pos) !== sep) && !acorn.newline.test(input.charAt(parser_pos));) resulting_string += input.charAt(parser_pos), esc ? esc = !1 : (esc = "\\" === input.charAt(parser_pos), "[" === input.charAt(parser_pos) ? in_char_class = !0 : "]" === input.charAt(parser_pos) && (in_char_class = !1)), parser_pos += 1;
				else if (opts.e4x && "<" === sep) {
					var xmlRegExp = /<(\/?)([-a-zA-Z:0-9_.]+|{[^{}]*}|!\[CDATA\[[\s\S]*?\]\])\s*([-a-zA-Z:0-9_.]+=('[^']*'|"[^"]*"|{[^{}]*})\s*)*(\/?)\s*>/g,
						xmlStr = input.slice(parser_pos - 1),
						match = xmlRegExp.exec(xmlStr);
					if (match && 0 === match.index) {
						for (var rootTag = match[2], depth = 0; match;) {
							var isEndTag = !!match[1],
								tagName = match[2],
								isSingletonTag = !!match[match.length - 1] || "![CDATA[" === tagName.slice(0, 8);
							if (tagName !== rootTag || isSingletonTag || (isEndTag ? --depth : ++depth), 0 >= depth) break;
							match = xmlRegExp.exec(xmlStr)
						}
						var xmlLength = match ? match.index + match[0].length : xmlStr.length;
						return parser_pos += xmlLength - 1, [xmlStr.slice(0, xmlLength), "TK_STRING"]
					}
				} else
					for (; input_length > parser_pos && (esc || input.charAt(parser_pos) !== sep && ("`" === sep || !acorn.newline.test(input.charAt(parser_pos))));) resulting_string += input.charAt(parser_pos), esc ? (("x" === input.charAt(parser_pos) || "u" === input.charAt(parser_pos)) && (has_char_escapes = !0), esc = !1) : esc = "\\" === input.charAt(parser_pos), parser_pos += 1;
				if (has_char_escapes && opts.unescape_strings && (resulting_string = unescape_string(resulting_string)), input_length > parser_pos && input.charAt(parser_pos) === sep && (resulting_string += sep, parser_pos += 1, "/" === sep))
					for (; input_length > parser_pos && acorn.isIdentifierStart(input.charCodeAt(parser_pos));) resulting_string += input.charAt(parser_pos), parser_pos += 1;
				return [resulting_string, "TK_STRING"]
			}
			if ("#" === c) {
				if (0 === tokens.length && "!" === input.charAt(parser_pos)) {
					for (resulting_string = c; input_length > parser_pos && "\n" !== c;) c = input.charAt(parser_pos), resulting_string += c, parser_pos += 1;
					return [trim(resulting_string) + "\n", "TK_UNKNOWN"]
				}
				var sharp = "#";
				if (input_length > parser_pos && digit.test(input.charAt(parser_pos))) {
					do c = input.charAt(parser_pos), sharp += c, parser_pos += 1; while (input_length > parser_pos && "#" !== c && "=" !== c);
					return "#" === c || ("[" === input.charAt(parser_pos) && "]" === input.charAt(parser_pos + 1) ? (sharp += "[]", parser_pos += 2) : "{" === input.charAt(parser_pos) && "}" === input.charAt(parser_pos + 1) && (sharp += "{}", parser_pos += 2)), [sharp, "TK_WORD"]
				}
			}
			if ("<" === c && "<!--" === input.substring(parser_pos - 1, parser_pos + 3)) {
				for (parser_pos += 3, c = "<!--";
					"\n" !== input.charAt(parser_pos) && input_length > parser_pos;) c += input.charAt(parser_pos), parser_pos++;
				return in_html_comment = !0, [c, "TK_COMMENT"]
			}
			if ("-" === c && in_html_comment && "-->" === input.substring(parser_pos - 1, parser_pos + 2)) return in_html_comment = !1, parser_pos += 2, ["-->", "TK_COMMENT"];
			if ("." === c) return [c, "TK_DOT"];
			if (in_array(c, punct)) {
				for (; input_length > parser_pos && in_array(c + input.charAt(parser_pos), punct) && (c += input.charAt(parser_pos), parser_pos += 1, !(parser_pos >= input_length)););
				return "," === c ? [c, "TK_COMMA"] : "=" === c ? [c, "TK_EQUALS"] : [c, "TK_OPERATOR"]
			}
			return [c, "TK_UNKNOWN"]
		}

		function unescape_string(s) {
			for (var c, esc = !1, out = "", pos = 0, s_hex = "", escaped = 0; esc || pos < s.length;)
				if (c = s.charAt(pos), pos++, esc) {
					if (esc = !1, "x" === c) s_hex = s.substr(pos, 2), pos += 2;
					else {
						if ("u" !== c) {
							out += "\\" + c;
							continue
						}
						s_hex = s.substr(pos, 4), pos += 4
					}
					if (!s_hex.match(/^[0123456789abcdefABCDEF]+$/)) return s;
					if (escaped = parseInt(s_hex, 16), escaped >= 0 && 32 > escaped) {
						out += "x" === c ? "\\x" + s_hex : "\\u" + s_hex;
						continue
					}
					if (34 === escaped || 39 === escaped || 92 === escaped) out += "\\" + String.fromCharCode(escaped);
					else {
						if ("x" === c && escaped > 126 && 255 >= escaped) return s;
						out += String.fromCharCode(escaped)
					}
				} else "\\" === c ? esc = !0 : out += c;
			return out
		}
		var whitespace = "\n\r	 ".split(""),
			digit = /[0-9]/,
			punct = "+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! ~ , : ? ^ ^= |= :: => <%= <% %> <?= <? ?>".split(" ");
		this.line_starters = "continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,yield,import,export".split(",");
		var n_newlines, whitespace_before_token, in_html_comment, tokens, parser_pos, input_length, reserved_words = this.line_starters.concat(["do", "in", "else", "get", "set", "new", "catch", "finally", "typeof"]);
		this.tokenize = function() {
			input_length = input.length, parser_pos = 0, in_html_comment = !1, tokens = [];
			for (var next, last, token_values, open = null, open_stack = [], comments = []; !last || "TK_EOF" !== last.type;) {
				for (token_values = tokenize_next(), next = new Token(token_values[1], token_values[0], n_newlines, whitespace_before_token);
					"TK_INLINE_COMMENT" === next.type || "TK_COMMENT" === next.type || "TK_BLOCK_COMMENT" === next.type || "TK_UNKNOWN" === next.type;) comments.push(next), token_values = tokenize_next(), next = new Token(token_values[1], token_values[0], n_newlines, whitespace_before_token);
				comments.length && (next.comments_before = comments, comments = []), "TK_START_BLOCK" === next.type || "TK_START_EXPR" === next.type ? (next.parent = last, open = next, open_stack.push(next)) : ("TK_END_BLOCK" === next.type || "TK_END_EXPR" === next.type) && open && ("]" === next.text && "[" === open.text || ")" === next.text && "(" === open.text || "}" === next.text && "}" === open.text) && (next.parent = open.parent, open = open_stack.pop()), tokens.push(next), last = next
			}
			return tokens
		}
	}
	var acorn = {};
	! function(exports) {
		{
			var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",
				nonASCIIidentifierChars = "̀-ͯ҃-֑҇-ׇֽֿׁׂׅׄؐ-ؚؠ-ىٲ-ۓۧ-ۨۻ-ۼܰ-݊ࠀ-ࠔࠛ-ࠣࠥ-ࠧࠩ-࠭ࡀ-ࡗࣤ-ࣾऀ-ःऺ-़ा-ॏ॑-ॗॢ-ॣ०-९ঁ-ঃ়া-ৄেৈৗয়-ৠਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢ-ૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୟ-ୠ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఁ-ఃె-ైొ-్ౕౖౢ-ౣ౦-౯ಂಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢ-ೣ೦-೯ംഃെ-ൈൗൢ-ൣ൦-൯ංඃ්ා-ුූෘ-ෟෲෳิ-ฺเ-ๅ๐-๙ິ-ູ່-ໍ໐-໙༘༙༠-༩༹༵༷ཁ-ཇཱ-྄྆-྇ྍ-ྗྙ-ྼ࿆က-ဩ၀-၉ၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟ᜎ-ᜐᜠ-ᜰᝀ-ᝐᝲᝳក-ឲ៝០-៩᠋-᠍᠐-᠙ᤠ-ᤫᤰ-᤻ᥑ-ᥭᦰ-ᧀᧈ-ᧉ᧐-᧙ᨀ-ᨕᨠ-ᩓ᩠-᩿᩼-᪉᪐-᪙ᭆ-ᭋ᭐-᭙᭫-᭳᮰-᮹᯦-᯳ᰀ-ᰢ᱀-᱉ᱛ-ᱽ᳐-᳒ᴀ-ᶾḁ-ἕ‌‍‿⁀⁔⃐-⃥⃜⃡-⃰ⶁ-ⶖⷠ-ⷿ〡-〨゙゚Ꙁ-ꙭꙴ-꙽ꚟ꛰-꛱ꟸ-ꠀ꠆ꠋꠣ-ꠧꢀ-ꢁꢴ-꣄꣐-꣙ꣳ-ꣷ꤀-꤉ꤦ-꤭ꤰ-ꥅꦀ-ꦃ꦳-꧀ꨀ-ꨧꩀ-ꩁꩌ-ꩍ꩐-꩙ꩻꫠ-ꫩꫲ-ꫳꯀ-ꯡ꯬꯭꯰-꯹ﬠ-ﬨ︀-️︠-︦︳︴﹍-﹏０-９＿",
				nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]"),
				nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
			exports.newline = /[\n\r\u2028\u2029]/, exports.isIdentifierStart = function(code) {
				return 65 > code ? 36 === code : 91 > code ? !0 : 97 > code ? 95 === code : 123 > code ? !0 : code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code))
			}, exports.isIdentifierChar = function(code) {
				return 48 > code ? 36 === code : 58 > code ? !0 : 65 > code ? !1 : 91 > code ? !0 : 97 > code ? 95 === code : 123 > code ? !0 : code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code))
			}
		}
	}(acorn);
	var MODE = {
			BlockStatement: "BlockStatement",
			Statement: "Statement",
			ObjectLiteral: "ObjectLiteral",
			ArrayLiteral: "ArrayLiteral",
			ForInitializer: "ForInitializer",
			Conditional: "Conditional",
			Expression: "Expression"
		},
		Token = function(type, text, newlines, whitespace_before) {
			this.type = type, this.text = text, this.comments_before = [], this.newlines = newlines || 0, this.wanted_newline = newlines > 0, this.whitespace_before = whitespace_before || "", this.parent = null
		};
	"function" == typeof define && define.amd ? define([], function() {
		return {
			js_beautify: js_beautify
		}
	}) : "undefined" != typeof exports ? exports.js_beautify = js_beautify : "undefined" != typeof window ? window.js_beautify = js_beautify : "undefined" != typeof global && (global.js_beautify = js_beautify)
}(),
function() {
	function css_beautify(source_text, options) {
		function next() {
			return ch = source_text.charAt(++pos), ch || ""
		}

		function peek(skipWhitespace) {
			var prev_pos = pos;
			return skipWhitespace && eatWhitespace(), result = source_text.charAt(pos + 1) || "", pos = prev_pos - 1, next(), result
		}

		function eatString(endChars) {
			for (var start = pos; next();)
				if ("\\" === ch) next();
				else {
					if (-1 !== endChars.indexOf(ch)) break;
					if ("\n" === ch) break
				}
			return source_text.substring(start, pos + 1)
		}

		function peekString(endChar) {
			var prev_pos = pos,
				str = eatString(endChar);
			return pos = prev_pos - 1, next(), str
		}

		function eatWhitespace() {
			for (var result = ""; whiteRe.test(peek());) next(), result += ch;
			return result
		}

		function skipWhitespace() {
			var result = "";
			for (ch && whiteRe.test(ch) && (result = ch); whiteRe.test(next());) result += ch;
			return result
		}

		function eatComment(singleLine) {
			var start = pos,
				singleLine = "/" === peek();
			for (next(); next();) {
				if (!singleLine && "*" === ch && "/" === peek()) {
					next();
					break
				}
				if (singleLine && "\n" === ch) return source_text.substring(start, pos)
			}
			return source_text.substring(start, pos) + ch
		}

		function lookBack(str) {
			return source_text.substring(pos - str.length, pos).toLowerCase() === str
		}

		function foundNestedPseudoClass() {
			for (var i = pos + 1; i < source_text.length; i++) {
				var ch = source_text.charAt(i);
				if ("{" === ch) return !0;
				if (";" === ch || "}" === ch || ")" === ch) return !1
			}
			return !1
		}

		function indent() {
			indentLevel++, basebaseIndentString += singleIndent
		}

		function outdent() {
			indentLevel--, basebaseIndentString = basebaseIndentString.slice(0, -indentSize)
		}
		options = options || {};
		var indentSize = options.indent_size || 4,
			indentCharacter = options.indent_char || " ",
			selectorSeparatorNewline = void 0 === options.selector_separator_newline ? !0 : options.selector_separator_newline,
			end_with_newline = void 0 === options.end_with_newline ? !1 : options.end_with_newline,
			newline_between_rules = void 0 === options.newline_between_rules ? !0 : options.newline_between_rules;
		"string" == typeof indentSize && (indentSize = parseInt(indentSize, 10));
		var ch, whiteRe = /^\s+$/,
			pos = -1,
			basebaseIndentString = source_text.match(/^[\t ]*/)[0],
			singleIndent = new Array(indentSize + 1).join(indentCharacter),
			indentLevel = 0,
			nestedLevel = 0,
			print = {};
		print["{"] = function(ch) {
			print.singleSpace(), output.push(ch), print.newLine()
		}, print["}"] = function(ch) {
			print.newLine(), output.push(ch), print.newLine()
		}, print._lastCharWhitespace = function() {
			return whiteRe.test(output[output.length - 1])
		}, print.newLine = function(keepWhitespace) {
			keepWhitespace || print.trim(), output.length && output.push("\n"), basebaseIndentString && output.push(basebaseIndentString)
		}, print.singleSpace = function() {
			output.length && !print._lastCharWhitespace() && output.push(" ")
		}, print.trim = function() {
			for (; print._lastCharWhitespace();) output.pop()
		};
		var output = [];
		basebaseIndentString && output.push(basebaseIndentString);
		for (var insideRule = !1, enteringConditionalGroup = !1, top_ch = "", last_top_ch = "";;) {
			var whitespace = skipWhitespace(),
				isAfterSpace = "" !== whitespace,
				isAfterNewline = -1 !== whitespace.indexOf("\n"),
				last_top_ch = top_ch,
				top_ch = ch;
			if (!ch) break;
			if ("/" === ch && "*" === peek()) {
				var header = lookBack("");
				print.newLine(), output.push(eatComment()), print.newLine(), header && print.newLine(!0)
			} else if ("/" === ch && "/" === peek()) isAfterNewline || "{" === last_top_ch || print.trim(), print.singleSpace(), output.push(eatComment()), print.newLine();
			else if ("@" === ch) {
				isAfterSpace && print.singleSpace(), output.push(ch);
				var variableOrRule = peekString(": ,;{}()[]/='\"").replace(/\s$/, "");
				variableOrRule in css_beautify.NESTED_AT_RULE ? (nestedLevel += 1, variableOrRule in css_beautify.CONDITIONAL_GROUP_RULE && (enteringConditionalGroup = !0)) : ": ".indexOf(variableOrRule[variableOrRule.length - 1]) >= 0 && (next(), variableOrRule = eatString(": ").replace(/\s$/, ""), output.push(variableOrRule), print.singleSpace())
			} else "{" === ch ? "}" === peek(!0) ? (eatWhitespace(), next(), print.singleSpace(), output.push("{}"), print.newLine(), newline_between_rules && 0 === indentLevel && print.newLine(!0)) : (indent(), print["{"](ch), enteringConditionalGroup ? (enteringConditionalGroup = !1, insideRule = indentLevel > nestedLevel) : insideRule = indentLevel >= nestedLevel) : "}" === ch ? (outdent(), print["}"](ch), insideRule = !1, nestedLevel && nestedLevel--, newline_between_rules && 0 === indentLevel && print.newLine(!0)) : ":" === ch ? (eatWhitespace(), !insideRule && !enteringConditionalGroup || lookBack("&") || foundNestedPseudoClass() ? ":" === peek() ? (next(), output.push("::")) : output.push(":") : (output.push(":"), print.singleSpace())) : '"' === ch || "'" === ch ? (isAfterSpace && print.singleSpace(), output.push(eatString(ch))) : ";" === ch ? (output.push(ch), print.newLine()) : "(" === ch ? lookBack("url") ? (output.push(ch), eatWhitespace(), next() && (")" !== ch && '"' !== ch && "'" !== ch ? output.push(eatString(")")) : pos--)) : (isAfterSpace && print.singleSpace(), output.push(ch), eatWhitespace()) : ")" === ch ? output.push(ch) : "," === ch ? (output.push(ch), eatWhitespace(), !insideRule && selectorSeparatorNewline ? print.newLine() : print.singleSpace()) : "]" === ch ? output.push(ch) : "[" === ch ? (isAfterSpace && print.singleSpace(), output.push(ch)) : "=" === ch ? (eatWhitespace(), output.push(ch)) : (isAfterSpace && print.singleSpace(), output.push(ch))
		}
		var sweetCode = output.join("").replace(/[\r\n\t ]+$/, "");
		return end_with_newline && (sweetCode += "\n"), sweetCode
	}
	css_beautify.NESTED_AT_RULE = {
		"@page": !0,
		"@font-face": !0,
		"@keyframes": !0,
		"@media": !0,
		"@supports": !0,
		"@document": !0
	}, css_beautify.CONDITIONAL_GROUP_RULE = {
		"@media": !0,
		"@supports": !0,
		"@document": !0
	}, "function" == typeof define && define.amd ? define([], function() {
		return {
			css_beautify: css_beautify
		}
	}) : "undefined" != typeof exports ? exports.css_beautify = css_beautify : "undefined" != typeof window ? window.css_beautify = css_beautify : "undefined" != typeof global && (global.css_beautify = css_beautify)
}(),
function() {
	function ltrim(s) {
		return s.replace(/^\s+/g, "")
	}

	function rtrim(s) {
		return s.replace(/\s+$/g, "")
	}

	function style_html(html_source, options, js_beautify, css_beautify) {
		function Parser() {
			return this.pos = 0, this.token = "", this.current_mode = "CONTENT", this.tags = {
				parent: "parent1",
				parentcount: 1,
				parent1: ""
			}, this.tag_type = "", this.token_text = this.last_token = this.last_text = this.token_type = "", this.newlines = 0, this.indent_content = indent_inner_html, this.Utils = {
				whitespace: "\n\r	 ".split(""),
				single_token: "br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed,?php,?,?=".split(","),
				extra_liners: "head,body,/html".split(","),
				in_array: function(what, arr) {
					for (var i = 0; i < arr.length; i++)
						if (what === arr[i]) return !0;
					return !1
				}
			}, this.is_whitespace = function(text) {
				for (var n = 0; n < text.length; text++)
					if (!this.Utils.in_array(text.charAt(n), this.Utils.whitespace)) return !1;
				return !0
			}, this.traverse_whitespace = function() {
				var input_char = "";
				if (input_char = this.input.charAt(this.pos), this.Utils.in_array(input_char, this.Utils.whitespace)) {
					for (this.newlines = 0; this.Utils.in_array(input_char, this.Utils.whitespace);) preserve_newlines && "\n" === input_char && this.newlines <= max_preserve_newlines && (this.newlines += 1), this.pos++, input_char = this.input.charAt(this.pos);
					return !0
				}
				return !1
			}, this.space_or_wrap = function(content) {
				this.line_char_count >= this.wrap_line_length ? (this.print_newline(!1, content), this.print_indentation(content)) : (this.line_char_count++, content.push(" "))
			}, this.get_content = function() {
				for (var input_char = "", content = [];
					"<" !== this.input.charAt(this.pos);) {
					if (this.pos >= this.input.length) return content.length ? content.join("") : ["", "TK_EOF"];
					if (this.traverse_whitespace()) this.space_or_wrap(content);
					else {
						if (indent_handlebars) {
							var peek3 = this.input.substr(this.pos, 3);
							if ("{{#" === peek3 || "{{/" === peek3) break;
							if ("{{" === this.input.substr(this.pos, 2) && "{{else}}" === this.get_tag(!0)) break
						}
						input_char = this.input.charAt(this.pos), this.pos++, this.line_char_count++, content.push(input_char)
					}
				}
				return content.length ? content.join("") : ""
			}, this.get_contents_to = function(name) {
				if (this.pos === this.input.length) return ["", "TK_EOF"];
				var content = "",
					reg_match = new RegExp("</" + name + "\\s*>", "igm");
				reg_match.lastIndex = this.pos;
				var reg_array = reg_match.exec(this.input),
					end_script = reg_array ? reg_array.index : this.input.length;
				return this.pos < end_script && (content = this.input.substring(this.pos, end_script), this.pos = end_script), content
			}, this.record_tag = function(tag) {
				this.tags[tag + "count"] ? (this.tags[tag + "count"]++, this.tags[tag + this.tags[tag + "count"]] = this.indent_level) : (this.tags[tag + "count"] = 1, this.tags[tag + this.tags[tag + "count"]] = this.indent_level), this.tags[tag + this.tags[tag + "count"] + "parent"] = this.tags.parent, this.tags.parent = tag + this.tags[tag + "count"]
			}, this.retrieve_tag = function(tag) {
				if (this.tags[tag + "count"]) {
					for (var temp_parent = this.tags.parent; temp_parent && tag + this.tags[tag + "count"] !== temp_parent;) temp_parent = this.tags[temp_parent + "parent"];
					temp_parent && (this.indent_level = this.tags[tag + this.tags[tag + "count"]], this.tags.parent = this.tags[temp_parent + "parent"]), delete this.tags[tag + this.tags[tag + "count"] + "parent"], delete this.tags[tag + this.tags[tag + "count"]], 1 === this.tags[tag + "count"] ? delete this.tags[tag + "count"] : this.tags[tag + "count"]--
				}
			}, this.indent_to_tag = function(tag) {
				if (this.tags[tag + "count"]) {
					for (var temp_parent = this.tags.parent; temp_parent && tag + this.tags[tag + "count"] !== temp_parent;) temp_parent = this.tags[temp_parent + "parent"];
					temp_parent && (this.indent_level = this.tags[tag + this.tags[tag + "count"]])
				}
			}, this.get_tag = function(peek) {
				var tag_start, tag_end, tag_start_char, input_char = "",
					content = [],
					comment = "",
					space = !1,
					orig_pos = this.pos,
					orig_line_char_count = this.line_char_count;
				peek = void 0 !== peek ? peek : !1;
				do {
					if (this.pos >= this.input.length) return peek && (this.pos = orig_pos, this.line_char_count = orig_line_char_count), content.length ? content.join("") : ["", "TK_EOF"];
					if (input_char = this.input.charAt(this.pos), this.pos++, this.Utils.in_array(input_char, this.Utils.whitespace)) space = !0;
					else {
						if (("'" === input_char || '"' === input_char) && (input_char += this.get_unformatted(input_char), space = !0), "=" === input_char && (space = !1), content.length && "=" !== content[content.length - 1] && ">" !== input_char && space && (this.space_or_wrap(content), space = !1), indent_handlebars && "<" === tag_start_char && input_char + this.input.charAt(this.pos) === "{{" && (input_char += this.get_unformatted("}}"), content.length && " " !== content[content.length - 1] && "<" !== content[content.length - 1] && (input_char = " " + input_char), space = !0), "<" !== input_char || tag_start_char || (tag_start = this.pos - 1, tag_start_char = "<"), indent_handlebars && !tag_start_char && content.length >= 2 && "{" === content[content.length - 1] && "{" == content[content.length - 2] && (tag_start = "#" === input_char || "/" === input_char ? this.pos - 3 : this.pos - 2, tag_start_char = "{"), this.line_char_count++, content.push(input_char), content[1] && "!" === content[1]) {
							content = [this.get_comment(tag_start)];
							break
						}
						if (indent_handlebars && "{" === tag_start_char && content.length > 2 && "}" === content[content.length - 2] && "}" === content[content.length - 1]) break
					}
				} while (">" !== input_char);
				var tag_index, tag_offset, tag_complete = content.join("");
				tag_index = tag_complete.indexOf(-1 !== tag_complete.indexOf(" ") ? " " : "{" === tag_complete[0] ? "}" : ">"), tag_offset = "<" !== tag_complete[0] && indent_handlebars ? "#" === tag_complete[2] ? 3 : 2 : 1;
				var tag_check = tag_complete.substring(tag_offset, tag_index).toLowerCase();
				return "/" === tag_complete.charAt(tag_complete.length - 2) || this.Utils.in_array(tag_check, this.Utils.single_token) ? peek || (this.tag_type = "SINGLE") : indent_handlebars && "{" === tag_complete[0] && "else" === tag_check ? peek || (this.indent_to_tag("if"), this.tag_type = "HANDLEBARS_ELSE", this.indent_content = !0, this.traverse_whitespace()) : this.is_unformatted(tag_check, unformatted) ? (comment = this.get_unformatted("</" + tag_check + ">", tag_complete), content.push(comment), tag_end = this.pos - 1, this.tag_type = "SINGLE") : "script" === tag_check && (-1 === tag_complete.search("type") || tag_complete.search("type") > -1 && tag_complete.search(/\b(text|application)\/(x-)?(javascript|ecmascript|jscript|livescript)/) > -1) ? peek || (this.record_tag(tag_check), this.tag_type = "SCRIPT") : "style" === tag_check && (-1 === tag_complete.search("type") || tag_complete.search("type") > -1 && tag_complete.search("text/css") > -1) ? peek || (this.record_tag(tag_check), this.tag_type = "STYLE") : "!" === tag_check.charAt(0) ? peek || (this.tag_type = "SINGLE", this.traverse_whitespace()) : peek || ("/" === tag_check.charAt(0) ? (this.retrieve_tag(tag_check.substring(1)), this.tag_type = "END") : (this.record_tag(tag_check), "html" !== tag_check.toLowerCase() && (this.indent_content = !0), this.tag_type = "START"), this.traverse_whitespace() && this.space_or_wrap(content), this.Utils.in_array(tag_check, this.Utils.extra_liners) && (this.print_newline(!1, this.output), this.output.length && "\n" !== this.output[this.output.length - 2] && this.print_newline(!0, this.output))), peek && (this.pos = orig_pos, this.line_char_count = orig_line_char_count), content.join("")
			}, this.get_comment = function(start_pos) {
				var comment = "",
					delimiter = ">",
					matched = !1;
				for (this.pos = start_pos, input_char = this.input.charAt(this.pos), this.pos++; this.pos <= this.input.length && (comment += input_char, comment[comment.length - 1] !== delimiter[delimiter.length - 1] || -1 === comment.indexOf(delimiter));) !matched && comment.length < 10 && (0 === comment.indexOf("<![if") ? (delimiter = "<![endif]>", matched = !0) : 0 === comment.indexOf("<![cdata[") ? (delimiter = "]]>", matched = !0) : 0 === comment.indexOf("<![") ? (delimiter = "]>", matched = !0) : 0 === comment.indexOf("<!--") && (delimiter = "-->", matched = !0)), input_char = this.input.charAt(this.pos), this.pos++;
				return comment
			}, this.get_unformatted = function(delimiter, orig_tag) {
				if (orig_tag && -1 !== orig_tag.toLowerCase().indexOf(delimiter)) return "";
				var input_char = "",
					content = "",
					min_index = 0,
					space = !0;
				do {
					if (this.pos >= this.input.length) return content;
					if (input_char = this.input.charAt(this.pos), this.pos++, this.Utils.in_array(input_char, this.Utils.whitespace)) {
						if (!space) {
							this.line_char_count--;
							continue
						}
						if ("\n" === input_char || "\r" === input_char) {
							content += "\n", this.line_char_count = 0;
							continue
						}
					}
					content += input_char, this.line_char_count++, space = !0, indent_handlebars && "{" === input_char && content.length && "{" === content[content.length - 2] && (content += this.get_unformatted("}}"), min_index = content.length)
				} while (-1 === content.toLowerCase().indexOf(delimiter, min_index));
				return content
			}, this.get_token = function() {
				var token;
				if ("TK_TAG_SCRIPT" === this.last_token || "TK_TAG_STYLE" === this.last_token) {
					var type = this.last_token.substr(7);
					return token = this.get_contents_to(type), "string" != typeof token ? token : [token, "TK_" + type]
				}
				if ("CONTENT" === this.current_mode) return token = this.get_content(), "string" != typeof token ? token : [token, "TK_CONTENT"];
				if ("TAG" === this.current_mode) {
					if (token = this.get_tag(), "string" != typeof token) return token;
					var tag_name_type = "TK_TAG_" + this.tag_type;
					return [token, tag_name_type]
				}
			}, this.get_full_indent = function(level) {
				return level = this.indent_level + level || 0, 1 > level ? "" : Array(level + 1).join(this.indent_string)
			}, this.is_unformatted = function(tag_check, unformatted) {
				if (!this.Utils.in_array(tag_check, unformatted)) return !1;
				if ("a" !== tag_check.toLowerCase() || !this.Utils.in_array("a", unformatted)) return !0;
				var next_tag = this.get_tag(!0),
					tag = (next_tag || "").match(/^\s*<\s*\/?([a-z]*)\s*[^>]*>\s*$/);
				return !tag || this.Utils.in_array(tag, unformatted) ? !0 : !1
			}, this.printer = function(js_source, indent_character, indent_size, wrap_line_length, brace_style) {
				this.input = js_source || "", this.output = [], this.indent_character = indent_character, this.indent_string = "", this.indent_size = indent_size, this.brace_style = brace_style, this.indent_level = 0, this.wrap_line_length = wrap_line_length, this.line_char_count = 0;
				for (var i = 0; i < this.indent_size; i++) this.indent_string += this.indent_character;
				this.print_newline = function(force, arr) {
					this.line_char_count = 0, arr && arr.length && (force || "\n" !== arr[arr.length - 1]) && ("\n" !== arr[arr.length - 1] && (arr[arr.length - 1] = rtrim(arr[arr.length - 1])), arr.push("\n"))
				}, this.print_indentation = function(arr) {
					for (var i = 0; i < this.indent_level; i++) arr.push(this.indent_string), this.line_char_count += this.indent_string.length
				}, this.print_token = function(text) {
					(!this.is_whitespace(text) || this.output.length) && ((text || "" !== text) && this.output.length && "\n" === this.output[this.output.length - 1] && (this.print_indentation(this.output), text = ltrim(text)), this.print_token_raw(text))
				}, this.print_token_raw = function(text) {
					this.newlines > 0 && (text = rtrim(text)), text && "" !== text && (text.length > 1 && "\n" === text[text.length - 1] ? (this.output.push(text.slice(0, -1)), this.print_newline(!1, this.output)) : this.output.push(text));
					for (var n = 0; n < this.newlines; n++) this.print_newline(n > 0, this.output);
					this.newlines = 0
				}, this.indent = function() {
					this.indent_level++
				}, this.unindent = function() {
					this.indent_level > 0 && this.indent_level--
				}
			}, this
		}
		var multi_parser, indent_inner_html, indent_size, indent_character, wrap_line_length, brace_style, unformatted, preserve_newlines, max_preserve_newlines, indent_handlebars, end_with_newline;
		for (options = options || {}, void 0 !== options.wrap_line_length && 0 !== parseInt(options.wrap_line_length, 10) || void 0 === options.max_char || 0 === parseInt(options.max_char, 10) || (options.wrap_line_length = options.max_char), indent_inner_html = void 0 === options.indent_inner_html ? !1 : options.indent_inner_html, indent_size = void 0 === options.indent_size ? 4 : parseInt(options.indent_size, 10), indent_character = void 0 === options.indent_char ? " " : options.indent_char, brace_style = void 0 === options.brace_style ? "collapse" : options.brace_style, wrap_line_length = 0 === parseInt(options.wrap_line_length, 10) ? 32786 : parseInt(options.wrap_line_length || 250, 10), unformatted = options.unformatted || ["a", "span", "img", "bdo", "em", "strong", "dfn", "code", "samp", "kbd", "var", "cite", "abbr", "acronym", "q", "sub", "sup", "tt", "i", "b", "big", "small", "u", "s", "strike", "font", "ins", "del", "pre", "address", "dt", "h1", "h2", "h3", "h4", "h5", "h6"], preserve_newlines = void 0 === options.preserve_newlines ? !0 : options.preserve_newlines, max_preserve_newlines = preserve_newlines ? isNaN(parseInt(options.max_preserve_newlines, 10)) ? 32786 : parseInt(options.max_preserve_newlines, 10) : 0, indent_handlebars = void 0 === options.indent_handlebars ? !1 : options.indent_handlebars, end_with_newline = void 0 === options.end_with_newline ? !1 : options.end_with_newline, multi_parser = new Parser, multi_parser.printer(html_source, indent_character, indent_size, wrap_line_length, brace_style);;) {
			var t = multi_parser.get_token();
			if (multi_parser.token_text = t[0], multi_parser.token_type = t[1], "TK_EOF" === multi_parser.token_type) break;
			switch (multi_parser.token_type) {
				case "TK_TAG_START":
					multi_parser.print_newline(!1, multi_parser.output), multi_parser.print_token(multi_parser.token_text), multi_parser.indent_content && (multi_parser.indent(), multi_parser.indent_content = !1), multi_parser.current_mode = "CONTENT";
					break;
				case "TK_TAG_STYLE":
				case "TK_TAG_SCRIPT":
					multi_parser.print_newline(!1, multi_parser.output), multi_parser.print_token(multi_parser.token_text), multi_parser.current_mode = "CONTENT";
					break;
				case "TK_TAG_END":
					if ("TK_CONTENT" === multi_parser.last_token && "" === multi_parser.last_text) {
						var tag_name = multi_parser.token_text.match(/\w+/)[0],
							tag_extracted_from_last_output = null;
						multi_parser.output.length && (tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length - 1].match(/(?:<|{{#)\s*(\w+)/)), (null === tag_extracted_from_last_output || tag_extracted_from_last_output[1] !== tag_name) && multi_parser.print_newline(!1, multi_parser.output)
					}
					multi_parser.print_token(multi_parser.token_text), multi_parser.current_mode = "CONTENT";
					break;
				case "TK_TAG_SINGLE":
					var tag_check = multi_parser.token_text.match(/^\s*<([a-z-]+)/i);
					tag_check && multi_parser.Utils.in_array(tag_check[1], unformatted) || multi_parser.print_newline(!1, multi_parser.output), multi_parser.print_token(multi_parser.token_text), multi_parser.current_mode = "CONTENT";
					break;
				case "TK_TAG_HANDLEBARS_ELSE":
					multi_parser.print_token(multi_parser.token_text), multi_parser.indent_content && (multi_parser.indent(), multi_parser.indent_content = !1), multi_parser.current_mode = "CONTENT";
					break;
				case "TK_CONTENT":
					multi_parser.print_token(multi_parser.token_text), multi_parser.current_mode = "TAG";
					break;
				case "TK_STYLE":
				case "TK_SCRIPT":
					if ("" !== multi_parser.token_text) {
						multi_parser.print_newline(!1, multi_parser.output);
						var _beautifier, text = multi_parser.token_text,
							script_indent_level = 1;
						"TK_SCRIPT" === multi_parser.token_type ? _beautifier = "function" == typeof js_beautify && js_beautify : "TK_STYLE" === multi_parser.token_type && (_beautifier = "function" == typeof css_beautify && css_beautify), "keep" === options.indent_scripts ? script_indent_level = 0 : "separate" === options.indent_scripts && (script_indent_level = -multi_parser.indent_level);
						var indentation = multi_parser.get_full_indent(script_indent_level);
						if (_beautifier) text = _beautifier(text.replace(/^\s*/, indentation), options);
						else {
							var white = text.match(/^\s*/)[0],
								_level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1,
								reindent = multi_parser.get_full_indent(script_indent_level - _level);
							text = text.replace(/^\s*/, indentation).replace(/\r\n|\r|\n/g, "\n" + reindent).replace(/\s+$/, "")
						}
						text && (multi_parser.print_token_raw(text), multi_parser.print_newline(!0, multi_parser.output))
					}
					multi_parser.current_mode = "TAG";
					break;
				default:
					"" !== multi_parser.token_text && multi_parser.print_token(multi_parser.token_text)
			}
			multi_parser.last_token = multi_parser.token_type, multi_parser.last_text = multi_parser.token_text
		}
		var sweet_code = multi_parser.output.join("").replace(/[\r\n\t ]+$/, "");
		return end_with_newline && (sweet_code += "\n"), sweet_code
	}
	if ("function" == typeof define && define.amd) define(["require", "./beautify", "./beautify-css"], function(requireamd) {
		var js_beautify = requireamd("./beautify"),
			css_beautify = requireamd("./beautify-css");
		return {
			html_beautify: function(html_source, options) {
				return style_html(html_source, options, js_beautify.js_beautify, css_beautify.css_beautify)
			}
		}
	});
	else if ("undefined" != typeof exports) {
		var js_beautify = require("./beautify.js"),
			css_beautify = require("./beautify-css.js");
		exports.html_beautify = function(html_source, options) {
			return style_html(html_source, options, js_beautify.js_beautify, css_beautify.css_beautify)
		}
	} else "undefined" != typeof window ? window.html_beautify = function(html_source, options) {
		return style_html(html_source, options, window.js_beautify, window.css_beautify)
	} : "undefined" != typeof global && (global.html_beautify = function(html_source, options) {
		return style_html(html_source, options, global.js_beautify, global.css_beautify)
	})
}();
var JavascriptObfuscator = {
		detect: function(str) {
			return /^var _0x[a-f0-9]+ ?\= ?\[/.test(str)
		},
		unpack: function(str) {
			if (JavascriptObfuscator.detect(str)) {
				var matches = /var (_0x[a-f\d]+) ?\= ?\[(.*?)\];/.exec(str);
				if (matches) {
					var var_name = matches[1],
						strings = JavascriptObfuscator._smart_split(matches[2]);
					str = str.substring(matches[0].length);
					for (var k in strings) str = str.replace(new RegExp(var_name + "\\[" + k + "\\]", "g"), JavascriptObfuscator._fix_quotes(JavascriptObfuscator._unescape(strings[k])))
				}
			}
			return str
		},
		_fix_quotes: function(str) {
			var matches = /^"(.*)"$/.exec(str);
			return matches && (str = matches[1], str = "'" + str.replace(/'/g, "\\'") + "'"), str
		},
		_smart_split: function(str) {
			for (var strings = [], pos = 0; pos < str.length;) {
				if ('"' == str.charAt(pos)) {
					var word = "";
					for (pos += 1; pos < str.length && '"' != str.charAt(pos);) "\\" == str.charAt(pos) && (word += "\\", pos++), word += str.charAt(pos), pos++;
					strings.push('"' + word + '"')
				}
				pos += 1
			}
			return strings
		},
		_unescape: function(str) {
			for (var i = 32; 128 > i; i++) str = str.replace(new RegExp("\\\\x" + i.toString(16), "ig"), String.fromCharCode(i));
			return str = str.replace(/\\x09/g, "	")
		},
		run_tests: function(sanity_test) {
			var t = sanity_test || new SanityTest;
			return t.test_function(JavascriptObfuscator._smart_split, "JavascriptObfuscator._smart_split"), t.expect("", []), t.expect('"a", "b"', ['"a"', '"b"']), t.expect('"aaa","bbbb"', ['"aaa"', '"bbbb"']), t.expect('"a", "b\\""', ['"a"', '"b\\""']), t.test_function(JavascriptObfuscator._unescape, "JavascriptObfuscator._unescape"), t.expect("\\x40", "@"), t.expect("\\x10", "\\x10"), t.expect("\\x1", "\\x1"), t.expect("\\x61\\x62\\x22\\x63\\x64", 'ab"cd'), t.test_function(JavascriptObfuscator.detect, "JavascriptObfuscator.detect"), t.expect("", !1), t.expect("abcd", !1), t.expect("var _0xaaaa", !1), t.expect('var _0xaaaa = ["a", "b"]', !0), t.expect('var _0xaaaa=["a", "b"]', !0), t.expect('var _0x1234=["a","b"]', !0), t
		}
	},
	isNode = "undefined" != typeof module && module.exports;
if (isNode) var SanityTest = require(__dirname + "/../../test/sanitytest");
var Urlencoded = {
	detect: function(str) {
		if (-1 == str.indexOf(" ")) {
			if (-1 != str.indexOf("%2")) return !0;
			if (str.replace(/[^%]+/g, "").length > 3) return !0
		}
		return !1
	},
	unpack: function(str) {
		return Urlencoded.detect(str) ? unescape(-1 != str.indexOf("%2B") || -1 != str.indexOf("%2b") ? str.replace(/\+/g, "%20") : str) : str
	},
	run_tests: function(sanity_test) {
		var t = sanity_test || new SanityTest;
		return t.test_function(Urlencoded.detect, "Urlencoded.detect"), t.expect("", !1), t.expect("var a = b", !1), t.expect("var%20a+=+b", !0), t.expect("var%20a=b", !0), t.expect("var%20%21%22", !0), t.expect("javascript:(function(){var%20whatever={init:function(){alert(%22a%22+%22b%22)}};whatever.init()})();", !0), t.test_function(Urlencoded.unpack, "Urlencoded.unpack"), t.expect("javascript:(function(){var%20whatever={init:function(){alert(%22a%22+%22b%22)}};whatever.init()})();", 'javascript:(function(){var whatever={init:function(){alert("a"+"b")}};whatever.init()})();'), t.expect("", ""), t.expect("abcd", "abcd"), t.expect("var a = b", "var a = b"), t.expect("var%20a=b", "var a=b"), t.expect("var%20a=b+1", "var a=b+1"), t.expect("var%20a=b%2b1", "var a=b+1"), t
	}
};
isNode && (module.exports = Urlencoded);
var P_A_C_K_E_R = {
		detect: function(str) {
			return P_A_C_K_E_R.get_chunks(str).length > 0
		},
		get_chunks: function(str) {
			var chunks = str.match(/eval\(\(?function\(.*?(,0,\{\}\)\)|split\('\|'\)\)\))($|\n)/g);
			return chunks ? chunks : []
		},
		unpack: function(str) {
			for (var chunk, chunks = P_A_C_K_E_R.get_chunks(str), i = 0; i < chunks.length; i++) chunk = chunks[i].replace(/\n$/, ""), str = str.split(chunk).join(P_A_C_K_E_R.unpack_chunk(chunk));
			return str
		},
		unpack_chunk: function(str) {
			var unpacked_source = "",
				__eval = eval;
			if (P_A_C_K_E_R.detect(str)) try {
				eval = function(s) {
					return unpacked_source += s
				}, __eval(str), "string" == typeof unpacked_source && unpacked_source && (str = unpacked_source)
			} catch (e) {}
			return eval = __eval, str
		},
		run_tests: function(sanity_test) {
			var t = sanity_test || new SanityTest,
				pk1 = "eval(function(p,a,c,k,e,r){e=String;if(!''.replace(/^/,String)){while(c--)r[c]=k[c]||c;k=[function(e){return r[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('0 2=1',3,3,'var||a'.split('|'),0,{}))",
				unpk1 = "var a=1",
				pk2 = "eval(function(p,a,c,k,e,r){e=String;if(!''.replace(/^/,String)){while(c--)r[c]=k[c]||c;k=[function(e){return r[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('0 2=1',3,3,'foo||b'.split('|'),0,{}))",
				unpk2 = "foo b=1",
				pk_broken = "eval(function(p,a,c,k,e,r){BORKBORK;if(!''.replace(/^/,String)){while(c--)r[c]=k[c]||c;k=[function(e){return r[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('0 2=1',3,3,'var||a'.split('|'),0,{}))";
			pk3 = "eval(function(p,a,c,k,e,r){e=String;if(!''.replace(/^/,String)){while(c--)r[c]=k[c]||c;k=[function(e){return r[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('0 2=1{}))',3,3,'var||a'.split('|'),0,{}))", unpk3 = "var a=1{}))", t.test_function(P_A_C_K_E_R.detect, "P_A_C_K_E_R.detect"), t.expect("", !1), t.expect("var a = b", !1), t.test_function(P_A_C_K_E_R.unpack, "P_A_C_K_E_R.unpack"), t.expect(pk_broken, pk_broken), t.expect(pk1, unpk1), t.expect(pk2, unpk2), t.expect(pk3, unpk3);
			var filler = "\nfiller\n";
			return t.expect(filler + pk1 + "\n" + pk_broken + filler + pk2 + filler, filler + unpk1 + "\n" + pk_broken + filler + unpk2 + filler), t
		}
	},
	MyObfuscate = {
		detect: function(str) {
			return /^var _?[0O1lI]{3}\=('|\[).*\)\)\);/.test(str) ? !0 : /^function _?[0O1lI]{3}\(_/.test(str) && /eval\(/.test(str) ? !0 : !1
		},
		unpack: function(str) {
			if (MyObfuscate.detect(str)) {
				var __eval = eval;
				try {
					eval = function(unpacked) {
						if (MyObfuscate.starts_with(unpacked, "var _escape")) {
							var matches = /'([^']*)'/.exec(unpacked),
								unescaped = unescape(matches[1]);
							MyObfuscate.starts_with(unescaped, "<script>") && (unescaped = unescaped.substr(8, unescaped.length - 8)), MyObfuscate.ends_with(unescaped, "</script>") && (unescaped = unescaped.substr(0, unescaped.length - 9)), unpacked = unescaped
						}
						throw unpacked = "// Unpacker warning: be careful when using myobfuscate.com for your projects:\n// scripts obfuscated by the free online version may call back home.\n\n//\n" + unpacked
					}, __eval(str)
				} catch (e) {
					"string" == typeof e && (str = e)
				}
				eval = __eval
			}
			return str
		},
		starts_with: function(str, what) {
			return str.substr(0, what.length) === what
		},
		ends_with: function(str, what) {
			return str.substr(str.length - what.length, what.length) === what
		},
		run_tests: function(sanity_test) {
			var t = sanity_test || new SanityTest;
			return t
		}
	};
! function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function getHints(cm, options) {
		var tags = options && options.schemaInfo,
			quote = options && options.quoteChar || '"';
		if (tags) {
			var cur = cm.getCursor(),
				token = cm.getTokenAt(cur);
			token.end > cur.ch && (token.end = cur.ch, token.string = token.string.slice(0, cur.ch - token.start));
			var inner = CodeMirror.innerMode(cm.getMode(), token.state);
			if ("xml" == inner.mode.name) {
				var prefix, tagStart, result = [],
					replaceToken = !1,
					tag = /\btag\b/.test(token.type) && !/>$/.test(token.string),
					tagName = tag && /^\w/.test(token.string);
				if (tagName) {
					var before = cm.getLine(cur.line).slice(Math.max(0, token.start - 2), token.start),
						tagType = /<\/$/.test(before) ? "close" : /<$/.test(before) ? "open" : null;
					tagType && (tagStart = token.start - ("close" == tagType ? 2 : 1))
				} else tag && "<" == token.string ? tagType = "open" : tag && "</" == token.string && (tagType = "close");
				if (!tag && !inner.state.tagName || tagType) {
					tagName && (prefix = token.string), replaceToken = tagType;
					var cx = inner.state.context,
						curTag = cx && tags[cx.tagName],
						childList = cx ? curTag && curTag.children : tags["!top"];
					if (childList && "close" != tagType)
						for (var i = 0; i < childList.length; ++i) prefix && 0 != childList[i].lastIndexOf(prefix, 0) || result.push("<" + childList[i]);
					else if ("close" != tagType)
						for (var name in tags) !tags.hasOwnProperty(name) || "!top" == name || "!attrs" == name || prefix && 0 != name.lastIndexOf(prefix, 0) || result.push("<" + name);
					cx && (!prefix || "close" == tagType && 0 == cx.tagName.lastIndexOf(prefix, 0)) && result.push("</" + cx.tagName + ">")
				} else {
					var curTag = tags[inner.state.tagName],
						attrs = curTag && curTag.attrs,
						globalAttrs = tags["!attrs"];
					if (!attrs && !globalAttrs) return;
					if (attrs) {
						if (globalAttrs) {
							var set = {};
							for (var nm in globalAttrs) globalAttrs.hasOwnProperty(nm) && (set[nm] = globalAttrs[nm]);
							for (var nm in attrs) attrs.hasOwnProperty(nm) && (set[nm] = attrs[nm]);
							attrs = set
						}
					} else attrs = globalAttrs;
					if ("string" == token.type || "=" == token.string) {
						var atValues, before = cm.getRange(Pos(cur.line, Math.max(0, cur.ch - 60)), Pos(cur.line, "string" == token.type ? token.start : token.end)),
							atName = before.match(/([^\s\u00a0=<>\"\']+)=$/);
						if (!atName || !attrs.hasOwnProperty(atName[1]) || !(atValues = attrs[atName[1]])) return;
						if ("function" == typeof atValues && (atValues = atValues.call(this, cm)), "string" == token.type) {
							prefix = token.string;
							var n = 0;
							/['"]/.test(token.string.charAt(0)) && (quote = token.string.charAt(0), prefix = token.string.slice(1), n++);
							var len = token.string.length;
							/['"]/.test(token.string.charAt(len - 1)) && (quote = token.string.charAt(len - 1), prefix = token.string.substr(n, len - 2)), replaceToken = !0
						}
						for (var i = 0; i < atValues.length; ++i) prefix && 0 != atValues[i].lastIndexOf(prefix, 0) || result.push(quote + atValues[i] + quote)
					} else {
						"attribute" == token.type && (prefix = token.string, replaceToken = !0);
						for (var attr in attrs) !attrs.hasOwnProperty(attr) || prefix && 0 != attr.lastIndexOf(prefix, 0) || result.push(attr)
					}
				}
				return {
					list: result,
					from: replaceToken ? Pos(cur.line, null == tagStart ? token.start : tagStart) : cur,
					to: replaceToken ? Pos(cur.line, token.end) : cur
				}
			}
		}
	}
	var Pos = CodeMirror.Pos;
	CodeMirror.registerHelper("hint", "xml", getHints)
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function Completion(cm, options) {
		this.cm = cm, this.options = options, this.widget = null, this.debounce = 0, this.tick = 0, this.startPos = this.cm.getCursor("start"), this.startLen = this.cm.getLine(this.startPos.line).length - this.cm.getSelection().length;
		var self = this;
		cm.on("cursorActivity", this.activityFunc = function() {
			self.cursorActivity()
		})
	}

	function parseOptions(cm, pos, options) {
		var editor = cm.options.hintOptions,
			out = {};
		for (var prop in defaultOptions) out[prop] = defaultOptions[prop];
		if (editor)
			for (var prop in editor) void 0 !== editor[prop] && (out[prop] = editor[prop]);
		if (options)
			for (var prop in options) void 0 !== options[prop] && (out[prop] = options[prop]);
		return out.hint.resolve && (out.hint = out.hint.resolve(cm, pos)), out
	}

	function getText(completion) {
		return "string" == typeof completion ? completion : completion.text
	}

	function buildKeyMap(completion, handle) {
		function addBinding(key, val) {
			var bound;
			bound = "string" != typeof val ? function(cm) {
				return val(cm, handle)
			} : baseMap.hasOwnProperty(val) ? baseMap[val] : val, ourMap[key] = bound
		}
		var baseMap = {
				Up: function() {
					handle.moveFocus(-1)
				},
				Down: function() {
					handle.moveFocus(1)
				},
				PageUp: function() {
					handle.moveFocus(-handle.menuSize() + 1, !0)
				},
				PageDown: function() {
					handle.moveFocus(handle.menuSize() - 1, !0)
				},
				Home: function() {
					handle.setFocus(0)
				},
				End: function() {
					handle.setFocus(handle.length - 1)
				},
				Enter: handle.pick,
				Tab: handle.pick,
				Esc: handle.close
			},
			custom = completion.options.customKeys,
			ourMap = custom ? {} : baseMap;
		if (custom)
			for (var key in custom) custom.hasOwnProperty(key) && addBinding(key, custom[key]);
		var extra = completion.options.extraKeys;
		if (extra)
			for (var key in extra) extra.hasOwnProperty(key) && addBinding(key, extra[key]);
		return ourMap
	}

	function getHintElement(hintsElement, el) {
		for (; el && el != hintsElement;) {
			if ("LI" === el.nodeName.toUpperCase() && el.parentNode == hintsElement) return el;
			el = el.parentNode
		}
	}

	function Widget(completion, data) {
		this.completion = completion, this.data = data, this.picked = !1;
		var widget = this,
			cm = completion.cm,
			hints = this.hints = document.createElement("ul");
		hints.className = "CodeMirror-hints", this.selectedHint = data.selectedHint || 0;
		for (var completions = data.list, i = 0; i < completions.length; ++i) {
			var elt = hints.appendChild(document.createElement("li")),
				cur = completions[i],
				className = HINT_ELEMENT_CLASS + (i != this.selectedHint ? "" : " " + ACTIVE_HINT_ELEMENT_CLASS);
			null != cur.className && (className = cur.className + " " + className), elt.className = className, cur.render ? cur.render(elt, data, cur) : elt.appendChild(document.createTextNode(cur.displayText || getText(cur))), elt.hintId = i
		}
		var pos = cm.cursorCoords(completion.options.alignWithWord ? data.from : null),
			left = pos.left,
			top = pos.bottom,
			below = !0;
		hints.style.left = left + "px", hints.style.top = top + "px";
		var winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth),
			winH = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
		(completion.options.container || document.body).appendChild(hints);
		var box = hints.getBoundingClientRect(),
			overlapY = box.bottom - winH,
			scrolls = hints.scrollHeight > hints.clientHeight + 1,
			startScroll = cm.getScrollInfo();
		if (overlapY > 0) {
			var height = box.bottom - box.top,
				curTop = pos.top - (pos.bottom - box.top);
			if (curTop - height > 0) hints.style.top = (top = pos.top - height) + "px", below = !1;
			else if (height > winH) {
				hints.style.height = winH - 5 + "px", hints.style.top = (top = pos.bottom - box.top) + "px";
				var cursor = cm.getCursor();
				data.from.ch != cursor.ch && (pos = cm.cursorCoords(cursor), hints.style.left = (left = pos.left) + "px", box = hints.getBoundingClientRect())
			}
		}
		var overlapX = box.right - winW;
		if (overlapX > 0 && (box.right - box.left > winW && (hints.style.width = winW - 5 + "px", overlapX -= box.right - box.left - winW), hints.style.left = (left = pos.left - overlapX) + "px"), scrolls)
			for (var node = hints.firstChild; node; node = node.nextSibling) node.style.paddingRight = cm.display.nativeBarWidth + "px";
		if (cm.addKeyMap(this.keyMap = buildKeyMap(completion, {
				moveFocus: function(n, avoidWrap) {
					widget.changeActive(widget.selectedHint + n, avoidWrap)
				},
				setFocus: function(n) {
					widget.changeActive(n)
				},
				menuSize: function() {
					return widget.screenAmount()
				},
				length: completions.length,
				close: function() {
					completion.close()
				},
				pick: function() {
					widget.pick()
				},
				data: data
			})), completion.options.closeOnUnfocus) {
			var closingOnBlur;
			cm.on("blur", this.onBlur = function() {
				closingOnBlur = setTimeout(function() {
					completion.close()
				}, 100)
			}), cm.on("focus", this.onFocus = function() {
				clearTimeout(closingOnBlur)
			})
		}
		return cm.on("scroll", this.onScroll = function() {
			var curScroll = cm.getScrollInfo(),
				editor = cm.getWrapperElement().getBoundingClientRect(),
				newTop = top + startScroll.top - curScroll.top,
				point = newTop - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
			return below || (point += hints.offsetHeight), point <= editor.top || point >= editor.bottom ? completion.close() : (hints.style.top = newTop + "px", void(hints.style.left = left + startScroll.left - curScroll.left + "px"))
		}), CodeMirror.on(hints, "dblclick", function(e) {
			var t = getHintElement(hints, e.target || e.srcElement);
			t && null != t.hintId && (widget.changeActive(t.hintId), widget.pick())
		}), CodeMirror.on(hints, "click", function(e) {
			var t = getHintElement(hints, e.target || e.srcElement);
			t && null != t.hintId && (widget.changeActive(t.hintId), completion.options.completeOnSingleClick && widget.pick())
		}), CodeMirror.on(hints, "mousedown", function() {
			setTimeout(function() {
				cm.focus()
			}, 20)
		}), CodeMirror.signal(data, "select", completions[this.selectedHint], hints.childNodes[this.selectedHint]), !0
	}

	function applicableHelpers(cm, helpers) {
		if (!cm.somethingSelected()) return helpers;
		for (var result = [], i = 0; i < helpers.length; i++) helpers[i].supportsSelection && result.push(helpers[i]);
		return result
	}

	function fetchHints(hint, cm, options, callback) {
		if (hint.async) hint(cm, callback, options);
		else {
			var result = hint(cm, options);
			result && result.then ? result.then(callback) : callback(result)
		}
	}

	function resolveAutoHints(cm, pos) {
		var words, helpers = cm.getHelpers(pos, "hint");
		if (helpers.length) {
			var resolved = function(cm, callback, options) {
				function run(i) {
					return i == app.length ? callback(null) : void fetchHints(app[i], cm, options, function(result) {
						result && result.list.length > 0 ? callback(result) : run(i + 1)
					})
				}
				var app = applicableHelpers(cm, helpers);
				run(0)
			};
			return resolved.async = !0, resolved.supportsSelection = !0, resolved
		}
		return (words = cm.getHelper(cm.getCursor(), "hintWords")) ? function(cm) {
			return CodeMirror.hint.fromList(cm, {
				words: words
			})
		} : CodeMirror.hint.anyword ? function(cm, options) {
			return CodeMirror.hint.anyword(cm, options)
		} : function() {}
	}
	var HINT_ELEMENT_CLASS = "CodeMirror-hint",
		ACTIVE_HINT_ELEMENT_CLASS = "CodeMirror-hint-active";
	CodeMirror.showHint = function(cm, getHints, options) {
		if (!getHints) return cm.showHint(options);
		options && options.async && (getHints.async = !0);
		var newOpts = {
			hint: getHints
		};
		if (options)
			for (var prop in options) newOpts[prop] = options[prop];
		return cm.showHint(newOpts)
	}, CodeMirror.defineExtension("showHint", function(options) {
		options = parseOptions(this, this.getCursor("start"), options);
		var selections = this.listSelections();
		if (!(selections.length > 1)) {
			if (this.somethingSelected()) {
				if (!options.hint.supportsSelection) return;
				for (var i = 0; i < selections.length; i++)
					if (selections[i].head.line != selections[i].anchor.line) return
			}
			this.state.completionActive && this.state.completionActive.close();
			var completion = this.state.completionActive = new Completion(this, options);
			completion.options.hint && (CodeMirror.signal(this, "startCompletion", this), completion.update(!0))
		}
	});
	var requestAnimationFrame = window.requestAnimationFrame || function(fn) {
			return setTimeout(fn, 1e3 / 60)
		},
		cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;
	Completion.prototype = {
		close: function() {
			this.active() && (this.cm.state.completionActive = null, this.tick = null, this.cm.off("cursorActivity", this.activityFunc), this.widget && this.data && CodeMirror.signal(this.data, "close"), this.widget && this.widget.close(), CodeMirror.signal(this.cm, "endCompletion", this.cm))
		},
		active: function() {
			return this.cm.state.completionActive == this
		},
		pick: function(data, i) {
			var completion = data.list[i];
			completion.hint ? completion.hint(this.cm, data, completion) : this.cm.replaceRange(getText(completion), completion.from || data.from, completion.to || data.to, "complete"), CodeMirror.signal(data, "pick", completion), this.close()
		},
		cursorActivity: function() {
			this.debounce && (cancelAnimationFrame(this.debounce), this.debounce = 0);
			var pos = this.cm.getCursor(),
				line = this.cm.getLine(pos.line);
			if (pos.line != this.startPos.line || line.length - pos.ch != this.startLen - this.startPos.ch || pos.ch < this.startPos.ch || this.cm.somethingSelected() || pos.ch && this.options.closeCharacters.test(line.charAt(pos.ch - 1))) this.close();
			else {
				var self = this;
				this.debounce = requestAnimationFrame(function() {
					self.update()
				}), this.widget && this.widget.disable()
			}
		},
		update: function(first) {
			if (null != this.tick) {
				var self = this,
					myTick = ++this.tick;
				fetchHints(this.options.hint, this.cm, this.options, function(data) {
					self.tick == myTick && self.finishUpdate(data, first)
				})
			}
		},
		finishUpdate: function(data, first) {
			this.data && CodeMirror.signal(this.data, "update");
			var picked = this.widget && this.widget.picked || first && this.options.completeSingle;
			this.widget && this.widget.close(), this.data = data, data && data.list.length && (picked && 1 == data.list.length ? this.pick(data, 0) : (this.widget = new Widget(this, data), CodeMirror.signal(data, "shown")))
		}
	}, Widget.prototype = {
		close: function() {
			if (this.completion.widget == this) {
				this.completion.widget = null, this.hints.parentNode.removeChild(this.hints), this.completion.cm.removeKeyMap(this.keyMap);
				var cm = this.completion.cm;
				this.completion.options.closeOnUnfocus && (cm.off("blur", this.onBlur), cm.off("focus", this.onFocus)), cm.off("scroll", this.onScroll)
			}
		},
		disable: function() {
			this.completion.cm.removeKeyMap(this.keyMap);
			var widget = this;
			this.keyMap = {
				Enter: function() {
					widget.picked = !0
				}
			}, this.completion.cm.addKeyMap(this.keyMap)
		},
		pick: function() {
			this.completion.pick(this.data, this.selectedHint)
		},
		changeActive: function(i, avoidWrap) {
			if (i >= this.data.list.length ? i = avoidWrap ? this.data.list.length - 1 : 0 : 0 > i && (i = avoidWrap ? 0 : this.data.list.length - 1), this.selectedHint != i) {
				var node = this.hints.childNodes[this.selectedHint];
				node.className = node.className.replace(" " + ACTIVE_HINT_ELEMENT_CLASS, ""), node = this.hints.childNodes[this.selectedHint = i], node.className += " " + ACTIVE_HINT_ELEMENT_CLASS, node.offsetTop < this.hints.scrollTop ? this.hints.scrollTop = node.offsetTop - 3 : node.offsetTop + node.offsetHeight > this.hints.scrollTop + this.hints.clientHeight && (this.hints.scrollTop = node.offsetTop + node.offsetHeight - this.hints.clientHeight + 3), CodeMirror.signal(this.data, "select", this.data.list[this.selectedHint], node)
			}
		},
		screenAmount: function() {
			return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1
		}
	}, CodeMirror.registerHelper("hint", "auto", {
		resolve: resolveAutoHints
	}), CodeMirror.registerHelper("hint", "fromList", function(cm, options) {
		var cur = cm.getCursor(),
			token = cm.getTokenAt(cur),
			to = CodeMirror.Pos(cur.line, token.end);
		if (token.string && /\w/.test(token.string[token.string.length - 1])) var term = token.string,
			from = CodeMirror.Pos(cur.line, token.start);
		else var term = "",
			from = to;
		for (var found = [], i = 0; i < options.words.length; i++) {
			var word = options.words[i];
			word.slice(0, term.length) == term && found.push(word)
		}
		return found.length ? {
			list: found,
			from: from,
			to: to
		} : void 0
	}), CodeMirror.commands.autocomplete = CodeMirror.showHint;
	var defaultOptions = {
		hint: CodeMirror.hint.auto,
		completeSingle: !0,
		alignWithWord: !0,
		closeCharacters: /[\s()\[\]{};:>,]/,
		closeOnUnfocus: !0,
		completeOnSingleClick: !0,
		container: null,
		customKeys: null,
		extraKeys: null
	};
	CodeMirror.defineOption("hintOptions", null)
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";
	var WORD = /[\w$]+/,
		RANGE = 500;
	CodeMirror.registerHelper("hint", "anyword", function(editor, options) {
		for (var word = options && options.word || WORD, range = options && options.range || RANGE, cur = editor.getCursor(), curLine = editor.getLine(cur.line), end = cur.ch, start = end; start && word.test(curLine.charAt(start - 1));) --start;
		for (var curWord = start != end && curLine.slice(start, end), list = options && options.list || [], seen = {}, re = new RegExp(word.source, "g"), dir = -1; 1 >= dir; dir += 2)
			for (var line = cur.line, endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir; line != endLine; line += dir)
				for (var m, text = editor.getLine(line); m = re.exec(text);)(line != cur.line || m[0] !== curWord) && (curWord && 0 != m[0].lastIndexOf(curWord, 0) || Object.prototype.hasOwnProperty.call(seen, m[0]) || (seen[m[0]] = !0, list.push(m[0])));
		return {
			list: list,
			from: CodeMirror.Pos(cur.line, start),
			to: CodeMirror.Pos(cur.line, end)
		}
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	function forEach(arr, f) {
		for (var i = 0, e = arr.length; e > i; ++i) f(arr[i])
	}

	function arrayContains(arr, item) {
		if (!Array.prototype.indexOf) {
			for (var i = arr.length; i--;)
				if (arr[i] === item) return !0;
			return !1
		}
		return -1 != arr.indexOf(item)
	}

	function scriptHint(editor, keywords, getToken, options) {
		var cur = editor.getCursor(),
			token = getToken(editor, cur);
		if (!/\b(?:string|comment)\b/.test(token.type)) {
			token.state = CodeMirror.innerMode(editor.getMode(), token.state).state, /^[\w$_]*$/.test(token.string) ? token.end > cur.ch && (token.end = cur.ch, token.string = token.string.slice(0, cur.ch - token.start)) : token = {
				start: cur.ch,
				end: cur.ch,
				string: "",
				state: token.state,
				type: "." == token.string ? "property" : null
			};
			for (var tprop = token;
				"property" == tprop.type;) {
				if (tprop = getToken(editor, Pos(cur.line, tprop.start)), "." != tprop.string) return;
				if (tprop = getToken(editor, Pos(cur.line, tprop.start)), !context) var context = [];
				context.push(tprop)
			}
			return {
				list: getCompletions(token, context, keywords, options),
				from: Pos(cur.line, token.start),
				to: Pos(cur.line, token.end)
			}
		}
	}

	function javascriptHint(editor, options) {
		return scriptHint(editor, javascriptKeywords, function(e, cur) {
			return e.getTokenAt(cur)
		}, options)
	}

	function getCoffeeScriptToken(editor, cur) {
		var token = editor.getTokenAt(cur);
		return cur.ch == token.start + 1 && "." == token.string.charAt(0) ? (token.end = token.start, token.string = ".", token.type = "property") : /^\.[\w$_]*$/.test(token.string) && (token.type = "property", token.start++, token.string = token.string.replace(/\./, "")), token
	}

	function coffeescriptHint(editor, options) {
		return scriptHint(editor, coffeescriptKeywords, getCoffeeScriptToken, options)
	}

	function forAllProps(obj, callback) {
		if (Object.getOwnPropertyNames && Object.getPrototypeOf)
			for (var o = obj; o; o = Object.getPrototypeOf(o)) Object.getOwnPropertyNames(o).forEach(callback);
		else
			for (var name in obj) callback(name)
	}

	function getCompletions(token, context, keywords, options) {
		function maybeAdd(str) {
			0 != str.lastIndexOf(start, 0) || arrayContains(found, str) || found.push(str)
		}

		function gatherCompletions(obj) {
			"string" == typeof obj ? forEach(stringProps, maybeAdd) : obj instanceof Array ? forEach(arrayProps, maybeAdd) : obj instanceof Function && forEach(funcProps, maybeAdd), forAllProps(obj, maybeAdd)
		}
		var found = [],
			start = token.string,
			global = options && options.globalScope || window;
		if (context && context.length) {
			var base, obj = context.pop();
			for (obj.type && 0 === obj.type.indexOf("variable") ? (options && options.additionalContext && (base = options.additionalContext[obj.string]), options && options.useGlobalScope === !1 || (base = base || global[obj.string])) : "string" == obj.type ? base = "" : "atom" == obj.type ? base = 1 : "function" == obj.type && (null == global.jQuery || "$" != obj.string && "jQuery" != obj.string || "function" != typeof global.jQuery ? null != global._ && "_" == obj.string && "function" == typeof global._ && (base = global._()) : base = global.jQuery()); null != base && context.length;) base = base[context.pop().string];
			null != base && gatherCompletions(base)
		} else {
			for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
			for (var v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);
			options && options.useGlobalScope === !1 || gatherCompletions(global), forEach(keywords, maybeAdd)
		}
		return found
	}
	var Pos = CodeMirror.Pos;
	CodeMirror.registerHelper("hint", "javascript", javascriptHint), CodeMirror.registerHelper("hint", "coffeescript", coffeescriptHint);
	var stringProps = "charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight toUpperCase toLowerCase split concat match replace search".split(" "),
		arrayProps = "length concat join splice push pop shift unshift slice reverse sort indexOf lastIndexOf every some filter forEach map reduce reduceRight ".split(" "),
		funcProps = "prototype apply call bind".split(" "),
		javascriptKeywords = "break case catch class const continue debugger default delete do else export extends false finally for function if in import instanceof new null return super switch this throw true try typeof var void while with yield".split(" "),
		coffeescriptKeywords = "and break catch class continue delete do else extends false finally for if in instanceof isnt new no not null of off on or return switch then throw true try typeof until void while with yes".split(" ")
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("./xml-hint")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "./xml-hint"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function populate(obj) {
		for (var attr in globalAttrs) globalAttrs.hasOwnProperty(attr) && (obj.attrs[attr] = globalAttrs[attr])
	}

	function htmlHint(cm, options) {
		var local = {
			schemaInfo: data
		};
		if (options)
			for (var opt in options) local[opt] = options[opt];
		return CodeMirror.hint.xml(cm, local)
	}
	var langs = "ab aa af ak sq am ar an hy as av ae ay az bm ba eu be bn bh bi bs br bg my ca ch ce ny zh cv kw co cr hr cs da dv nl dz en eo et ee fo fj fi fr ff gl ka de el gn gu ht ha he hz hi ho hu ia id ie ga ig ik io is it iu ja jv kl kn kr ks kk km ki rw ky kv kg ko ku kj la lb lg li ln lo lt lu lv gv mk mg ms ml mt mi mr mh mn na nv nb nd ne ng nn no ii nr oc oj cu om or os pa pi fa pl ps pt qu rm rn ro ru sa sc sd se sm sg sr gd sn si sk sl so st es su sw ss sv ta te tg th ti bo tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa cy wo fy xh yi yo za zu".split(" "),
		targets = ["_blank", "_self", "_top", "_parent"],
		charsets = ["ascii", "utf-8", "utf-16", "latin1", "latin1"],
		methods = ["get", "post", "put", "delete"],
		encs = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"],
		media = ["all", "screen", "print", "embossed", "braille", "handheld", "print", "projection", "screen", "tty", "tv", "speech", "3d-glasses", "resolution [>][<][=] [X]", "device-aspect-ratio: X/Y", "orientation:portrait", "orientation:landscape", "device-height: [X]", "device-width: [X]"],
		s = {
			attrs: {}
		},
		data = {
			a: {
				attrs: {
					href: null,
					ping: null,
					type: null,
					media: media,
					target: targets,
					hreflang: langs
				}
			},
			abbr: s,
			acronym: s,
			address: s,
			applet: s,
			area: {
				attrs: {
					alt: null,
					coords: null,
					href: null,
					target: null,
					ping: null,
					media: media,
					hreflang: langs,
					type: null,
					shape: ["default", "rect", "circle", "poly"]
				}
			},
			article: s,
			aside: s,
			audio: {
				attrs: {
					src: null,
					mediagroup: null,
					crossorigin: ["anonymous", "use-credentials"],
					preload: ["none", "metadata", "auto"],
					autoplay: ["", "autoplay"],
					loop: ["", "loop"],
					controls: ["", "controls"]
				}
			},
			b: s,
			base: {
				attrs: {
					href: null,
					target: targets
				}
			},
			basefont: s,
			bdi: s,
			bdo: s,
			big: s,
			blockquote: {
				attrs: {
					cite: null
				}
			},
			body: s,
			br: s,
			button: {
				attrs: {
					form: null,
					formaction: null,
					name: null,
					value: null,
					autofocus: ["", "autofocus"],
					disabled: ["", "autofocus"],
					formenctype: encs,
					formmethod: methods,
					formnovalidate: ["", "novalidate"],
					formtarget: targets,
					type: ["submit", "reset", "button"]
				}
			},
			canvas: {
				attrs: {
					width: null,
					height: null
				}
			},
			caption: s,
			center: s,
			cite: s,
			code: s,
			col: {
				attrs: {
					span: null
				}
			},
			colgroup: {
				attrs: {
					span: null
				}
			},
			command: {
				attrs: {
					type: ["command", "checkbox", "radio"],
					label: null,
					icon: null,
					radiogroup: null,
					command: null,
					title: null,
					disabled: ["", "disabled"],
					checked: ["", "checked"]
				}
			},
			data: {
				attrs: {
					value: null
				}
			},
			datagrid: {
				attrs: {
					disabled: ["", "disabled"],
					multiple: ["", "multiple"]
				}
			},
			datalist: {
				attrs: {
					data: null
				}
			},
			dd: s,
			del: {
				attrs: {
					cite: null,
					datetime: null
				}
			},
			details: {
				attrs: {
					open: ["", "open"]
				}
			},
			dfn: s,
			dir: s,
			div: s,
			dl: s,
			dt: s,
			em: s,
			embed: {
				attrs: {
					src: null,
					type: null,
					width: null,
					height: null
				}
			},
			eventsource: {
				attrs: {
					src: null
				}
			},
			fieldset: {
				attrs: {
					disabled: ["", "disabled"],
					form: null,
					name: null
				}
			},
			figcaption: s,
			figure: s,
			font: s,
			footer: s,
			form: {
				attrs: {
					action: null,
					name: null,
					"accept-charset": charsets,
					autocomplete: ["on", "off"],
					enctype: encs,
					method: methods,
					novalidate: ["", "novalidate"],
					target: targets
				}
			},
			frame: s,
			frameset: s,
			h1: s,
			h2: s,
			h3: s,
			h4: s,
			h5: s,
			h6: s,
			head: {
				attrs: {},
				children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
			},
			header: s,
			hgroup: s,
			hr: s,
			html: {
				attrs: {
					manifest: null
				},
				children: ["head", "body"]
			},
			i: s,
			iframe: {
				attrs: {
					src: null,
					srcdoc: null,
					name: null,
					width: null,
					height: null,
					sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
					seamless: ["", "seamless"]
				}
			},
			img: {
				attrs: {
					alt: null,
					src: null,
					ismap: null,
					usemap: null,
					width: null,
					height: null,
					crossorigin: ["anonymous", "use-credentials"]
				}
			},
			input: {
				attrs: {
					alt: null,
					dirname: null,
					form: null,
					formaction: null,
					height: null,
					list: null,
					max: null,
					maxlength: null,
					min: null,
					name: null,
					pattern: null,
					placeholder: null,
					size: null,
					src: null,
					step: null,
					value: null,
					width: null,
					accept: ["audio/*", "video/*", "image/*"],
					autocomplete: ["on", "off"],
					autofocus: ["", "autofocus"],
					checked: ["", "checked"],
					disabled: ["", "disabled"],
					formenctype: encs,
					formmethod: methods,
					formnovalidate: ["", "novalidate"],
					formtarget: targets,
					multiple: ["", "multiple"],
					readonly: ["", "readonly"],
					required: ["", "required"],
					type: ["hidden", "text", "search", "tel", "url", "email", "password", "datetime", "date", "month", "week", "time", "datetime-local", "number", "range", "color", "checkbox", "radio", "file", "submit", "image", "reset", "button"]
				}
			},
			ins: {
				attrs: {
					cite: null,
					datetime: null
				}
			},
			kbd: s,
			keygen: {
				attrs: {
					challenge: null,
					form: null,
					name: null,
					autofocus: ["", "autofocus"],
					disabled: ["", "disabled"],
					keytype: ["RSA"]
				}
			},
			label: {
				attrs: {
					"for": null,
					form: null
				}
			},
			legend: s,
			li: {
				attrs: {
					value: null
				}
			},
			link: {
				attrs: {
					href: null,
					type: null,
					hreflang: langs,
					media: media,
					sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
				}
			},
			map: {
				attrs: {
					name: null
				}
			},
			mark: s,
			menu: {
				attrs: {
					label: null,
					type: ["list", "context", "toolbar"]
				}
			},
			meta: {
				attrs: {
					content: null,
					charset: charsets,
					name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
					"http-equiv": ["content-language", "content-type", "default-style", "refresh"]
				}
			},
			meter: {
				attrs: {
					value: null,
					min: null,
					low: null,
					high: null,
					max: null,
					optimum: null
				}
			},
			nav: s,
			noframes: s,
			noscript: s,
			object: {
				attrs: {
					data: null,
					type: null,
					name: null,
					usemap: null,
					form: null,
					width: null,
					height: null,
					typemustmatch: ["", "typemustmatch"]
				}
			},
			ol: {
				attrs: {
					reversed: ["", "reversed"],
					start: null,
					type: ["1", "a", "A", "i", "I"]
				}
			},
			optgroup: {
				attrs: {
					disabled: ["", "disabled"],
					label: null
				}
			},
			option: {
				attrs: {
					disabled: ["", "disabled"],
					label: null,
					selected: ["", "selected"],
					value: null
				}
			},
			output: {
				attrs: {
					"for": null,
					form: null,
					name: null
				}
			},
			p: s,
			param: {
				attrs: {
					name: null,
					value: null
				}
			},
			pre: s,
			progress: {
				attrs: {
					value: null,
					max: null
				}
			},
			q: {
				attrs: {
					cite: null
				}
			},
			rp: s,
			rt: s,
			ruby: s,
			s: s,
			samp: s,
			script: {
				attrs: {
					type: ["text/javascript"],
					src: null,
					async: ["", "async"],
					defer: ["", "defer"],
					charset: charsets
				}
			},
			section: s,
			select: {
				attrs: {
					form: null,
					name: null,
					size: null,
					autofocus: ["", "autofocus"],
					disabled: ["", "disabled"],
					multiple: ["", "multiple"]
				}
			},
			small: s,
			source: {
				attrs: {
					src: null,
					type: null,
					media: null
				}
			},
			span: s,
			strike: s,
			strong: s,
			style: {
				attrs: {
					type: ["text/css"],
					media: media,
					scoped: null
				}
			},
			sub: s,
			summary: s,
			sup: s,
			table: s,
			tbody: s,
			td: {
				attrs: {
					colspan: null,
					rowspan: null,
					headers: null
				}
			},
			textarea: {
				attrs: {
					dirname: null,
					form: null,
					maxlength: null,
					name: null,
					placeholder: null,
					rows: null,
					cols: null,
					autofocus: ["", "autofocus"],
					disabled: ["", "disabled"],
					readonly: ["", "readonly"],
					required: ["", "required"],
					wrap: ["soft", "hard"]
				}
			},
			tfoot: s,
			th: {
				attrs: {
					colspan: null,
					rowspan: null,
					headers: null,
					scope: ["row", "col", "rowgroup", "colgroup"]
				}
			},
			thead: s,
			time: {
				attrs: {
					datetime: null
				}
			},
			title: s,
			tr: s,
			track: {
				attrs: {
					src: null,
					label: null,
					"default": null,
					kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
					srclang: langs
				}
			},
			tt: s,
			u: s,
			ul: s,
			"var": s,
			video: {
				attrs: {
					src: null,
					poster: null,
					width: null,
					height: null,
					crossorigin: ["anonymous", "use-credentials"],
					preload: ["auto", "metadata", "none"],
					autoplay: ["", "autoplay"],
					mediagroup: ["movie"],
					muted: ["", "muted"],
					controls: ["", "controls"]
				}
			},
			wbr: s
		},
		globalAttrs = {
			accesskey: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
			"class": null,
			contenteditable: ["true", "false"],
			contextmenu: null,
			dir: ["ltr", "rtl", "auto"],
			draggable: ["true", "false", "auto"],
			dropzone: ["copy", "move", "link", "string:", "file:"],
			hidden: ["hidden"],
			id: null,
			inert: ["inert"],
			itemid: null,
			itemprop: null,
			itemref: null,
			itemscope: ["itemscope"],
			itemtype: null,
			lang: ["en", "es"],
			spellcheck: ["true", "false"],
			style: null,
			tabindex: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
			title: null,
			translate: ["yes", "no"],
			onclick: null,
			rel: ["stylesheet", "alternate", "author", "bookmark", "help", "icon", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"]
		};
	populate(s);
	for (var tag in data) data.hasOwnProperty(tag) && data[tag] != s && populate(data[tag]);
	CodeMirror.htmlSchema = data, CodeMirror.registerHelper("hint", "html", htmlHint)
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror"), require("../../mode/css/css")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror", "../../mode/css/css"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";
	var pseudoClasses = {
		link: 1,
		visited: 1,
		active: 1,
		hover: 1,
		focus: 1,
		"first-letter": 1,
		"first-line": 1,
		"first-child": 1,
		before: 1,
		after: 1,
		lang: 1
	};
	CodeMirror.registerHelper("hint", "css", function(cm) {
		function add(keywords) {
			for (var name in keywords) word && 0 != name.lastIndexOf(word, 0) || result.push(name)
		}
		var cur = cm.getCursor(),
			token = cm.getTokenAt(cur),
			inner = CodeMirror.innerMode(cm.getMode(), token.state);
		if ("css" == inner.mode.name) {
			if ("keyword" == token.type && 0 == "!important".indexOf(token.string)) return {
				list: ["!important"],
				from: CodeMirror.Pos(cur.line, token.start),
				to: CodeMirror.Pos(cur.line, token.end)
			};
			var start = token.start,
				end = cur.ch,
				word = token.string.slice(0, end - start);
			/[^\w$_-]/.test(word) && (word = "", start = end = cur.ch);
			var spec = CodeMirror.resolveMode("text/css"),
				result = [],
				st = inner.state.state;
			return "pseudo" == st || "variable-3" == token.type ? add(pseudoClasses) : "block" == st || "maybeprop" == st ? add(spec.propertyKeywords) : "prop" == st || "parens" == st || "at" == st || "params" == st ? (add(spec.valueKeywords), add(spec.colorKeywords)) : ("media" == st || "media_parens" == st) && (add(spec.mediaTypes), add(spec.mediaFeatures)), result.length ? {
				list: result,
				from: CodeMirror.Pos(cur.line, start),
				to: CodeMirror.Pos(cur.line, end)
			} : void 0
		}
	})
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function Bar(cls, orientation, scroll) {
		function onWheel(e) {
			var moved = CodeMirror.wheelEventPixels(e)["horizontal" == self.orientation ? "x" : "y"],
				oldPos = self.pos;
			self.moveTo(self.pos + moved), self.pos != oldPos && CodeMirror.e_preventDefault(e)
		}
		this.orientation = orientation, this.scroll = scroll, this.screen = this.total = this.size = 1, this.pos = 0, this.node = document.createElement("div"), this.node.className = cls + "-" + orientation, this.inner = this.node.appendChild(document.createElement("div"));
		var self = this;
		CodeMirror.on(this.inner, "mousedown", function(e) {
			function done() {
				CodeMirror.off(document, "mousemove", move), CodeMirror.off(document, "mouseup", done)
			}

			function move(e) {
				return 1 != e.which ? done() : void self.moveTo(startpos + (e[axis] - start) * (self.total / self.size))
			}
			if (1 == e.which) {
				CodeMirror.e_preventDefault(e);
				var axis = "horizontal" == self.orientation ? "pageX" : "pageY",
					start = e[axis],
					startpos = self.pos;
				CodeMirror.on(document, "mousemove", move), CodeMirror.on(document, "mouseup", done)
			}
		}), CodeMirror.on(this.node, "click", function(e) {
			CodeMirror.e_preventDefault(e);
			var where, innerBox = self.inner.getBoundingClientRect();
			where = "horizontal" == self.orientation ? e.clientX < innerBox.left ? -1 : e.clientX > innerBox.right ? 1 : 0 : e.clientY < innerBox.top ? -1 : e.clientY > innerBox.bottom ? 1 : 0, self.moveTo(self.pos + where * self.screen)
		}), CodeMirror.on(this.node, "mousewheel", onWheel), CodeMirror.on(this.node, "DOMMouseScroll", onWheel)
	}

	function SimpleScrollbars(cls, place, scroll) {
		this.addClass = cls, this.horiz = new Bar(cls, "horizontal", scroll), place(this.horiz.node), this.vert = new Bar(cls, "vertical", scroll), place(this.vert.node), this.width = null
	}
	Bar.prototype.setPos = function(pos, force) {
		return 0 > pos && (pos = 0), pos > this.total - this.screen && (pos = this.total - this.screen), force || pos != this.pos ? (this.pos = pos, this.inner.style["horizontal" == this.orientation ? "left" : "top"] = pos * (this.size / this.total) + "px", !0) : !1
	}, Bar.prototype.moveTo = function(pos) {
		this.setPos(pos) && this.scroll(pos, this.orientation)
	};
	var minButtonSize = 10;
	Bar.prototype.update = function(scrollSize, clientSize, barSize) {
		var sizeChanged = this.screen != clientSize || this.total != scrollSize || this.size != barSize;
		sizeChanged && (this.screen = clientSize, this.total = scrollSize, this.size = barSize);
		var buttonSize = this.screen * (this.size / this.total);
		minButtonSize > buttonSize && (this.size -= minButtonSize - buttonSize, buttonSize = minButtonSize), this.inner.style["horizontal" == this.orientation ? "width" : "height"] = buttonSize + "px", this.setPos(this.pos, sizeChanged)
	}, SimpleScrollbars.prototype.update = function(measure) {
		if (null == this.width) {
			var style = window.getComputedStyle ? window.getComputedStyle(this.horiz.node) : this.horiz.node.currentStyle;
			style && (this.width = parseInt(style.height))
		}
		var width = this.width || 0,
			needsH = measure.scrollWidth > measure.clientWidth + 1,
			needsV = measure.scrollHeight > measure.clientHeight + 1;
		return this.vert.node.style.display = needsV ? "block" : "none", this.horiz.node.style.display = needsH ? "block" : "none", needsV && (this.vert.update(measure.scrollHeight, measure.clientHeight, measure.viewHeight - (needsH ? width : 0)), this.vert.node.style.bottom = needsH ? width + "px" : "0"), needsH && (this.horiz.update(measure.scrollWidth, measure.clientWidth, measure.viewWidth - (needsV ? width : 0) - measure.barLeft), this.horiz.node.style.right = needsV ? width + "px" : "0", this.horiz.node.style.left = measure.barLeft + "px"), {
			right: needsV ? width : 0,
			bottom: needsH ? width : 0
		}
	}, SimpleScrollbars.prototype.setScrollTop = function(pos) {
		this.vert.setPos(pos)
	}, SimpleScrollbars.prototype.setScrollLeft = function(pos) {
		this.horiz.setPos(pos)
	}, SimpleScrollbars.prototype.clear = function() {
		var parent = this.horiz.node.parentNode;
		parent.removeChild(this.horiz.node), parent.removeChild(this.vert.node)
	}, CodeMirror.scrollbarModel.simple = function(place, scroll) {
		return new SimpleScrollbars("CodeMirror-simplescroll", place, scroll)
	}, CodeMirror.scrollbarModel.overlay = function(place, scroll) {
		return new SimpleScrollbars("CodeMirror-overlayscroll", place, scroll)
	}
}),
function(mod) {
	"object" == typeof exports && "object" == typeof module ? mod(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], mod) : mod(CodeMirror)
}(function(CodeMirror) {
	"use strict";

	function Annotation(cm, options) {
		function scheduleRedraw(delay) {
			clearTimeout(self.doRedraw), self.doRedraw = setTimeout(function() {
				self.redraw()
			}, delay)
		}
		this.cm = cm, this.options = options, this.buttonHeight = options.scrollButtonHeight || cm.getOption("scrollButtonHeight"), this.annotations = [], this.doRedraw = this.doUpdate = null, this.div = cm.getWrapperElement().appendChild(document.createElement("div")), this.div.style.cssText = "position: absolute; right: 0; top: 0; z-index: 7; pointer-events: none", this.computeScale();
		var self = this;
		cm.on("refresh", this.resizeHandler = function() {
			clearTimeout(self.doUpdate), self.doUpdate = setTimeout(function() {
				self.computeScale() && scheduleRedraw(20)
			}, 100)
		}), cm.on("markerAdded", this.resizeHandler), cm.on("markerCleared", this.resizeHandler), options.listenForChanges !== !1 && cm.on("change", this.changeHandler = function() {
			scheduleRedraw(250)
		})
	}
	CodeMirror.defineExtension("annotateScrollbar", function(options) {
		return "string" == typeof options && (options = {
			className: options
		}), new Annotation(this, options)
	}), CodeMirror.defineOption("scrollButtonHeight", 0), Annotation.prototype.computeScale = function() {
		var cm = this.cm,
			hScale = (cm.getWrapperElement().clientHeight - cm.display.barHeight - 2 * this.buttonHeight) / cm.getScrollerElement().scrollHeight;
		return hScale != this.hScale ? (this.hScale = hScale, !0) : void 0
	}, Annotation.prototype.update = function(annotations) {
		this.annotations = annotations, this.redraw()
	}, Annotation.prototype.redraw = function(compute) {
		function getY(pos, top) {
			if (curLine != pos.line && (curLine = pos.line, curLineObj = cm.getLineHandle(curLine)), curLineObj.widgets && curLineObj.widgets.length || wrapping && curLineObj.height > singleLineH) return cm.charCoords(pos, "local")[top ? "top" : "bottom"];
			var topY = cm.heightAtLine(curLineObj, "local");
			return topY + (top ? 0 : curLineObj.height)
		}
		compute !== !1 && this.computeScale();
		var cm = this.cm,
			hScale = this.hScale,
			frag = document.createDocumentFragment(),
			anns = this.annotations,
			wrapping = cm.getOption("lineWrapping"),
			singleLineH = wrapping && 1.5 * cm.defaultTextHeight(),
			curLine = null,
			curLineObj = null,
			lastLine = cm.lastLine();
		if (cm.display.barWidth)
			for (var nextTop, i = 0; i < anns.length; i++) {
				var ann = anns[i];
				if (!(ann.to.line > lastLine)) {
					for (var top = nextTop || getY(ann.from, !0) * hScale, bottom = getY(ann.to, !1) * hScale; i < anns.length - 1 && !(anns[i + 1].to.line > lastLine) && (nextTop = getY(anns[i + 1].from, !0) * hScale, !(nextTop > bottom + .9));) ann = anns[++i], bottom = getY(ann.to, !1) * hScale;
					if (bottom != top) {
						var height = Math.max(bottom - top, 3),
							elt = frag.appendChild(document.createElement("div"));
						elt.style.cssText = "position: absolute; right: 0px; width: " + Math.max(cm.display.barWidth - 1, 2) + "px; top: " + (top + this.buttonHeight) + "px; height: " + height + "px", elt.className = this.options.className, ann.id && elt.setAttribute("annotation-id", ann.id)
					}
				}
			}
		this.div.textContent = "", this.div.appendChild(frag)
	}, Annotation.prototype.clear = function() {
		this.cm.off("refresh", this.resizeHandler), this.cm.off("markerAdded", this.resizeHandler), this.cm.off("markerCleared", this.resizeHandler), this.changeHandler && this.cm.off("change", this.changeHandler), this.div.parentNode.removeChild(this.div)
	}
});