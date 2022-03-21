import React from 'react';
import Button from 'src/Components/components/Button';
import styled from 'styled-components';

// import MakeOfferDialog from '../MakeOfferDialog';

const TableRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 26px 0;

  .table-row-item {
    width: 9%;

    &:first-child {
      width: 12%;
    }
  }

  .nft-title {
    color: ${({ theme }) => theme.colors.textColor4};
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

    .table-row-button {
      width: 40%;
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

export default function TableRow() {
  // const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const handleUpdateOffer = () => {
    // setOpenMakeOfferDialog(!openMakeOfferDialog);
  };
  return (
    <>
      <TableRowContainer>
        <div className="table-row-item">Meerkats</div>
        <div className="table-row-item nft-title">#53453</div>
        <div className="table-row-item">Offer made</div>
        <div className="table-row-item">15.11.2022</div>
        <div className="table-row-item">0x84…x987</div>
        <div className="table-row-item">1500 CRO</div>
        <div className="table-row-item">Unknown</div>
        <div className="table-row-item">1550 CRO</div>
        <div className="table-row-item">
          <Button onClick={handleUpdateOffer}>Update</Button>
        </div>
        <div className="table-row-item">
          <Button type="outlined">Cancel</Button>
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
        <ItemRow>
          <div>Collection Name</div>
          <div>Meerkats</div>
        </ItemRow>
        <ItemRow>
          <div>NFT title</div>
          <div className="nft-title">#53453</div>
        </ItemRow>
        <ItemRow>
          <div>Status</div>
          <div>Offer made</div>
        </ItemRow>
        <ItemRow>
          <div>Date</div>
          <div>15.11.2022</div>
        </ItemRow>
        <ItemRow>
          <div>Owner</div>
          <div>0x84…x987</div>
        </ItemRow>
        <ItemRow>
          <div>Offer Price</div>
          <div>1550 CRO</div>
        </ItemRow>
        <ItemRow>
          <div className="table-row-button">
            <Button onClick={handleUpdateOffer}>Update</Button>
          </div>
          <div className="table-row-button">
            <Button type="outlined">Cancel</Button>
          </div>
        </ItemRow>
      </TableRowContainerMobile>
    </>
  );
}
