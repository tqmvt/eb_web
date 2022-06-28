import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import {faDiscord, faTwitter, faMedium, faInstagram, faTelegram, faLinkedin} from '@fortawesome/free-brands-svg-icons';
import { faSquare, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import LayeredIcon from './LayeredIcon';
import {hostedImage} from "../../helpers/image";
import Link from "next/link";

const Footer = () => {
  const userTheme = useSelector((state) => {
    return state.user.theme;
  });

  return (
    <footer className="footer-light">
      <div className="container">
        <div className="row">
          <div className="col-md-3 col-sm-6 col-xs-1">
            <div className="widget">
              <img
                height="40px"
                src={hostedImage(userTheme === 'light' ? '/img/logo-light.svg' : '/img/logo-dark-prod.svg')}
                alt="ebisus bay logo"
              />
              <p className="mt-2">Ebisu's Bay is the first and largest NFT marketplace on Cronos. Create, buy, sell, trade and enjoy the #CroFam NFT community.</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 col-xs-1">
            <div className="widget">
              <h5>Marketplace</h5>
              <ul>
                <li><Link href="/marketplace">Explore</Link></li>
                <li><Link href="/collections">Collections</Link></li>
                <li><Link href="/drops">Drops</Link></li>
                <li><Link href="/stats">Stats</Link></li>
                <li><Link href="/apply?type=listing">Listing Application</Link></li>
                <li><Link href="/apply?type=launchpad">Launchpad Application</Link></li>
              </ul>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 col-xs-1">
            <div className="widget">
              <h5>Resources</h5>
              <ul>
                <li><a href="https://status.ebisusbay.com/" target="_blank" rel="noreferrer">Platform Status</a></li>
                <li><a href="https://faq.ebisusbay.com/" target="_blank" rel="noreferrer">FAQ</a></li>
                <li><a href="https://blog.ebisusbay.com/" target="_blank" rel="noreferrer">Blog</a></li>
                <li><a href="https://almurraydesign.com/store.html#!/Ebisus-Bay/c/130146020" target="_blank" rel="noreferrer">Merchandise</a></li>
                <li><a href="/terms-of-service.html" target="_blank" rel="noreferrer">Terms of Service</a></li>
                <li><a href="/privacy-policy.html" target="_blank" rel="noreferrer">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 col-xs-1">
            <div className="widget">
              <h5>Community</h5>
              <ul>
                <li><a href="/collection/founding-member">Become a Founding Member</a></li>
                <li><a href="https://discord.gg/ebisusbay" target="_blank" rel="noreferrer">Discord</a></li>
                <li><a href="https://twitter.com/EbisusBay" target="_blank" rel="noreferrer">Twitter</a></li>
                <li><a href="https://instagram.com/ebisusbayofficial" target="_blank" rel="noreferrer">Instagram</a></li>
                <li><a href="https://t.me/ebisusbay" target="_blank" rel="noreferrer">Telegram</a></li>
                <li><a href="https://linkedin.com/company/ebisusbay" target="_blank" rel="noreferrer">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="subfooter">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="de-flex">
                <div className="de-flex-col">
                  <span className="copy">&copy; 2021 - {new Date().getFullYear()} Ebisu's Bay Marketplace</span>
                </div>
                <div className="de-flex-col">
                  <div className="social-icons">
                    <a href="https://discord.gg/ebisusbay" target="_blank" rel="noreferrer">
                      <LayeredIcon icon={faDiscord} bgIcon={faSquare} shrink={8} />
                    </a>
                    <a href="https://twitter.com/EbisusBay" target="_blank" rel="noreferrer">
                      <LayeredIcon icon={faTwitter} bgIcon={faSquare} shrink={7} />
                    </a>
                    <a href="https://www.instagram.com/ebisusbayofficial" target="_blank" rel="noreferrer">
                      <LayeredIcon icon={faInstagram} bgIcon={faSquare} shrink={7} />
                    </a>
                    <a href="https://t.me/ebisusbay" target="_blank" rel="noreferrer">
                      <LayeredIcon icon={faTelegram} bgIcon={faSquare} shrink={7} />
                    </a>
                    <a href="https://blog.ebisusbay.com" target="_blank" rel="noreferrer">
                      <LayeredIcon icon={faMedium} bgIcon={faSquare} shrink={7} />
                    </a>
                    <a href="https://linkedin.com/company/ebisusbay" target="_blank" rel="noreferrer">
                      <LayeredIcon icon={faLinkedin} bgIcon={faSquare} shrink={7} />
                    </a>
                    <a href="mailto:support@ebisusbay.com">
                      <LayeredIcon icon={faEnvelope} bgIcon={faSquare} shrink={7} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
