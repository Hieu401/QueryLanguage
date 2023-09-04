import {Querybuilder} from '../querybuilder'
import {getModelList} from '../nameresolver'

type TGrade = {id: number, grade: number, courseId: number, studentId: number }

let Grade = (Id: number, Grade: number, CourseId: number, StudentId: number) : TGrade => 
    ({id: Id, grade: Grade, courseId: CourseId, studentId: StudentId})

let Grades = () => Querybuilder<TGrade>("Grades").call(getModelList("Grades"))

export {TGrade, Grade, Grades}