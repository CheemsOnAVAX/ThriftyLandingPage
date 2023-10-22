const { encrypt, decrypt } = require('./utils/crpyto');

const hash = encrypt(`
    Hello World!asdfasdfasdfasdfas2349870987@1230985
    asdf%kj !@#$%^&*(_+":?><MNBVCX)
`, "0xf827c3E5fD68e78aa092245D442398E12988901C");


// {
//     iv: '237f306841bd23a418878792252ff6c8',
//     content: 'e2da5c6073dd978991d8c7cd'
// }

const text = decrypt(hash, "0xf827c3E5fD68e78aa092245D442398E12988901C");

console.log(text); // Hello World!