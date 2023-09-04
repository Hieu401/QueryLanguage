import {Querybuilder} from '../querybuilder'
import {getModelList} from '../nameresolver'

type TCourse = {id: number, name: string, teacherId: number}

let Course = (Id: number, Name: string, TeacherId: number) : TCourse => ({id: Id, name: Name, teacherId: TeacherId})
let Courses =  () => Querybuilder<TCourse>("Courses").call(getModelList("Courses"))

export {TCourse, Course, Courses}