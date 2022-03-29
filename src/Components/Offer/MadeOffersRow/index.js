import React from 'react';
import Button from 'src/Components/components/Button';
import styled from 'styled-components';

// import MakeOfferDialog from '../MakeOfferDialog';

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
  // const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const handleUpdateOffer = () => {
    // setOpenMakeOfferDialog(!openMakeOfferDialog);
  };

  return (
    <>
      <TableRowContainer>
        <div className="table-row-item">
          <a href="/collection/mad-meerkat">
            <img
              className="lazy"
              src="/img/collections/meerkats/avatar.png"
              alt="Mad Meerkat"
              width="50"
              height="50"
              style={{ marginRight: '10px' }}
            />
          </a>
          <div className="collection-name">{data.name}</div>
        </div>
        <div className="table-row-item nft-title">{data.title}</div>
        <div className="table-row-item">{data.status}</div>
        <div className="table-row-item">{data.offerDate}</div>
        <div className="table-row-item">{data.owner}</div>
        <div className="table-row-item">{data.offerPrice}</div>
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
          <a href="/collection/mad-meerkat">
            <img
              className="lazy"
              src="/img/collections/meerkats/avatar.png"
              alt="Mad Meerkat"
              width="50"
              height="50"
              style={{ marginRight: '10px' }}
            />
          </a>
        </div>
        <ItemRow>
          <div>Collection Name</div>
          <div>{data.name}</div>
        </ItemRow>
        <ItemRow>
          <div>NFT title</div>
          <div className="nft-title">{data.title}</div>
        </ItemRow>
        <ItemRow>
          <div>Status</div>
          <div>{data.status}</div>
        </ItemRow>
        <ItemRow>
          <div>Date</div>
          <div>{data.offerDate}</div>
        </ItemRow>
        <ItemRow>
          <div>Owner</div>
          <div>{data.owner}</div>
        </ItemRow>
        <ItemRow>
          <div>Offer Price</div>
          <div>{data.offerPrice}</div>
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
