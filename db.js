const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'node_atkbot',
    'postgres',
    '1234',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
)