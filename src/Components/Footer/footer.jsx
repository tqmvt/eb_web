import React from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import TwitterIcon from '@mui/icons-material/Twitter';
// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

import "./footer.css";
const Footer = () => {
  return (
    <div className="footerContainer">
      <div className="footerSec">

        <ul className="socialLinks">
          <li>
            <a href="mailto:admin@ebisusbay.xyz">
              <MailOutlineIcon />
            </a>
            {/* <a href="http://" target="_blank" rel="noopener noreferrer">
            </a> */}
          </li>
          <li>
            <a href="https://twitter.com/EbisusBay" target="_blank" rel="noopener noreferrer">
              <TwitterIcon />
            </a>
          </li>
          <li>
            <a href="https://discord.gg/gf6KzyQG" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faDiscord} />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
