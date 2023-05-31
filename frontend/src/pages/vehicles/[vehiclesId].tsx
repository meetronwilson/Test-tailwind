import {
  mdiAccount,
  mdiChartTimelineVariant,
  mdiMail,
  mdiUpload,
} from '@mdi/js';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import CardBox from '../../components/CardBox';
import LayoutAuthenticated from '../../layouts/Authenticated';
import SectionMain from '../../components/SectionMain';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import { getPageTitle } from '../../config';

import { Field, Form, Formik } from 'formik';
import FormField from '../../components/FormField';
import BaseDivider from '../../components/BaseDivider';
import BaseButtons from '../../components/BaseButtons';
import BaseButton from '../../components/BaseButton';
import FormCheckRadio from '../../components/FormCheckRadio';
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup';
import FormFilePicker from '../../components/FormFilePicker';
import FormImagePicker from '../../components/FormImagePicker';
import { SelectField } from '../../components/SelectField';
import { SelectFieldMany } from '../../components/SelectFieldMany';
import { SwitchField } from '../../components/SwitchField';
import { RichTextField } from '../../components/RichTextField';

import { update, fetch } from '../../stores/vehicles/vehiclesSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';

const EditVehicles = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notify = (type, msg) => toast(msg, { type, position: 'bottom-center' });
  const initVals = {
    ['make']: '',

    ['model']: '',

    ['year']: '',

    ['plate_number']: '',

    owner_id: '',
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { vehicles } = useAppSelector((state) => state.vehicles);

  const { vehiclesId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: vehiclesId }));
  }, [vehiclesId]);

  useEffect(() => {
    if (typeof vehicles === 'object') {
      setInitialValues(vehicles);
    }
  }, [vehicles]);

  useEffect(() => {
    if (typeof vehicles === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach((el) => (newInitialVal[el] = vehicles[el]));

      setInitialValues(newInitialVal);
    }
  }, [vehicles]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: vehiclesId, data }));
    await router.push('/vehicles/vehicles-list');
    notify('success', 'Vehicles was updated!');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit vehicles')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title='Edit vehicles'
          main
        >
          Breadcrumbs
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>
              <FormField label='Make'>
                <Field name='make' placeholder='Your Make' />
              </FormField>

              <FormField label='Model'>
                <Field name='model' placeholder='Your Model' />
              </FormField>

              <FormField label='Year'>
                <Field name='year' placeholder='Your Year' />
              </FormField>

              <FormField label='PlateNumber'>
                <Field name='plate_number' placeholder='Your PlateNumber' />
              </FormField>

              <FormField label='Owner' labelFor='owner_id'>
                <Field
                  name='owner_id'
                  id='owner_id'
                  component={SelectField}
                  options={initialValues.owner_id}
                  itemRef={'users'}
                  showField={'firstName'}
                ></Field>
              </FormField>

              <BaseDivider />

              <BaseButtons>
                <BaseButton type='submit' color='info' label='Submit' />
                <BaseButton type='reset' color='info' outline label='Reset' />
                <BaseButton
                  type='reset'
                  color='danger'
                  outline
                  label='Cancel'
                  onClick={() => router.push('/vehicles/vehicles-list')}
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
      <ToastContainer />
    </>
  );
};

EditVehicles.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default EditVehicles;
