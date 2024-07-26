import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useChatContext } from '../../context/ChatContext';
import ChatMessage from '../Chat/ChatMessage';

function ChatRoomMessage({ chatMessages, messageLoading }) {
  const { chatId } = useChatContext();

  const msgRef = useRef(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollIntoView();
    }
  }, [chatMessages]);

  const renderedMessage = chatMessages.map((msg) => {
    return <ChatMessage key={msg._id} {...msg} ref={msgRef} />;
  });

  return (
    <RoomMessage>
      {chatId ? (
        messageLoading ? (
          <RoomEmptyMessage>Loading...</RoomEmptyMessage>
        ) : chatMessages.length === 0 ? (
          <RoomEmptyMessage></RoomEmptyMessage>
        ) : (
          renderedMessage
        )
      ) : (
        <RoomWelcomeMessage><h2> WhatsApp for Windows</h2></RoomWelcomeMessage>
      )}
    </RoomMessage>
  );
}

ChatRoomMessage.propTypes = {
  chatMessages: PropTypes.array,
  messageLoading: PropTypes.bool
};

const RoomMessage = styled.div`
  flex: 1;
  overflow: auto;
  padding: 1.5rem 1.5rem 0;
`;

const RoomEmptyMessage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-main);
  color: var(--);
  font-size: 1rem;
  font-weight: 500;
`;

const RoomWelcomeMessage = styled(RoomEmptyMessage)`

  font-size: 1.5rem;
`;

export default ChatRoomMessage;
