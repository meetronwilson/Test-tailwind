import React, { useEffect, useId, useState } from 'react';
import Switch from 'react-switch';

export const SwitchField = ({ field, form }) => {
  const [value, setValue] = useState(false);

  useEffect(() => {
    if (field.value === 'true') {
      setValue(true);
    } else {
      setValue(false);
    }
  }, []);
  const handleChange = (data: any) => {
    setValue(data);
    form.setFieldValue(field.name, data);
  };

  return (
    <Switch
      checkedIcon={false}
      uncheckedIcon={false}
      className={'check'}
      onChange={handleChange}
      checked={value}
    />
  );
};
