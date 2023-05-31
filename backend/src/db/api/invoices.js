const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class InvoicesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const invoices = await db.invoices.create(
      {
        id: data.id || undefined,

        date: data.date || null,
        amount: data.amount || null,
        description: data.description || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await invoices.setUser_id(data.user_id || null, {
      transaction,
    });

    await invoices.setJob_ids(data.job_ids || [], {
      transaction,
    });

    return invoices;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const invoices = await db.invoices.findByPk(id, {
      transaction,
    });

    await invoices.update(
      {
        date: data.date || null,
        amount: data.amount || null,
        description: data.description || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await invoices.setUser_id(data.user_id || null, {
      transaction,
    });

    await invoices.setJob_ids(data.job_ids || [], {
      transaction,
    });

    return invoices;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const invoices = await db.invoices.findByPk(id, options);

    await invoices.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await invoices.destroy({
      transaction,
    });

    return invoices;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const invoices = await db.invoices.findOne({ where }, { transaction });

    if (!invoices) {
      return invoices;
    }

    const output = invoices.get({ plain: true });

    output.user_id = await invoices.getUser_id({
      transaction,
    });

    output.job_ids = await invoices.getJob_ids({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.users,
        as: 'user_id',
      },

      {
        model: db.jobs,
        as: 'job_ids',
        through: filter.job_ids
          ? {
              where: {
                [Op.or]: filter.job_ids.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.job_ids ? true : null,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('invoices', 'description', filter.description),
        };
      }

      if (filter.dateRange) {
        const [start, end] = filter.dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.amountRange) {
        const [start, end] = filter.amountRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            amount: {
              ...where.amount,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            amount: {
              ...where.amount,
              [Op.lte]: end,
            },
          };
        }
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.user_id) {
        var listItems = filter.user_id.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          user_idId: { [Op.or]: listItems },
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = options?.countOnly
      ? {
          rows: [],
          count: await db.invoices.count({
            where,
            include,
            distinct: true,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order:
              filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction,
          }),
        }
      : await db.invoices.findAndCountAll({
          where,
          include,
          distinct: true,
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
          order:
            filter.field && filter.sort
              ? [[filter.field, filter.sort]]
              : [['createdAt', 'desc']],
          transaction,
        });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('invoices', 'date', query),
        ],
      };
    }

    const records = await db.invoices.findAll({
      attributes: ['id', 'date'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['date', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.date,
    }));
  }
};
