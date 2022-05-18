import React from 'react';

import MySoldNftCollection from '../src/Components/components/MySoldNftCollection';
import Footer from '../src/Components/components/Footer';
import withAuth from '../src/Components/withAuth';

const MySales = () => {
  const Content = () => (
    <>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>My Sales</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <MySoldNftCollection walletAddress={walletAddress} />
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

export default withAuth(MySales);
