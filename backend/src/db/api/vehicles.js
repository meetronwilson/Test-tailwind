const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class VehiclesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const vehicles = await db.vehicles.create(
      {
        id: data.id || undefined,

        make: data.make || null,
        model: data.model || null,
        year: data.year || null,
        plate_number: data.plate_number || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await vehicles.setOwner_id(data.owner_id || null, {
      transaction,
    });

    return vehicles;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const vehicles = await db.vehicles.findByPk(id, {
      transaction,
    });

    await vehicles.update(
      {
        make: data.make || null,
        model: data.model || null,
        year: data.year || null,
        plate_number: data.plate_number || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await vehicles.setOwner_id(data.owner_id || null, {
      transaction,
    });

    return vehicles;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const vehicles = await db.vehicles.findByPk(id, options);

    await vehicles.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await vehicles.destroy({
      transaction,
    });

    return vehicles;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const vehicles = await db.vehicles.findOne({ where }, { transaction });

    if (!vehicles) {
      return vehicles;
    }

    const output = vehicles.get({ plain: true });

    output.owner_id = await vehicles.getOwner_id({
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
        as: 'owner_id',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.make) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('vehicles', 'make', filter.make),
        };
      }

      if (filter.model) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('vehicles', 'model', filter.model),
        };
      }

      if (filter.year) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('vehicles', 'year', filter.year),
        };
      }

      if (filter.plate_number) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'vehicles',
            'plate_number',
            filter.plate_number,
          ),
        };
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

      if (filter.owner_id) {
        var listItems = filter.owner_id.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          owner_idId: { [Op.or]: listItems },
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
          count: await db.vehicles.count({
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
      : await db.vehicles.findAndCountAll({
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
          Utils.ilike('vehicles', 'plate_number', query),
        ],
      };
    }

    const records = await db.vehicles.findAll({
      attributes: ['id', 'plate_number'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['plate_number', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.plate_number,
    }));
  }
};
