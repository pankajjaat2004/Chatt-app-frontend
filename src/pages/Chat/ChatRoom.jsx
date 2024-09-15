import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import ChatRoomHeader from './ChatRoomHeader';
import ChatRoomMessage from './ChatRoomMessage';
import ChatRoomInput from './ChatRoomInput';
import { useChatContext } from '../../context/ChatContext';
import { useAuthContext } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { chatAPI } from '../../api';
import { useAxios } from '../../hooks/useAxios';
import { IoSend } from 'react-icons/io5';
import axios from 'axios';

function ChatRoom() {
  const { user } = useAuthContext();
  const { chatId, chatInfo, updateMessageStatusToRead } = useChatContext();
  const { isLoading: messageLoading, sendRequest: getUserMessages } = useAxios();
  const {
    socketValue: { messageData, messageReadStatus },
    resetSocketValue
  } = useSocketContext();

  const [chatMessages, setChatMessages] = useState([]);
  const [isChatBotVisible, setIsChatBotVisible] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      getUserMessages(
        {
          method: 'GET',
          url: chatAPI.getUserMessages({
            userId: user._id,
            chatId,
            type: chatInfo.chatType
          })
        },
        (data) => {
          setChatMessages(data.data);
        }
      );
    }
  }, [chatId, getUserMessages, user._id, chatInfo]);

  const checkIsChatting = useCallback(
    (messageData) => {
      const { type, sender, receiver } = messageData;
      return type === 'user' ? chatId === sender : chatId === receiver;
    },
    [chatId]
  );

  const updateSelfMessageStatus = useCallback(
    (messageData) => {
      setChatMessages((prev) => [
        ...prev,
        {
          ...messageData,
          readers: [user._id]
        }
      ]);
    },
    [user]
  );

  // socket
  useEffect(() => {
    if (messageData) {
      console.log('=== socket===', messageData);
      const isChatting = checkIsChatting(messageData);
      
      if (isChatting) {
        updateSelfMessageStatus(messageData);
        //API
        const { receiver, sender, type } = messageData;
        const toId = type === 'room' ? receiver : sender;
        updateMessageStatusToRead(toId, type);
      }
      // RESET
      resetSocketValue('messageData');
    }
  }, [messageData, checkIsChatting, updateSelfMessageStatus, updateMessageStatusToRead, resetSocketValue]);

  // socket message update status
  useEffect(() => {
    if (messageReadStatus) {
      const { type, readerId, toId: receiveRoomId } = messageReadStatus;
      
      const isChatting = type === 'user' ? chatId === readerId : chatId === receiveRoomId;
      if (isChatting) {
        // console.log('*** set chat message read status ***', messageReadStatus);
        setChatMessages((prev) =>
          prev.map((msg) => (msg.sender !== readerId ? { ...msg, readers: [...msg.readers, readerId] } : msg))
        );
      }
    }
  }, [messageReadStatus, chatId]);

  const toggleChatBotVisibility = () => {
    setIsChatBotVisible(!isChatBotVisible);
  };

  // AI to generate answer to the question asked by the user
  async function GenerateAnswer(incommingChatLi) {

    const MessageElement = incommingChatLi.querySelector('p');
    const response = await axios({
      url: process.env.VITE_AI_URL,
      method: "post",
      data: { "contents": [{ "parts": [{ "text": question }] }] },
    });


    let responseText = response.data.candidates[0].content.parts[0].text;

    // Replace starred text with bold text
    responseText = responseText.replace(/\*(.*?)\*/g, '<b>$1</b>');
  
    MessageElement.innerHTML = responseText;

    
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // AI chatbot submit handler function to send the question to the AI and user question to the chat
  const handleAISubmit = (e) => {

    e.preventDefault();
    if (question.trim() === '') {
      setQuestion('');
      return;
    }

    chatbox.appendChild(createBotMessage(question,"chat_outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
      const incommingChatLi =createBotMessage("Thinking...","chat_incoming");
      chatbox.appendChild(incommingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);

      GenerateAnswer(incommingChatLi);

    }, 600);
    setQuestion("");

  };

const chatbox = document.querySelector('.chatbox');

  const createBotMessage = (message, className) => {
    const chatli = document.createElement('li');
    chatli.classList.add(className);
    let chatContent =className === "chat_outgoing" ? `<p></p>` : `<span>🤖</span> <p></p>`;
    chatli.innerHTML = chatContent;
    chatli.querySelector('p').textContent = message;
    return chatli;
  }

  return (
    <RoomWrapper>
      <ChatRoomHeader />
      <ChatRoomMessage chatMessages={chatMessages} messageLoading={messageLoading} />
      {isChatBotVisible && (
        <ChatBot>
          <header>CHATBOT</header>
          <ul className='chatbox'>
            <li className='chat_incoming'>
              <span>🤖</span>
              <p>Hi!👋🏻 I'm your personal assistant. How can I assist you?</p>
            </li>

          </ul>

          <ChatInput onSubmit={handleAISubmit}>
          <InputToBot
            role="text"
            rows="1"
            name="inputMessage"
            placeholder="Type a message"
            value={question}
            onChange={(e) => setQuestion(e.target.value)} 
          />
          <AIInputButton>
              <ButtonIconWrapper onClick={handleAISubmit}>
                <IoSend />
              </ButtonIconWrapper>
          </AIInputButton>
        </ChatInput>


        </ChatBot>
      )}
      <AIbutton onClick={toggleChatBotVisibility}>🤖</AIbutton>
      <ChatRoomInput setChatMessages={setChatMessages} />
      <div ref={chatEndRef}></div>
    </RoomWrapper>
  );
}

const AIInputButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 0 20px 20px 0;
  padding-right: 0.3rem;
  background-color: purple;
  color: var(--bg-color-main);
  outline: none;
  border: none;
  cursor: pointer;
`;

const InputToBot = styled.input`
  flex: 1;
  padding: 0.5rem;
  border-radius: 20px 0 0 20px;
  border: none;
  background-color: var(--bg-color-main);
  color: var(--text-color);
  outline: none;
  overflow: hidden;
  overflow-wrap: break-word;
  resize: none;
  &::selection {
    border-radius: 5px;
    background-color: purple;
    color: var(--bg-color-main);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonIconWrapper = styled(IconWrapper)`
  font-size: 1.15rem;
  transform: rotate(-40deg);
  padding-left: 6px;
  cursor: pointer;
`;

const ChatInput = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: grey;
  margin-top: 1.2rem;
  input {
    flex: 1;
    padding: 0.5rem;
    border-radius: 20px 0 0 20px;
    border: none;
    background-color: var(--bg-color-main);
    color: var(--text-color);
    outline: none; 
    overflow: hidden;
    overflow-wrap: break-word;
    resize: none;
  }
  input::selection {
    border-radius: 5px;
    background-color: purple;
    color: var(--bg-color-main);
  }
  button {
    width: 30px;
    height: 30px;
    border-radius: 0 20px 20px 0;
    padding-right: 0.3rem;
    background-color: purple;
    color: var(--bg-color-main);
    outline: none;
    border: none;
  }
`;

const ChatBot = styled.div`
  header {
    font-size: 1.4rem;
    text-align: center;
    font-weight: 500;
    color: purple;
    margin-bottom: 1rem;
    cursor: default;
  }
  min-height: 25%;
  max-height: 76%;
  min-width: 18rem;
  max-width: 60%;
  overflow-y: auto;
  padding: 1rem;
  background-color: grey;
  border-radius: 20px 20px 0px 20px;
  border: 2px solid purple;
  flex-direction: column;
  position: fixed;
  bottom: 19%;
  right: 5%;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .chat_outgoing {
    display: flex;
    justify-content: right;
    margin: 0.5rem 0;
    p {
      background-color: var(--zomp);
      color: var(--text-color);
      padding: 0.5rem;
      max-width: 65%;
      border-radius: 10px 10px 0 10px;
      white-space: pre-wrap;
    }
  }
  .chat_incoming {
    white-space: pre-wrap;
    display: flex;
    justify-content: left;
    margin: 0.5rem 0;
    span {
      display: inline-block;
      font-size: 1.3rem;
      margin-left: -0.5rem;
      margin-right: 0.5rem;
    }
    p {
      background-color: var(--sheen-green);
      color: var(--text-color);
      padding: 0.5rem;
      margin-left: -0.4rem;
      max-width: 65%;
      border-radius: 10px 10px 10px 0;
    }
  }
`;

const AIbutton = styled.button`
  border-radius: 40% 40% 10% 40%;
  position: fixed;
  bottom: 11%;
  right: 3%;
  width: 45px;
  height: 45px;
  background-color: var(--zomp);
  color: var(--text-color);
  font-size: 1rem;
  border: none;
  border-top: 1px solid var(--bg-color-darken);
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: var(--sheen-green);
  }
  &:active {
    background-color: var(--zomp);
    scale: 0.9;
  }
  &:hover {
    scale: 1.1;
  } 
`;

const RoomWrapper = styled.div`
  margin: 1rem 1rem 0 ;
  width: 100%;
  height: calc(100% - 1rem);
  background-color: var(--bg-color-main);
  border-top-left-radius: 20px;
  border-top-right-radius: 8px;
  border: 2px solid var(--bg-color-darken);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export default ChatRoom;
