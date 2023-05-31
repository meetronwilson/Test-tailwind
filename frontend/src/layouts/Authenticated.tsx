import React, { ReactNode, useEffect } from 'react';
import { useState } from 'react';
import { mdiForwardburger, mdiBackburger, mdiMenu } from '@mdi/js';
import menuAside from '../menuAside';
import menuNavBar from '../menuNavBar';
import BaseIcon from '../components/BaseIcon';
import NavBar from '../components/NavBar';
import NavBarItemPlain from '../components/NavBarItemPlain';
import AsideMenu from '../components/AsideMenu';
import FooterBar from '../components/FooterBar';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import FormField from '../components/FormField';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';

type Props = {
  children: ReactNode;
};

export default function LayoutAuthenticated({ children }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  let localToken;
  if (typeof window !== 'undefined') {
    // Perform localStorage action
    localToken = localStorage.getItem('token');
  }

  useEffect(() => {
    if (!token && !localToken) {
      router.push('/login');
    }
  }, [token, localToken]);

  const darkMode = useAppSelector((state) => state.style.darkMode);

  const [isAsideMobileExpanded, setIsAsideMobileExpanded] = useState(false);
  const [isAsideLgActive, setIsAsideLgActive] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsAsideMobileExpanded(false);
      setIsAsideLgActive(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events, dispatch]);

  const layoutAsidePadding = 'xl:pl-60';

  return (
    <div
      className={`${
        darkMode ? 'dark' : ''
      } overflow-hidden lg:overflow-visible`}
    >
      <div
        className={`${layoutAsidePadding} ${
          isAsideMobileExpanded ? 'ml-60 lg:ml-0' : ''
        } pt-14 min-h-screen w-screen transition-position lg:w-auto bg-gray-50 dark:bg-slate-800 dark:text-slate-100`}
      >
        <NavBar
          menu={menuNavBar}
          className={`${layoutAsidePadding} ${
            isAsideMobileExpanded ? 'ml-60 lg:ml-0' : ''
          }`}
        >
          <NavBarItemPlain
            display='flex lg:hidden'
            onClick={() => setIsAsideMobileExpanded(!isAsideMobileExpanded)}
          >
            <BaseIcon
              path={isAsideMobileExpanded ? mdiBackburger : mdiForwardburger}
              size='24'
            />
          </NavBarItemPlain>
          <NavBarItemPlain
            display='hidden lg:flex xl:hidden'
            onClick={() => setIsAsideLgActive(true)}
          >
            <BaseIcon path={mdiMenu} size='24' />
          </NavBarItemPlain>
          <NavBarItemPlain useMargin>
            <Formik
              initialValues={{
                search: '',
              }}
              onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
            >
              <Form>
                <FormField isBorderless isTransparent>
                  <Field name='search' placeholder='Search' />
                </FormField>
              </Form>
            </Formik>
          </NavBarItemPlain>
        </NavBar>
        <AsideMenu
          isAsideMobileExpanded={isAsideMobileExpanded}
          isAsideLgActive={isAsideLgActive}
          menu={menuAside}
          onAsideLgClose={() => setIsAsideLgActive(false)}
        />
        {children}
        <FooterBar>Hand-crafted & Made with ❤️</FooterBar>
      </div>
    </div>
  );
}
