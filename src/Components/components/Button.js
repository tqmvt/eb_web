import React from 'react';
import styled from 'styled-components';
const StyledButton = styled.button`
  border-radius: 100px;
  border: none;
  background-color: orange;
  color: white;
  width: 100%;
  padding: 5px;
`;

export default function Button({ children }) {
  return <StyledButton>{children}</StyledButton>;
}
