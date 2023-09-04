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
exports.UnitException = exports.JoinException = exports.MapException = exports.NoException = exports.Exception = exports.BindRightEither = exports.UnitRightEither = exports.JoinRightEither = exports.MapEither = exports.inr = exports.inl = exports.MergeSortModelList = exports.FilterListWithBind = exports.FilterList = exports.ListToArray = exports.MapList = exports.FoldList = exports.FillList = exports.EmptyList = exports.FilledList = exports.MapPair = exports.Pair = exports.id = exports.Fun = void 0;
var Fun = function (f) { return ({ call: f, then: function (g) { return exports.Fun(function (x) { return g.call(f(x)); }); } }); };
exports.Fun = Fun;
var id = function () { return exports.Fun(function (x) { return x; }); };
exports.id = id;
var Pair = function (x, y) { return ({ fst: x, snd: y }); };
exports.Pair = Pair;
var MapPair = function (f, g) {
    return exports.Fun(function (p) { return ({ fst: f.call(p.fst), snd: g.call(p.snd) }); });
};
exports.MapPair = MapPair;
var FilledList = function () { return exports.Fun(function (x) { return ({ kind: "full", value: x, tail: exports.EmptyList().call(x) }); }); };
exports.FilledList = FilledList;
var EmptyList = function () { return exports.Fun(function (_) { return ({ kind: "empty" }); }); };
exports.EmptyList = EmptyList;
var FillList = function (x) { return exports.Fun(function (l) { return ({ kind: "full", value: x, tail: l }); }); };
exports.FillList = FillList;
var FoldList = function (base, f) {
    return exports.Fun(function (l) { return l.kind == "empty" ? base : f(l.value, exports.FoldList(base, f).call(l.tail)); });
};
exports.FoldList = FoldList;
// let MapList = <a,b>(f: Fun<a,b>) : Fun<List<a>, List<b>> => 
//     Fun( l => FoldList<a, List<b>>( {kind: "empty"}, (h, t) => FillList(f.call(h)).call(t)).call(l) )
var MapList = function (f) {
    return exports.Fun(function m(l) {
        return l.kind == "empty" ? exports.id().call(l) : __assign(__assign({}, l), { value: f.call(l.value), tail: m(l.tail) });
    });
};
exports.MapList = MapList;
var ListToArray = function (l) { return l.kind == "empty" ? [] : [l.value].concat(exports.ListToArray(l.tail)); };
exports.ListToArray = ListToArray;
var FilterList = function (f) {
    return exports.Fun(function (l) { return exports.FoldList(exports.EmptyList().call({}), function (h, t) { return f.call(h) ? exports.FillList(h).call(t) : t; }).call(l); });
};
exports.FilterList = FilterList;
var FilterListWithBind = function (f) {
    return BindList(exports.Fun(function (e) { return f.call(e) ? exports.FilledList().call(e) : exports.EmptyList().call({}); }));
};
exports.FilterListWithBind = FilterListWithBind;
var JoinList = function () {
    return exports.Fun(function (l) { return l.kind == "empty" ? l : ConcatList(l.value, JoinList().call(l.tail)); });
};
var BindList = function (f) {
    return exports.Fun(function (l) { return exports.MapList(f).then(JoinList()).call(l); });
};
var MergeSortList = function (l, relation) {
    if (l.kind == "empty" || l.tail.kind == "empty") {
        return l;
    }
    else {
        var p = HalfList(l);
        var p1 = MergeSortList(p.fst, relation);
        var p2 = MergeSortList(p.snd, relation);
        return Mergelist(p1, p2, relation);
    }
};
var MergeSortModelList = function (l, relation) {
    if (l.kind == "empty" || l.tail.kind == "empty") {
        return l;
    }
    else {
        var p = HalfList(l);
        var p1 = exports.MergeSortModelList(p.fst, relation);
        var p2 = exports.MergeSortModelList(p.snd, relation);
        return MergeModelList(p1, p2, relation);
    }
};
exports.MergeSortModelList = MergeSortModelList;
var GetListLength = function (l) { return l.kind == "empty" ? 0 : 1 + GetListLength(l.tail); };
var ConcatList = function (l1, l2) {
    return l1.kind == "empty" ? l2 : l2.kind == "empty" ? l1 : __assign(__assign({}, l1), { tail: ConcatList(l1.tail, l2) });
};
var MergeModelList = function (l1, l2, r) {
    return l1.kind == "empty" ? l2 : l2.kind == "empty" ? l1 :
        r(l1.value.snd, l2.value.snd) ? __assign(__assign({}, l1), { tail: MergeModelList(l1.tail, l2, r) }) : __assign(__assign({}, l2), { tail: MergeModelList(l1, l2.tail, r) });
};
var Mergelist = function (l1, l2, Relation) {
    return l1.kind == "empty" ? l2 : l2.kind == "empty" ? l1 :
        Relation(l1.value, l2.value) ? __assign(__assign({}, l1), { tail: Mergelist(l1.tail, l2, Relation) }) : __assign(__assign({}, l2), { tail: Mergelist(l1, l2.tail, Relation) });
};
var HalfList = function (l) { return SplitList(l, Math.round(GetListLength(l) / 2)); };
var SplitList = function (l, n) {
    if (n <= 0) {
        return exports.Pair(exports.EmptyList().call({}), l);
    }
    else if (l.kind == "empty") {
        return exports.Pair(exports.EmptyList().call({}), exports.EmptyList().call({}));
    }
    else {
        var newL = SplitList(l.tail, n - 1);
        return exports.Pair(ConcatList(exports.FilledList().call(l.value), newL.fst), newL.snd);
    }
};
var inl = function () { return exports.Fun(function (v) { return ({ kind: 'l', value: v }); }); };
exports.inl = inl;
var inr = function () { return exports.Fun(function (v) { return ({ kind: 'r', value: v }); }); };
exports.inr = inr;
var MapEither = function (f, g) {
    return exports.Fun(function (e) { return e.kind == 'l' ? f.then(exports.inl()).call(e.value) : g.then(exports.inr()).call(e.value); });
};
exports.MapEither = MapEither;
var JoinRightEither = function () { return exports.Fun(function (e) { return e.kind == 'l' ? exports.id().call(e) : e.value; }); };
exports.JoinRightEither = JoinRightEither;
var UnitRightEither = function () { return exports.inr(); };
exports.UnitRightEither = UnitRightEither;
var BindRightEither = function (e, f) {
    return exports.MapEither(exports.id(), f).then(exports.JoinRightEither()).call(e);
};
exports.BindRightEither = BindRightEither;
var Exception = function () { return exports.inl(); };
exports.Exception = Exception;
var NoException = function () { return exports.inr(); };
exports.NoException = NoException;
var MapException = function (f) { return exports.MapEither(exports.id(), f); };
exports.MapException = MapException;
var JoinException = function () { return exports.JoinRightEither(); };
exports.JoinException = JoinException;
var UnitException = function () { return exports.UnitRightEither(); };
exports.UnitException = UnitException;
