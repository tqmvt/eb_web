import { useEffect, useRef, useState } from 'react';

export const useOutSide = (initialValue) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(initialValue);

  const handleClickOutSide = (e) => {
    if (ref.current && !ref.current.contains(e.target)) setVisible(false)
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutSide, true);

    return () => {
      document.removeEventListener('click', handleClickOutSide, true)
    };
  }, [ref]);

  return { visible, setVisible, ref };
};

export default useOutSide;