import React from 'react';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import SliderCarouselRedux from "../components/SliderCarouselRedux";
import ListingCollection from "../components/ListingCollection";
import {useHistory} from "react-router-dom";
import HotCollections from "../components/HotCollections";

const GlobalStyles = createGlobalStyle`
`;

const Home = () => {
    const history = useHistory();

    const navigateTo = (link) => {
        history.push(link);
    }

    return (
        <div>
            <GlobalStyles/>
            <section className="jumbotron no-bg no-bottom">
                <div className='container-fluid'>
                    <div className='row'>
                        <SliderCarouselRedux/>
                    </div>
                </div>
            </section>

            <section className='container no-top'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <div className="spacer-double"></div>
                            <h2 className='style-2'>New Items</h2>
                        </div>
                    </div>
                    <ListingCollection showLoadMore={false}/>
                    <div className='col-lg-12'>
                        <div className="spacer-single"></div>
                        <span onClick={() => navigateTo(`/marketplace`)} className="btn-main lead m-auto">View Marketplace</span>
                    </div>
                </div>
            </section>

            <section className='container'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <h2 className='style-2'>Hot Collections</h2>
                    </div>
                </div>
                <div className='container'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <HotCollections/>
                        </div>
                    </div>
                </div>
            </section>

            <Footer/>

        </div>
    );
};
export default Home;