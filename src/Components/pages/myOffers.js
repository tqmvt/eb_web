import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import { fetchMadeOffers, fetchReceivedOffers } from '../../GlobalState/offerSlice';
import Footer from '../components/Footer';
import MadeOffers from '../Offer/MadeOffers';
import ReceivedOffers from '../Offer/ReceivedOffers';

const OFFERS_TAB = {
  make: 'Made Offers',
  receive: 'Received Offers',
};

const Tabs = styled.div`
  display: flex;
  margin-left: 80px;
  margin-bottom: 60px;

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin: 0px;
    justify-content: space-between;
  }
`;

const Tab = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textColor3};
  font-size: 18px;
  font-weight: bold;
  padding: 2px 18px;
  margin-right: 50px;
  border-bottom: solid 6px ${({ theme }) => theme.colors.borderColor4};

  &.active {
    border-bottom: solid 6px ${({ theme }) => theme.colors.borderColor3};
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-right: 0px;
    padding: 2px 0px;
    &:first-child {
      margin-right: 10px;
    }
  }
`;

const MyOffers = () => {
  const walletAddress = useSelector((state) => state.user.address);
  const madeOffers = useSelector((state) => state.offer.madeOffers);
  const receivedOffers = useSelector((state) => state.offer.receivedOffers);
  const [tab, setTab] = useState(OFFERS_TAB.make);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMadeOffers(walletAddress));
    dispatch(fetchReceivedOffers(walletAddress));
  }, []);

  const Content = () => (
    <>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>My Offers</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <Tabs>
          <Tab onClick={() => setTab(OFFERS_TAB.make)} className={`${tab === OFFERS_TAB.make ? 'active' : ''}`}>
            {OFFERS_TAB.make}
          </Tab>
          <Tab onClick={() => setTab(OFFERS_TAB.receive)} className={`${tab === OFFERS_TAB.receive ? 'active' : ''}`}>
            {OFFERS_TAB.receive}
          </Tab>
        </Tabs>
        {tab === OFFERS_TAB.make && <MadeOffers offers={madeOffers} />}
        {tab === OFFERS_TAB.receive && <ReceivedOffers offers={receivedOffers} />}
      </section>

      <Footer />
    </>
  );

  return <div>{walletAddress ? <Content /> : <Redirect to="/marketplace" />}</div>;
};

export default MyOffers;
