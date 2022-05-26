import React, { useEffect } from 'react';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import { initializeApp } from 'firebase/app';
import { initializeAnalytics } from 'firebase/analytics';

import ScrollToTopBtn from './Components/menu/ScrollToTop';
import Header from './Components/menu/header';
import firebaseConfig from './Firebase/firebase_config';
import { initProvider } from './GlobalState/User';
import { appInitializer } from './GlobalState/InitSlice';
import { getTheme } from './Theme/theme';

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: smooth;
  }
  .jumbotron.tint{
    background-color: rgba(0,0,0,0.6);
    background-blend-mode: multiply;
  }
  .jumbotron.breadcumb.no-bg.tint {

    background-image: url(${({ isDark }) =>
      isDark ? '/img/background/header-dark.webp' : '/img/background/Ebisu-DT-Header.webp'});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: bottom;
  }

  @media only screen and (min-width: 1200px) {
    .jumbotron.breadcumb.no-bg.tint {
      margin-top: 84px;
    }
  }
    
  @media only screen and (max-width: 768px) {
    .jumbotron.breadcumb.no-bg.tint {
      background-image: url(${({ isDark }) =>
        isDark ? '/img/background/mobile-header-dark.webp' : '/img/background/Ebisu-Mobile-Header.webp'});
      background-size: cover;
      background-repeat: no-repeat;
    }
  }
`;

function App({ Component, pageProps }) {
  const dispatch = useDispatch();

  const userTheme = useSelector((state) => {
    return state.user.theme;
  });

  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', userTheme);
  }

  useEffect(() => {
    dispatch(appInitializer());
  }, [dispatch]);

  useEffect(() => {
    const firebase = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined') {
      initializeAnalytics(firebase);
      dispatch(initProvider());
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={getTheme(userTheme)}>
      <Head>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Ebisu's Bay Marketplace</title>
      </Head>
      <div className="wraper">
        <GlobalStyles isDark={userTheme === 'dark'} />
        <Header />
        <Component {...pageProps} />
        <ScrollToTopBtn />
        <ToastContainer position={toast.POSITION.BOTTOM_LEFT} hideProgressBar={true} />
      </div>
    </ThemeProvider>
  );
}

export default App;
