import React, {useState} from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../components/Footer';
import {createSuccessfulTransactionToastContent} from 'src/utils';
import {FormControl, InputGroup, Spinner} from "react-bootstrap";
import {Contract, ethers} from "ethers";
import config from "../../Assets/networks/rpc_config.json";
import {
    getSlothty721NftsFromIds,
    getSlothty721NftsFromWallet
} from "../../core/api/chain";
import styled from "styled-components";
import RugsuranceAbi from '../../Contracts/SlothtyRugsurance.json';
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import MetaMaskOnboarding from "@metamask/onboarding";
import {chainConnect, connectAccount} from "../../GlobalState/User";

const knownContracts = config.known_contracts;
const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);

const GreyscaleImg = styled.img`
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
`;
const rugContractAddress = '0x99F3960E8219384BF0624D388cAD698d5A54AE6C';

const Rugsurance = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const [nfts, setNfts] = useState([]);
  const [selectedNfts, setSelectedNfts] = useState([]);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [executingBurn, setisExecutingBurn] = useState(false);
  const [burnError, setBurnError] = useState(null);

  const checkBurnList = async (address) => {
    const readContract = new Contract(rugContractAddress, RugsuranceAbi.abi, readProvider);

    try {
      const result = await readContract.getRefundInfo(address);
      return result.Ids.map((i) => i.toNumber());
    } catch (e) {
      return [];
    }
  }

  const calculateBurnEligibility = async () => {
      if (!user.address) {
          if (user.needsOnboard) {
              const onboarding = new MetaMaskOnboarding();
              onboarding.startOnboarding();
          } else if (!user.address) {
              dispatch(connectAccount());
          } else if (!user.correctChain) {
              dispatch(chainConnect());
          }
          return;
      }

      setIsChecking(true);
      setError(false);
      setNfts([]);

      const slothtyAddress = knownContracts.find((c) => c.slug === '3d-slothty').address;
      try {
          const eligibleIds = await checkBurnList(user.address) ?? [];
          const nftsFromWallet = await getSlothty721NftsFromWallet(slothtyAddress, user.address);
          const nftsFromCsv = await getSlothty721NftsFromIds(slothtyAddress, eligibleIds);
          const allNfts = nftsFromWallet
              .map((n) => {
                  // Will catch tokens that are in user wallet but not eligible ID list
                  n.isEligible = eligibleIds.includes(n.id);

                  return n;
              })
              .concat(nftsFromCsv.map((n) => {
                  // Will catch tokens not in user wallet but in eligible ID list
                  n.isEligible = nftsFromWallet.map(a => a.id).includes(n.id);

                  return n;
              }))
              .filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i)
              .sort((a, b) => (a.id > b.id ? 1 : -1));

          setNfts(allNfts);
      } finally {
          setIsChecking(false);
      }
  }

  const selectNft = (nftId) => {
      let currentSelectedNfts;
      if (selectedNfts.includes(nftId)) {
          currentSelectedNfts = selectedNfts.filter((n) => n !== nftId);
      } else {
          currentSelectedNfts = [...selectedNfts, nftId];
      }
      setSelectedNfts(currentSelectedNfts);
  };

  const executeBurn = () => async () => {
    setisExecutingBurn(true);
    const writeContract = new Contract(rugContractAddress, RugsuranceAbi.abi, user.provider.getSigner());

    try {
        console.log('burning...', user.address, selectedNfts);
        const tx = await writeContract.claimRefund(user.address, selectedNfts);
        const receipt = await tx.wait();
        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
    } catch (error) {
        if (error.data) {
            toast.error(error.data.message);
        } else if (error.message) {
            toast.error(error.message);
        } else {
            console.log(error);
            toast.error('Unknown Error');
        }
    } finally {
        setisExecutingBurn(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Slothty Rugsurance | Ebisu's Bay Marketplace</title>
        <meta name="description" content="Peace of mind minting on Ebisu's Bay Marketplace" />
        <meta name="title" content="Slothty Rugsurance | Ebisu's Bay Marketplace" />
        <meta property="og:title" content="Slothty Rugsurance | Ebisu's Bay Marketplace" />
        <meta property="og:url" content={`https://app.ebisusbay.com/slothty-rugsurance`} />
        <meta name="twitter:title" content="Slothty Rugsurance | Ebisu's Bay Marketplace" />
      </Helmet>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Slothty Rugsurance</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <p className="text-center">Slothty NFTs can only be refunded to the wallet they were originally minted from. Any unselectable NFTs below must be returned to the original wallet to process a refund.</p>
            <button className="btn-main lead mb-5 mr15 mx-auto" onClick={() => calculateBurnEligibility()} disabled={isChecking}>
              {isChecking ? (
                <>
                  Checking...
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>Check My Eligibility</>
              )}
            </button>
          </div>
        </div>
        {nfts.length > 0 && (
          <>
            <div className="row">
              <div className="col">
                  <h3>Tokens Refundable</h3>
                  <p>{nfts.length} results found</p>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div className="card-group">
                  {nfts.map((nft, index) => (
                    <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2">
                      <div className="card eb-nft__card h-100 shadow">
                          {nft.isEligible ? (
                              <img
                                  src={nft.image}
                                  className={`card-img-top`}
                                  alt={nft.name}
                              />
                          ) : (
                              <GreyscaleImg
                                  src={nft.image}
                                  className={`card-img-top`}
                                  alt={nft.name}
                              />
                          )}
                        <div className="card-body d-flex flex-column">
                          <h6 className="card-title mt-auto">{nft.name}</h6>
                          <div className="nft__item_action">
                              {nft.isEligible ? (
                                  <span style={{cursor:'pointer'}} onClick={() => selectNft(nft.id)}>
                                      {selectedNfts.includes(nft.id) ? (
                                          <>Unselect</>
                                      ) : (
                                          <>Select for Burn</>
                                      )}
                                  </span>
                              ) : (
                                  <span className="text-grey">Cannot be selected for Burn</span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
              <div className="row">
                  <div className="col d-flex flex-row justify-content-end">
                      <span className="my-auto fst-italic">{selectedNfts.length} selected</span>
                      <button className="btn-main lead mr15 ms-4 my-auto" onClick={() => setOpenConfirmationDialog(true)} disabled={selectedNfts < 1}>
                          Process Refund
                      </button>
                  </div>
              </div>
          </>
        )}
        {error && (
          <div className="row">
            <div className="col text-center">
              <p>{error}</p>
            </div>
          </div>
        )}
      </section>

      {openConfirmationDialog && (
        <div className="checkout">
            <div className="maincheckout">
                <button className="btn-close" onClick={() => setOpenConfirmationDialog(false)}>
                    x
                </button>
                <div className="heading">
                    <h3>Are you sure you want to burn Slothty?</h3>
                </div>
                <p>To burn and receive your refund, please follow the prompts in your</p>

                <button
                    className="btn-main lead mb-5"
                    onClick={executeBurn()}
                    disabled={!!burnError || executingBurn}
                >
                    {executingBurn ? (
                        <>
                            Burning Slothty...
                            <Spinner animation="border" role="status" size="sm" className="ms-1">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </>
                    ) : (
                        <>Burn Slothty</>
                    )}
                </button>
            </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
export default Rugsurance;
