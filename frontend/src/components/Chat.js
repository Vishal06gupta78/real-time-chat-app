import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  const typingTimeoutRef = useRef();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get backend URL from environment or use relative path (empty string)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join chat room
  const joinChat = () => {
    if (username.trim() === '') return;

    // Use full backend URL during development, relative path in production (empty = same origin)
    const newSocket = io(backendUrl || '/', {
      transports: ['websocket'],
    });

    newSocket.emit('setUsername', username);
    newSocket.emit('getOnlineUsers');

    newSocket.on('connect', () => {
      console.log('✅ Socket connected, re-sending username:', username);
      newSocket.emit('setUsername', username);
      newSocket.emit('getOnlineUsers');
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      alert('Cannot connect to chat server. Check if backend is running.');
    });

    newSocket.on('onlineUsers', (users) => {
      console.log('📡 Online users received:', users);
      setOnlineUsers(users);
    });

    newSocket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('typing', (data) => {
      if (data.username !== username) {
        setTypingUser(data.username);
        setTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 1000);
      }
    });

    setSocket(newSocket);
    setIsJoined(true);
    if (inputRef.current) inputRef.current.focus();
  };

  // Send message – use backendUrl for API calls
  const sendMessage = async () => {
    if (input.trim() === '' || !username) return;

    const messageData = { username, content: input };

    try {
      const response = await fetch(`${backendUrl}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        setInput('');
        socket?.emit('stopTyping', { username });
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Typing indicator
  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing', { username });
  };

  // Leave chat
  const leaveChat = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setIsJoined(false);
    setMessages([]);
    setUsername('');
    setOnlineUsers([]);
  };

  if (!isJoined) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h1>💬 Real-Time Chat</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && joinChat()}
            autoFocus
          />
          <button onClick={joinChat}>Join Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="user-info">
          <div className="avatar">{username[0].toUpperCase()}</div>
          <span>{username}</span>
          <button className="leave-btn" onClick={leaveChat}>Leave</button>
        </div>
        <div className="online-users">
          <h3>Online Users</h3>
          <ul>
            {onlineUsers.length === 0 ? (
              <li className="placeholder">No other users online</li>
            ) : (
              onlineUsers.map((user, idx) => (
                <li key={idx}>
                  🟢 {user} {user === username && '(You)'}
                </li>
              ))
            )}
          </ul>
          <button 
            onClick={() => socket?.emit('getOnlineUsers')}
            style={{ marginTop: '10px', fontSize: '12px', padding: '4px 8px' }}
          >
            ↻ Refresh users
          </button>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h2># General Chat</h2>
        </div>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.username === username ? 'own' : 'other'}`}
            >
              <div className="message-avatar">
                {msg.username[0].toUpperCase()}
              </div>
              <div className="message-content">
                <div className="message-info">
                  <span className="username">{msg.username}</span>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="message-text">{msg.content}</div>
              </div>
            </div>
          ))}
          {typing && typingUser && (
            <div className="typing-indicator">
              <span>{typingUser} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;