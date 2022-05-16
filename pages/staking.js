import React from 'react';
import { useSelector } from 'react-redux';

import Footer from '../src/Components/components/Footer';
import MyStakingComponent from '../src/Components/components/MyStaking';

const MyStaking = () => {
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
                <h1>My Staking</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <MyStakingComponent />
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

export default MyStaking;
