import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

const DialogAlert = ({ ref, title, buttonText, onClick, closePopup = null, isWaiting = false, children }) => {
  return (
    <div className='dialogAlertContainer'>
      <div className='dialogAlert' ref={ref}>
        <div className='container'>
          {closePopup && <div className='popup-icon' onClick={closePopup}>
            <FontAwesomeIcon icon={faTimes} className='icon-close' />
          </div>}

          <h2>{title}</h2>

          <div className='content'>
            {children}
          </div>

          <button className='btn-popup' onClick={!isWaiting ? onClick : undefined} disabled={isWaiting}>
            {isWaiting ? <span className="d-flex align-items-center">
              <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
              <span className="ps-2">Working...</span>
            </span> :
              buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DialogAlert;