'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = define;
function define(sequelize, DataTypes) {
  return sequelize.define('User', {
    uid: DataTypes.STRING(32),
    type: DataTypes.STRING(20),
    url: DataTypes.STRING(255),
    down: { type: DataTypes.INTEGER, defaultValue: 0 },
    done: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 't_user',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    indexes: [{ unique: true, fields: ['uid'] }]
  });
}