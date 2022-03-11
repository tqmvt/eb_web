import React from 'react';
import Button from 'src/Components/components/Button';
import styled from 'styled-components';

const TableRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;

  .table-row-item {
    width: 9%;

    &:first-child {
      width: 12%;
    }
  }

  .nft-title {
    color: ${({ theme }) => theme.colors.textColor4};
  }
`;
export default function TableRow() {
  return (
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
        <Button>Update</Button>
      </div>
      <div className="table-row-item">
        <Button type="outlined">Cancel</Button>
      </div>
    </TableRowContainer>
  );
}
