import dayjs from 'dayjs';

export default {
  filesFormatter(arr) {
    if (!arr || !arr.length) return '';
    return arr.map((item) => item.name);
  },
  imageFormatter(arr) {
    if (!arr || !arr.length) return [];
    return arr.map((item) => ({
      publicUrl: item.publicUrl || '',
    }));
  },
  oneImageFormatter(arr) {
    if (!arr || !arr.length) return '';
    return arr[0].publicUrl || '';
  },
  dateFormatter(date) {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD');
  },
  dateTimeFormatter(date) {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  },
  booleanFormatter(val) {
    return val ? 'Yes' : 'No';
  },

  usersManyListFormatter(val) {
    if (!val || !val.length) return [];
    return val.map((item) => item.firstName);
  },
  usersOneListFormatter(val) {
    if (!val) return '';
    return val.firstName;
  },
  usersManyListFormatterEdit(val) {
    if (!val || !val.length) return [];
    return val.map((item) => {
      return { id: item.id, label: item.firstName };
    });
  },
  usersOneListFormatterEdit(val) {
    if (!val) return '';
    return { label: val.firstName, id: val.id };
  },

  jobsManyListFormatter(val) {
    if (!val || !val.length) return [];
    return val.map((item) => item.description);
  },
  jobsOneListFormatter(val) {
    if (!val) return '';
    return val.description;
  },
  jobsManyListFormatterEdit(val) {
    if (!val || !val.length) return [];
    return val.map((item) => {
      return { id: item.id, label: item.description };
    });
  },
  jobsOneListFormatterEdit(val) {
    if (!val) return '';
    return { label: val.description, id: val.id };
  },

  vehiclesManyListFormatter(val) {
    if (!val || !val.length) return [];
    return val.map((item) => item.plate_number);
  },
  vehiclesOneListFormatter(val) {
    if (!val) return '';
    return val.plate_number;
  },
  vehiclesManyListFormatterEdit(val) {
    if (!val || !val.length) return [];
    return val.map((item) => {
      return { id: item.id, label: item.plate_number };
    });
  },
  vehiclesOneListFormatterEdit(val) {
    if (!val) return '';
    return { label: val.plate_number, id: val.id };
  },
};
