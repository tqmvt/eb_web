import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { createGlobalStyle } from 'styled-components';
import useBreakpoint from 'use-breakpoint';
import AccountMenu from '../components/AccountMenu';
import InvalidListingWarning from '../components/InvalidListingWarning';
// import { setTheme } from '../../GlobalState/User';

const BREAKPOINTS = { xs: 0, m: 768, l: 1199, xl: 1200 };

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: ${({ theme }) => theme.colors.bgColor4};
    border-bottom: 0;
    box-shadow: 0 4px 20px 0 rgba(10,10,10, .8);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
    background: #fff;
  }
  @media only screen and (max-width: 1199px) { 
    .navbar{
      background: #0078cb;
      border-bottom: 0;
      box-shadow: 0 4px 20px 0 rgba(10,10,10, .8);
    }
  }
`;

const Header = function () {
  const [showMenu, setShowMenu] = useState(false);
  const theme = useSelector((state) => {
    return state.user.theme;
  });
  const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS);
  const [useMobileMenu, setUseMobileMenu] = useState(false);

  // const dispatch = useDispatch();
  // const toggleTheme = () => {
  //   const newTheme = theme === 'light' ? 'dark' : 'light';
  //   dispatch(setTheme(newTheme));
  // };

  useEffect(() => {
    setUseMobileMenu(minWidth < BREAKPOINTS.l);
  }, [breakpoint]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const header = document.getElementById('myHeader');
      const totop = document.getElementById('eb-scroll-to-top');
      const sticky = header.offsetTop;
      const scrollCallBack = window.addEventListener('scroll', () => {
        setShowMenu(false);
        if (window.pageYOffset > sticky) {
          totop.classList.add('show');
        } else {
          header.classList.remove('sticky');
          totop.classList.remove('show');
        }
      });
      return () => {
        window.removeEventListener('scroll', scrollCallBack);
      };
    }
  }, []);

  return (
    <header id="myHeader" className="navbar white">
      <GlobalStyles />
      <div className="container">
        <div className="row w-100-nav">
          <div className="logo px-0">
            <div className="navbar-title navbar-item">
              <Link href="/">
                <a>
                  <img
                    src={theme === 'light' ? '/img/logo-light.svg' : '/img/logo-dark-prod.svg'}
                    alt="ebisus bay logo"
                    style={{ width: '44px', height: '40px' }}
                  />
                </a>
              </Link>
            </div>
          </div>

          {useMobileMenu ? (
            <div className="breakpoint__l-down">
              {showMenu && (
                <div className="menu">
                  <div className="menu">
                    <div className="navbar-item">
                      <Link href="/">
                        <a>
                          Home
                          <span className="lines"></span>
                        </a>
                      </Link>
                    </div>
                    <div className="navbar-item">
                      <Link href="/marketplace">
                        <a>
                          Marketplace
                          <span className="lines"></span>
                        </a>
                      </Link>
                    </div>
                    <div className="navbar-item">
                      <Link href="/collections">
                        <a>
                          Collections
                          <span className="lines"></span>
                        </a>
                      </Link>
                    </div>
                    <div className="navbar-item">
                      <Link href="/drops">
                        <a>
                          Drops
                          <span className="lines"></span>
                        </a>
                      </Link>
                    </div>
                    <div className="navbar-item">
                      <Link href="/stats">
                        <a>
                          Stats
                          <span className="lines"></span>
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="breakpoint__xl-only ">
              <div className="menu">
                <div className="navbar-item">
                  <Link href="/">
                    <a>
                      Home
                      <span className="lines"></span>
                    </a>
                  </Link>
                </div>
                <div className="navbar-item">
                  <Link href="/marketplace">
                    <a>
                      Marketplace
                      <span className="lines"></span>
                    </a>
                  </Link>
                </div>
                <div className="navbar-item">
                  <Link href="/collections">
                    <a>
                      Collections
                      <span className="lines"></span>
                    </a>
                  </Link>
                </div>
                <div className="navbar-item">
                  <Link href="/drops">
                    <a>
                      Drops
                      <span className="lines"></span>
                    </a>
                  </Link>
                </div>
                <div className="navbar-item">
                  <Link href="/stats">
                    <a>
                      Stats
                      <span className="lines"></span>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <AccountMenu />
          <InvalidListingWarning size={'2x'} />
        </div>

        <button className="nav-icon" onClick={() => setShowMenu(!showMenu)}>
          <div className="menu-line white"></div>
          <div className="menu-line1 white"></div>
          <div className="menu-line2 white"></div>
        </button>
      </div>
    </header>
  );
};
export default Header;
