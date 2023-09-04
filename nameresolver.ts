// import models from './db.json'
import {TStudent} from './Models/Student'
import {TGrade} from './Models/Grade'
import {TCourse} from './Models/Course'
import {TTeacher} from './Models/Teacher'
import {List, Pair, EmptyList, FillList} from './helpermonads'
import * as fs from 'fs'

const data = fs.readFileSync('./db.json',
            {encoding:'utf8', flag:'r'});

let models = JSON.parse(data)

type ModelName<T> = 
    T extends "Grades"  ? TGrade : 
    T extends "Students" ? TStudent :
    T extends "Courses" ? TCourse :
    T extends "Teachers" ? TTeacher : 
    never

type StringLiteral<T> = T extends string ? string extends T ? never : T : never


let getModelList = function <m extends keyof typeof models>(modelname: m) : List<Pair<{}, ModelName<m>>> {
    let l = EmptyList<Pair<Partial<ModelName<m>>, ModelName<m>>>().call(Pair({}, {} as ModelName<m>))
    for (let model of models[modelname]) {
        l = FillList(Pair({}, model as ModelName<m>)).call(l)
    }
    return l
}

let isKeyOfType = <m extends keyof typeof models>(potentialKey: string | number | symbol, object: ModelName<m>) : potentialKey is keyof ModelName<m> => 
    potentialKey in object

let isKeyOfTypeT = <b>(k: string | number | symbol, o:b) : k is keyof b => k in o

export {ModelName, StringLiteral, getModelList, isKeyOfType, isKeyOfTypeT}