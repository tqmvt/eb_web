import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DotIcon = ({ icon }) => {

  return (
    <div className='dot_icon'>
      <FontAwesomeIcon icon={ icon } className='d_icon' />
    </div>
  )
};

export default DotIcon;