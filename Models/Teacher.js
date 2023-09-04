"use strict";
exports.__esModule = true;
exports.Teachers = exports.Teacher = void 0;
var querybuilder_1 = require("../querybuilder");
var nameresolver_1 = require("../nameresolver");
var Teacher = function (Id, CourseId, StudentId) { return ({ id: Id, courseId: CourseId, studentId: StudentId }); };
exports.Teacher = Teacher;
var Teachers = function () { return querybuilder_1.Querybuilder("Teachers").call(nameresolver_1.getModelList("Teachers")); };
exports.Teachers = Teachers;
