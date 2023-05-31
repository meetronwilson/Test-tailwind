const db = require('../db/models');
const VehiclesDBApi = require('../db/api/vehicles');

module.exports = class VehiclesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await VehiclesDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let vehicles = await VehiclesDBApi.findBy({ id }, { transaction });

      if (!vehicles) {
        throw new ValidationError('vehiclesNotFound');
      }

      await VehiclesDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return vehicles;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (currentUser.role !== 'admin') {
        throw new ValidationError('errors.forbidden.message');
      }

      await VehiclesDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
