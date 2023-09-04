// Fun framework
export type Fun<a,b> = {call: (_:a) => b, then: <c>(g: Fun<b,c>) => Fun<a,c>}
export let Fun = <a,b>(f: (_:a) => b) : Fun<a,b> => ({call: f, then: <c>(g: Fun<b,c>) => Fun((x: a) => g.call(f(x)))})
export let id = <a>(): Fun<a,a> => Fun(x =>x)

// Pair
export type Pair<a,b> = {fst: a, snd: b}

export let Pair = <a,b>(x: a, y: b) : Pair<a,b> => ({fst: x, snd: y})

export let MapPair = <a,b,c,d>(f: Fun<a,c>, g: Fun<b,d>): Fun<Pair<a,b>, Pair<c,d>> =>
    Fun( p => ({fst: f.call(p.fst) , snd: g.call(p.snd)}) )

// List
export type List<a> = ({kind: "full", value: a, tail: List<a>} | {kind: "empty"})  

export let FilledList = <a>() : Fun<a, List<a>> => Fun( x => ({kind: "full", value: x, tail: EmptyList<a>().call(x)}))

export let EmptyList = <a>(): Fun<a, List<a>> => Fun(_ => ({kind: "empty"}))

export let FillList = <a>(x: a) : Fun<List<a>, List<a>> => Fun(l => ({kind: "full", value: x, tail: l}))

export let FoldList = <a,b>(base: b, f: (x:a, y:b) => b) : Fun<List<a>, b> =>
    Fun( l => l.kind == "empty" ? base : f(l.value, FoldList(base, f).call(l.tail)))
 
// let MapList = <a,b>(f: Fun<a,b>) : Fun<List<a>, List<b>> => 
//     Fun( l => FoldList<a, List<b>>( {kind: "empty"}, (h, t) => FillList(f.call(h)).call(t)).call(l) )

export let MapList = <a,b>(f: Fun<a,b>) : Fun<List<a>, List<b>> =>
    Fun( 
        function m (l) : List<b> { 
            return l.kind == "empty" ? id<List<b>>().call(l) : {...l, value: f.call(l.value), tail: m(l.tail)}
        }
    )

export let ListToArray = <a>(l: List<a>) : a[] => l.kind == "empty" ? [] : [l.value].concat(ListToArray(l.tail))

export let FilterList = <a>(f: Fun<a, boolean>) : Fun<List<a>, List<a>> =>
    Fun( l => FoldList<a, List<a>>(EmptyList<a>().call({} as a), (h, t) => f.call(h) ? FillList(h).call(t) : t).call(l) )

export let FilterListWithBind = <a>(f: Fun<a, boolean>) : Fun<List<a>, List<a>> =>
    BindList(
        Fun((e: a) : List<a> => f.call(e) ? FilledList<a>().call(e) : EmptyList<a>().call({} as a))
    )

let JoinList = <a>() : Fun<List<List<a>>, List<a>> => 
        Fun(l => l.kind == "empty" ? l : ConcatList<a>(l.value, JoinList<a>().call(l.tail)))

let BindList = <a,b>(f: Fun<a, List<b>>) : Fun<List<a>,List<b>> =>
    Fun(l => MapList<a, List<b>>(f).then(JoinList()).call(l))

let MergeSortList = function<a>(l: List<a>, relation: (x: a, y: a) => boolean) : List<a> {
    if (l.kind == "empty" || l.tail.kind == "empty") {
        return l
    }
    else {
        let p = HalfList(l)
        let p1 = MergeSortList(p.fst, relation)
        let p2 = MergeSortList(p.snd, relation)
        return Mergelist(p1, p2, relation)
    }
}

export let MergeSortModelList = function<a>(l: List<Pair<Partial<a>,a>>, relation: (x: a, y: a) => boolean) : List<Pair<Partial<a>,a>> {
    if (l.kind == "empty" || l.tail.kind == "empty") {
        return l
    }
    else {
        let p = HalfList(l)
        let p1 = MergeSortModelList(p.fst, relation)
        let p2 = MergeSortModelList(p.snd, relation)
        return MergeModelList(p1, p2, relation)
    }
}

let GetListLength = <a>(l: List<a>) : number => l.kind == "empty" ? 0 : 1 + GetListLength(l.tail)

let ConcatList = <a>(l1: List<a>, l2: List<a>) : List<a> => 
    l1.kind == "empty" ? l2 : l2.kind == "empty" ? l1 : {...l1, tail: ConcatList(l1.tail, l2)}

let MergeModelList = <a>(l1: List<Pair<Partial<a>,a>>, l2: List<Pair<Partial<a>,a>>, r: (x:a, y:a) => boolean) : List<Pair<Partial<a>,a>> =>
    l1.kind == "empty" ? l2 : l2.kind == "empty" ? l1 : 
    r(l1.value.snd, l2.value.snd) ? {...l1, tail: MergeModelList(l1.tail, l2, r)} :
    {...l2, tail: MergeModelList(l1, l2.tail, r)}

let Mergelist = <a>(l1: List<a>, l2: List<a>, Relation: (x: a, y: a) => boolean ) : List<a> => 
    l1.kind == "empty" ? l2 : l2.kind == "empty" ? l1 : 
    Relation(l1.value, l2.value) ? {...l1, tail: Mergelist(l1.tail, l2, Relation)} :
    {...l2, tail: Mergelist(l1, l2.tail, Relation)}

let HalfList = <a>(l: List<a>) : Pair<List<a>, List<a>> => SplitList(l, Math.round(GetListLength(l) / 2))
let SplitList = <a>(l: List<a>, n: number) : Pair<List<a>, List<a>> => {
    if (n <= 0) {
        return Pair(EmptyList<a>().call({} as a), l)
    } 
    else if (l.kind == "empty") {
        return Pair(EmptyList<a>().call({} as a), EmptyList<a>().call({} as a))
    } 
    else {
        let newL = SplitList(l.tail, n - 1)
        return Pair(ConcatList(FilledList<a>().call(l.value), newL.fst), newL.snd)
    }
}


// Either
export type Either<a,b> = ({kind: 'l', value: a} | {kind: 'r', value: b})

export let inl = <a, b>(): Fun<a,Either<a,b>> => Fun((v: a): Either<a,b> => ({kind: 'l', value: v}))

export let inr = <a, b>(): Fun<b,Either<a,b>> => Fun((v: b): Either<a,b> => ({kind: 'r', value: v}))

export let MapEither = <a,b,c,d>(f: Fun<a,c>, g: Fun<b,d>): Fun<Either<a,b>, Either<c,d>> => 
    Fun((e: Either<a,b>): Either<c,d> => e.kind == 'l' ? f.then(inl<c, d>()).call(e.value) : g.then(inr<c,d>()).call(e.value))

export let JoinRightEither = <a,b>(): Fun<Either<a, Either<a,b>>, Either<a,b>> => Fun(e => e.kind == 'l' ? id<Either<a,b>>().call(e) : e.value)
export let UnitRightEither = <a,b>(): Fun<b, Either<a,b>> => inr()
export let BindRightEither = <a,b,c>(e: Either<a,b>, f: Fun<b, Either<a,c>>) : Either<a,c> => 
    MapEither<a,b,a,Either<a,c>>(id(), f).then(JoinRightEither<a,c>()).call(e)

// Exception
export type Exception<a> = Either<string, a>  

export let Exception = <a>(): Fun<string, Exception<a>> => inl<string, a>()
export let NoException = <a>(): Fun<a, Exception<a>> => inr<string, a>()

export let MapException = <a,b>(f: Fun<a,b>): Fun<Exception<a>, Exception<b>> => MapEither(id(), f)

export let JoinException = <a>(): Fun<Exception<Exception<a>>, Exception<a>> => JoinRightEither<string, a>()

export let UnitException = <a>(): Fun<a, Exception<a>> => UnitRightEither()
