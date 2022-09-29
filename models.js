const sequelize = require('./db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.STRING, unique: true},
    first_name: {type: DataTypes.STRING, unique: true},
    last_name: {type: DataTypes.STRING, unique: true},
    username: {type: DataTypes.STRING, unique: true}
})

module.exports = User;