import React from 'react';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';

import { ErrorPage } from '../src/Components/ErrorPage';
import store from '../src/Store/store';
import App from '../src/App';
import { SentryLoggingService } from '../src/services/sentry-logging.service';
import { Site24x7LoggingService } from '../src/services/site24x7-logging.service';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import '../src/Assets/styles/style.scss';
import '../src/Assets/styles/override.scss';
import '../src/Assets/styles/Everything.css';

SentryLoggingService.init();
Site24x7LoggingService.init();

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Provider store={store}>
        <Sentry.ErrorBoundary fallback={() => <ErrorPage />}>
          <App Component={Component} pageProps={pageProps} />
        </Sentry.ErrorBoundary>
      </Provider>
    </>
  );
}
