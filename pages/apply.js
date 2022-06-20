import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import styled, { createGlobalStyle } from 'styled-components';
import { useSelector } from 'react-redux';
import Reveal from 'react-awesome-reveal';
import { keyframes } from '@emotion/react';
import dynamic from 'next/dynamic';
import { faLightbulb, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Footer from '../src/Components/components/Footer';
import {useRouter} from "next/router";
const NativeForms = dynamic(() => import('native-forms-react'), { ssr: false });

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

const StyledForm = styled.div`
  .nf-form-container * {
    color: ${({ theme }) => theme.colors.textColor3} !important;
    background: ${({ theme }) => theme.colors.bgColor1} !important;
  }
  .nf-form-container input {
    color: ${({ theme }) => theme.colors.textColor3} !important;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.textColor3} !important;
  }
  .nf-form-container .nf-files-upload {
    fill: ${({ theme }) => theme.colors.textColor3} !important;
  }

  .nf-root *,
  .nf-status-container * {
    color: ${({ theme }) => theme.colors.textColor3} !important;
    background: ${({ theme }) => theme.colors.bgColor1} !important;
  }
`;

const choice = {
  listing: 'listing',
  launchpad: 'launchpad'
};

const Application = ({type}) => {
  const router = useRouter();

  const userTheme = useSelector((state) => {
    return state.user.theme;
  });

  const [openTab, setOpenTab] = useState(type);
  const handleBtnClick = (index) => (element) => {
    if (choice[index]) {
      router.push({
        pathname: '/apply',
        query: { type: choice[index] }
      },
        undefined, { shallow: true }
      );
    }
  };

  useEffect(() => {
    if (router.query.type && choice[router.query.type]) {
      setOpenTab(router.query.type);
      const element = document.getElementById('form');
      element.scrollIntoView();
    }
  }, [router.query])

  return (
    <div>
      <Head>
        {type === choice.listing && (
          <>
            <title>Listing Application | Ebisu's Bay Marketplace</title>
            <meta name="title" key="title" content="Listing Application | Ebisu's Bay Marketplace" />
            <meta name="description" key="desc" content="Get your project listed on Ebisu's Bay Marketplace" />
            <meta property="og:url" key="og_url" content="https://app.ebisusbay.com/apply" />
            <meta property="og:title" key="og_title" content="Listing Application | Ebisu's Bay Marketplace" />
            <meta property="og:description" key="og_desc" content="Get your project listed on Ebisu's Bay Marketplace" />
            <meta property="twitter:url" key="twitter_url" content="https://app.ebisusbay.com/apply">
            <meta property="twitter:title" key="twitter_title" content="Listing Application | Ebisu's Bay Marketplace" />
            <meta property="twitter:description" key="twitter_desc" content="Get your project listed on Ebisu's Bay Marketplace" />
          </>
        )}
        {type === choice.launchpad && (
          <>
            <title>Launchpad Application | Ebisu's Bay Marketplace</title>
            <meta name="title" key="title" content="Launchpad Application | Ebisu's Bay Marketplace" />
            <meta name="description" key="desc" content="Get your project listed on Ebisu's Bay Marketplace" />
            <meta property="og:url" key="og_url" content="https://app.ebisusbay.com/apply" />
            <meta property="og:title" key="og_title" content="Launchpad Application | Ebisu's Bay Marketplace" />
            <meta property="og:description" key="og_desc" content="Get your project listed on Ebisu's Bay Marketplace" />
            <meta property="twitter:url" key="twitter_url" content="https://app.ebisusbay.com/apply">
            <meta property="twitter:title" key="twitter_title" content="Launchpad Application | Ebisu's Bay Marketplace" />
            <meta property="twitter:description" key="twitter_desc" content="Get your project listed on Ebisu's Bay Marketplace" />
          </>
        )}
      </Head>
      <GlobalStyles />
      <section className="container mt-0 mt-lg-5">
        <div className="row">
          <div className="col">
            <h2>Choose Application Type</h2>
          </div>
        </div>
        <div className="row justify-content-center mt-2">
          <div className="col-xl-4 col-sm-6 d-flex justify-content-center mb-2 mb-sm-0">
            <ChoiceBox
              className={`tab feature-box f-boxed style-3 ${openTab === choice.listing ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={handleBtnClick(choice.listing)}
            >
              <Reveal className="onStep mb-3" keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                <FontAwesomeIcon className="bg-color-2" icon={faTags} />
              </Reveal>
              <div className="text">
                <Reveal className="onStep" keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Listing Request</h4>
                </Reveal>
                <Reveal className="onStep" keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">For established projects that would like to be added to the marketplace.</p>
                </Reveal>
              </div>
            </ChoiceBox>
          </div>

          <div className="col-xl-4 col-sm-6 d-flex justify-content-center">
            <ChoiceBox
              className={`tab feature-box f-boxed style-3 ${openTab === choice.launchpad ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={handleBtnClick(choice.launchpad)}
            >
              <Reveal className="onStep mb-3" keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                <FontAwesomeIcon className="bg-color-2" icon={faLightbulb} />
              </Reveal>
              <div className="text">
                <Reveal className="onStep" keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Launchpad Request</h4>
                </Reveal>
                <Reveal className="onStep" keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">For projects that would like to launch on the Ebisu's Bay launchpad</p>
                </Reveal>
              </div>
            </ChoiceBox>
          </div>
        </div>
        <div id="form" className="row">
          <div className="col">
            <div className="col-lg-12 mt-4">
              {openTab === choice.listing && (
                <>
                  <h3 className="text-center">Listing Request</h3>
                  <StyledForm isDark={userTheme === 'dark'}>
                    <NativeForms form="https://form.nativeforms.com/iNHbm1jZmoWRPBXaK1Db" />
                  </StyledForm>
                </>
              )}
              {openTab === choice.launchpad && (
                <>
                  <h3 className="text-center">Launchpad Request</h3>
                  <StyledForm isDark={userTheme === 'dark'}>
                    <NativeForms form="https://form.nativeforms.com/AM0YjZ50jZmoWRPBXaK1Db" />
                  </StyledForm>
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

export const getServerSideProps = async ({ query }) => {
  console.log(query)
  return {
    props: {
      type: query?.type ?? null,
    },
  };
};
