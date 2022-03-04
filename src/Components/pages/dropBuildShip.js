import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Spinner } from 'react-bootstrap';
import * as Sentry from '@sentry/react';
import Footer from '../components/Footer';
import config from '../../Assets/networks/rpc_config.json';
import {
  createSuccessfulTransactionToastContent
} from '../../utils';
import ShipABI from "../../Contracts/Ship.json"
import ShipItemABI from "../../Contracts/ShipItem.json"

const Drop = () => {
  const [amount, setAmount] = useState(1);
  const [shipType, setShipType] = useState("");
  const [shipTypes, setShipTypes] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [shipContract, setShipContract] = useState(null);
  const [ids, setIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

        const shipItemDrop = config.drops.find(drop => drop.slug === "crosmonauts-ship");

        let shipItem = await new ethers.Contract(shipItemDrop.address, ShipItemABI.abi, user.provider.getSigner());
        let ids= [];
        for(let i = 0; i < 9; i ++) {
          const balance = await shipItem.balanceOf(user.address, i);  
          ids.push(balance.toNumber());
        }
        
        const tmpShipTypes = [];
        for(let i = 0; i < 3; i ++) {
          if (ids[i] > 0 && ids[i + 3] > 0 && ids[i + 6] > 0)
          tmpShipTypes.push({name: `ship${i+1}`, value: ships[i]});
        }
        
        setShipTypes(tmpShipTypes);
        setIds(ids);

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

  

  const mint = async() => {
    if (!shipContract)  return;

    try {
      setIsMinting(true);
      await shipContract.mint(amount, shipType);
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
  return (
    <> 
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
