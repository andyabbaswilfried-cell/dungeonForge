const people=[{name: "Andy", age: 19}, {name: "Sarah", age: 22}, {name: "Leo", age: 17}]

const adult= people.filter(e=> e.age>18 && e.age <21)
console.log(adult)