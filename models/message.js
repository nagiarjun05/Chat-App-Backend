const Sequelize=require('sequelize');

const sequelize=require('../util/database');

const Message=sequelize.define('message',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  message:Sequelize.STRING
});

module.exports=Message;