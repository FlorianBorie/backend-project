let db, config

module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Members
}

let Members = class {

    static getById(id) {

        return new Promise((next) => {
            db.query('SELECT * FROM members WHERE id = ?', [id])
                .then((result) => {
                    if(result[0] != undefined){
                        next(result[0])
                    } else {
                        next(new Error(config.errors.wrongID))
                    }
                })
                .catch((err) => next(err))
        })

    }

    static getAll(max) {

        return new Promise((next) => {

            if(max != undefined && max > 0) {

            db.query('SELECT * FROM members LIMIT 0, ?', [parseInt(max)])
                .then((result) => next(result))
                .catch((err) => next(err))
            }else if(max != undefined){
                next(new Error(config.errors.wrongMaxValue))
            }else{

                db.query('SELECT * FROM members')
                    .then((result) => next(result))
                    .catch((err) => next(err))
            }

        })
    }

    static add(firstname, lastname, age, mail) {

        return new Promise((next) => {

            if(mail != undefined && mail.trim() != '') {

                mail = mail.trim()

                db.query('SELECT * FROM members WHERE mail = ?', [mail])
                    .then((result) => {
                        if (result[0] != undefined) {
                            next(new Error(config.errors.wrongMail))
                        } else {
                            return db.query('INSERT INTO members(firstname, lastname, age, mail) VALUES(?, ?, ?, ?)', [firstname, lastname, age, mail])
                        }
                    })
                    .then(() => {
                        return db.query('SELECT * FROM members WHERE mail = ?', [mail])
                    })
                    .then((result) => {
                        next({
                            id: result[0].id,
                            firstname: result[0].firstname,
                            lastname: result[0].lastname,
                            age: result[0].age,
                            mail: result[0].mail
                        })                       
                    })
                    .catch((err) => next(err))
            }else{
                next(new Error(config.errors.noNameValue))
            }
        })

    }

    static update(id, firstname, lastname, age, mail) {

        return new Promise((next) => {

            if(mail != undefined && mail.trim() != '') {

                mail = mail.trim()

                db.query('SELECT * FROM members WHERE id = ?', [id])
                    .then((result) => {
                        if(result[0] != undefined){                            
                            return db.query('SELECT * FROM members WHERE mail = ? AND id != ?', [mail,id])
                        } else {
                            next(new Error(config.errors.wrongID))
                        }
                    })
                    .then((result) => {
                        if(result[0] != undefined) {
                            next(new Error(config.errors.sameName))
                        } else {
                            return db.query('UPDATE members SET firstname = ?, lastname = ?, age = ?, mail = ? where id = ?', [firstname, lastname, age, mail, id])
                        }  
                    })
                    .then(() => next(true))
                    .catch((err) => next(err))
            } else {
                next(new Error(config.errors.noNameValue))
            }
        })   
    }

    static delete(id){
        return new Promise((next) => {
            db.query('SELECT * FROM members WHERE id = ?', [id])
                .then((result) => {
                    if(result[0] != undefined){
                        return db.query('DELETE FROM members Where id = ?', [id])
                    } else {
                    next(new Error(config.errors.wrongID))
                    } 
                })
                .then(() => next(true))
                .catch((err) => next(err))
        })
    }

}