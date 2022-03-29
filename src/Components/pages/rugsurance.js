import React, {useEffect, useState} from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../components/Footer';
import {caseInsensitiveCompare, shortAddress} from 'src/utils';
import {FormControl, InputGroup, Spinner} from "react-bootstrap";
import { usePapaParse } from 'react-papaparse';
import {ethers} from "ethers";
import config from "../../Assets/networks/rpc_config.json";
import {
    getSlothty721NftsFromIds,
    getSlothty721NftsFromWallet
} from "../../core/api/chain";
import styled from "styled-components";
const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);

const GreyscaleImg = styled.img`
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
`;

const Rugsurance = () => {
  const { readRemoteFile } = usePapaParse();

  const [isChecking, setIsChecking] = useState(false);
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);

  const [nfts, setNfts] = useState([]);
  const [selectedNfts, setSelectedNfts] = useState([]);

  const checkCsv = async (address) => {
      return new Promise((resolve, reject) => {
          readRemoteFile('/3dslothty-refunds.csv', {
              header: true,
              complete: (results) => {
                  const record = results.data.find(o => caseInsensitiveCompare(o.Address, address.trim()));
                  if (record) {
                      resolve({
                          error: null,
                          result: {
                              address: address,
                              costPerSlothty: record['Cost Per Slothty'],
                              ids: JSON.parse(record.IDs),
                              minted: record.Minted,
                              totalCost: record['Total Cost']
                          }
                      });
                  } else {
                      resolve({
                          error: 'No Slothtys found for this address',
                          result: {
                              ids: []
                          }
                      });
                  }
              },
          });
      });
  }

  const calculateBurnEligibility = async (walletAddress) => {
      setIsChecking(true);
      setError(false);
      setNfts([]);
      if (!address) {
          setError('Please provide an address');
          setIsChecking(false);
          return;
      }

      const slothtyAddress = '0x966B18Afe9D9062d611D0C246A1959b7a25FCdDe';
      const rugAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      try {
          const csvData = await checkCsv(walletAddress) ?? [];
          console.log('ei', csvData);
          const nftsFromWallet = await getSlothty721NftsFromWallet(slothtyAddress, walletAddress);
          const nftsFromCsv = !csvData.error ? await getSlothty721NftsFromIds(slothtyAddress, csvData.result.ids) : [];
          console.log(csvData.result.ids, nftsFromWallet, nftsFromCsv);
          const allNfts = nftsFromWallet
              .map((n) => {
                  n.isEligible = csvData.result.ids.includes(n.id);

                  return n;
              })
              .concat(nftsFromCsv.map((n) => {
                  n.isEligible = nftsFromWallet.map(a => a.id).includes(n.id);

                  return n;
              }))
              .filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i)
              .sort((a, b) => (a.id > b.id ? 1 : -1));
console.log(allNfts);
          setNfts(allNfts);
      } finally {
          setIsChecking(false);
      }
  }

  useEffect(() => {
      console.log('updatd nfts', nfts);
  }, [nfts])

  const handleChangeAddress = (event) => {
    const { value } = event.target;
    setAddress(value);
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
            <p className="text-center">Refunds for the 3DSlothty drop will be available later this week. In the meantime, you may check your address below to confirm your eligibility for a refund.</p>
            <h3>Wallet Address</h3>
            <FormControl
              onChange={handleChangeAddress}
              placeholder="Enter Wallet Address"
              aria-label="Wallet Address"
            />
            <button className="btn-main lead mb-5 mr15" onClick={() => calculateBurnEligibility(address)} disabled={isChecking}>
              {isChecking ? (
                <>
                  Checking...
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>Check Now</>
              )}
            </button>
          </div>
        </div>
        {nfts.length > 0 && (
          <>
            <div className="row">
              <div className="col">
                  <h3>Tokens Refundable for {address}</h3>
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
                                  <span style={{cursor:'pointer'}}>Select for Burn</span>
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
                  <div className="col">
                      <button className="btn-main lead mb-5 mr15 ms-auto">
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

      <Footer />
    </div>
  );
};
export default Rugsurance;
