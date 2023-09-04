import {Student, TStudent, Students} from './Models/Student'
import {TCourse, Course, Courses} from './Models/Course'
import {Querybuilder} from './querybuilder'

/*

type Querybuilder<a> = Either<string, List<Pair<{}, a>>>

Select is a bind, returns either an error or a list with objects
    1. It is inclusive, calling select twice should return the combination of both select without the duplicate keys
    2. It returns a error if no parameters have been passed
    3. It returns the whole Object if a "*" has been passed
    4. It passes error messages of previous clauses
    5. Shows compiler error if you try to select properties of the model that does not exist

Include is a bind that maps each object in the list to the same object with an additional function that gets called last moment
    1. Lazy loaded
    2. Only does N - M
    3. Passes error messages of previous clauses
    4. Returns an error if no relation exists
    5. Returns an error if no model exists in the relation (Should be impossible technically)
    6. Shows compiler error if you try to get a model that does not exist
    7. Shows compiler error if you try to get properties of that model in the query function

Where is also a bind on Either level, but a filter on List level
    1. Accepts a function that take each model in the querybuilder as input and returns a bool
    2. Able to filter on all properties of the models regardless of previous clauses
    3. Based on a bind as well
    4. Passes error messages from previous clauses
    5. Shows compiler error if you try to call properties of the model that does not exist in the predicate function

OrderBy is also a bind on Either level, but a mergesort on List level
    1. Based on own Merge Sort algorithm
    2. Instead of a simple > or < in the algorithm, the function of the algorithm 
        has been changed to accept another function that 
        represents the predicate which is used in the algorithm itself. This give the user alot of flexibility
    3. This the predicate function accepts two models as input and returns a boolean as output
    4. Able to get all properties of the models regardless of previous clauses
    5. Passes error messages from previous clauses
    6. Shows compiler error if you try to call properties of the model that does not exist in the predicate function

Group is also a Bind on Either level, but a fold on List level that folds a List into a Object with lists
    1. Returns a new Group object
    2. Based on fold
    3. Returns an error if the querybuilder is empty
    4. Should return an error if you try to group based on a property that cannot turn into a key

*/

let students: Querybuilder<TStudent> = Students()
let courses: Querybuilder<TCourse> = Courses()

// console.log(students.Select("id", "name").Include("Courses", (x) => x.Select("id")))

//let s = students.Select("*").GetArray()//.OrderBy((x, y) => x.age > y.age ).Where((x) => x.age < 18 ).GroupBy("sex")
//console.log(s.value)

// let t = students.Select("id", "name")
//     .Include(
//         "Grades", 
//         (g) => g.Select("id", "grade").OrderBy((x, y) => x.grade > y.grade).Where(x => x.grade > 5)
//     )
//     .OrderBy((x, y) => x.age > y.age)
//     .GroupBy("sex")

let t2 = students.Select("age").Include("Grades", (r) => r)
// console.log(t2.kind == "l" ? t.value )
console.log(t2.kind == "l" ? t2.value : t2.GetArray().Grades == undefined ? undefined : t2.value.Grades().GetArray().value)