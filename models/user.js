const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const User = sequelize.define(
  'user',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { tableName: 'user', timestamps: false }
)

module.exports = User
