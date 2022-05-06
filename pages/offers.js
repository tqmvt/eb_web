import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Spinner } from 'react-bootstrap';

import Footer from '../components/Footer';
import MadeOffers from '../Offer/MadeOffers';
import ReceivedOffers from '../Offer/ReceivedOffers';
import MyOffersFilter from '../Offer/MyOffersFilter';
import { initOffers, fetchMadeOffers, fetchAllOffers, fetchMyNFTs } from '../../GlobalState/offerSlice';
import { getAllCollections, knownContracts } from '../../GlobalState/collectionsSlice';
import { caseInsensitiveCompare, isNftBlacklisted } from '../../utils';
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
  receive: 'Received Direct Offers',
  receivePublic: 'Received Public Offers',
};

const MyOffers = () => {
  const walletAddress = useSelector((state) => state.user.address);

  const lastId = useSelector((state) => state.offer.lastId);
  const madeOffersLoading = useSelector((state) => state.offer.madeOffersLoading);
  const madeOffers = useSelector((state) => state.offer.madeOffers);

  const [receivedOffers, setReceivedOffers] = useState([]);
  const [receivedPublicOffers, setReceivedPublicOffers] = useState([]);
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
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (myNFTs && !myNFTsLoading) {
      const collectionAddresses = myNFTs.map((nftData) => nftData.nftAddress.toLowerCase());

      dispatch(fetchAllOffers(collectionAddresses));
    }
  }, [dispatch, myNFTs, myNFTsLoading]);

  useEffect(() => {
    if (myNFTs && !myNFTsLoading && allOffers && collectionsStats.length > 0) {
      const receivedOffersFilter = allOffers
        .filter((offer) => {
          const nft = myNFTs.find(
            (c) => c.nftAddress.toLowerCase() === offer.nftAddress && c.edition?.toString() === offer.nftId
          );

          const knownContract = findKnownContract(offer.nftAddress, offer.nftId);
          const floorPrice = findCollectionFloor(knownContract);
          const offerPrice = parseInt(offer.price);
          const isAboveOfferThreshold = floorPrice ? offerPrice >= floorPrice / 2 : true;
          const canShowCompletedOffers = !knownContract.multiToken || parseInt(offer.state) === offerState.ACTIVE;
          const isBlacklisted = isNftBlacklisted(offer.nftAddress, offer.nftId);

          return nft && isAboveOfferThreshold && canShowCompletedOffers && !nft.is1155 && !isBlacklisted;
        })
        .sort((a, b) => parseInt(b.price) - parseInt(a.price));
      const receivedPublicOffersFilter = allOffers
        .filter((offer) => {
          const nft = myNFTs.find(
            (c) => c.nftAddress.toLowerCase() === offer.nftAddress && c.edition?.toString() === offer.nftId
          );

          const knownContract = findKnownContract(offer.nftAddress, offer.nftId);
          const floorPrice = findCollectionFloor(knownContract);
          const offerPrice = parseInt(offer.price);
          const isAboveOfferThreshold = floorPrice ? offerPrice >= floorPrice / 2 : true;
          const canShowCompletedOffers = !knownContract.multiToken || parseInt(offer.state) === offerState.ACTIVE;
          const isBlacklisted = isNftBlacklisted(offer.nftAddress, offer.nftId);

          return nft && isAboveOfferThreshold && canShowCompletedOffers && nft.is1155 && !isBlacklisted;
        })
        .sort((a, b) => parseInt(b.price) - parseInt(a.price));

      setReceivedOffers(receivedOffersFilter);
      setReceivedPublicOffers(receivedPublicOffersFilter);
    }
    // eslint-disable-next-line
  }, [myNFTs, allOffers, collectionsStats]);

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
    dispatch(initOffers());
    dispatch(fetchMadeOffers(walletAddress, filter));
    if (myNFTs && !myNFTsLoading) {
      const collectionAddresses = myNFTs.map((nftData) => nftData.nftAddress.toLowerCase());

      dispatch(fetchAllOffers(collectionAddresses, filter));
    }
  };

  const loadMoreMade = () => {
    dispatch(fetchMadeOffers(walletAddress, filterChecked));
  };

  const loadMoreReceived = () => {
    if (myNFTs && !myNFTsLoading) {
      const collectionAddresses = myNFTs.map((nftData) => nftData.nftAddress.toLowerCase());

      dispatch(fetchAllOffers(collectionAddresses, filterChecked));
    }
  };

  if (!walletAddress) {
    router.push('/marketplace');
    return;
  }

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
          <Tab
            onClick={() => setTab(OFFERS_TAB.receivePublic)}
            className={`${tab === OFFERS_TAB.receivePublic ? 'active' : ''}`}
          >
            {OFFERS_TAB.receivePublic}
          </Tab>
        </Tabs>
        {tab === OFFERS_TAB.make && (
          <>
            <MyOffersFilter checked={filterChecked} onFilter={handleOfferFilter} />
            <InfiniteScroll
              dataLength={madeOffers.length}
              next={loadMoreMade}
              hasMore={!!lastId}
              style={{ overflow: 'hidden' }}
              loader={
                madeOffersLoading ? (
                  <div className="row">
                    <div className="col-lg-12 text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  </div>
                ) : (
                  <></>
                )
              }
            >
              <MadeOffers offers={madeOffers} isLoading={madeOffersLoading} />
            </InfiniteScroll>
          </>
        )}
        {tab === OFFERS_TAB.receive && (
          <>
            <MyOffersFilter checked={filterChecked} onFilter={handleOfferFilter} />
            <InfiniteScroll
              dataLength={receivedOffers.length}
              next={loadMoreReceived}
              hasMore={!!lastId}
              style={{ overflow: 'hidden' }}
              loader={
                myNFTsLoading ? (
                  <div className="row">
                    <div className="col-lg-12 text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  </div>
                ) : (
                  <></>
                )
              }
            >
              <ReceivedOffers offers={receivedOffers} isLoading={allOffersLoading || myNFTsLoading} />
            </InfiniteScroll>
          </>
        )}
        {tab === OFFERS_TAB.receivePublic && (
          <>
            <div className="alert alert-info" role="alert">
              Public offers are offers on certain collections that any holders of that collection can accept. These
              offers are on all ERC1155 collections, including Ebisu's Founding Member and VIP Founding Member NFTs.
            </div>
            <InfiniteScroll
              dataLength={receivedPublicOffers.length}
              next={loadMoreReceived}
              hasMore={!!lastId}
              style={{ overflow: 'hidden' }}
              loader={
                myNFTsLoading ? (
                  <div className="row">
                    <div className="col-lg-12 text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  </div>
                ) : (
                  <></>
                )
              }
            >
              <ReceivedOffers offers={receivedPublicOffers} isLoading={allOffersLoading || myNFTsLoading} />
            </InfiniteScroll>
          </>
        )}
      </section>

      <Footer />
    </>
  );

  return (
    <div>
      <Content />{' '}
    </div>
  );
};

export default MyOffers;
