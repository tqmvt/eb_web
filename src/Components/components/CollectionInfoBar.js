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

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 22px;
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    padding: 22px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    font-size: 16px;
  }
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    order: 2;
  }
`;

export default function CollectionInfoBar({ collectionStats, royalty, type = 'legacy' }) {
  const { numberActive, averageSalePrice, numberOfSales, floorPrice, totalVolume } = collectionStats;

  if (type === 'legacy') {
    return (
      <div className="d-item col-lg-8 col-sm-10 mb-4 mx-auto">
        <div className="nft_attr">
          <div className="row">
            <div className="col-md-2 col-xs-4">
              <h5>Floor</h5>
              <h4>{floorPrice ? <>{siPrefixedNumber(Number(floorPrice).toFixed(0))} CRO</> : <>-</>}</h4>
            </div>
            <div className="col-md-2 col-xs-4">
              <h5>Volume</h5>
              <h4>{totalVolume ? <>{siPrefixedNumber(Number(totalVolume).toFixed(0))} CRO</> : <>-</>}</h4>
            </div>
            <div className="col-md-2 col-xs-4">
              <h5>Sales</h5>
              <h4>{numberOfSales ? <>{siPrefixedNumber(numberOfSales)}</> : <>-</>}</h4>
            </div>
            <div className="col-md-2 col-xs-4">
              <h5>Avg. Sale</h5>
              <h4>{averageSalePrice ? <>{siPrefixedNumber(Number(averageSalePrice).toFixed(0))} CRO</> : <>-</>}</h4>
            </div>
            <div className="col-md-2 col-xs-4">
              <h5>Royalty</h5>
              <h4>{royalty ? <>{royalty}%</> : <>-</>}</h4>
            </div>
            <div className="col-md-2 col-xs-4">
              <h5>Active Listings</h5>
              <h4>{numberActive ? <>{siPrefixedNumber(numberActive)}</> : <>-</>}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CollectionInfoBarContainer>
        <InfoItem>
          <ItemValue>{floorPrice ? <>{siPrefixedNumber(Number(floorPrice).toFixed(0))} CRO</> : <>-</>}</ItemValue>
          <ItemTitle>Floor</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{totalVolume ? <>{siPrefixedNumber(Number(totalVolume).toFixed(0))} CRO</> : <>-</>}</ItemValue>
          <ItemTitle>Volume</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{numberOfSales ? <>{siPrefixedNumber(numberOfSales)}</> : <>-</>}</ItemValue>
          <ItemTitle>Sales</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>
            {averageSalePrice ? <>{siPrefixedNumber(Number(averageSalePrice).toFixed(0))} CRO</> : <>-</>}
          </ItemValue>
          <ItemTitle>Avg. Sale</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{royalty ? <>{royalty}%</> : <>-</>}</ItemValue>
          <ItemTitle>Royalty</ItemTitle>
        </InfoItem>
        <InfoItem>
          <ItemValue>{numberActive ? <>{siPrefixedNumber(numberActive)}</> : <>-</>}</ItemValue>
          <ItemTitle>Active Listings</ItemTitle>
        </InfoItem>
      </CollectionInfoBarContainer>
    </div>
  );
}
