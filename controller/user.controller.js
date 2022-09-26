const db = require('../db')

class UserController {
    async createUser(req, res) {
        const {name} = req.body
        // console.log(name)
        const newPerson = await db.query('INSERT INTO person (name) values ($1) RETURNING *', [name])
        res.json(newPerson.rows[0])
    }
    async getUsers(req, res) {

    }
    async getOneUser(req, res) {

    }
    async updateUser(req, res) {

    }
    async deleteUser(req, res) {

    }
}

module.exports = new UserController()