import React from 'react';
import Button from 'src/Components/components/Button';
import styled from 'styled-components';
import moment from 'moment';

import { shortAddress } from 'src/utils';
import config from 'src/Assets/networks/rpc_config.json';
// import MakeOfferDialog from '../MakeOfferDialog';

const knownContracts = config.known_contracts;

const TableRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 26px 0;
  font-size: 14px;

  .table-row-item {
    width: 12%;

    &:first-child {
      display: flex;
      align-items: center;
      width: 13%;
    }
  }

  .nft-title {
    color: ${({ theme }) => theme.colors.textColor4};
    font-weight: bold;
  }

  button {
    font-size: 14px;
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    .table-row-item {
      .collection-name {
        display: none;
      }
      &:first-child {
        width: 10%;
      }
    }
    .nft-title {
      display: none;
    }
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const TableRowContainerMobile = styled.div`
  display: none;
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-radius: 11px;
    border: 1px solid ${({ theme }) => theme.colors.borderColor5};
    margin-top: 10px;
    font-size: 14px;

    .table-row-button {
      width: 40%;
    }

    .collection-logo {
      text-align: center;
    }
  }
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 0;

  .nft-title {
    color: ${({ theme }) => theme.colors.textColor4};
  }
`;

export default function TableRow({ data, type }) {
  const { state, timeCreated, seller, price, nftAddress, nftId } = data;
  // const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const handleUpdateOffer = () => {
    // setOpenMakeOfferDialog(!openMakeOfferDialog);
  };

  const collectionData = knownContracts.find((c) => c.address.toLowerCase() === nftAddress.toLowerCase());
  const getCollectionName = () => {
    const { name } = collectionData;
    return name;
  };

  const getCollectionAvatar = () => {
    const {
      metadata: { avatar },
    } = collectionData;
    return avatar;
  };

  const getState = (offerState) => {
    if (offerState === '0') {
      return 'Active';
    } else if (offerState === '1') {
      return 'Accepted';
    } else if (offerState === '2') {
      return 'Rejected';
    } else if (offerState === '3') {
      return 'Cancelled';
    } else {
      return '';
    }
  };

  const getOfferDate = (timestamp) => {
    const offerDate = moment(new Date(timestamp * 1000)).format('DD/MM/YYYY');
    return offerDate;
  };

  return (
    <>
      <TableRowContainer>
        <div className="table-row-item">
          <a href={`/collection/${collectionData?.slug}`}>
            <img
              className="lazy"
              src={getCollectionAvatar()}
              alt={getCollectionName()}
              width="50"
              height="50"
              style={{ marginRight: '10px' }}
            />
          </a>
          <div className="collection-name">{getCollectionName()}</div>
        </div>
        <div className="table-row-item nft-title">{nftId}</div>
        <div className="table-row-item">{getState(state)}</div>
        <div className="table-row-item">{getOfferDate(timeCreated)}</div>
        <div className="table-row-item">{shortAddress(seller || '')}</div>
        <div className="table-row-item">{price} CRO</div>
        <div className="table-row-item">
          {type === 'Made' && <Button onClick={handleUpdateOffer}>Update</Button>}
          {type === 'Received' && <Button onClick={handleUpdateOffer}>Accept</Button>}
        </div>
        <div className="table-row-item">
          {type === 'Made' && <Button type="outlined">Withdraw</Button>}
          {type === 'Received' && <Button type="outlined">Decline</Button>}
        </div>
        {/* <MakeOfferDialog
        isOpen={openMakeOfferDialog}
        toggle={handleUpdateOffer}
        nftData={listing}
        address={address}
        collectionMetadata={collectionMetadata}
      /> */}
      </TableRowContainer>
      <TableRowContainerMobile>
        <div className="collection-logo">
          <a href={`/collection/${collectionData?.slug}`}>
            <img
              className="lazy"
              src={getCollectionAvatar()}
              alt={getCollectionName()}
              width="50"
              height="50"
              style={{ marginRight: '10px' }}
            />
          </a>
        </div>
        <ItemRow>
          <div>Collection Name</div>
          <div>{getCollectionName()}</div>
        </ItemRow>
        <ItemRow>
          <div>NFT title</div>
          <div className="nft-title">{nftId}</div>
        </ItemRow>
        <ItemRow>
          <div>Status</div>
          <div>{getState(state)}</div>
        </ItemRow>
        <ItemRow>
          <div>Date</div>
          <div>{getOfferDate(timeCreated)}</div>
        </ItemRow>
        <ItemRow>
          <div>Owner</div>
          <div>{shortAddress(seller || '')}</div>
        </ItemRow>
        <ItemRow>
          <div>Offer Price</div>
          <div>{price} CRO</div>
        </ItemRow>
        <ItemRow>
          <div className="table-row-button">
            {type === 'Made' && <Button onClick={handleUpdateOffer}>Update</Button>}
            {type === 'Received' && <Button onClick={handleUpdateOffer}>Accept</Button>}
          </div>
          <div className="table-row-button">
            {type === 'Made' && <Button type="outlined">Withdraw</Button>}
            {type === 'Received' && <Button type="outlined">Decline</Button>}
          </div>
        </ItemRow>
      </TableRowContainerMobile>
    </>
  );
}
