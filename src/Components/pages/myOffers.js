import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import Footer from '../components/Footer';
import MadeOffers from '../Offer/MadeOffers';
import ReceivedOffers from '../Offer/ReceivedOffers';
import MyOffersFilter from '../Offer/MyOffersFilter';
import { fetchMadeOffers, fetchAllOffers, fetchMyNFTs } from '../../GlobalState/offerSlice';
import { getAllCollections, knownContracts } from '../../GlobalState/collectionsSlice';
import { caseInsensitiveCompare } from '../../utils';
import { offerState } from '../../core/api/enums';

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

const OFFERS_TAB = {
  make: 'Made Offers',
  receive: 'Received Offers',
};

const MyOffers = () => {
  const walletAddress = useSelector((state) => state.user.address);

  const madeOffersLoading = useSelector((state) => state.offer.madeOffersLoading);
  const madeOffers = useSelector((state) => state.offer.madeOffers);

  const [receivedOffers, setReceivedOffers] = useState([]);
  const allOffersLoading = useSelector((state) => state.offer.allOffersLoading);
  const allOffers = useSelector((state) => state.offer.allOffers);

  const myNFTsLoading = useSelector((state) => state.offer.myNFTsLoading);
  const myNFTs = useSelector((state) => state.offer.myNFTs);
  const collectionsStats = useSelector((state) => state.collections.collections);

  const [tab, setTab] = useState(OFFERS_TAB.make);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMadeOffers(walletAddress));
    if (!myNFTsLoading) {
      dispatch(fetchMyNFTs(walletAddress));
    }
    if (!collectionsStats || collectionsStats.length === 0) {
      dispatch(getAllCollections());
    }
  }, []);

  useEffect(() => {
    if (myNFTs && !myNFTsLoading) {
      const collectionAddresses = myNFTs.map((nftData) => nftData.nftAddress.toLowerCase());

      dispatch(fetchAllOffers(collectionAddresses));
    }
  }, [myNFTs, myNFTsLoading]);

  useEffect(() => {
    if (myNFTs && !myNFTsLoading && allOffers && collectionsStats.length > 0) {
      const receivedOffersFilter = allOffers.filter((offer) => {
        const nft = myNFTs.find(
          (c) => c.nftAddress.toLowerCase() === offer.nftAddress && c.edition?.toString() === offer.nftId
        );

        const knownContract = findKnownContract(offer.nftAddress, offer.nftId);
        const floorPrice = findCollectionFloor(knownContract);
        const offerPrice = parseInt(offer.price);
        const isAboveOfferThreshold = floorPrice ? offerPrice >= floorPrice / 2 : true;
        const canShowCompletedOffers = !knownContract.multiToken || parseInt(offer.state) === offerState.ACTIVE;

        if (nft && isAboveOfferThreshold && canShowCompletedOffers) {
          return true;
        }
        return false;
      });
      setReceivedOffers(receivedOffersFilter);
    }
  }, [myNFTs, allOffers]);

  const findKnownContract = (address, nftId) => {
    return knownContracts.find((c) => {
      const matchedAddress = caseInsensitiveCompare(c.address, address);
      const matchedToken = !c.multiToken || parseInt(nftId) === c.id;
      return matchedAddress && matchedToken;
    });
  };

  const findCollectionFloor = (knownContract) => {
    const collectionStats = collectionsStats.find((o) => {
      if (knownContract.multiToken && o.collection.indexOf('-') !== -1) {
        let parts = o.collection.split('-');
        return caseInsensitiveCompare(knownContract.address, parts[0]) && knownContract.id === parseInt(parts[1]);
      } else {
        return caseInsensitiveCompare(knownContract.address, o.collection);
      }
    });

    return collectionStats ? collectionStats.floorPrice : null;
  };

  const [filterChecked, setFilterChecked] = useState('0');
  const handleOfferFilter = (filter) => {
    setFilterChecked(filter);
    dispatch(fetchMadeOffers(walletAddress, filter));
    if (myNFTs && !myNFTsLoading) {
      const collectionAddresses = myNFTs.map((nftData) => nftData.nftAddress.toLowerCase());

      dispatch(fetchAllOffers(collectionAddresses, filter));
    }
  };

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
        <MyOffersFilter checked={filterChecked} onFilter={handleOfferFilter} />
        {tab === OFFERS_TAB.make && (
          <>
            <MadeOffers offers={madeOffers} isLoading={madeOffersLoading} />
          </>
        )}
        {tab === OFFERS_TAB.receive && (
          <>
            <ReceivedOffers offers={receivedOffers} isLoading={allOffersLoading || myNFTsLoading} />
          </>
        )}
      </section>

      <Footer />
    </>
  );

  return <div>{walletAddress ? <Content /> : <Redirect to="/marketplace" />}</div>;
};

export default MyOffers;
