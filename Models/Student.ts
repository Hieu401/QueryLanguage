import {Querybuilder} from '../querybuilder'
import {getModelList} from '../nameresolver'

type TStudent = {id: number, name: string, age: number, sex: string}

let Student = (Id: number, Name: string, Age: number, Sex: string) : TStudent => ({id: Id, name: Name, age: Age, sex: Sex})
let Students = () => Querybuilder<TStudent>("Students").call(getModelList("Students"))

export {TStudent, Student, Students}