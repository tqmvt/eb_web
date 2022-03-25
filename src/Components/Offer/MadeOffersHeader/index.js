import React from 'react';
import styled from 'styled-components';

const TableHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor2};
  margin: 8px 0px;
  padding: 8px 0px;
  font-size: 14px;

  .table-row-item {
    width: 12%;

    &:first-child {
      display: flex;
      align-items: center;
      width: 13%;
    }
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    .table-row-item {
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
export default function TableHeader() {
  return (
    <TableHeaderContainer>
      <div className="table-row-item">Collection name</div>
      <div className="table-row-item nft-title">NFT title</div>
      <div className="table-row-item">Status</div>
      <div className="table-row-item">Offer Date</div>
      <div className="table-row-item">Owner</div>
      <div className="table-row-item">Offer price</div>
      <div className="table-row-item"></div>
      <div className="table-row-item"></div>
    </TableHeaderContainer>
  );
}
