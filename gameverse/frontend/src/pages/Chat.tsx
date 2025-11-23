import React, { useState } from 'react';
import { Chat } from '../types';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-sidebar">
          <ChatList 
            onSelectChat={setSelectedChat}
            selectedChat={selectedChat}
          />
        </div>
        
        <div className="chat-main">
          <ChatWindow chat={selectedChat} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;