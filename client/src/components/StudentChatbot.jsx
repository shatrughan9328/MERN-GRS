import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hello! I am your **AI Grievance Assistant**. I can help you check your complaint status, explain priority levels, or provide suggestions to strengthen your grievance draft. How can I assist you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const SUGGESTED_PROMPTS = [
  "Check my complaint status",
  "How do priority levels work?",
  "Help me draft a grievance",
  "Which categories are available?",
];

const StudentChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("grs_chat_history");
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(SUGGESTED_PROMPTS);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem("grs_chat_history", JSON.stringify(messages));
    } catch (e) {}
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to use the AI Chatbot.");
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage = {
      role: "user",
      content: textToSend,
      timestamp: timeStr,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/chat",
        {
          message: textToSend,
          history: updatedHistory
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success && res.data?.data) {
        const botReply = {
          role: "assistant",
          content: res.data.data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botReply]);
        if (res.data.data.suggestions && res.data.data.suggestions.length > 0) {
          setSuggestions(res.data.data.suggestions);
        }
      } else {
        throw new Error(res.data?.msg || "Failed to get reply");
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      const errorReply = {
        role: "assistant",
        content:
          "⚠️ I encountered an issue connecting to the grievance service. Please ensure you are logged in, or try asking in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setSuggestions(SUGGESTED_PROMPTS);
    try {
      sessionStorage.removeItem("grs_chat_history");
    } catch (e) {}
  };

  // Helper to render bold markdown and bullet items nicely
  const renderMessageContent = (text) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Bold replacer
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      const parsedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} style={{ color: "#ffffff", fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.25)",
                color: "#93c5fd",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
        return (
          <div key={index} className="chat-bullet-line">
            <span className="bullet-dot">•</span>
            <span>{parsedLine}</span>
          </div>
        );
      }

      if (line.trim() === "") {
        return <div key={index} style={{ height: "6px" }} />;
      }

      return (
        <p key={index} style={{ margin: "2px 0" }}>
          {parsedLine}
        </p>
      );
    });
  };

  return (
    <div className="grs-ai-chatbot-root">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          className="grs-chatbot-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Grievance Assistant"
        >
          <div className="launcher-pulse"></div>
          <div className="launcher-icon">
            <Sparkles size={20} className="sparkle-anim" />
          </div>
          <span className="launcher-label">AI Assistant</span>
          <span className="launcher-badge">Live</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="grs-chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-bot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <div className="chat-bot-title">
                  <h4>Grievance AI Guide</h4>
                  <span className="chat-status-pill">
                    <span className="pulse-dot"></span> Online
                  </span>
                </div>
                <p className="chat-bot-sub">Automated Redressal Advisor</p>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                className="chat-icon-btn"
                onClick={handleReset}
                title="Restart Conversation"
                aria-label="Restart Conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="chat-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                aria-label="Minimize Chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble-wrap ${
                  msg.role === "user" ? "user-wrap" : "bot-wrap"
                }`}
              >
                <div className="chat-sender-avatar">
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div className="chat-bubble-content">
                  <div className={`chat-bubble ${msg.role}`}>
                    {renderMessageContent(msg.content)}
                  </div>
                  <span className="chat-timestamp">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-wrap bot-wrap">
                <div className="chat-sender-avatar">
                  <Bot size={14} />
                </div>
                <div className="chat-bubble bot typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {suggestions.length > 0 && !loading && (
            <div className="chat-suggestions">
              {suggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  className="chat-suggestion-chip"
                  onClick={() => handleSend(prompt)}
                >
                  <Sparkles size={11} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="chat-input-bar">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about your complaints, priority, categories..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChatbot;
