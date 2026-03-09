1. What is the difference between var, let, and const?

var is function-scoped and can be redeclared and reassigned. 
It is also hoisted and initialized as undefined. 
let is block-scoped, can be reassigned but cannot be redeclared in the same scope. 
const is block-scoped, cannot be reassigned or redeclared, and must be initialized at declaration. 
const does not make objects immutable, just the binding.

2. What is the spread operator (...)?

The spread operator is written as three dots (...) and is used to expand an iterable like an array or object into individual elements. 
It is commonly used to copy arrays or objects, combine them, or pass array elements as arguments to functions. 
For example: const newArray = [...oldArray, 'new item'];

3. What is the difference between map(), filter(), and forEach()?

map creates a new array by applying a function to every element of the original array. 
filter creates a new array containing only elements that pass a test condition. 
forEach executes a function on each element but does not return a new array, making it useful for side effects like logging or modifying external variables.

4. What is an arrow function?

An arrow function is a shorter syntax for writing function expressions using =>. 
It does not have its own this, arguments, or super, and cannot be used as a constructor. 
Arrow functions inherit this from the surrounding lexical scope, making them useful for callbacks and avoiding confusion with this binding.

5. What are template literals?

Template literals are strings enclosed in backticks (``) instead of quotes. 
They support multiline strings and string interpolation using ${expression} to embed variables or expressions directly inside the string. 
For example: const message = Hello, ${name}!;
