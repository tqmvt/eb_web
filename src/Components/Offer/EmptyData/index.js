import React from 'react';
import styled from 'styled-components';

const EmptyDataContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 100px;
`;
export default function EmptyData({ children }) {
  return <EmptyDataContainer>{children}</EmptyDataContainer>;
}
