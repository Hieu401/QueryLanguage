"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Querybuilder = void 0;
var nameresolver_1 = require("./nameresolver");
var helpermonads_1 = require("./helpermonads");
var fs = require("fs");
var data = fs.readFileSync('./db.json', { encoding: 'utf8', flag: 'r' });
var models = JSON.parse(data);
var Querybuilder = function (mT) {
    return helpermonads_1.Fun(function (lp) { return ({
        modelType: mT,
        kind: 'r',
        value: lp,
        Select: function () {
            var property = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                property[_i] = arguments[_i];
            }
            return Select(property, this);
        },
        Include: function (name, f) {
            return Include(this, name, f);
        },
        Where: function (f) { return Where(this, f); },
        OrderBy: function (f) { return OrderBy(this, f); },
        // GroupBy: <b>() : Grouping<b> => null,
        Get: function () {
            return GetModelList(this);
        },
        GetArray: function () {
            return helpermonads_1.BindRightEither(GetModelList(this), helpermonads_1.Fun(function (l) { return helpermonads_1.NoException().call(helpermonads_1.ListToArray(l)); }));
        },
        First: function () {
            return helpermonads_1.BindRightEither(GetModelList(this), helpermonads_1.Fun(function (l) { return l.kind == "full" ? helpermonads_1.NoException().call(l.value) : helpermonads_1.Exception().call("No Result"); }));
        },
        GroupBy: function (k) {
            return GroupBy(this, k);
        }
    }); });
};
exports.Querybuilder = Querybuilder;
var Queryexception = function () {
    return helpermonads_1.Fun(function (e) { return ({
        modelType: 'Students',
        kind: 'l',
        value: e,
        Select: function () {
            var property = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                property[_i] = arguments[_i];
            }
            return Select(property, this);
        },
        Include: function (name, f) {
            return Include(this, name, f);
        },
        Where: function (f) { return Where(this, f); },
        OrderBy: function (f) { return OrderBy(this, f); },
        //   GroupBy: <b>() : Grouping<b> => null
        Get: function () {
            return GetModelList(this);
        },
        GetArray: function () {
            return helpermonads_1.BindRightEither(GetModelList(this), helpermonads_1.Fun(function (l) { return helpermonads_1.NoException().call(helpermonads_1.ListToArray(l)); }));
        },
        First: function () {
            return helpermonads_1.BindRightEither(GetModelList(this), helpermonads_1.Fun(function (l) { return l.kind == "full" ? helpermonads_1.NoException().call(l.value) : helpermonads_1.Exception().call("No Result"); }));
        },
        GroupBy: function (k) {
            return GroupBy(this, k);
        }
    }); });
};
// check if value of key is not primitive
var GroupBy = function (qb, key) {
    return helpermonads_1.BindRightEither(qb, helpermonads_1.Fun(function (l) {
        if (l.kind == "empty") {
            return helpermonads_1.Exception().call("Cannot group empty collection");
        }
        else {
            var foldedList = helpermonads_1.FoldList({}, function (element, o) {
                var k = element.snd[key];
                if (typeof k == "string" || typeof k == "number") {
                    if (nameresolver_1.isKeyOfTypeT(k, o)) {
                        if (o[k] == undefined) {
                            o[k] = [element.fst];
                            return o;
                        }
                        else {
                            var t = o[k];
                            t.push(element.fst);
                            o[k] = t;
                            return o;
                        }
                    }
                    else {
                        var newObject = {};
                        newObject[k] = [element.fst];
                        return __assign(__assign({}, o), newObject);
                    }
                }
                else {
                    return {};
                }
            }).call(l);
            return foldedList == {} ? helpermonads_1.Exception().call("Value not groupable") : helpermonads_1.inr().call(foldedList);
        }
    }));
};
var MapListPair = function (f, g) {
    return helpermonads_1.Fun(function (lp) { return helpermonads_1.MapList(helpermonads_1.MapPair(f, g)).call(lp); });
};
var MapQuerybuilder = function (f) {
    return helpermonads_1.Fun(function (qb) {
        return qb.kind == 'l' ? Queryexception().call(qb.value) : exports.Querybuilder(qb.modelType).call(helpermonads_1.MapList(helpermonads_1.MapPair(f, helpermonads_1.id())).call(qb.value));
    });
};
var JoinQuerybuilder = function () {
    return helpermonads_1.Fun(function (qb) { return qb.kind == 'l' ? Queryexception().call(qb.value) : qb.value; });
};
var BindQuerybuilder = function (qb, f) {
    return helpermonads_1.MapEither(helpermonads_1.id(), f).then(JoinQuerybuilder()).call(qb);
};
var Select = function (keys, qb) {
    return BindQuerybuilder(qb, helpermonads_1.Fun(function (l) {
        if (keys.length <= 0) {
            return Queryexception().call("No attributes given in Select clause");
        }
        else if (l.kind == "empty") {
            return exports.Querybuilder(qb.modelType).call(l);
        }
        else if (keys.some(function (e) { return e == "*"; })) {
            return exports.Querybuilder(qb.modelType).call(helpermonads_1.MapList(helpermonads_1.Fun(function (p) { return AddKeysFromRight(p, Object.keys(l.value.snd)); })).call(l));
        }
        else {
            return exports.Querybuilder(qb.modelType).call(helpermonads_1.MapList(helpermonads_1.Fun(function (p) { return AddKeysFromRight(p, keys.filter(function (e) { return e != "*"; })); })).call(l));
        }
    }));
};
var Where = function (qb, f) {
    return BindQuerybuilder(qb, helpermonads_1.Fun(function (l) { return exports.Querybuilder(qb.modelType).call(helpermonads_1.FilterListWithBind(helpermonads_1.Fun(function (p) { return f(p.snd); })).call(l)); }));
};
var OrderBy = function (qb, f) {
    return BindQuerybuilder(qb, helpermonads_1.Fun(function (l) { return exports.Querybuilder(qb.modelType).call(helpermonads_1.MergeSortModelList(l, f)); }));
};
var Include = function (currentQB, nameRelation, f) {
    return BindQuerybuilder(currentQB, helpermonads_1.Fun(function (l) {
        var relationList = nameresolver_1.getModelList(nameRelation);
        var foreignKey = currentQB.modelType.slice(0, -1).toLowerCase() + "Id";
        if (relationList.kind == "empty") {
            return Queryexception().call("No objects in relationship");
        }
        else if (nameresolver_1.isKeyOfType(foreignKey, relationList.value.snd)) {
            var fk_1 = foreignKey; // for some reason had to do this, otherwise foreignKey would become a string type again
            return exports.Querybuilder(currentQB.modelType).call(helpermonads_1.MapList(helpermonads_1.Fun(function (p) {
                return AddLazyRelationToModel(p, fk_1, nameRelation, f);
            })).call(l));
        }
        else {
            return Queryexception().call("No relation found between" + currentQB.modelType + " and " + nameRelation);
        }
    }));
};
var GetModelList = function (qb) {
    return helpermonads_1.BindRightEither(qb, helpermonads_1.Fun(function (lp) { return helpermonads_1.NoException().call(helpermonads_1.MapList(helpermonads_1.Fun(function (p) { return p.fst; })).call(lp)); }));
};
var AddLazyRelationToModel = function (p, nameModel, nameRelation, f) {
    var relation = exports.Querybuilder(nameRelation).call(nameresolver_1.getModelList(nameRelation))
        .Where(function (r) { return r[nameModel] == p.snd.id; });
    // Had to initiate an empty object first and then make a translation from partial to not partial
    var relationObject = {};
    relationObject[nameRelation] = function () { return f(relation); };
    var filledRelationObject = __assign({}, relationObject);
    return helpermonads_1.MapPair(helpermonads_1.Fun(function (p) { return (__assign(__assign({}, p), filledRelationObject)); }), helpermonads_1.Fun(function (p) { return (__assign(__assign({}, p), filledRelationObject)); })).call(p);
};
var AddKeysFromRight = function (p, keys) {
    for (var K in keys) {
        var newFirst = p.fst;
        newFirst[keys[K]] = p.snd[keys[K]];
    }
    // !
    return helpermonads_1.Pair(p.fst, p.snd);
};
