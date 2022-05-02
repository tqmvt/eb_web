import React, { memo, useCallback, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import NftCard from './MyNftCard';
import TopFilterBar from './TopFilterBar';
import { FilterOption } from '../Models/filter-option.model';
import { Form, Spinner } from 'react-bootstrap';
import { collectionFilterOptions } from './constants/filter-options';
import { fetchChainNfts, fetchNfts, MyNftPageActions } from '../../GlobalState/User';
import InvalidListingsPopup from './InvalidListingsPopup';
import { getAnalytics, logEvent } from '@firebase/analytics';

const mapStateToProps = (state) => ({
  nfts: state.user.nfts,
  isLoading: state.user.fetchingNfts,
  listedOnly: state.user.myNftPageListedOnly,
  activeFilterOption: state.user.myNftPageActiveFilterOption,
});

let abortController;
const MyNftCardList = ({ nfts = [], isLoading, listedOnly, activeFilterOption, useChain = false }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (useChain) {
      abortController = new AbortController();
      dispatch(fetchChainNfts(abortController.signal));
    } else {
      if (abortController) {
        abortController.abort();
      } else {
        abortController = new AbortController();
      }
      dispatch(fetchNfts());
    }
    // disable-eslint-next-line
  }, [useChain]);

  const onFilterChange = useCallback(
    (filterOption) => {
      dispatch(MyNftPageActions.setMyNftPageActiveFilterOption(filterOption));
    },
    [dispatch]
  );

  const possibleCollections = collectionFilterOptions.filter((collection) =>
    isLoading ? true : !!nfts.find((x) => x.address === collection.address)
  );

  const filteredNFTs = nfts
    .filter((nft) => (listedOnly ? nft.listed : true))
    .filter((nft) => {
      if (activeFilterOption.getOptionValue === null) {
        return true;
      }

      const isSameAddress = activeFilterOption.getOptionValue === nft.address;

      if (!nft.multiToken) {
        return isSameAddress;
      }

      const hasId = !!nft.id;

      if (!hasId) {
        return isSameAddress;
      }

      const isSameId = activeFilterOption.id === nft.id;

      return isSameId && isSameAddress;
    });

  return (
    <>
      {isLoading && nfts.length === 0 ? (
        <div className="row">
          <div className="row mt-4">
            <div className="col-lg-12 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </div>
        </div>
      ) : (
        <>
          <InvalidListingsPopup navigateTo={true} />
          <div className="row">
            <div className="col-12">
              <TopFilterBar
                className="col-6"
                showFilter={true}
                showSort={false}
                showSearch={false}
                filterOptions={[FilterOption.default(), ...possibleCollections]}
                defaultFilterValue={activeFilterOption}
                filterPlaceHolder="Filter Collection..."
                onFilterChange={onFilterChange}
                filterValue={activeFilterOption}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4 m-0 text-nowrap d-flex align-items-center">
              <div className="items_filter">
                <Form.Switch
                  className="mt-4"
                  label={'Only listed'}
                  checked={listedOnly}
                  onChange={() => dispatch(MyNftPageActions.setMyNftPageListedOnly(!listedOnly))}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="card-group">
              {filteredNFTs.map((nft, index) => (
                <div
                  className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2"
                  key={`${nft.address}-${nft.id}-${nft.listed}-${index}`}
                >
                  <NftCard
                    nft={nft}
                    canTransfer={nft.canTransfer}
                    canSell={nft.listable && !nft.listed && nft.canSell}
                    isStaked={nft.isStaked}
                    canCancel={nft.listed && nft.listingId}
                    canUpdate={nft.listable && nft.listed}
                    onTransferButtonPressed={() => dispatch(MyNftPageActions.showMyNftPageTransferDialog(nft))}
                    onSellButtonPressed={() => dispatch(MyNftPageActions.showMyNftPageListDialog(nft))}
                    onUpdateButtonPressed={() => dispatch(MyNftPageActions.showMyNftPageListDialog(nft))}
                    onCancelButtonPressed={() => dispatch(MyNftPageActions.showMyNftPageCancelDialog(nft))}
                    newTab={true}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="row">
            {nfts.length === 0 && (
              <div className="row mt-4">
                <div className="col-lg-12 text-center">
                  <span>Nothing to see here...</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default connect(mapStateToProps)(memo(MyNftCardList));
