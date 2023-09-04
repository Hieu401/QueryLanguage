"use strict";
exports.__esModule = true;
exports.Grades = exports.Grade = void 0;
var querybuilder_1 = require("../querybuilder");
var nameresolver_1 = require("../nameresolver");
var Grade = function (Id, Grade, CourseId, StudentId) {
    return ({ id: Id, grade: Grade, courseId: CourseId, studentId: StudentId });
};
exports.Grade = Grade;
var Grades = function () { return querybuilder_1.Querybuilder("Grades").call(nameresolver_1.getModelList("Grades")); };
exports.Grades = Grades;
