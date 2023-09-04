"use strict";
exports.__esModule = true;
exports.isKeyOfTypeT = exports.isKeyOfType = exports.getModelList = void 0;
var helpermonads_1 = require("./helpermonads");
var fs = require("fs");
var data = fs.readFileSync('./db.json', { encoding: 'utf8', flag: 'r' });
var models = JSON.parse(data);
var getModelList = function (modelname) {
    var l = helpermonads_1.EmptyList().call(helpermonads_1.Pair({}, {}));
    for (var _i = 0, _a = models[modelname]; _i < _a.length; _i++) {
        var model = _a[_i];
        l = helpermonads_1.FillList(helpermonads_1.Pair({}, model)).call(l);
    }
    return l;
};
exports.getModelList = getModelList;
var isKeyOfType = function (potentialKey, object) {
    return potentialKey in object;
};
exports.isKeyOfType = isKeyOfType;
var isKeyOfTypeT = function (k, o) { return k in o; };
exports.isKeyOfTypeT = isKeyOfTypeT;
