require('babel-register')
const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    database: 'backendproject',
    user: 'root',
    password: ''
})

db.connect((err) => {
    if(err){
        console.log(err.message)
    } else {
        console.log('Connected.')
    }
})