// pages/Aichat.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Aichat = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeHistory, setActiveHistory] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cleanResponse = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/`{3}(.*?)`{3}/gs, '$1')
    .replace(/- /g, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const generateAnswer = async () => {
    if (!question.trim()) return;

    const userMessage = { text: question, sender: 'user' };
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBKqC3-JdSNxSVwwHuZK7HiVov-7oMTDx8', {
        contents: tempMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      });

      const aiText = cleanResponse(res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ Sorry, I could not understand that.');
      const aiMessage = { text: aiText, sender: 'ai' };
      const finalMessages = [...tempMessages, aiMessage];
      setMessages(finalMessages);

      const newHistory = {
        id: Date.now(),
        title: question.substring(0, 30) + (question.length > 30 ? '...' : ''),
        messages: finalMessages,
        timestamp: new Date().toLocaleString()
      };

      setHistory(prev => [newHistory, ...prev]);
      setActiveHistory(newHistory.id);
    } catch (err) {
      setMessages(prev => [...prev, { text: '❌ Failed to get answer. Please try again.', sender: 'ai' }]);
    } finally {
      setLoading(false);
      if (isMobile) setShowSidebar(false);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const startNewChat = () => {
    if (messages.length > 0 && (!activeHistory || !history.some(h => h.id === activeHistory))) {
      const newItem = {
        id: Date.now(),
        title: messages[0]?.text?.substring(0, 30) || 'New Chat',
        messages: [...messages],
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newItem, ...prev]);
    }
    setMessages([]);
    setActiveHistory(null);
    if (isMobile) setShowSidebar(false);
  };

  const loadChatFromHistory = (item) => {
    setMessages(item.messages);
    setActiveHistory(item.id);
    if (isMobile) setShowSidebar(false);
  };

  const deleteChatFromHistory = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
    if (activeHistory === id) startNewChat();
  };

  return (
    <div className="flex h-[100dvh] w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden relative">
      <Sidebar
        isMobile={isMobile}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        startNewChat={startNewChat}
        history={history}
        activeHistory={activeHistory}
        loadChatFromHistory={loadChatFromHistory}
        deleteChatFromHistory={deleteChatFromHistory}
      />
      <ChatWindow
        isMobile={isMobile}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        question={question}
        setQuestion={setQuestion}
        loading={loading}
        generateAnswer={generateAnswer}
        messages={messages}
        copyToClipboard={copyToClipboard}
      />
      {isMobile && showSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setShowSidebar(false)}></div>
      )}
    </div>
  );
};

export default Aichat;
