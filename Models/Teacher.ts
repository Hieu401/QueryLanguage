import {Querybuilder} from '../querybuilder'
import {getModelList} from '../nameresolver'

type TTeacher = {id: number, courseId: number, studentId: number }

let Teacher = (Id: number, CourseId: number, StudentId: number) : TTeacher => ({id: Id, courseId: CourseId, studentId: StudentId})
let Teachers = () => Querybuilder<TTeacher>("Teachers").call(getModelList("Teachers"))

export {TTeacher, Teacher, Teachers}