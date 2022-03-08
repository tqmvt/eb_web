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

const Drop = () => {
  const [amount, setAmount] = useState(1);
  const [shipType, setShipType] = useState("");
  const [shipTypes, setShipTypes] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [shipContract, setShipContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  const [regularQuantity, setRegularQuantity] = useState(0);
  const [greatQuantity, setGreatQuantity] = useState(0);
  const [legendaryQuantity, setLegendaryQuantity] = useState(0);
  const onQuantityChange = (key, e) => {
    const value = e.target.value;
    if (key === 'regular') {
      setRegularQuantity(value)
    } else if (key === 'great') {
      setGreatQuantity(value)
    } else if (key === 'legendary') {
      setLegendaryQuantity(value)
    }
  }

  useEffect(() => {
   
  }, []);

  const user = useSelector((state) => {
    return state.user;
  });

  const init = useCallback (async() => {
    if (user.provider) {
      try {
        setIsLoading(true);
        let spaceShip = await new ethers.Contract(config.spaceship_contract, ShipABI.abi, user.provider.getSigner());
        const ship1 = await spaceShip.SHIP1();
        const ship2 = await spaceShip.SHIP2();
        const ship3 = await spaceShip.SHIP3();
        const ships = [ship1, ship2, ship3];
console.log('ships', ships)
        const shipItemDrop = config.known_contracts.find(drop => drop.slug === "crosmocrafts-parts");

        let shipItem = await new ethers.Contract(shipItemDrop.address, ShipItemABI.abi, user.provider.getSigner());
        let ids= [];
        for(let i = 0; i < 9; i ++) {
          const balance = await shipItem.balanceOf(user.address, i);  
          ids.push(balance.toNumber());
        }
        console.log(ids);
        
        const tmpShipTypes = [];
        for(let i = 0; i < 3; i ++) {
          if (ids[i] > 0 && ids[i + 3] > 0 && ids[i + 6] > 0)
          tmpShipTypes.push({name: `ship${i+1}`, value: ships[i]});
        }
        console.log(tmpShipTypes);
        setShipTypes(tmpShipTypes);

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
      setIsMinting(true);
      await shipContract.mint(quantity, address);
      toast.success(createSuccessfulTransactionToastContent("Successfully minted"));
    } catch(err) {
      toast.error(err.message);
    } finally {
      setIsMinting(false);
    }
  }

  const handleChange = (e) => {
    setAmount(e.target.value);
  }

  const onChangeShipType = (e) => {
    setShipType(e.target.value);
  }

  const ShipBuilderCard = ({type}) => {
    let key = 0;
    let quantity;
    if (type === 'regular') {
      key = 0;
      quantity = regularQuantity;
    } else if (type === 'great') {
      key = 1;
      quantity = greatQuantity;
    } else if (type === 'legendary') {
      key = 2;
      quantity = legendaryQuantity;
    }

    return (
        <div className="card eb-nft__card h-100 w-100 shadow">
          <div className="card-body d-flex flex-column">
            <h5>{humanize(type)} Parts</h5>
            <div className="row row-cols-1 row-cols-sm-3 row-cols-md-4 g-3">
              <div className="card border-0">
                <img src={`/img/collections/crosmonauts/parts/${type}-booster.webp`} className="card-img-top" alt="..." />
                <div className="card-body">
                  <h5 className="card-title">Booster</h5>
                  <p className="card-text">Parts Collected: 4</p>
                </div>
              </div>
              <div className="card border-0">
                <img src={`/img/collections/crosmonauts/parts/${type}-engine.webp`}  className="card-img-top" alt="..." />
                <div className="card-body">
                  <h5 className="card-title">Engine</h5>
                  <p className="card-text">Parts Collected: 4</p>
                </div>
              </div>
              <div className="card border-0">
                <img src={`/img/collections/crosmonauts/parts/${type}-deck.webp`}  className="card-img-top" alt="..." />
                <div className="card-body">
                  <h5 className="card-title">Deck</h5>
                  <p className="card-text">Parts Collected: 4</p>
                </div>
              </div>
              <div className="card border-0">
                <div className="card-body d-flex">
                  <div className="align-self-center">
                    <h5 className="card-title d-flex justify-content-center">Build {humanize(type)} Ship</h5>
                    <div className="row row-cols-1 g-3 mt-2">
                      <div className="col d-flex justify-content-center">
                        <Form.Label>Quantity</Form.Label>
                      </div>
                      <div className="col d-flex justify-content-center">
                        <Form.Control
                            type="number"
                            placeholder="Input the amount"
                            onChange={(e) => onQuantityChange('regular', e)}
                            value={regularQuantity}
                            style={{width:'100px', marginBottom: 0, appearance:'none', margin: 0}}
                        />
                      </div>
                      <div className="col d-flex justify-content-center">
                        <button className="btn-main lead mb-5 mr15" onClick={() => mint(shipTypes[key].value, quantity)}>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  };

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
        <div className="row row-cols-1 g-4">
          <ShipBuilderCard type="regular" />
          <ShipBuilderCard type="great" />
          <ShipBuilderCard type="legendary" />
        </div>
      </section>

        <div className='container' style={{"marginTop": "120px"}}>
        {
          isLoading ? (
            <div className="row mt-4" style={{"marginTop": "220px"}}>
              <div className="col-lg-12 text-center">
                <span>Loading...</span>
              </div>
            </div>
          ):
          (<>
          <div className='row d-flex justify-content-center'>
            <div className='col-lg-4'>
              <Form.Select aria-label="Default select example" onChange={onChangeShipType}>
                {
                  shipTypes.length === 0 ? <option>No available </option>
                  : <>
                    <option>Select the ShipType</option>
                    {
                      shipTypes.map((ship, index) => {
                          return (
                            <option value={ship.value} key={`${index}_${ship.value}`}>{ship.name} </option>
                          )
                      })
                    }
                  </>
                }
            </Form.Select>
            </div>
            <div className='col-lg-4'>
              <Form.Control type="number" placeholder="Input the amount" onChange={handleChange} value={amount}/>
            </div>
          </div>

          <div className='row d-flex justify-content-center'>
            <button className="btn-main lead mb-5 mr15" onClick={mint}>
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
          </>)
        }
        </div>
 
      
      <Footer />
    </>
  );
};
export default Drop;
