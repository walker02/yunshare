export default function define(sequelize, DataTypes) {
  return sequelize.define('Share',
    {
      uid: DataTypes.STRING(32),
      type: DataTypes.STRING(20),
      url: DataTypes.STRING(255),
      down: { type: DataTypes.INTEGER, defaultValue: 0 },
      done: { type: DataTypes.INTEGER, defaultValue: 0 }
    },
    {
      tableName: 't_share',
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      indexes: [{ unique: true, fields: ['uid'] }]
    });
}
