import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import MySoldNftCollection from '../src/Components/components/MySoldNftCollection';
import Footer from '../src/Components/components/Footer';

const MySales = () => {
  const router = useRouter();
  const walletAddress = useSelector((state) => state.user.address);

  if (!walletAddress) {
    if (typeof window !== 'undefined') {
      router.push('/marketplace');
    }
  }

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

export default MySales;
