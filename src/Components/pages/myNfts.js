import React, {memo, useState} from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Footer from '../components/Footer';
import NftCardList from '../components/MyNftCardList';
import MyNftTransferDialog from '../components/MyNftTransferDialog';
import MyNftCancelDialog from '../components/MyNftCancelDialog';
import MyNftListDialog from '../components/MyNftListDialog';

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  isLoading: state.user.fetchingNfts,
});

const MyNfts = ({ walletAddress, isLoading }) => {
  const dispatch = useDispatch();
  const [showChainSearch, setShowChainSearch] = useState(false);

  if (!walletAddress) {
    return <Redirect to="/marketplace" />;
  }

  const onClickChainSearch = (searchChain) => {
    setShowChainSearch(searchChain);
  }

  return (
    <div>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>My NFTs</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        {showChainSearch ? (
          <>
            <p className="text-center text-md-end">Viewing chain results <span className="color fw-bold" role="button" onClick={() => onClickChainSearch(false)}>Go Back</span></p>
            <div className="alert alert-info" role="alert">
              A full search will search the Cronos chain directly to get your NFT information. This is slower, but may return NFTs that might be missing due to dropped transaction issues.
            </div>
            <NftCardList useChain={showChainSearch} />
          </>
        ) :(
          <>
            <p className="text-center text-md-end">Don't see your NFT? Try a full search <span className="color fw-bold" role="button" onClick={() => onClickChainSearch(true)}>here</span></p>
            <NftCardList useChain={showChainSearch} />
          </>
        )}
        <MyNftTransferDialog />
        <MyNftCancelDialog />
        <MyNftListDialog />
      </section>

      <Footer />
    </div>
  );
};
export default connect(mapStateToProps)(memo(MyNfts));
