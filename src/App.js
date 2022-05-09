import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ScrollToTopBtn from './Components/menu/ScrollToTop';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
// import { AppRouter } from './Router/Router';
import { getTheme } from './Theme/theme';
import { toast, ToastContainer } from 'react-toastify';

import { initializeApp } from 'firebase/app';
import firebaseConfig from './Firebase/firebase_config';
import { initializeAnalytics } from 'firebase/analytics';
import { initProvider } from './GlobalState/User';
import { appInitializer } from './GlobalState/InitSlice';

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

function App() {
  const dispatch = useDispatch();

  const userTheme = useSelector((state) => {
    return state.user.theme;
  });
  document.documentElement.setAttribute('data-theme', userTheme);

  useEffect(() => {
    dispatch(appInitializer());
  }, [dispatch]);

  useLayoutEffect(() => {
    const firebase = initializeApp(firebaseConfig);
    initializeAnalytics(firebase);
    dispatch(initProvider());
  }, [dispatch]);

  return (
    <ThemeProvider theme={getTheme(userTheme)}>
      <div className="wraper">
        <GlobalStyles isDark={userTheme === 'dark'} />
        {/* <AppRouter firebase /> */}
        <ScrollToTopBtn />
        <ToastContainer position={toast.POSITION.BOTTOM_LEFT} hideProgressBar={true} />
      </div>
    </ThemeProvider>
  );
}

export default App;
