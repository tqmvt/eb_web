import React from 'react';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';

import Header from '../src/Components/menu/header';
import ScrollToTopBtn from '../src/Components/menu/ScrollToTop';
import { getTheme } from '../src/Theme/theme';
import store from '../src/Store/store';
// import { SentryLoggingService } from '../src/services/sentry-logging.service';
// import { Site24x7LoggingService } from '../src/services/site24x7-logging.service';

import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '../src/Assets/styles/style.scss';
import '../src/Assets/styles/override.scss';
import '../src/Assets/styles/Everything.css';

// SentryLoggingService.init();
// Site24x7LoggingService.init();
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

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider theme={getTheme('light')}>
          <Head>
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <meta
              name="viewport"
              content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
            <title>Ebisu's Bay Marketplace</title>
          </Head>
          <div className="wraper">
            <GlobalStyles isDark={false} />
            <Header />
            <Component {...pageProps} />
            <ScrollToTopBtn />
            <ToastContainer position={toast.POSITION.BOTTOM_LEFT} hideProgressBar={true} />
          </div>
        </ThemeProvider>
      </Provider>
    </>
  );
}
