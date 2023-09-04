"use strict";
exports.__esModule = true;
exports.Students = exports.Student = void 0;
var querybuilder_1 = require("../querybuilder");
var nameresolver_1 = require("../nameresolver");
var Student = function (Id, Name, Age, Sex) { return ({ id: Id, name: Name, age: Age, sex: Sex }); };
exports.Student = Student;
var Students = function () { return querybuilder_1.Querybuilder("Students").call(nameresolver_1.getModelList("Students")); };
exports.Students = Students;
