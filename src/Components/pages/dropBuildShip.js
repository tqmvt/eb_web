import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Spinner } from 'react-bootstrap';
import * as Sentry from '@sentry/react';
import Footer from '../components/Footer';
import config from '../../Assets/networks/rpc_config.json';
import {
  createSuccessfulTransactionToastContent, humanize
} from '../../utils';
import ShipABI from "../../Contracts/Ship.json"
import ShipItemABI from "../../Contracts/ShipItem.json"
import styled from "styled-components";

const Drop = () => {
  const [ships, setShips] = useState([]);
  const [partsBalances, setPartsBalances] = useState([]);
  const [shipContract, setShipContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state) => {
    return state.user;
  });

  const init = useCallback (async() => {
    if (user.provider) {
      try {
        setIsLoading(true);
        let spaceShip = await new ethers.Contract(config.spaceship_contract, ShipABI.abi, user.provider.getSigner());
        const ship1 = await spaceShip.SHIP1(); // Regular
        const ship2 = await spaceShip.SHIP2(); // Great
        const ship3 = await spaceShip.SHIP3(); // Legendary
        const ships = [ship1, ship2, ship3];
        setShips(ships);

        const shipItemDrop = config.known_contracts.find(drop => drop.slug === "crosmocrafts-parts");

        let shipItem = await new ethers.Contract(shipItemDrop.address, ShipItemABI.abi, user.provider.getSigner());
        let ids= [];
        for(let i = 0; i < 9; i ++) {
          const balance = await shipItem.balanceOf(user.address, i);  
          ids.push(balance.toNumber());
        }
        setPartsBalances(ids);

        setShipContract(spaceShip);
      } catch (error) {
        console.log(error);
        Sentry.captureException(error);
      }
      setIsLoading(false);
    }
  }, [user.address, user.provider]);

  useEffect(() => {
    init();
  }, [init, user]);

  const mint = async(address, quantity) => {
    if (!shipContract)  return;
    console.log('minting...', quantity, address);
    try {
      await shipContract.mint(quantity, address);
      toast.success(createSuccessfulTransactionToastContent("Successfully minted"));
    } catch(err) {
      toast.error(err.message);
    } finally {
    }
  }

  return (
    <>
      <section
          className="jumbotron breadcumb no-bg tint"
          style={{
            backgroundImage: 'url(/img/collections/crosmonauts/ship/banner.webp)',
            backgroundPosition: '50% 50%',
          }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>Build a Crosmocraft</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        {
          isLoading ? (
            <div className="row mt-4" style={{"marginTop": "220px"}}>
              <div className="col-lg-12 text-center">
                <span>Loading...</span>
              </div>
            </div>
          ):
          (
            <div className="row row-cols-1 g-4">
              {ships[0] && (
                  <ShipBuilderCard
                      type="regular"
                      shipAddress={ships[0]}
                      key={0}
                      mintCallback={mint}
                      quantityCollected={[partsBalances[0], partsBalances[3], partsBalances[6]]}
                  />
              )}
              {ships[1] && (
                  <ShipBuilderCard
                      type="great"
                      shipAddress={ships[1]}
                      key={1}
                      mintCallback={mint}
                      quantityCollected={[partsBalances[1], partsBalances[4], partsBalances[7]]}
                  />
              )}
              {ships[2] && (
                  <ShipBuilderCard
                      type="legendary"
                      shipAddress={ships[2]}
                      key={2}
                      mintCallback={mint}
                      quantityCollected={[partsBalances[2], partsBalances[5], partsBalances[8]]}
                  />
              )}
            </div>
          )
        }
      </section>
      <Footer />
    </>
  );
};
export default Drop;

const GreyscaleImg = styled.img`
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
`;

const ShipBuilderCard = ({type, shipAddress, key, mintCallback, quantityCollected}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const onQuantityChange = (key, e) => {
    const value = e.target.value;
    const maxAvailable = Math.min(...quantityCollected);
    console.log(value, quantityCollected, maxAvailable)
    if (value <= maxAvailable && value > 0) {
        setQuantity(value);
    }
  }

  const onMint = async() => {
    setIsMinting(true);
    await mintCallback(shipAddress, quantity);
    setIsMinting(false);
  };

  useEffect(() => {
      const maxAvailable = Math.min(...quantityCollected);
      setQuantity(maxAvailable > 0 ? 1 : 0);
  }, []);

  return (
      <div className="card eb-nft__card h-100 w-100 shadow">
        <div className="card-body d-flex flex-column">
          <h5>{humanize(type)} Parts</h5>
          <div className="row row-cols-1 row-cols-sm-3 row-cols-md-4 g-3">
            <div className="card border-0">
              {quantityCollected[0] > 0 ? (
                <img src={`/img/collections/crosmonauts/parts/${type}-engine.webp`}  className="card-img-top" alt="..." />
              ) : (
                <GreyscaleImg src={`/img/collections/crosmonauts/parts/${type}-engine.webp`}  className="card-img-top" alt="..." />
              )}
              <div className="card-body">
                <h5 className="card-title">Core</h5>
                <p className="card-text">Parts Collected: {quantityCollected[0]}</p>
              </div>
            </div>
            <div className="card border-0">
              {quantityCollected[0] > 0 ? (
                <img src={`/img/collections/crosmonauts/parts/${type}-booster.webp`}  className="card-img-top" alt="..." />
              ) : (
                <GreyscaleImg src={`/img/collections/crosmonauts/parts/${type}-booster.webp`}  className="card-img-top" alt="..." />
              )}
              <div className="card-body">
                <h5 className="card-title">Booster</h5>
                <p className="card-text">Parts Collected: {quantityCollected[1]}</p>
              </div>
            </div>
            <div className="card border-0">
              {quantityCollected[0] > 0 ? (
                <img src={`/img/collections/crosmonauts/parts/${type}-deck.webp`}  className="card-img-top" alt="..." />
              ) : (
                <GreyscaleImg src={`/img/collections/crosmonauts/parts/${type}-deck.webp`}  className="card-img-top" alt="..." />
              )}
              <div className="card-body">
                <h5 className="card-title">Deck</h5>
                <p className="card-text">Parts Collected: {quantityCollected[2]}</p>
              </div>
            </div>
            <div className="card border-0">
              <div className="card-body d-flex">
                <div className="align-self-center">
                  <h5 className="card-title d-flex justify-content-center">Build {humanize(type)} Ship</h5>
                    {quantityCollected[0] > 0 &&  quantityCollected[1] > 0 && quantityCollected[2] > 0 ? (
                        <div className="row row-cols-1 g-3 mt-2">
                            <div className="col d-flex justify-content-center">
                                <Form.Label>Quantity</Form.Label>
                            </div>
                            <div className="col d-flex justify-content-center">
                                <Form.Control
                                    type="number"
                                    placeholder="Input the amount"
                                    onChange={(e) => onQuantityChange('regular', e)}
                                    value={quantity}
                                    style={{width:'100px', marginBottom: 0, appearance:'none', margin: 0}}
                                />
                            </div>
                            <div className="col d-flex justify-content-center">
                                <button className="btn-main lead mb-5 mr15" onClick={() => onMint(shipAddress, quantity)}>
                                    {isMinting ? (
                                        <>
                                            Minting...
                                            <Spinner animation="border" role="status" size="sm" className="ms-1">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                        </>
                                    ) : (
                                        <>Mint</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>Not enough parts</p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
};