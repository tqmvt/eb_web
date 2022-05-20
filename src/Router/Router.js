import React, { memo } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';

import history from '../history';
import Home from '../Components/pages/home';
import Marketplace from '../Components/pages/marketplace';
import Collection from '../Components/pages/collection';
import Seller from '../Components/pages/seller';
import Listing from '../Components/pages/listing';
import Auction from '../Components/pages/auction';
import Nft from '../Components/pages/nft';
import MyNfts from '../Components/pages/myNfts';
import Header from '../Components/menu/header';
import Drops from '../Components/pages/drops';
import Drop from '../Components/pages/drop';
import DropBuildShip from '../Components/pages/dropBuildShip';
import MyListings from '../Components/pages/myListings';
import MySales from '../Components/pages/mySales';
import MyOffers from '../Components/pages/myOffers';
import MyStaking from '../Components/pages/myStaking';
import Collections from '../Components/pages/collections';
import MetaverseAuctions from '../Components/pages/metaverseAuctions';
import { ErrorPage } from '../Components/pages/ErrorPage';
import ManageAuctions from '../Components/pages/manageAuctions';
import Application from '../Components/pages/application';

const SentryEnhancedRoute = Sentry.withSentryRouting(Route);

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  authInitFinished: state.appInitialize.authInitFinished,
});

const Component = ({ walletAddress, authInitFinished }) => {
  const walletConnected = !!walletAddress;

  function PrivateRoute({ component: Component, ...rest }) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('wallet=' + walletConnected);
    }

    return (
      <SentryEnhancedRoute
        {...rest}
        render={(props) => {
          if (!authInitFinished) {
            return (
              <div className="col-lg-12 text-center justify-content-center align-items-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            );
          }
          if (!walletConnected) {
            // not logged in so redirect to login page with the return url
            return <Redirect to={{ pathname: '/', state: { from: props.location } }} />;
          }

          // authorized so return component
          return <Component {...props} />;
        }}
      />
    );
  }

  return (
    <Router history={history}>
      <Sentry.ErrorBoundary fallback={() => <ErrorPage />}>
        <Header />
        <Switch>
          <SentryEnhancedRoute exact path="/" component={Home} />
          <SentryEnhancedRoute path="/home" render={() => <Redirect to="/" />} />
          <SentryEnhancedRoute exact path="/marketplace" component={Marketplace} />
          {/*<Route exact path="/roadmap" component={Roadmap} />*/}
          <PrivateRoute exact path="/nfts" component={MyNfts} />
          <PrivateRoute exact path="/sales" component={MySales} />
          <PrivateRoute exact path="/offers" component={MyOffers} />
          <PrivateRoute exact path="/staking" component={MyStaking} />
          <PrivateRoute exact path="/wallet/listings" component={MyListings} />
          <SentryEnhancedRoute exact path="/build-ship" component={DropBuildShip} />

          <SentryEnhancedRoute exact path="/drops" component={Drops} />
          <SentryEnhancedRoute
            exact
            path="/drops/founding-member"
            render={() => <Redirect to="/collection/founding-member" />}
          />
          <SentryEnhancedRoute exact path="/drops/:slug" component={Drop} />
          <SentryEnhancedRoute exact path="/listing/:id" component={Listing} />
          <SentryEnhancedRoute exact path="/manage/auctions" component={ManageAuctions} />
          <SentryEnhancedRoute exact path="/auctions/:id" component={Auction} />
          <SentryEnhancedRoute exact path="/collections" component={Collections} />
          <SentryEnhancedRoute
            exact
            path="/collection/mad-treehouse"
            render={() => <Redirect to="/collection/mm-treehouse" />}
          />
          <SentryEnhancedRoute
            exact
            path="/collection/degen-mad-meerkat"
            render={() => <Redirect to="/collection/mad-meerkat-degen" />}
          />
          <SentryEnhancedRoute
            exact
            path="/collection/degen-mad-meerkat/:id"
            render={(props) => <Redirect to={`/collection/mad-meerkat-degen/${props.match.params.id}`} />}
          />
          <SentryEnhancedRoute
            exact
            path="/collection/weird-apes-club-v2"
            render={() => <Redirect to="/collection/weird-apes-club" />}
          />
          <SentryEnhancedRoute exact path="/collection/:slug" component={Collection} />
          <SentryEnhancedRoute exact path="/collection/:slug/:id" component={Nft} />
          {/* <SentryEnhancedRoute exact path="/collection-detail/:id" component={CollectionDetail} /> */}
          <SentryEnhancedRoute exact path="/seller/:address" component={Seller} />
          <SentryEnhancedRoute exact path="/metaverse-auctions" component={MetaverseAuctions} />
          {/*<SentryEnhancedRoute exact path="/slothty-rugsurance" component={Rugsurance} />*/}
          <SentryEnhancedRoute exact path="/apply" component={Application} />
          <SentryEnhancedRoute exact path="/sales_bot" component={() => {
            window.location.href = 'https://discord.com/api/oauth2/authorize?client_id=976699886890254356&permissions=268453904&scope=bot%20applications.commands';
            return null;
          }}
          />
          <SentryEnhancedRoute path="*" render={() => <Redirect to="/" />} />
        </Switch>
      </Sentry.ErrorBoundary>
    </Router>
  );
};

export const AppRouter = connect(mapStateToProps)(memo(Component));
