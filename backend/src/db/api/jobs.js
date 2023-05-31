const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class JobsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const jobs = await db.jobs.create(
      {
        id: data.id || undefined,

        start_time: data.start_time || null,
        end_time: data.end_time || null,
        description: data.description || null,
        price: data.price || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await jobs.setAssigned_user_id(data.assigned_user_id || null, {
      transaction,
    });

    await jobs.setAssigned_vehicle_ids(data.assigned_vehicle_ids || [], {
      transaction,
    });

    return jobs;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const jobs = await db.jobs.findByPk(id, {
      transaction,
    });

    await jobs.update(
      {
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        description: data.description || null,
        price: data.price || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await jobs.setAssigned_user_id(data.assigned_user_id || null, {
      transaction,
    });

    await jobs.setAssigned_vehicle_ids(data.assigned_vehicle_ids || [], {
      transaction,
    });

    return jobs;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const jobs = await db.jobs.findByPk(id, options);

    await jobs.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await jobs.destroy({
      transaction,
    });

    return jobs;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const jobs = await db.jobs.findOne({ where }, { transaction });

    if (!jobs) {
      return jobs;
    }

    const output = jobs.get({ plain: true });

    output.assigned_vehicle_ids = await jobs.getAssigned_vehicle_ids({
      transaction,
    });

    output.assigned_user_id = await jobs.getAssigned_user_id({
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
        as: 'assigned_user_id',
      },

      {
        model: db.vehicles,
        as: 'assigned_vehicle_ids',
        through: filter.assigned_vehicle_ids
          ? {
              where: {
                [Op.or]: filter.assigned_vehicle_ids.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.assigned_vehicle_ids ? true : null,
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
          [Op.and]: Utils.ilike('jobs', 'description', filter.description),
        };
      }

      if (filter.start_timeRange) {
        const [start, end] = filter.start_timeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            start_time: {
              ...where.start_time,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            start_time: {
              ...where.start_time,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.end_timeRange) {
        const [start, end] = filter.end_timeRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            end_time: {
              ...where.end_time,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            end_time: {
              ...where.end_time,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.priceRange) {
        const [start, end] = filter.priceRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            price: {
              ...where.price,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            price: {
              ...where.price,
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

      if (filter.assigned_user_id) {
        var listItems = filter.assigned_user_id.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          assigned_user_idId: { [Op.or]: listItems },
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
          count: await db.jobs.count({
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
      : await db.jobs.findAndCountAll({
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
          Utils.ilike('jobs', 'description', query),
        ],
      };
    }

    const records = await db.jobs.findAll({
      attributes: ['id', 'description'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['description', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.description,
    }));
  }
};
