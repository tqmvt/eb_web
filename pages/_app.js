import React from 'react';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import Header from '../src/Components/menu/header';
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
          <Header />
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </>
  );
}
