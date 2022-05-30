import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import DropsCarousel from '../components/DropsCarousel';
import CurrentDrops from '../components/CurrentDrops';
import Footer from '../components/Footer';
import UpcomingDrops from '../Drops/UpcomingDrops';
import PastDrops from '../Drops/PastDrops';
import { getTheme } from 'src/Theme/theme';

const Drops = () => {
  const userTheme = useSelector((state) => {
    return state.user.theme;
  });
  return (
    <div>
      <section className="no-top mt-2 pb-2 bg-transparent">
        <div className="d-flex justify-content-center px-5">
          <p className="my-auto me-5">
            Enjoy amazing discounts on drops and 50% off service fees while holding an Ebisu's Bay Founding Member NFT.
            <span className="fw-bold d-block d-md-inline-block text-end ms-3">
              <Link to="/collection/founding-member">Learn More</Link>
            </span>
          </p>
          <div style={{ width: '70px' }} className="my-auto">
            <Link to="/collection/founding-member">
              <img src="/img/founding_member_sm.png" className="img-responsive" alt="Founding Member Membership" />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="jumbotron breadcumb no-bg h-vh"
        style={{ backgroundColor: getTheme(userTheme).colors.bgColor3 }}
      >
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
