// Aichat.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Chat from "./Chat";

const Aichat = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeHistory, setActiveHistory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Start new chat
  const startNewChat = () => {
    if (messages.length > 0 && (!activeHistory || !history.some(h => h.id === activeHistory))) {
      const newHistoryItem = {
        id: Date.now(),
        title: messages[0]?.text?.substring(0, 30) || "New Chat",
        messages: [...messages],
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    }
    setMessages([]);
    setActiveHistory(null);
    if (isMobile) setIsSidebarOpen(false);
  };

  // ✅ Load old chat
  const loadChatFromHistory = (historyItem) => {
    setMessages(historyItem.messages);
    setActiveHistory(historyItem.id);
    if (isMobile) setIsSidebarOpen(false);
  };

  // ✅ Delete old chat
  const deleteChatFromHistory = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeHistory === id) startNewChat();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ AI response ko format karna with SyntaxHighlighter
  const renderResponse = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const elements = [];

    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) {
        elements.push(
          <p key={lastIndex} className="whitespace-pre-wrap">
            {before}
          </p>
        );
      }

      const language = match[1] || "javascript";
      const code = match[2];

      elements.push(
        <div key={match.index} className="my-3 rounded-lg overflow-hidden shadow-md relative">
          {/* ✅ Copy Button */}
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            Copy
          </button>
          <SyntaxHighlighter language={language} style={oneDark} showLineNumbers wrapLongLines>
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    const after = text.slice(lastIndex);
    if (after.trim()) {
      elements.push(
        <p key="after" className="whitespace-pre-wrap">
          {after}
        </p>
      );
    }

    return elements;
  };

  // ✅ Generate AI response
  const generateAnswer = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    const userMessage = { text: currentQuestion, sender: "user" };
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    setQuestion("");
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBKqC3-JdSNxSVwwHuZK7HiVov-7oMTDx8",
        {
          contents: tempMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          }))
        }
      );

      let aiText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ Sorry, I could not understand that.";

      const aiMessage = { text: aiText, sender: "ai", render: renderResponse(aiText) };
      const finalMessages = [...tempMessages, aiMessage];

      setMessages(finalMessages);

      const newHistoryItem = {
        id: Date.now(),
        title: currentQuestion.substring(0, 30) + (currentQuestion.length > 30 ? "..." : ""),
        messages: finalMessages,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setActiveHistory(newHistoryItem.id);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setMessages(prev => [
        ...prev,
        { text: "❌ Failed to get answer. Please try again.", sender: "ai" }
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full ${darkMode ? "dark" : ""}`}>
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden relative">
        <AnimatePresence>
          <Sidebar
            isOpen={isSidebarOpen}
            isMobile={isMobile}
            toggleSidebar={toggleSidebar}
            startNewChat={startNewChat}
            history={history}
            activeHistory={activeHistory}
            loadChatFromHistory={loadChatFromHistory}
            deleteChatFromHistory={deleteChatFromHistory}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </AnimatePresence>

        <div
          className={`flex-1 flex flex-col ${isMobile ? "pt-16" : ""} transition-all duration-300 ${
            isSidebarOpen && !isMobile ? "ml-64" : ""
          }`}
        >
          <Chat
            messages={messages}
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            isTyping={isTyping}
            generateAnswer={generateAnswer}
            isMobile={isMobile}
            toggleSidebar={toggleSidebar}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Aichat;
