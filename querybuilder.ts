import {ModelName, getModelList, StringLiteral, isKeyOfType, isKeyOfTypeT} from './nameresolver'
import {
    Exception, 
    List, 
    Pair, 
    Either, 
    Fun, 
    id, 
    MapList, 
    MapPair, 
    MapEither, 
    FilterList, 
    BindRightEither, 
    NoException, 
    ListToArray, 
    MergeSortModelList,
    inr,
    FoldList,
    FilterListWithBind
} from './helpermonads'
import * as fs from 'fs'

const data = fs.readFileSync('./db.json',
            {encoding:'utf8', flag:'r'});

let models = JSON.parse(data)

// Querybuilder
type Grouping<s extends {id: number}, g extends Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>> = Exception<g>

export type Querybuilder<s extends {id: number}> = Exception<List<Pair<Partial<s>,s>>> & 
    { 
        modelType: keyof typeof models
        Select(...property: ((keyof s) | "*")[]) : Querybuilder<s>, 
        Include<m extends keyof typeof models>(name: m, f: (qb: Querybuilder<ModelName<m>>) => Querybuilder<ModelName<m>>) : Querybuilder<s & Record<m , () => Querybuilder<ModelName<m>>>>, 
        Where(f: (model: s) => boolean) : Querybuilder<s>, 
        OrderBy(f: (x: s, y: s) => boolean) : Querybuilder<s>, 
        GroupBy<g extends Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>>(key: keyof s) : Grouping<s,g>,
        First() : Exception<Partial<s>>,
        Get() : Exception<List<Partial<s>>>,
        GetArray() : Exception<Partial<s>[]>,
        // Save
        // Delete
    }

export let Querybuilder = <s extends {id: number}>(mT: keyof typeof models) : Fun<List<Pair<Partial<s>,s>>, Querybuilder<s>> => 
    Fun( lp => (
        {
            modelType: mT,
            kind: 'r', 
            value: lp,
            Select: function (this: Querybuilder<s>, ...property: ((keyof s) | "*")[]) : Querybuilder<s> { 
                return Select(property, this)
            },
            Include: function<m extends keyof typeof models>(this: Querybuilder<s>, name: m, f: (qb: Querybuilder<ModelName<m>>) => Querybuilder<ModelName<m>>) : 
                Querybuilder<s &  Record<m, () => Querybuilder<ModelName<m>>>> 
            {
                return Include(this, name, f)
            },
            Where: function(this: Querybuilder<s>, f: (model: s) => boolean) : Querybuilder<s> { return Where(this, f)},
            OrderBy: function(this: Querybuilder<s>, f: (x:s, y:s) => boolean) : Querybuilder<s> { return OrderBy(this, f)},
            // GroupBy: <b>() : Grouping<b> => null,
            Get: function(this: Querybuilder<s>) : Exception<List<Partial<s>>> { 
                return GetModelList(this)
            },
            GetArray: function(this: Querybuilder<s>) : Exception<Partial<s>[]> {
                return BindRightEither(GetModelList(this), Fun((l) => NoException<Partial<s>[]>().call(ListToArray(l))))
            },
            First: function(this: Querybuilder<s>) : Exception<Partial<s>> {
                return BindRightEither(
                    GetModelList(this), 
                    Fun(
                        (l) => l.kind == "full" ? NoException<Partial<s>>().call(l.value) : Exception<Partial<s>>().call("No Result")
                    )
                )
            },
            GroupBy: function<g extends Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>>
                (this:Querybuilder<s>, k: keyof s) : Grouping<s,g> {
                    return GroupBy(this, k) as Grouping<s,g>
            }
        }
    ))

let Queryexception = <s extends {id: number}>() : Fun<string, Querybuilder<s>> =>
    Fun( e => (
        {
            modelType: 'Students',
            kind: 'l', 
            value: e,
            Select: function (this: Querybuilder<s>, ...property: ((keyof s) | "*")[]) : Querybuilder<s> { 
                return Select(property, this)
            },
            Include: function<m extends keyof typeof models>(this: Querybuilder<s>, name: m, f: (qb: Querybuilder<ModelName<m>>) => Querybuilder<ModelName<m>>) : 
                Querybuilder<s & Record<m, () => Querybuilder<ModelName<m>>>> 
            {
                return Include(this, name, f)  
            },
            Where: function(this: Querybuilder<s>, f: (model: s) => boolean) : Querybuilder<s> { return Where(this, f)},
            OrderBy: function(this: Querybuilder<s>, f: (x: s, y: s) => boolean) : Querybuilder<s> { return OrderBy(this, f)},
            //   GroupBy: <b>() : Grouping<b> => null
            Get: function(this: Querybuilder<s>) : Exception<List<Partial<s>>>
            { 
                return GetModelList(this)
            },
            GetArray: function(this: Querybuilder<s>) : Exception<Partial<s>[]> {
                return BindRightEither(GetModelList(this), Fun((l) => NoException<Partial<s>[]>().call(ListToArray(l))))
            },
            First: function(this: Querybuilder<s>) : Exception<Partial<s>> {
                return BindRightEither(
                    GetModelList(this), 
                    Fun(
                        (l) => l.kind == "full" ? NoException<Partial<s>>().call(l.value) : Exception<Partial<s>>().call("No Result")
                    )
                )
            },
            GroupBy: function<g extends Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>>
                (this:Querybuilder<s>, k: keyof s) : Grouping<s,g> {
                    return GroupBy(this, k) as Grouping<s,g>
            }
        }
    ))

// check if value of key is not primitive
let GroupBy = <s extends {id: number}, g extends Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>>
    (qb: Querybuilder<s>, key: keyof s) : Grouping<s,Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>> =>
        BindRightEither(qb, Fun(
            function (l: List<Pair<Partial<s>,s>>) : Grouping<s,Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>> {
                if (l.kind == "empty") { 
                    return Exception<g>().call("Cannot group empty collection")
                }
                else {
                    let foldedList = FoldList<Pair<Partial<s>,s>, Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>>(
                        {}, 
                        function (element: Pair<Partial<s>,s>, o: Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>) : Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>> {
                            let k = element.snd[key]
                            if (typeof k == "string" || typeof k == "number") {
                                if(isKeyOfTypeT(k, o)) {
                                    if(o[k] == undefined) {
                                        o[k] = [element.fst]
                                        return o
                                    }
                                    else{
                                        let t: Partial<s>[] = <Partial<s>[]>o[k]
                                        t.push(element.fst)
                                        o[k] = t
                                        return o
                                    }
                                }
                                else {
                                    let newObject: Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>> = {}
                                    newObject[k as Extract<s[keyof s], string | number>] = [element.fst]
                                    return {...o, ...newObject}
                                }
                            } else { 
                                return {}
                            }
                        }
                    ).call(l)
                    return foldedList == {} ? Exception<g>().call("Value not groupable") : inr<string, Partial<Record<Extract<s[keyof s], string | number>, Partial<s>[]>>>().call(foldedList)
                }
            })
        )

let MapListPair = <a,b,s,ns>(f: Fun<a,b>, g: Fun<s,ns>) : Fun<List<Pair<a,s>>, List<Pair<b,ns>>> =>
    Fun(lp => MapList<Pair<a,s>, Pair<b,ns>>(MapPair<a,s,b,ns>(f, g)).call(lp))

let MapQuerybuilder = <s extends {id: number}>(f: Fun<Partial<s>,Partial<s>>) : Fun<Querybuilder<s>, Querybuilder<s>> =>
    Fun((qb: Querybuilder<s>) => 
        qb.kind == 'l' ? Queryexception<s>().call(qb.value) : Querybuilder<s>(qb.modelType).call(MapList(MapPair<Partial<s>,s,Partial<s>,s>(f, id())).call(qb.value)))

let JoinQuerybuilder = <s extends {id: number}>() : Fun<Either<string, Querybuilder<s>>, Querybuilder<s>> => 
    Fun(qb => qb.kind == 'l' ? Queryexception<s>().call(qb.value) : qb.value)

let BindQuerybuilder = <s extends {id: number},a>(qb: Either<string, a>, f: Fun<a, Querybuilder<s>>) : Querybuilder<s> =>
        MapEither(id<string>(), f).then(JoinQuerybuilder()).call(qb)

let Select = <s extends {id: number}>(keys: ((keyof s) | "*")[], qb: Querybuilder<s>) : Querybuilder<s> =>
        BindQuerybuilder(qb, 
            Fun(
                function (l : List<Pair<Partial<s>,s>>) {
                    if (keys.length <= 0) { 
                        return Queryexception<s>().call("No attributes given in Select clause") 
                    }
                    else if (l.kind == "empty") {
                        return Querybuilder<s>(qb.modelType).call(l)
                    }
                    else if (keys.some( e => e =="*")) {
                        return Querybuilder<s>(qb.modelType).call(
                            MapList<Pair<Partial<s>,s>, Pair<Partial<s>,s>>(
                                Fun(
                                    (p: Pair<Partial<s>,s>) : Pair<Partial<s>,s> => AddKeysFromRight(p, Object.keys(l.value.snd) as (keyof s)[])
                                )
                            ).call(l)
                        )
                    }
                    else {
                        return Querybuilder<s>(qb.modelType).call(
                            MapList<Pair<Partial<s>,s>, Pair<Partial<s>,s>>(
                                Fun(
                                    (p: Pair<Partial<s>,s>) : Pair<Partial<s>,s> => AddKeysFromRight(p, keys.filter(e => e != "*") as (keyof s)[])
                                )
                            ).call(l)
                        )
                    }
                }
            )
        )

let Where = <s extends {id: number}>(qb: Querybuilder<s>, f: (model: s) => boolean) : Querybuilder<s> =>
    BindQuerybuilder(qb, Fun(
            (l: List<Pair<Partial<s>, s>>) => Querybuilder<s>(qb.modelType).call(FilterListWithBind<Pair<Partial<s>,s>>(Fun((p) => f(p.snd))).call(l))
        ))

let OrderBy = <s extends {id: number}>(qb: Querybuilder<s>, f: (x: s, y: s) => boolean) : Querybuilder<s> =>
    BindQuerybuilder(qb, Fun(
        (l: List<Pair<Partial<s>, s>>) => Querybuilder<s>(qb.modelType).call(MergeSortModelList(l, f))
    ))

let Include = function<s extends {id: number}, m extends keyof typeof models>
    (currentQB: Querybuilder<s>, nameRelation: m, f: (nestedQB: Querybuilder<ModelName<m>>) => Querybuilder<ModelName<m>>) : Querybuilder<s & Record<m, () => Querybuilder<ModelName<m>>>>
    {
        return BindQuerybuilder(currentQB, 
            Fun<List<Pair<Partial<s>,s>>, Querybuilder<s & Record<m, () => Querybuilder<ModelName<m>>>>>(
                function (l : List<Pair<Partial<s>, s>>) : Querybuilder<s & Record<m, () => Querybuilder<ModelName<m>>>> {
                    
                    let relationList = getModelList(nameRelation)
                    let foreignKey = (currentQB.modelType as string).slice(0, -1).toLowerCase() + "Id"

                    if(relationList.kind == "empty") {
                        return Queryexception<s & Record<m, () => Querybuilder<ModelName<m>>>>().call("No objects in relationship")
                    }
                    else if ( isKeyOfType(foreignKey, relationList.value.snd) ) {
                        let fk = foreignKey // for some reason had to do this, otherwise foreignKey would become a string type again
                        return Querybuilder<s & Record<m, () => Querybuilder<ModelName<m>>>>(currentQB.modelType).call(
                            MapList(
                                Fun(
                                    (p: Pair<Partial<s>, s>) : Pair<Partial<s & Record<m, () => Querybuilder<ModelName<m>>>>, s & Record<m, () => Querybuilder<ModelName<m>>>> => 
                                    AddLazyRelationToModel(p, fk, nameRelation, f)
                                )
                            ).call(l)
                        ) 
                    }
                    else {
                        return Queryexception<s & Record<m, () => Querybuilder<ModelName<m>>>>().call("No relation found between" + <string>currentQB.modelType + " and " + nameRelation)
                    }
                } 
            )
        )
    }

let GetModelList = <s extends {id: number}>(qb: Querybuilder<s>) : Exception<List<Partial<s>>> =>
    BindRightEither(qb, Fun((lp) => NoException<List<Partial<s>>>().call(MapList(Fun((p: Pair<Partial<s>, s>) => p.fst)).call(lp))))

let AddLazyRelationToModel = <s extends {id: number}, m extends keyof typeof models>
    (p: Pair<Partial<s>, s>, nameModel: keyof ModelName<m>, nameRelation: m, f: (NQB: Querybuilder<ModelName<m>>) => Querybuilder<ModelName<m>>) :
    Pair<Partial<s & Record<m, () => Querybuilder<ModelName<m>>>>, s & Record<m, () => Querybuilder<ModelName<m>>>> =>
        {
            let relation = Querybuilder<ModelName<m>>(nameRelation).call(getModelList(nameRelation))
                .Where((r) => r[nameModel] as unknown == p.snd.id)

            // Had to initiate an empty object first and then make a translation from partial to not partial
            let relationObject: Partial<Record<m, () => Querybuilder<ModelName<m>>>> = {}
            relationObject[nameRelation] = () => f(relation)
            let filledRelationObject: Record<m, () => Querybuilder<ModelName<m>>> = <Record<m, () => Querybuilder<ModelName<m>>>>{...relationObject}

            return MapPair(
                Fun<Partial<s>, Partial<s & Record<m, () => Querybuilder<ModelName<m>>>>>(p => <Partial<s & Record<m, () => Querybuilder<ModelName<m>>>>>({...p, ...filledRelationObject}) ), 
                Fun<s, s & Record<m, () => Querybuilder<ModelName<m>>>>(p => ({...p, ...filledRelationObject}))).call(p)
        }    

let AddKeysFromRight = <s>(p: Pair<Partial<s>,s>, keys: (keyof s)[]) : Pair<Partial<s>,s> =>
    {   
        for (let K in keys) {
            let newFirst = p.fst
            newFirst[keys[K]] = p.snd[keys[K]]
        }
        // !
        return Pair<Partial<s>,s>(p.fst, p.snd)
    }