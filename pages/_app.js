import React from 'react';
import { Provider } from 'react-redux';
import store from '../src/Store/store';

import App from '../src/App';
// import { SentryLoggingService } from '../src/services/sentry-logging.service';
// import { Site24x7LoggingService } from '../src/services/site24x7-logging.service';

import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '../src/Assets/styles/style.scss';
import '../src/Assets/styles/override.scss';
import '../src/Assets/styles/Everything.css';
import '../src/Assets/styles/Filters.css';

// SentryLoggingService.init();
// Site24x7LoggingService.init();

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Provider store={store}>
        <App Component={Component} pageProps={pageProps} />
      </Provider>
    </>
  );
}
