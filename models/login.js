"use strict";
module.exports = function(sequelize, DataTypes) {
  var Login = sequelize.define("Login", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    source_type: DataTypes.STRING,
    source_id: DataTypes.INTEGER,
    role: DataTypes.ENUM('unit leader', 'pal', 'hq staff', 'admin')
  }, {
    underscored: true,
    classMethods: {
      associate: function(models) {}
    }
  });
  return Login;
};