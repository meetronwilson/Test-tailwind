const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const vehicles = sequelize.define(
    'vehicles',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      make: {
        type: DataTypes.TEXT,
      },

      model: {
        type: DataTypes.TEXT,
      },

      year: {
        type: DataTypes.TEXT,
      },

      plate_number: {
        type: DataTypes.TEXT,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  vehicles.associate = (db) => {
    db.vehicles.belongsTo(db.users, {
      as: 'owner_id',
      foreignKey: {
        name: 'owner_idId',
      },
      constraints: false,
    });

    db.vehicles.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.vehicles.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return vehicles;
};
