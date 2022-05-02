import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../components/Footer';
import styled, {createGlobalStyle} from 'styled-components';
import { useDispatch } from 'react-redux';
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
    background: #145499;
    color: #fff;
    box-shadow: 2px 2px 20px 0px rgba(0, 0, 0, 0.05);
    transition: 0.7s;
  }
  .feature-box.f-boxed.active h4 {
    color: #fff;
    transition: 0.7s;
  }
  
  .feature-box.f-boxed:hover {
    background: #145499;
  }
`;

const ChoiceBox = styled.div`
  @media only screen and (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 400px;
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 250px;
    padding: 30px !important;
  }
`;

const Application = () => {
  const dispatch = useDispatch();

  const [openTab, setOpenTab] = useState(null);
  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.closest('.tab').classList.add('active');

    setOpenTab(index);
  };

  return (
    <div>
      <Helmet>
        <title>Project Applications | Ebisu's Bay Marketplace</title>
        <meta name="description" content="Peace of mind minting on Ebisu's Bay Marketplace" />
        <meta name="title" content="Project Applications | Ebisu's Bay Marketplace" />
        <meta property="og:title" content="Project Applications | Ebisu's Bay Marketplace" />
        <meta property="og:url" content={`https://app.ebisusbay.com/apply`} />
        <meta name="twitter:title" content="Project Applications | Ebisu's Bay Marketplace" />
      </Helmet>
      <GlobalStyles />
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Project Application</h1>
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

          <div className="col-xl-4 col-sm-6 d-flex justify-content-center mb-2 mb-sm-0">
            <a href="#form">
              <ChoiceBox className="tab feature-box f-boxed style-3" style={{cursor: 'pointer'}} onClick={handleBtnClick(0)}>
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
              </ChoiceBox>
            </a>
          </div>

          <div className="col-xl-4 col-sm-6 d-flex justify-content-center">
            <a href="#form">
              <ChoiceBox className="tab feature-box f-boxed style-3" style={{cursor: 'pointer'}} onClick={handleBtnClick(1)}>
                <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                  <i className="bg-color-2 i-boxed icon_lightbulb_alt"></i>
                </Reveal>
                <div className="text">
                  <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                    <h4 className="">Become a Creator</h4>
                  </Reveal>
                  <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                    <p className="">For projects that would like to mint on the Ebisu's Bay launchpad</p>
                  </Reveal>
                </div>
                <i className="wm icon_lightbulb_alt"></i>
              </ChoiceBox>
            </a>
          </div>
        </div>
        <div id="form" className="row">
          <div className="col">
            <div className="col-lg-12 mt-4">
              {openTab === 0 && (
                <>
                  <h3 className="text-center">Listing Application</h3>
                  <iframe
                    src="https://form.nativeforms.com/iNHbm1jZmoWRPBXaK1Db"
                    width="100%"
                    height="600"
                    frameBorder="0"
                  >
                  </iframe>
                </>
              )}
              {openTab === 1 && (
                <>
                  <h3 className="text-center">Creator Application</h3>
                  <iframe
                    src="https://form.nativeforms.com/AM0YjZ50jZmoWRPBXaK1Db"
                    width="100%"
                    height="600"
                    frameBorder="0"
                  >
                  </iframe>
                </>
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