"use strict";
exports.__esModule = true;
exports.Courses = exports.Course = void 0;
var querybuilder_1 = require("../querybuilder");
var nameresolver_1 = require("../nameresolver");
var Course = function (Id, Name, TeacherId) { return ({ id: Id, name: Name, teacherId: TeacherId }); };
exports.Course = Course;
var Courses = function () { return querybuilder_1.Querybuilder("Courses").call(nameresolver_1.getModelList("Courses")); };
exports.Courses = Courses;
