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

import { update, fetch } from '../../stores/invoices/invoicesSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';

const EditInvoices = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notify = (type, msg) => toast(msg, { type, position: 'bottom-center' });
  const initVals = {
    date: new Date(),

    ['amount']: '',

    user_id: '',

    job_ids: [],

    ['description']: '',
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { invoices } = useAppSelector((state) => state.invoices);

  const { invoicesId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: invoicesId }));
  }, [invoicesId]);

  useEffect(() => {
    if (typeof invoices === 'object') {
      setInitialValues(invoices);
    }
  }, [invoices]);

  useEffect(() => {
    if (typeof invoices === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach((el) => (newInitialVal[el] = invoices[el]));

      setInitialValues(newInitialVal);
    }
  }, [invoices]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: invoicesId, data }));
    await router.push('/invoices/invoices-list');
    notify('success', 'Invoices was updated!');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit invoices')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title='Edit invoices'
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
              <FormField label='Date'>
                <DatePicker
                  dateFormat='yyyy-MM-dd hh:mm'
                  showTimeSelect
                  selected={
                    initialValues.date
                      ? new Date(
                          dayjs(initialValues.date).format('YYYY-MM-DD hh:mm'),
                        )
                      : null
                  }
                  onChange={(date) =>
                    setInitialValues({ ...initialValues, date: date })
                  }
                />
              </FormField>

              <FormField label='Amount'>
                <Field type='number' name='amount' placeholder='Your Amount' />
              </FormField>

              <FormField label='User' labelFor='user_id'>
                <Field
                  name='user_id'
                  id='user_id'
                  component={SelectField}
                  options={initialValues.user_id}
                  itemRef={'users'}
                  showField={'firstName'}
                ></Field>
              </FormField>

              <FormField label='Jobs' labelFor='job_ids'>
                <Field
                  name='job_ids'
                  id='job_ids'
                  component={SelectFieldMany}
                  options={initialValues.job_ids}
                  itemRef={'jobs'}
                  showField={'description'}
                ></Field>
              </FormField>

              <FormField label='Description'>
                <Field name='description' placeholder='Your Description' />
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
                  onClick={() => router.push('/invoices/invoices-list')}
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

EditInvoices.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default EditInvoices;
