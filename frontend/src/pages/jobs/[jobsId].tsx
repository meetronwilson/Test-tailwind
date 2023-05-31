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

import { update, fetch } from '../../stores/jobs/jobsSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';

const EditJobs = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notify = (type, msg) => toast(msg, { type, position: 'bottom-center' });
  const initVals = {
    start_time: new Date(),

    end_time: new Date(),

    description: '',

    ['price']: '',

    assigned_vehicle_ids: [],

    assigned_user_id: '',
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { jobs } = useAppSelector((state) => state.jobs);

  const { jobsId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: jobsId }));
  }, [jobsId]);

  useEffect(() => {
    if (typeof jobs === 'object') {
      setInitialValues(jobs);
    }
  }, [jobs]);

  useEffect(() => {
    if (typeof jobs === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach((el) => (newInitialVal[el] = jobs[el]));

      setInitialValues(newInitialVal);
    }
  }, [jobs]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: jobsId, data }));
    await router.push('/jobs/jobs-list');
    notify('success', 'Jobs was updated!');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit jobs')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title='Edit jobs'
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
              <FormField label='StartTime'>
                <DatePicker
                  dateFormat='yyyy-MM-dd hh:mm'
                  showTimeSelect
                  selected={
                    initialValues.start_time
                      ? new Date(
                          dayjs(initialValues.start_time).format(
                            'YYYY-MM-DD hh:mm',
                          ),
                        )
                      : null
                  }
                  onChange={(date) =>
                    setInitialValues({ ...initialValues, start_time: date })
                  }
                />
              </FormField>

              <FormField label='EndTime'>
                <DatePicker
                  dateFormat='yyyy-MM-dd hh:mm'
                  showTimeSelect
                  selected={
                    initialValues.end_time
                      ? new Date(
                          dayjs(initialValues.end_time).format(
                            'YYYY-MM-DD hh:mm',
                          ),
                        )
                      : null
                  }
                  onChange={(date) =>
                    setInitialValues({ ...initialValues, end_time: date })
                  }
                />
              </FormField>

              <FormField label='Description' hasTextareaHeight>
                <Field
                  name='description'
                  id='description'
                  component={RichTextField}
                ></Field>
              </FormField>

              <FormField label='Price'>
                <Field type='number' name='price' placeholder='Your Price' />
              </FormField>

              <FormField
                label='AssignedVehicles'
                labelFor='assigned_vehicle_ids'
              >
                <Field
                  name='assigned_vehicle_ids'
                  id='assigned_vehicle_ids'
                  component={SelectFieldMany}
                  options={initialValues.assigned_vehicle_ids}
                  itemRef={'vehicles'}
                  showField={'plate_number'}
                ></Field>
              </FormField>

              <FormField label='AssignedUser' labelFor='assigned_user_id'>
                <Field
                  name='assigned_user_id'
                  id='assigned_user_id'
                  component={SelectField}
                  options={initialValues.assigned_user_id}
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
                  onClick={() => router.push('/jobs/jobs-list')}
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

EditJobs.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default EditJobs;
