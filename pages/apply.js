import React, { useState } from 'react';
import Head from 'next/head';
import styled, { createGlobalStyle } from 'styled-components';
import { useSelector } from 'react-redux';
import Reveal from 'react-awesome-reveal';
import { keyframes } from '@emotion/react';
import dynamic from 'next/dynamic'
import Footer from '../src/Components/components/Footer';
const NativeForms = dynamic(
  () => import('native-forms-react'),
  { ssr: false }
)

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

const Application = () => {
  // const dispatch = useDispatch();

  const userTheme = useSelector((state) => {
    return state.user.theme;
  });

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
      <Head>
        <title>Project Applications | Ebisu's Bay Marketplace</title>
        <meta name="description" content="Peace of mind minting on Ebisu's Bay Marketplace" />
        <meta name="title" content="Project Applications | Ebisu's Bay Marketplace" />
        <meta property="og:title" content="Project Applications | Ebisu's Bay Marketplace" />
        <meta property="og:url" content={`https://app.ebisusbay.com/apply`} />
        <meta name="twitter:title" content="Project Applications | Ebisu's Bay Marketplace" />
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
            <a href="#form">
              <ChoiceBox
                className="tab feature-box f-boxed style-3"
                style={{ cursor: 'pointer' }}
                onClick={handleBtnClick(0)}
              >
                <Reveal className="onStep" keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                  <i className="bg-color-2 i-boxed icon_tags_alt"></i>
                </Reveal>
                <div className="text">
                  <Reveal className="onStep" keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                    <h4 className="">Listing Request</h4>
                  </Reveal>
                  <Reveal className="onStep" keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                    <p className="">For established projects that would like to be added to the marketplace.</p>
                  </Reveal>
                </div>
                <i className="wm icon_tags_alt"></i>
              </ChoiceBox>
            </a>
          </div>

          <div className="col-xl-4 col-sm-6 d-flex justify-content-center">
            <a href="#form">
              <ChoiceBox
                className="tab feature-box f-boxed style-3"
                style={{ cursor: 'pointer' }}
                onClick={handleBtnClick(1)}
              >
                <Reveal className="onStep" keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                  <i className="bg-color-2 i-boxed icon_lightbulb_alt"></i>
                </Reveal>
                <div className="text">
                  <Reveal className="onStep" keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                    <h4 className="">Launchpad Request</h4>
                  </Reveal>
                  <Reveal className="onStep" keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                    <p className="">For projects that would like to launch on the Ebisu's Bay launchpad</p>
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
                  <h3 className="text-center">Listing Request</h3>
                  <StyledForm isDark={userTheme === 'dark'}>
                    <NativeForms form="https://form.nativeforms.com/iNHbm1jZmoWRPBXaK1Db" />
                  </StyledForm>
                </>
              )}
              {openTab === 1 && (
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
