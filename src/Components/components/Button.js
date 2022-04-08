import React from 'react';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';

const DefaultButton = styled.button`
  font-size: 18px;
  font-weight: bold;
  background: transparent linear-gradient(270deg, #ff9420 0%, #e57700 100%) 0% 0% no-repeat padding-box;
  color: ${({ theme }) => theme.colors.textColor1};
  width: 100%;
  height: 36px;
  padding: 5px;
  border-radius: 100px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor1};
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    color: ${({ theme }) => theme.colors.textColor1};
    background: #cbcbcb 0% 0% no-repeat padding-box;
    border: 1px solid #cbcbcb;
  }
`;

const OutlinedButton = styled.button`
  font-size: 18px;
  font-weight: bold;
  background: transparent;
  color: ${({ theme }) => theme.colors.textColor2};
  width: 100%;
  height: 36px;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor1};
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    color: ${({ theme }) => theme.colors.textColor1};
    background: #cbcbcb 0% 0% no-repeat padding-box;
    border: 1px solid #cbcbcb;
  }
`;

const SpinnerContainer = styled.div`
  margin-right: 6px;
`;

export default function Button({ type = 'default', isLoading = false, children, ...props }) {
  if (type === 'outlined') {
    return (
      <>
        <OutlinedButton {...props}>
          {isLoading && (
            <SpinnerContainer>
              <Spinner animation="border" role="status" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </SpinnerContainer>
          )}
          {children}
        </OutlinedButton>
      </>
    );
  }
  return (
    <>
      <DefaultButton {...props}>
        {isLoading && (
          <SpinnerContainer>
            <Spinner animation="border" role="status" size="sm">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </SpinnerContainer>
        )}
        {children}
      </DefaultButton>
    </>
  );
}
