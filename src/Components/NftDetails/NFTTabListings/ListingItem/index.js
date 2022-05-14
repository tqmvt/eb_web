import React from 'react';

import { Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

import Blockies from 'react-blockies';

const ListingItem = ({ user, route, time, price, primaryTitle, primaryText, buttonText, onClick, isProcessing = false }) => {
  const link =  `${route}/${user}`;

  return (
    <div className='listing-row'>
      <div className='listing-container'>
        <Link className='avatar' to={link}>
          <div>
            <span>
              <Link to={link}>
                <Blockies seed={user} size={10} scale={5} />
              </Link>
            </span>
          </div>
        </Link>
        <div className="p_list_info">
          <span>{time} ago</span>
          {`${primaryTitle} `}
          <b>
            <Link to={link}>{primaryText}</Link>
          </b>{' '}
          for <b>{price} CRO</b>
        </div>
      </div>
      {buttonText && <button className="btn-main me-2" onClick={onClick} disabled={isProcessing}>
        {isProcessing ? (
          <>
            {`${buttonText}...`}
            <Spinner animation="border" role="status" size="sm" className="ms-1">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </>
        ) : (
          <>{buttonText}</>
        )}
      </button>}
    </div>
  )
}

export default ListingItem