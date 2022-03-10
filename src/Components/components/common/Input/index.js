import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.input`
  width: 100%;
  background: transparent;
  border: 0.25px solid ${({ theme }) => theme.colors.borderColor2};
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 14px;
`;

export default function Input({ ...props }) {
  return <InputContainer {...props} />;
}
