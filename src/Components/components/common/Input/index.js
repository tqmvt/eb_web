import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.input`
  width: 100%;
  background: transparent;
  border: 0.5px solid ${({ theme }) => theme.colors.borderColor2};
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textColor3};

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type='number'] {
    -moz-appearance: textfield;
  }

  &.is-error {
    border: 0.5px solid ${({ theme }) => theme.colors.borderColor6};
    outline-color: ${({ theme }) => theme.colors.borderColor6};
  }
`;

export default function Input({ ...props }) {
  return <InputContainer {...props} />;
}
