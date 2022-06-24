import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

const DialogAlert = ({ ref, title, firstButtonText, secondButtonText, onClickFirstButton, onClickSecondButton, closePopup = null, isWaiting = false, isWarningMessage = false, children }) => {
  
  return (
    <div className='dialogAlertContainer'>
      <div className='dialogAlert' ref={ref}>
        <div className='container'>
          {closePopup && <div className='popup-icon' onClick={closePopup}>
            <FontAwesomeIcon icon={faTimes} className='icon-close' />
          </div>}

          <h2 className={isWarningMessage ? 'warningMessage' : ''} >{title}</h2>

          <div className='content'>
            {children}
          </div>

          {!secondButtonText ? <button className='btn-popup' onClick={!isWaiting ? onClickFirstButton : undefined} disabled={isWaiting}>
            {isWaiting ? <span className="d-flex align-items-center">
              <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
              <span className="ps-2">Working...</span>
            </span> :
              firstButtonText}
          </button>
            :
            <div className= 'button-container'>
              <button className='btn-popup first-button' onClick={!isWaiting ? onClickFirstButton : undefined} disabled={isWaiting}>
                {isWaiting ? <span className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                  <span className="ps-2">Working...</span>
                </span> :
                  firstButtonText}
              </button>

              <button className='btn-popup' onClick={!isWaiting ? onClickSecondButton : undefined} disabled={isWaiting}>
                {isWaiting ? <span className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                  <span className="ps-2">Working...</span>
                </span> :
                  secondButtonText}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default DialogAlert;