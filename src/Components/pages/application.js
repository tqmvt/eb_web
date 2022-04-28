import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../components/Footer';
import { createSuccessfulTransactionToastContent } from 'src/utils';
import { Modal, Spinner } from 'react-bootstrap';
import { Contract, ethers } from 'ethers';
import config from '../../Assets/networks/rpc_config.json';
import { getSlothty721NftsFromIds, getSlothty721NftsFromWallet } from '../../core/api/chain';
import styled from 'styled-components';
import RugsuranceAbi from '../../Contracts/SlothtyRugsurance.json';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import MetaMaskOnboarding from '@metamask/onboarding';
import { chainConnect, connectAccount } from '../../GlobalState/User';
import { ERC721 } from '../../Contracts/Abis';
import '../../Assets/styles/fire.css';

const knownContracts = config.known_contracts;
const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);

const GreyscaleImg = styled.img`
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
`;
const rugContractAddress = config.slothy_rugsurance_contract;

const txExtras = {
  gasPrice: ethers.utils.parseUnits('5000', 'gwei'),
};

const Application = () => {
  const dispatch = useDispatch();

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
                <h1 className="text-center">Application</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <iframe
              src="https://form.nativeforms.com/iNHbm1jZmoWRPBXaK1Db"
              width="100%"
              height="600"
              frameBorder="0"
            >
            </iframe>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default Application;