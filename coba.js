let arr1 = ['courier', 'history', 'order']
    arr2 = ['courier']
    arr3 = ['courier', 'history']
    arr4 = ['courier', 'his1tory', 'order']
    arr5 = ['courier', 'history', 'order', 'asd']
let checker = (arr, target) => target.every(v => arr.includes(v));

console.log(checker(arr1, arr2))
console.log(checker(arr1, arr3))
console.log(checker(arr1, arr4))
console.log(checker(arr1, arr5))

const coba = 'asd,    asdddd'
console.log(coba.replace(/\s/g, "").split(','))

let email = "123456@gmail.com";
// let maskedEmail = email.replace(/((?<=^.{5}).+(?=[^@]*?.@))|(g)/, (match, s1) => '*'.repeat(s1.length)); // Replace characters between the 5th and last characters before the '@' symbol with asterisks
// console.log(maskedEmail); // Output: dewi.****y@gmail.com

const len = email.replace(/@.+/, '').length
const regex = new RegExp(`((?<=^.{${len > 6 ? 4 : (len-3 >= 0 ? len-3 : 0)}}).+(?=[^@]*?.@))`, "g")
const encEmail = email.replace(regex, (match, s1) => '*'.repeat(s1.length))
console.log(encEmail)