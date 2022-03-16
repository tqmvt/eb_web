import React from 'react';
import styled from 'styled-components';

const TableHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor2};
  margin: 8px 0px;
  padding: 8px 0px;

  div {
    width: 9%;

    &:first-child {
      width: 12%;
    }
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;
export default function TableHeader() {
  return (
    <TableHeaderContainer>
      <div>Collection name</div>
      <div>NFT title</div>
      <div>Status</div>
      <div>Date</div>
      <div>Owner</div>
      <div>Last price</div>
      <div>Floor price</div>
      <div>Offer price</div>
      <div></div>
      <div></div>
    </TableHeaderContainer>
  );
}
