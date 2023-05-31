const db = require('../db/models');
const InvoicesDBApi = require('../db/api/invoices');

module.exports = class InvoicesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await InvoicesDBApi.create(data, {
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
      let invoices = await InvoicesDBApi.findBy({ id }, { transaction });

      if (!invoices) {
        throw new ValidationError('invoicesNotFound');
      }

      await InvoicesDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return invoices;
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

      await InvoicesDBApi.remove(id, {
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
