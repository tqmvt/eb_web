import React, { memo, useEffect, useState } from 'react';
import Blockies from 'react-blockies';
import { useDispatch, useSelector } from 'react-redux';
import useOnclickOutside from 'react-cool-onclickoutside';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faImage, faSignOutAlt, faShoppingBag, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Modal, NavLink, Spinner, ModalTitle } from 'react-bootstrap';
import styled from 'styled-components';

import {
  connectAccount,
  onLogout,
  setTheme,
  setShowWrongChainModal,
  chainConnect,
  AccountMenuActions,
  checkForOutstandingOffers,
} from '../../GlobalState/User';
import rpcConfig from '../../Assets/networks/rpc_config.json';

import { getThemeInStorage, setThemeInStorage } from 'src/helpers/storage';
import { getAllCollections } from '../../GlobalState/collectionsSlice';
import { fetchMyNFTs } from '../../GlobalState/offerSlice';
import { isUserBlacklisted, shortAddress } from '../../utils';

const BlockiesBadge = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background-color: #bd2727;
`;

const StyledModal = styled(Modal)`
  .modal-content {
    background: ${({ theme }) => theme.colors.bgColor1};
  }
`;

const StyledModalTitle = styled(ModalTitle)`
  color: ${({ theme }) => theme.colors.textColor3};
`;

const AccountMenu = function () {
  const dispatch = useDispatch();
  const history = useRouter();

  const [showpop, btn_icon_pop] = useState(false);

  const closePop = () => {
    btn_icon_pop(false);
  };
  const refpop = useOnclickOutside(() => {
    closePop();
  });
  const walletAddress = useSelector((state) => {
    return state.user.address;
  });
  const correctChain = useSelector((state) => {
    return state.user.correctChain;
  });
  const theme = useSelector((state) => {
    return state.user.theme;
  });
  const user = useSelector((state) => {
    return state.user;
  });
  const needsOnboard = useSelector((state) => {
    return state.user.needsOnboard;
  });
  const collectionsStats = useSelector((state) => state.collections.collections);
  const myNFTs = useSelector((state) => state.offer.myNFTs);

  const navigateTo = (link) => {
    closePop();
    history.push(link);
  };

  const logout = async () => {
    dispatch(onLogout());
  };
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };
  useEffect(() => {
    if (walletAddress) {
      dispatch(getAllCollections());
      dispatch(fetchMyNFTs(walletAddress));
    }
    // eslint-disable-next-line
  }, [walletAddress]);

  useEffect(() => {
    if (collectionsStats && collectionsStats.length > 0 && myNFTs && myNFTs.length > 0) {
      dispatch(checkForOutstandingOffers());
    }
    // eslint-disable-next-line
  }, [collectionsStats, myNFTs]);

  const connectWalletPressed = async () => {
    if (needsOnboard) {
      const onboarding = new MetaMaskOnboarding();
      onboarding.startOnboarding();
    } else {
      dispatch(connectAccount());
    }
  };

  // const toggleTheme = () => {
  //   const newTheme = theme === 'light' ? 'dark' : 'light';
  //   dispatch(setTheme(newTheme));
  // };

  const handleCopy = (code) => () => {
    navigator.clipboard.writeText(code);
    toast.success('Copied!');
  };

  const withdrawRewards = async () => {
    dispatch(AccountMenuActions.withdrawRewards());
  };

  const withdrawBalance = async () => {
    dispatch(AccountMenuActions.withdrawMarketBalance());
  };

  const harvestStakingRewards = async () => {
    dispatch(AccountMenuActions.harvestStakingRewards());
  };

  // const registerCode = async () => {
  //   dispatch(AccountMenuActions.registerCode());
  // };

  const clearCookies = async () => {
    dispatch(onLogout());
    toast.success(`Cookies cleared!`);
  };

  useEffect(() => {
    const themeInStorage = getThemeInStorage();

    if (themeInStorage) {
      dispatch(setTheme(themeInStorage));
    } else {
      setThemeInStorage('dark');
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let defiLink = localStorage.getItem('DeFiLink_session_storage_extension');
    if (defiLink) {
      try {
        const json = JSON.parse(defiLink);
        if (!json.connected) {
          dispatch(onLogout());
        }
      } catch (error) {
        dispatch(onLogout());
      }
    }
    if (
      localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER') ||
      window.ethereum ||
      localStorage.getItem('DeFiLink_session_storage_extension')
    ) {
      if (!user.provider) {
        if (window.navigator.userAgent.includes('Crypto.com DeFiWallet')) {
          dispatch(connectAccount(false, 'defi'));
        } else {
          dispatch(connectAccount());
        }
      }
    }
    if (!user.provider) {
      if (window.navigator.userAgent.includes('Crypto.com DeFiWallet')) {
        dispatch(connectAccount(false, 'defi'));
      }
    }
    // eslint-disable-next-line
  }, []);

  const onWrongChainModalClose = () => {
    dispatch(setShowWrongChainModal(false));
  };

  const onWrongChainModalChangeChain = () => {
    dispatch(setShowWrongChainModal(false));
    dispatch(chainConnect());
  };

  // const myUnfilteredListings = useSelector((state) => {
  //   return state.user.myUnfilteredListings;
  // });

  return (
    <div className="mainside d-flex">
      <span onClick={toggleTheme} className="cursor-pointer me-3 my-auto">
        <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} color="#fff" />
      </span>
      {!walletAddress && (
        <div className="connect-wal">
          <NavLink onClick={connectWalletPressed}>Connect Wallet</NavLink>
        </div>
      )}
      {walletAddress && !correctChain && !user.showWrongChainModal && (
        <div className="connect-wal">
          <NavLink onClick={onWrongChainModalChangeChain}>Switch network</NavLink>
        </div>
      )}
      {walletAddress && correctChain && (
        <div id="de-click-menu-profile" className="de-menu-profile">
          <span onClick={() => btn_icon_pop(!showpop)}>
            <Blockies seed={user.address} size={8} scale={4} />
            {user.hasOutstandingOffers && <BlockiesBadge className="notification-badge"></BlockiesBadge>}
          </span>
          {showpop && (
            <div className="popshow" ref={refpop}>
              <div className="d-wallet">
                <h4>My Wallet</h4>
                <div className="d-flex justify-content-between">
                  <span id="wallet" className="d-wallet-address">
                    {user.cnsProfile?.name ?? shortAddress(walletAddress)}
                  </span>
                  <button className="btn_menu" title="Copy Address" onClick={handleCopy(walletAddress)}>
                    Copy
                  </button>
                </div>
              </div>
              <div className="d-wallet">
                <h4>Wallet Balance</h4>
                <div className="d-flex justify-content-between">
                  {!user.connectingWallet ? (
                    <span className="d-wallet-value">
                      {user.balance ? <>{Math.round(user.balance * 100) / 100} CRO</> : <>N/A</>}
                    </span>
                  ) : (
                    <span>
                      <Spinner animation="border" role="status" size={'sm'}>
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </span>
                  )}
                </div>
              </div>
              <div className="d-wallet">
                <h4>Market Escrow</h4>
                <div className="d-flex justify-content-between">
                  {!user.connectingWallet ? (
                    <>
                      {user.marketBalance ? (
                        <>
                          <span className="d-wallet-value">{Math.round(user.marketBalance * 100) / 100} CRO</span>
                          {user.marketBalance !== '0.0' && (
                            <button className="btn_menu" title="Withdraw Balance" onClick={withdrawBalance}>
                              {user.withdrawingMarketBalance ? (
                                <>
                                  <Spinner animation="border" role="status" size="sm">
                                    <span className="visually-hidden">Loading...</span>
                                  </Spinner>
                                </>
                              ) : (
                                <>Withdraw</>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="d-wallet-value">0.0 CRO</span>
                      )}
                    </>
                  ) : (
                    <span>
                      <Spinner animation="border" role="status" size={'sm'}>
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </span>
                  )}
                </div>
              </div>
              {(user.vipCount > 0 || user.stakeCount > 0) && (
                <div className="d-wallet">
                  <h4>Staking Rewards</h4>
                  <div className="d-flex justify-content-between">
                    {!user.connectingWallet ? (
                      <>
                        {user.stakingRewards ? (
                          <>
                            <span className="d-wallet-value">{Math.round(user.stakingRewards * 100) / 100} CRO</span>

                            {user.stakingRewards > 0 && (
                              <button
                                className="btn_menu"
                                title="Harvest Staking Rewards"
                                onClick={harvestStakingRewards}
                              >
                                {user.harvestingStakingRewards ? (
                                  <>
                                    <Spinner animation="border" role="status" size="sm">
                                      <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                  </>
                                ) : (
                                  <>Harvest</>
                                )}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="d-wallet-value">0.0 CRO</span>
                        )}
                      </>
                    ) : (
                      <span>
                        <Spinner animation="border" role="status" size={'sm'}>
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </span>
                    )}
                  </div>
                </div>
              )}
              {user.isMember && user.rewards !== '0.0' && (
                <>
                  <div className="d-wallet">
                    <h4>Referral Balance</h4>
                    <div className="d-flex justify-content-between">
                      {!user.connectingWallet ? (
                        <>
                          {user.rewards ? (
                            <>
                              <span>{Math.round(user.rewards * 100) / 100} CRO</span>
                              {user.rewards !== '0.0' && !isUserBlacklisted(user.address) && (
                                <button
                                  className="btn_menu"
                                  title="Withdraw Referral Rewards"
                                  onClick={withdrawRewards}
                                >
                                  Withdraw
                                </button>
                              )}
                            </>
                          ) : (
                            <>N/A</>
                          )}
                        </>
                      ) : (
                        <span>
                          <Spinner animation="border" role="status" size={'sm'}>
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
              <div className="d-line"></div>
              <ul className="de-submenu-profile">
                <li>
                  <span onClick={() => navigateTo(`/nfts`)}>
                    <span>
                      <FontAwesomeIcon icon={faImage} />
                    </span>
                    <span>My NFTs</span>
                  </span>
                </li>
                <li className="my-offers-menu-item">
                  <span onClick={() => navigateTo(`/offers`)}>
                    <span>
                      <img src={'/img/icons/hand-holding-cro.svg'} alt="handholding-cro" width="14" height="14" />
                    </span>
                    <span>My Offers</span>
                  </span>
                  {user.hasOutstandingOffers && <div className="notification-badge"></div>}
                </li>
                {(user.vipCount > 0 || user.stakeCount > 0) && (
                  <li>
                    <span onClick={() => navigateTo(`/staking`)}>
                      <span>
                        <FontAwesomeIcon icon={faShoppingBag} />
                      </span>
                      <span>My Staking</span>
                    </span>
                  </li>
                )}
                <li>
                  <span onClick={clearCookies}>
                    <span>
                      <FontAwesomeIcon icon={faBolt} />
                    </span>
                    <span>Clear Cookies</span>
                  </span>
                </li>
              </ul>
              <div className="d-line"></div>
              <ul className="de-submenu-profile">
                <li>
                  <span onClick={logout}>
                    <span>
                      <FontAwesomeIcon icon={faSignOutAlt} />
                    </span>
                    <span>Disconnect Wallet</span>
                  </span>
                </li>
                {/* <li>
                  <span>
                    <span>
                      <FontAwesomeIcon icon={faMoon} />
                    </span>
                    <span className="d-flex">
                      <label htmlFor="dark-mode-switch" className="cursor-pointer">
                        Dark Mode
                      </label>
                      <FormCheck
                        type="switch"
                        id="dark-mode-switch"
                        className="ms-2 cursor-pointer"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                      />
                    </span>
                  </span>
                </li> */}
              </ul>
            </div>
          )}
        </div>
      )}

      <StyledModal show={user.showWrongChainModal} onHide={onWrongChainModalClose}>
        <Modal.Header closeButton>
          <StyledModalTitle>Wrong network!</StyledModalTitle>
        </Modal.Header>
        <Modal.Body>
          To continue, you need to switch the network to <span style={{ fontWeight: 'bold' }}>{rpcConfig.name}</span>.{' '}
        </Modal.Body>
        <Modal.Footer>
          <button className="p-4 pt-2 pb-2 btn_menu inline white lead" onClick={onWrongChainModalClose}>
            Close
          </button>
          <button
            className="p-4 pt-2 pb-2 btn_menu inline white lead btn-outline"
            onClick={onWrongChainModalChangeChain}
          >
            Switch
          </button>
        </Modal.Footer>
      </StyledModal>
    </div>
  );
};

export default memo(AccountMenu);
