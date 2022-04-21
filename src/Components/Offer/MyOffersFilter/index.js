import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-top: 16px;
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-top: 16px;
    flex-wrap: wrap;
  }
`;

export default function MyOffersFilter({ checked, onFilter }) {
  return (
    <FilterContainer className="d-flex mb-3">
      <div className="d-flex align-items-center">
        <input
          type="radio"
          id="offerStatus"
          name="offer"
          checked={checked === '0'}
          onChange={() => onFilter('0')}
          role="button"
        />
        <label className="ms-1 me-3" htmlFor="offerStatus" role="button">
          Active
        </label>
      </div>
      <div className="d-flex align-items-center">
        <input
          type="radio"
          id="offerStatus1"
          name="offer"
          checked={checked === '1'}
          onChange={() => onFilter('1')}
          role="button"
        />
        <label className="ms-1 me-3" htmlFor="offerStatus1" role="button">
          Accepted
        </label>
      </div>
      <div className="d-flex align-items-center">
        <input
          type="radio"
          id="offerStatus2"
          name="offer"
          checked={checked === '2'}
          onChange={() => onFilter('2')}
          role="button"
        />
        <label className="ms-1 me-3" htmlFor="offerStatus2" role="button">
          Rejected
        </label>
      </div>
      <div className="d-flex align-items-center">
        <input
          type="radio"
          id="offerStatus3"
          name="offer"
          checked={checked === '3'}
          onChange={() => onFilter('3')}
          role="button"
        />
        <label className="ms-1 me-3" htmlFor="offerStatus3" role="button">
          Cancelled
        </label>
      </div>
    </FilterContainer>
  );
}
