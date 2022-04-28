import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../components/Footer';
import { createSuccessfulTransactionToastContent } from 'src/utils';
import { Modal, Spinner } from 'react-bootstrap';
import { Contract, ethers } from 'ethers';
import config from '../../Assets/networks/rpc_config.json';
import { getSlothty721NftsFromIds, getSlothty721NftsFromWallet } from '../../core/api/chain';
import styled, {createGlobalStyle} from 'styled-components';
import RugsuranceAbi from '../../Contracts/SlothtyRugsurance.json';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import MetaMaskOnboarding from '@metamask/onboarding';
import { chainConnect, connectAccount } from '../../GlobalState/User';
import { ERC721 } from '../../Contracts/Abis';
import '../../Assets/styles/fire.css';
import Reveal from "react-awesome-reveal";
import {keyframes} from "@emotion/react";

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;

const GlobalStyles = createGlobalStyle`
  .feature-box.f-boxed.active {
    color: #fff;
    box-shadow: 2px 2px 20px 0px rgba(0, 0, 0, 0.05);
    background: #403f83;
    transition: 0.7s;
  }
  .feature-box.f-boxed.active h4 {
    color: #fff;
    transition: 0.7s;
  }
`;


const Application = () => {
  const dispatch = useDispatch();

  const [openTab, setOpenTab] = useState(0);
  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenTab(index);
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
      <GlobalStyles />
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
          <div className="col">
            <h2>Choose Application Type</h2>
          </div>
        </div>
        <div className="row justify-content-center">

          <div className="col-xl-4">
            <div className="tab feature-box f-boxed style-3" style={{width: '400px', cursor: 'pointer'}} onClick={handleBtnClick(0)}>
              <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                <i className="bg-color-2 i-boxed icon_tags_alt"></i>
              </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Submit a Listing</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">For established projects that would like to be added to the marketplace.</p>
                </Reveal>
              </div>
              <i className="wm icon_tags_alt"></i>
            </div>
          </div>

          <div className="col-xl-4">
            <div className="tab feature-box f-boxed style-3" style={{width: '400px', cursor: 'pointer'}} onClick={handleBtnClick(1)}>
              <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                <i className="bg-color-2 i-boxed icon_lightbulb_alt"></i>
              </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Become a Creator</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">For projects that would like to mint on Ebisu's Bay</p>
                </Reveal>
              </div>
              <i className="wm icon_lightbulb_alt"></i>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="col-lg-12">
              {openTab === 0 && (
              <iframe
                src="https://form.nativeforms.com/iNHbm1jZmoWRPBXaK1Db"
                width="100%"
                height="600"
                frameBorder="0"
              >
              </iframe>
              )}
              {openTab === 1 && (
                <iframe
                  src="https://form.nativeforms.com/AM0YjZ50jZmoWRPBXaK1Db"
                  width="100%"
                  height="600"
                  frameBorder="0"
                >
                </iframe>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default Application;