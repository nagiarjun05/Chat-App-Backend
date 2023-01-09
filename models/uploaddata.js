const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const uploadData = sequelize.define('uploaddata', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileUrl: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = uploadData;