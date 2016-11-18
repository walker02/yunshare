import path from 'path';
import Sequelize from 'sequelize';

const mysql = new Sequelize('yun', 'root', 'root', {
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 5,
    idle: 10000
  },
});

const User = mysql.import(path.join(__dirname, './User'));

const Share = mysql.import(path.join(__dirname, './Share'));

export { User, Share };
