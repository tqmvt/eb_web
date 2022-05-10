import React from 'react';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { getTheme } from '../src/Theme/theme';
import store from '../src/Store/store';

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
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </>
  );
}
