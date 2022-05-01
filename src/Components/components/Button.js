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

const LegacyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  color: #fff !important;
  background: #218cff;
  border-radius: 6px;
  letter-spacing: normal;
  outline: 1px solid #218cff;
  font-weight: 800;
  text-decoration: none;
  padding: 8px 24px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  box-shadow: 2px 2px 20px 0px rgb(131 100 226 / 0%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 2px 2px 20px 0px rgb(131 100 226 / 50%);
    transition: all 0.3s ease;
  }

  &:disabled {
    outline: 1px solid #cccccc;
  }
`;

const LegacyOutlinedButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  color: ${({ theme }) => theme.colors.textColor5} !important;
  background-color: ${({ theme }) => theme.colors.bgColor1} !important;
  border-radius: 6px;
  letter-spacing: normal;
  outline: 1px solid #ddd;
  font-weight: 800;
  text-decoration: none;
  padding: 8px 24px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  box-shadow: 2px 2px 20px 0px rgb(131 100 226 / 0%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 2px 2px 20px 0px rgb(131 100 226 / 50%);
    transition: all 0.3s ease;
  }
  
  &:focus {
    outline: 1px solid #ddd !important;
  }

  &:disabled {
    cursor: unset;
    background-color: #cccccc !important;
    color: #ffffff !important;
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

  if (type === 'legacy') {
    return (
      <LegacyButton {...props}>
        {isLoading && (
          <SpinnerContainer>
            <Spinner animation="border" role="status" size="sm">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </SpinnerContainer>
        )}
        {children}
      </LegacyButton>
    );
  }

  if (type === 'legacy-outlined') {
    return (
      <LegacyOutlinedButton className="m-0 text-nowrap p-4 pt-2 pb-2 btn-outline inline white" {...props}>
        {children}
      </LegacyOutlinedButton>
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
