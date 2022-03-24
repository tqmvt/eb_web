import React, {useCallback, useState} from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

import ListingCollection from '../components/ListingCollection';
import Footer from '../components/Footer';
import TopFilterBar from '../components/TopFilterBar';
import { sortOptions } from '../components/constants/sort-options';
import { SortOption } from '../Models/sort-option.model';
import { sortListings } from '../../GlobalState/marketplaceSlice';
import {caseInsensitiveCompare, shortAddress} from 'src/utils';
import {Button, FormControl, InputGroup, Spinner} from "react-bootstrap";
import { usePapaParse } from 'react-papaparse';
import {commify} from "ethers/lib.esm/utils";

const Rugsurance = () => {
  const cacheName = 'sellerPage';
  const { readRemoteFile } = usePapaParse();

  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(false);
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkCsv = async (address) => {
      setResult(null);
      setError(false);

      if (!address) {
          setError('Please provide an address');
          return;
      }

      readRemoteFile('/3dslothty-refunds.csv', {
        header: true,
        complete: (results) => {
          const record = results.data.find(o => caseInsensitiveCompare(o.Address, address.trim()));
          if (record) {
              setResult({
                  address: address,
                  costPerSlothty: record['Cost Per Slothty'],
                  ids: JSON.parse(record.IDs),
                  minted: record.Minted,
                  totalCost: record['Total Cost']
              })
          } else {
              setError('No Slothtys found for this address');
          }
        },
      });

//     const response = await fetch('/3dslothty-refunds.csv');
//
//     const reader = response.body.getReader();
//     const rd = await reader.read();
//     const decoder = new TextDecoder('utf-8');
//     const csv = await decoder.decode(rd.value);
// console.log('lenfth', csv.length);
//
//     const jsonList = await Papa.parse(csv, {header: true});
//     const addressList = jsonList.data;
//     console.log('res', addressList);
//
//     console.log('res', foundAddress);
  }

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
          <div className="col-lg-12 text-center">
            <p>Refunds for the 3DSlothty drop will be available later this week. In the meantime, you may check your address below to confirm your eligibility for a refund.</p>
              <FormControl
                  onChange={handleChangeAddress}
                  placeholder="Enter Wallet Address"
                  aria-label="Wallet Address"
              />
              <button className="btn-main lead mb-5 mr15" onClick={() => checkCsv(address)} disabled={isChecking}>
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
        <div className="row">
            <div className="col text-center">
                {result && (
                    <>
                        <div className="card eb-nft__card h-100 shadow px-4">
                            <div className="card-body d-flex flex-column">
                                <h5>Information</h5>
                                <p><strong>Address</strong>: {result.address}</p>
                                <p><strong>Cost Per Slothty</strong>: {result.costPerSlothty} CRO</p>
                                <p><strong>Total Minted</strong>: {result.minted}</p>
                                <p><strong>Eligible IDs to be burned</strong>: {result.ids.join(', ')}</p>
                                <p><strong>Maximum Eligible Refund</strong>: {commify(result.totalCost)} CRO</p>
                            </div>
                        </div>
                    </>
                )}
                {!result && error && (
                    <p>{error}</p>
                )}
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Rugsurance;
