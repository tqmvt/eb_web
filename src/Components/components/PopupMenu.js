import React,{ useCallback} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import  useOutSide  from '../../hooks/useOutSide';

const FIELD_HEIGHT = 55;
const DEFAULT_MENU_SPACING = 30;

const PopupMenu = ({ options, children}) => {

  const {visible, setVisible, ref} = useOutSide(false);
  
  const pxInset = (DEFAULT_MENU_SPACING + FIELD_HEIGHT * (
    options.length )
  );

  const onClick = useCallback(()=>{
    setVisible((prevSate)=>
    !prevSate
    )
  },[setVisible]);

  const selectOption = useCallback(event =>{
    setVisible(false);
    event();
  }, [setVisible]);

  return (
    <div>
      {React.cloneElement(children, { onClick})}
      {visible && <div className='popupMenu' style={{ inset: `-${pxInset}px auto auto -200px`}} ref={ref}>
        <ul>
          {options.map(option => <li 
            key={option.label}
            onClick={() => selectOption(option.handleClick)}>
            <FontAwesomeIcon icon={option.icon} style={{ marginRight: 16 }} />
            <span>{option.label}</span>
          </li>)}
        </ul>
      </div>}
    </div>
  )
};

export default PopupMenu;