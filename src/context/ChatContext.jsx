import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, setIsChatOpen }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatState() {
  return useContext(ChatContext);
}
