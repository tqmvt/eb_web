import React from 'react';
import styled from 'styled-components';
import Blockies from 'react-blockies';
import { Dropdown } from 'react-bootstrap';
import moment from 'moment';

import Button from 'src/Components/components/Button';
import { shortAddress } from 'src/utils';
import { commify } from 'ethers/lib.esm/utils';
import { Link } from 'react-router-dom';
import { offerState } from '../../../../core/api/enums';

const TableRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 26px 0;

  .actions-dropdown {
    &-toggle {
      padding: 5px;
      border: 0.25px solid #707070;
      border-radius: 8px;
      background-color: transparent !important;

      &:hover,
      &:focus,
      &:active,
      &:visited {
        background-color: transparent !important;
        box-shadow: none !important;
      }
      &:before,
      &:after {
        display: none;
      }

      .dot-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 2px;

        span {
          width: 8px;
          height: 8px;
          background: transparent linear-gradient(180deg, #ff9420 0%, #e57700 100%) 0% 0% no-repeat padding-box;
          border-radius: 4px;

          margin-right: 4px;

          &:last-child {
            margin-right: 0px;
          }
        }
      }
    }

    &-item-text {
      font-size: 12px;
      letter-spacing: 0px;
      color: #707070;
    }
  }

  .table-row-item {
    width: 20%;
  }

  .address {
    display: flex;
    align-items: center;
    width: 30%;

    .blockies {
      border-radius: 50px;
      margin-right: 5px;
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

export default function OffersRow({ data, type }) {
  const getOfferDate = (timestamp) => {
    const offerDate = moment(new Date(timestamp * 1000)).format('DD/MM/YYYY');
    return offerDate;
  };

  return (
    <>
      <TableRowContainer>
        <div className="table-row-item address">
          <Link to={`/seller/${data.buyer}`}>
            <Blockies seed={data.buyer} size={6} scale={5} className="blockies" />
            <span className="my-auto">{shortAddress(data.buyer)}</span>
          </Link>
        </div>
        <div className="table-row-item">{getOfferDate(data.timeCreated)}</div>
        {type === 'Observer' && (
          <div className="table-row-item">
            {data.state === offerState.ACTIVE.toString() && <>Offered</>}
            {data.state === offerState.CANCELLED.toString() && <>Cancelled</>}
            {data.state === offerState.REJECTED.toString() && <>Rejected</>}
            {data.state === offerState.ACCEPTED.toString() && <>Accepted</>}
          </div>
        )}
        <div className="table-row-item">{commify(data.price)} CRO</div>
        {type === 'Received' && (
          <div className="table-row-item">
            <Button>Accept</Button>
          </div>
        )}
        {type === 'Made' && (
          <>
            <Dropdown className="actions-dropdown">
              <Dropdown.Toggle className="actions-dropdown-toggle">
                <div className="dot-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.ItemText className="actions-dropdown-item-text">Action</Dropdown.ItemText>
                <Dropdown.Item>Update offer</Dropdown.Item>
                <Dropdown.Item>Cancel offer</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        )}
      </TableRowContainer>
      <TableRowContainerMobile>
        <ItemRow>
          <div>Address</div>
          <div>{data.buyer ? shortAddress(data.buyer) : '-'}</div>
        </ItemRow>
        <ItemRow>
          <div>Offer Date</div>
          <div>{getOfferDate(data.timeCreated)}</div>
        </ItemRow>
        <ItemRow>
          <div>Offer Price</div>
          <div>{commify(data.price)} CRO</div>
        </ItemRow>
        {type === 'Received' && (
          <ItemRow>
            <div className="table-row-button">
              <Button>Accept</Button>
            </div>
            <div className="table-row-button">
              <Button type="outlined">Decline</Button>
            </div>
          </ItemRow>
        )}
        {type === 'Made' && (
          <ItemRow>
            <div className="table-row-button">
              <Button>Update</Button>
            </div>
            <div className="table-row-button">
              <Button type="outlined">Cancel</Button>
            </div>
          </ItemRow>
        )}
      </TableRowContainerMobile>
    </>
  );
}
