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

const Drop = () => {
  const [amount, setAmount] = useState(1);
  const [shipType, setShipType] = useState("");
  const [shipTypes, setShipTypes] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [shipContract, setShipContract] = useState(null);
  const [ids, setIds] = useState([]);

  useEffect(() => {
   
  }, []);

  const user = useSelector((state) => {
    return state.user;
  });

  const init = useCallback (async() => {
    if (user.provider) {
      try {
        let contract = await new ethers.Contract(config.spaceship_contract, ShipABI.abi, user.provider.getSigner());
        const ship1 = await contract.SHIP1();
        const ship2 = await contract.SHIP2();
        const ship3 = await contract.SHIP3();
        setShipTypes([ship1, ship2, ship3]);

        const ids = await contract.walletOfOwner(user.address);
        setIds(ids);

        setShipContract(contract);
      } catch (error) {
        console.log(error);
        Sentry.captureException(error);
      }
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
        <div className='row d-flex justify-content-center'>
          <div className='col-lg-4'>
            <Form.Select aria-label="Default select example" onChange={onChangeShipType}>
              <option>Select the ShipType</option>
              {
                shipTypes.map((type, index) => {
                  if (ids[index] > 0 && ids[index+4] > 0 && ids[index+6] > 0 ) {
                    return (
                      <option value={type} key={type}> Ship{index+1} </option>
                    )
                  } else {
                    return index;
                  }
                  
                })
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
      </div>
      
      <Footer />
    </>
  );
};
export default Drop;
