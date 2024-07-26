import React, { useState, useEffect } from 'react';
import Form from '../../components/Form';
import TextInput from '../../components/TextInput';
import { PrimaryButton } from '../../components/Button';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAxios } from '../../hooks/useAxios';
import { authAPI } from '../../api';
import { useAuthContext } from '../../context/AuthContext';
import { errorToast, warningToast } from '../../utils/toastify';
import { useSocketContext } from '../../context/SocketContext';

function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const { setUser, setToken } = useAuthContext();
  const { socketConnect } = useSocketContext();
  const { error, isLoading, sendRequest: postLogin } = useAxios();

  useEffect(() => {
    if (error?.errors) {
      error.errors.forEach((e) => {
        errorToast(e.msg);
      });
    } else if (error?.message) {
      errorToast(error.message);
    }
  }, [error]);

  // check login fields and send data check request to backend to check the login credits and create jwt access token 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      warningToast('All fields are required!');
      return;
    }
    postLogin(
      {
        method: 'POST',
        url: authAPI.login,
        data: { ...formData }
      },
      (data) => {
        const { accessToken, ...other } = data.data;
        setUser({ ...other });
        setToken({ accessToken });
        socketConnect();
      }
    );
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>Enter your details</FormTitle>
      <TextInput
        type="text"
        placeholder="User Name"
        name="username"
        id="username"
        value={formData.username}
        onChange={handleInputChange}
      />
      <TextInput
        type="password"
        placeholder="Password"
        name="password"
        id="password"
        value={formData.password}
        onChange={handleInputChange}
      />
      <PrimaryButton>{isLoading ? 'Loading...' : 'Login'}</PrimaryButton>
      <LoginSpan>
        Do not have an account ?
        <Link to="/signup">
          <span>sign up</span>
        </Link>
      </LoginSpan>
    </Form>
  );
}

const FormTitle = styled.h1`
  font-size: 1.5rem;
  font-weight:10;
  letter-spacing: 1px;
  text-align: center;
  margin: 0.5rem 0;
  margin-bottom:
`;

const LoginSpan = styled.p`
  font-size: 1rem;

  a {
    text-decoration: none;
  }

  span {
    margin-left: 0.5rem;
    color: var(--danger);
    font-weight: 500;
    text-transform: capitalize;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default LoginForm;
