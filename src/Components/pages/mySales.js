import React, {useEffect, useState} from 'react';
import { useSelector, useDispatch } from "react-redux";

import Footer from '../components/Footer';
import { createGlobalStyle } from 'styled-components';
import TopFilterBar from '../components/TopFilterBar';
import {Redirect} from "react-router-dom";
import MySoldNftCollection from "../components/MySoldNftCollection";

const GlobalStyles = createGlobalStyle`
.jumbotron.tint{
  background-color: rgba(0,0,0,0.6);
  background-blend-mode: multiply;
}
`;

const MySales = () => {
    const walletAddress = useSelector((state) => state.user.address)


    const Content = () => (
        <>
            <GlobalStyles/>

            <section className='jumbotron breadcumb no-bg tint'
                     style={{backgroundImage: `url(${'/img/background/Ebisu-DT-Header.jpg'})`, backgroundPosition:'bottom'}}>
                <div className='mainbreadcumb'>
                    <div className='container'>
                        <div className='row m-10-hor'>
                            <div className='col-12 text-center'>
                                <h1>My Sales</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='container'>
                <MySoldNftCollection
                    walletAddress={walletAddress}
                />
            </section>

            <Footer/>
        </>
    );


    return (
        <div>
            {(walletAddress)?
                <Content/>
                :
                <Redirect to='/marketplace'/>
            }
        </div>
    );
};

export default MySales;
