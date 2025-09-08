// Aichat.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
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
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preference for dark mode
    const saved = localStorage.getItem("darkMode");
    return saved !== null ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [typingProgress, setTypingProgress] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // ✅ Start new chat
  const startNewChat = () => {
    if (messages.length > 0 && (!activeHistory || !history.some(h => h.id === activeHistory))) {
      const newHistoryItem = {
        id: Date.now(),
        title: messages[0]?.text?.substring(0, 30) || "New Chat",
        messages: [...messages],
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]); // Limit to 50 history items
    }
    setMessages([]);
    setActiveHistory(null);
    setError(null);
    if (isMobile) setIsSidebarOpen(false);
  };

  // ✅ Load old chat
  const loadChatFromHistory = (historyItem) => {
    setMessages(historyItem.messages);
    setActiveHistory(historyItem.id);
    setError(null);
    if (isMobile) setIsSidebarOpen(false);
  };

  // ✅ Delete old chat
  const deleteChatFromHistory = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeHistory === id) startNewChat();
  };

  // ✅ Clear all history
  const clearAllHistory = () => {
    setHistory([]);
    startNewChat();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingProgress]);

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

  // Simulate typing effect
  useEffect(() => {
    if (isTyping) {
      let progress = "";
      const fullText = messages.length > 0 ? messages[messages.length - 1].text : "";
      
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      
      typingIntervalRef.current = setInterval(() => {
        if (progress.length < fullText.length) {
          progress = fullText.substring(0, progress.length + 1);
          setTypingProgress(progress);
        } else {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
        }
      }, 10); // Adjust typing speed here
    } else {
      setTypingProgress("");
    }

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [isTyping, messages]);

  // ✅ AI response ko format karna
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
        <div key={match.index} className="my-3 rounded-lg overflow-hidden shadow-md relative group">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="px-2 py-1 text-xs rounded bg-gray-700 text-white hover:bg-gray-600"
              title="Copy code"
            >
              Copy
            </button>
          </div>
          <SyntaxHighlighter 
            language={language} 
            style={oneDark} 
            showLineNumbers 
            wrapLongLines
            customStyle={{ margin: 0, borderRadius: '0.5rem' }}
          >
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
    if (!question.trim() || loading) return;

    const currentQuestion = question;
    const userMessage = { text: currentQuestion, sender: "user" };
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    setQuestion("");
    setLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBKqC3-JdSNxSVwwHuZK7HiVov-7oMTDx8`,
        {
          contents: tempMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          })),
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );

      let aiText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ Sorry, I could not understand that.";

      const aiMessage = { 
        text: aiText, 
        sender: "ai", 
        render: renderResponse(aiText),
        timestamp: new Date().toLocaleTimeString()
      };
      
      const finalMessages = [...tempMessages, aiMessage];
      setMessages(finalMessages);

      // Update or create history item
      setHistory(prev => {
        if (activeHistory) {
          return prev.map(item => 
            item.id === activeHistory 
              ? {...item, messages: finalMessages, timestamp: new Date().toLocaleString()}
              : item
          );
        } else {
          const newHistoryItem = {
            id: Date.now(),
            title: currentQuestion.substring(0, 30) + (currentQuestion.length > 30 ? "..." : ""),
            messages: finalMessages,
            timestamp: new Date().toLocaleString()
          };
          return [newHistoryItem, ...prev.slice(0, 49)]; // Keep only 50 most recent
        }
      });

    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      const errorMessage = err.response?.status === 429 
        ? "❌ Too many requests. Please try again later." 
        : err.response?.status === 403 
          ? "❌ API key error. Please check your configuration."
          : "❌ Failed to get answer. Please check your connection and try again.";
      
      setError(errorMessage);
      setMessages(prev => [
        ...prev,
        { text: errorMessage, sender: "ai", isError: true }
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        startNewChat();
      }
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className={`flex flex-col h-[100dvh] w-full ${darkMode ? "dark" : ""}`}>
      <Navbar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        startNewChat={startNewChat}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="flex h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden relative">
        {/* ✅ Sidebar Mobile me overlay karega */}
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
            clearAllHistory={clearAllHistory}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </AnimatePresence>

        {/* ✅ Chat area full width mobile pe */}
        <div
          className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${
            isSidebarOpen && !isMobile ? "ml-64" : ""
          }`}
        >
          <Chat
            messages={messages}
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            isTyping={isTyping}
            typingProgress={typingProgress}
            generateAnswer={generateAnswer}
            isMobile={isMobile}
            toggleSidebar={toggleSidebar}
            messagesEndRef={messagesEndRef}
            error={error}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Aichat;