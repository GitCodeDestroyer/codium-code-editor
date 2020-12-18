"use strict";
var string = '';
const patternRgb = /(rgb)(\s*?)(\()(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\))/g, patternRgba = /(rgba)(\s*?)(\()(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)([0-9]{1,3})(\s*?)(\,)(\s*?)(0?)(\.?)([0-9]*)(\s*?)(\))/g, patternHex = /\#[0-9a-fA-F]{6}|\#[0-9a-fA-F]{3}/g;
if (!!~string.search(patternRgb)) {
    return {
        type: 'rgb',
        string: string.match(patternRgb)[0].replace(/\s*/g, ''),
        realString: string
    };
} else if (!!~string.search(patternRgba)) {
    return {
        type: 'rgba',
        string: string.match(patternRgba)[0].replace(/\s*/g, ''),
        realString: string
    };
} else if (!!~string.search(patternHex)) {
    return {
        type: 'hex',
        string: string.match(patternHex)[0].replace(/\s*/g, ''),
        realString: string
    };
}
function hexToRgba(string, realString) {
    string = string.replace('#', '');
    var color = 'rgba(';
    if (string.length == 3) {
        color += parseInt(string.slice(0, 1) + '' + string.slice(0, 1), 16) + ',';
        color += parseInt(string.slice(1, 2) + '' + string.slice(1, 2), 16) + ',';
        color += parseInt(string.slice(2, 3) + '' + string.slice(2, 3), 16);
    }
    else if (string.length == 6) {
        color += parseInt(string.slice(0, 2), 16) + ',';
        color += parseInt(string.slice(2, 4), 16) + ',';
        color += parseInt(string.slice(4, 6), 16);
    }
    color += ', 1)';
    realString = realString.replace(realString.match(patternHex)[0], color);
    return realString;
}
function rgbaToHex(string, realString, type) {
    var colors = string.replace('rgb', '').replace('a', '').replace('(', '').replace(')').split(',').slice(0, 3).map(function (v) {
        v = parseInt(v).toString(16);
        return (v.length == 1) ? '0' + v : v;
    });
    var color = '#' + colors.join('');
    if (type == 'rgba') {
        realString = realString.replace(realString.match(patternRgba)[0], color);
    }
    else if (type == 'rgb') {
        realString = realString.replace(realString.match(patternRgb)[0], color);
    }
    return realString;
}