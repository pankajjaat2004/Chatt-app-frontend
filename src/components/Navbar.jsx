import React, { useContext, useEffect, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { HiOutlineSun, HiOutlineMoon, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { MdGroupAdd } from 'react-icons/md';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';
import { useSocketContext } from '../context/SocketContext';
import { socketEmitEvent } from '../socket/emit';

function Navbar() {
  const { mode, setMode } = useContext(ThemeContext);
  const { user, setUser, setToken } = useAuthContext();
  const { setChatInfo } = useChatContext();

  const {
    socketValue: { socket, socketId, onlineUsers },
    resetSocketValue
  } = useSocketContext();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (socketId) {
      setShow(true); // TODO:
    }
  }, [socketId]);

  const handleLogout = () => {
    console.log('logout', socketEmitEvent(socket));
    setUser(null);
    setToken(null);
    setChatInfo(null);
    if (socketId) {
      socketEmitEvent(socket).userOffline(user._id);
      console.log('DISCONNECT');
      resetSocketValue();
      socket.disconnect();
    }
  };

  return (
    <NavContainer>
      <Link to="/">
        <NavLogo>
          <NavImage src="/talking.png" alt="brand=logo" />
          <NavBrand>WhatsApp</NavBrand>
          {show && onlineUsers && <NavCount> Online：{onlineUsers.length || 0}</NavCount>}
        </NavLogo>
      </Link>
      {user ? (
        <NavUser>
          Welcome! <span>{user.name}</span>
        </NavUser>
      ) : null}
      <NavIcons>
        <NavIcon>
          {mode === 'light' ? (
            <HiOutlineSun onClick={() => setMode('dark')} />
          ) : (
            <HiOutlineMoon onClick={() => setMode('light')} />
          )}
        </NavIcon>
        {user ? (
          <>
            <NavIcon className='logout'>
              <Link to="/open-room">
              <span>Group</span>
                <MdGroupAdd />
              </Link>
            </NavIcon>
            <NavIcon className="logout">
              <span>Logout </span>
              <HiOutlineArrowTopRightOnSquare onClick={handleLogout} />
            </NavIcon>
          </>
        ) : null}
      </NavIcons>
    </NavContainer>
  );
}

const NavContainer = styled.nav`
  height: 70px;
  padding: 1rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background-color: var(--bg-color-darken);

  a {
    color: var(--main-color);
    text-decoration: none;
  }

  @media screen and (min-width: 768px) {
    padding: 1rem 2rem;
  }
`;

const NavLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const NavImage = styled.img`
  display: block;
  width: 30px;
  height: 30px;
  object-fit: cover;
`;

const NavBrand = styled.h1`
  font-size: 1rem;
  font-weight: 500;
  margin-left: 5px;
  letter-spacing: 1px;
  display: none;

  @media screen and (min-width: 768px) {
    display: block;
  }
`;

const NavCount = styled.p`
  font-size: 0.8rem;
  margin-left: 0.5rem;
`;

const NavUser = styled.h2`
  flex: 1;
  font-size: 1rem;
  text-align: end;
  margin-right: 0.5rem;
  padding: 0 1rem;
  text-transform: capitalize;
  display: none;

  span {
    font-style: italic;
  }

  @media screen and (min-width: 768px) {
    display: block;
  }
`;

const NavIcons = styled.div`
  display: flex;
  align-items: center;
`;

const NavIcon = styled.div`
  min-width: 40px;
  height: 40px;
  margin: 4px;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background-color: var(--bg-color-main);
  color: var(--main-color);
  cursor: pointer;
  box-shadow: 2px 2px 4px var(--shadow-color);

  &:hover {
    transform: scale(1.05);
    position: relative;
    bottom: 1px;
    transition: 0.5s;
  }

  a {
    display: flex;
    color: var(--main-color);
  }

  :not(:last-child) {
    margin-right: 0.5rem;
  }
  span{
  font-size:0.9rem;
  margin-right:5px;
  }

`;

export default Navbar;
