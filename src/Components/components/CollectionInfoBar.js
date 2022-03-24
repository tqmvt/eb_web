import React from 'react';
import { siPrefixedNumber } from '../../utils';
import styled from 'styled-components';

const CollectionInfoBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background: transparent linear-gradient(180deg, #ff9420 0%, #e57700 100%) 0% 0% no-repeat padding-box;
  box-shadow: 0px 3px 6px #00000029;
  border-radius: 8px;
  padding: 22px 46px;

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    padding: 22px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  border-right: solid 4px #ffffff;

  &:last-child {
    border-right: 0px;
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.xl}) {
    border-right: solid 2px #ffffff;
  }
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    border: none;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const ItemTitle = styled.div`
  color: #ffffff;
  font-weight: normal;
  font-size: 18px;
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.xxl}) {
    font-size: 16px;
  }
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.xxl}) {
    font-size: 14px;
  }
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    order: 1;
  }
`;

const ItemValue = styled.div`
  color: #ffffff;
  font-weight: 800;
  font-size: 32px;
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.xxl}) {
    font-size: 24px;
  }
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.xl}) {
    font-size: 18px;
  }
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    order: 2;
  }
`;

export default function CollectionInfoBar({ collectionStats, royalty }) {
  const { active, avg_sale_price, complete, floor_price, volume } = collectionStats;
  return (
    <div>
      <CollectionInfoBarContainer>
        <InfoItem>
          <ItemValue>{floor_price ? <>{siPrefixedNumber(Number(floor_price).toFixed(0))} CRO</> : <>-</>}</ItemValue>
          <ItemTitle>Floor</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{volume ? <>{siPrefixedNumber(Number(volume).toFixed(0))} CRO</> : <>-</>}</ItemValue>
          <ItemTitle>Volume</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{complete ? <>{siPrefixedNumber(complete)}</> : <>-</>}</ItemValue>
          <ItemTitle>Sales</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>
            {avg_sale_price ? <>{siPrefixedNumber(Number(avg_sale_price).toFixed(0))} CRO</> : <>-</>}
          </ItemValue>
          <ItemTitle>Avg. Sale</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{royalty ? <>{royalty}%</> : <>-</>}</ItemValue>
          <ItemTitle>Royalty</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{active ? <>{siPrefixedNumber(active)}</> : <>-</>}</ItemValue>
          <ItemTitle>Active Listings</ItemTitle>
        </InfoItem>
      </CollectionInfoBarContainer>
    </div>
  );
}
