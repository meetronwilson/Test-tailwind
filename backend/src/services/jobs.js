const db = require('../db/models');
const JobsDBApi = require('../db/api/jobs');

module.exports = class JobsService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await JobsDBApi.create(data, {
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
      let jobs = await JobsDBApi.findBy({ id }, { transaction });

      if (!jobs) {
        throw new ValidationError('jobsNotFound');
      }

      await JobsDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return jobs;
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

      await JobsDBApi.remove(id, {
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
