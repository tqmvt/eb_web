import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import DropsCarousel from '../../src/Components/components/DropsCarousel';
import CurrentDrops from '../../src/Components/components/CurrentDrops';
import Footer from '../../src/Components/components/Footer';
import UpcomingDrops from '../../src/Components/Drops/UpcomingDrops';
import PastDrops from '../../src/Components/Drops/PastDrops';
import { getTheme } from '../../src/Theme/theme';
import {hostedImage} from "../../src/helpers/image";
import Head from "next/head";
import PageHead from "../../src/Components/Head/PageHead";

const Drops = () => {
  const userTheme = useSelector((state) => {
    return state.user.theme;
  });
  return (
    <div>
      <PageHead
        title="Latest Drops"
        description="View the hottest drops on the Ebisu's Bay Launchpad"
        url="/drops"
      />
      <section className="no-top mt-2 pb-2 bg-transparent">
        <div className="d-flex justify-content-center px-5">
          <p className="my-auto me-5">
            Enjoy amazing discounts on drops and 50% off service fees while holding an Ebisu's Bay Founding Member NFT.
            <span className="fw-bold d-block d-md-inline-block text-end ms-3">
              <Link href="/collection/founding-member">
                <a>Learn More</a>
              </Link>
            </span>
          </p>
          <div style={{ width: '70px' }} className="my-auto">
            <Link href="/collection/founding-member">
              <a>
                <img src={hostedImage('/img/founding_member_sm.png')} className="img-responsive" alt="Founding Member Membership" />
              </a>
            </Link>
          </div>
        </div>
      </section>
      <section className="jumbotron breadcumb no-bg" style={{ backgroundColor: getTheme(userTheme).colors.bgColor3 }}>
        <div className="container">
          <div className="row py-4">
            <DropsCarousel />
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Active Drops</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <CurrentDrops useCarousel={false} />
          </div>
        </div>
      </section>

      <section className="container no-top">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>
                Upcoming Drops
              </h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <UpcomingDrops />
          </div>
        </div>
      </section>

      <section className="container no-top">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Completed Drops</h2>
              <div className="small-border"></div>
            </div>
          </div>
          <div className="col-lg-12">
            <PastDrops />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Drops;
