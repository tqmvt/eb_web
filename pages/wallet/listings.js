import React from 'react';
import { useSelector } from 'react-redux';

import Footer from '../../src/Components/components/Footer';
import MyListingsCollection from '../../src/Components/components/MyListingsCollection';

const MyListings = () => {
  // const walletAddress = useSelector((state) => state.user.address);

  // if (!walletAddress) {
  //   router.push('/marketplace');
  //   return;
  // }

  const Content = () => (
    <>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>My Listings</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <MyListingsCollection walletAddress={walletAddress} />
      </section>

      <Footer />
    </>
  );

  return (
    <div>
      <Content />
    </div>
  );
};

export default MyListings;
