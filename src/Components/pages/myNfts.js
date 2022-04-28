import React, {memo, useState} from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Footer from '../components/Footer';
import NftCardList from '../components/MyNftCardList';
import MyNftTransferDialog from '../components/MyNftTransferDialog';
import MyNftCancelDialog from '../components/MyNftCancelDialog';
import MyNftListDialog from '../components/MyNftListDialog';
import MyListingsCollection from "../components/MyListingsCollection";
import MySoldNftCollection from "../components/MySoldNftCollection";

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  isLoading: state.user.fetchingNfts,
});

const MyNfts = ({ walletAddress, isLoading }) => {
  const dispatch = useDispatch();
  const [showChainSearch, setShowChainSearch] = useState(false);
  const [openTab, setOpenTab] = useState(0);

  const onClickChainSearch = (searchChain) => {
    setShowChainSearch(searchChain);
  }

  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenTab(index);
  };

  if (!walletAddress) {
    return <Redirect to="/marketplace" />;
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
        <div className="de_tab">
          <ul className="de_nav mb-4">
            <li id="Mainbtn0" className="tab active">
              <span onClick={handleBtnClick(0)}>NFTs</span>
            </li>
            <li id="Mainbtn1" className="tab">
              <span onClick={handleBtnClick(1)}>Listings</span>
            </li>
            <li id="Mainbtn2" className="tab">
              <span onClick={handleBtnClick(2)}>Sales</span>
            </li>
          </ul>

          <div className="de_tab_content">
            {openTab === 0 && (
              <>
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
                    <p className="text-center text-md-end">NFTs not showing correctly? Try a full search <span className="color fw-bold" role="button" onClick={() => onClickChainSearch(true)}>here</span></p>
                    <div className="alert alert-warning" role="alert">
                      <strong>Note</strong>: due to current issues with dropped transactions on the Cronos chain, some NFTs may show incorrectly below. This may include NFTs not appearing, or remaining even after they have been sold or staked. If you are experiencing this issue with any in your collection, try the full chain search above.
                    </div>
                    <NftCardList useChain={showChainSearch} />
                  </>
                )}
                <MyNftTransferDialog />
                <MyNftCancelDialog />
                <MyNftListDialog />
              </>
            )}
            {openTab === 1 && (
              <MyListingsCollection walletAddress={walletAddress} />
            )}
            {openTab === 2 && (
              <MySoldNftCollection walletAddress={walletAddress} />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default connect(mapStateToProps)(memo(MyNfts));
