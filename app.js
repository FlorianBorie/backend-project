require('babel-register')
const {success, error} = require('functions')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const morgan = require('morgan')
const config = require('./config')

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

        const app = express()

        let MembersRouter = express.Router()

        app.use(morgan('dev'))
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended : true }));

        MembersRouter.route('/:id')

            // Récupère un membre avec son ID
            .get((req, res) => {

                db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                    if(err) {
                        res.json(error(err.message))
                    }else{

                        if(result[0] != undefined){
                            res.json(success(result[0]))
                        } else {
                            res.json(error('Wrong id'))
                        }
                        
                    }
                })
            })

            // Modifie un membre avec son ID
            .put((req, res) => {

                if(req.body.mail) {

                    db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        }else{
    
                            if(result[0] != undefined){
                                
                                db.query('SELECT * FROM members WHERE mail = ? AND id != ?', [req.body.mail,req.params.id], (err, result) => {
                                    if(err) {
                                        res.json(error(err.message))
                                    } else {
                                        if(result[0] != undefined) {
                                            res.json(error('same mail'))
                                        } else {

                                            db.query('UPDATE members SET firstname = ?, lastname = ?, age = ?, mail = ? where id = ?', [req.body.firstname, req.body.lastname, req.body.age, req.body.mail, req.params.id], (err, result) => {
                                                if(err) {
                                                    res.json(error(err.message))
                                                } else {
                                                    res.json(success(true))
                                                }
                                            })
                                        }
                                    }
                                })
                            } else {
                                res.json(error('Wrong id'))
                            }
                        }
                    })
                } else {
                    res.json(error('no name value'))
                }
            })

            // Suprime un membre avec son ID
            .delete ((req, res) => {

                let index = getIndex(req.params.id);

                if (typeof(index) == 'string') {
                    res.json(error(index))
                } else {

                    members.splice(index, 1)
                    res.json(success(members))

                }
            })
            
        MembersRouter.route('/')

            // Récupère tous les membres
            .get((req, res) => {
                if(req.query.max != undefined && req.query.max > 0) {

                    db.query('SELECT * FROM members LIMIT 0, ?', [req.query.max], (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        } else {
                            res.json(success(result))
                        }
                            
                    })
                }else if(req.query.max != undefined){
                    res.json(error('Wrong max value'))
                }else{
                    db.query('SELECT * FROM members', (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        } else {
                            res.json(success(result))
                        }
                            
                    })
                    res.json(success(members[0].firstname)) 
                }
            })

            // Ajoute un membre
            .post((req, res) => {
                if(req.body.mail) {

                    db.query('SELECT * FROM members WHERE mail = ?', [req.body.mail], (err, result) => {
                        if(err) {
                            res.json(error(err.message))
                        } else {
                            if (result[0] != undefined) {
                                res.json(error('Wrong mail'))
                            } else {
                                db.query('INSERT INTO members(firstname, lastname, age, mail) VALUES(?, ?, ?, ?)', [req.body.firstname, req.body.lastname, req.body.age, req.body.mail], (err, result) => {
                                    if(err) {
                                        res.json(error(err.message))
                                    } else {
                                        db.query('SELECT * FROM members WHERE mail = ?', [req.body.mail], (err, result) => {
                                            if(err) {
                                                res.json(error(err.message))
                                            } else {
                                                res.json(success({
                                                    id: result[0].id,
                                                    firstname: result[0].firstname,
                                                    lastname: result[0].lastname,
                                                    age: result[0].age,
                                                    mail: result[0].mail
                                                }))
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }else{
                    res.json(error('no name value'))
                }
            })

        app.use(config.rootAPI+'members', MembersRouter)

        app.listen(config.port, () => console.log('Started on port '+config.port))
    }
})

function getIndex(id) {
    for (let i = 0; i < members.length; i++) {
        if(members[i].id == id)
            return i
    }
    return 'wrong id'
}

function createID() {
    return lastMember = members[members.length-1].id + 1
}