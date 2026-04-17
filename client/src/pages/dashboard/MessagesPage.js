import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function MessagesPage() {
  const { user, token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Initialize socket
  useEffect(() => {
    const s = io(process.env.REACT_APP_SOCKET_URL || '', { auth: { token } });
    setSocket(s);
    s.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    s.on('typing', ({ userId }) => {
      if (userId !== user?._id) setTyping(true);
    });
    s.on('stop_typing', () => setTyping(false));
    return () => s.disconnect();
  }, [token]);

  // Load conversations
  useEffect(() => {
    api.get('/messages/conversations').then(r => {
      setConversations(r.data);
      const convId = searchParams.get('conv');
      if (convId) {
        const conv = r.data.find(c => c._id === convId);
        if (conv) selectConversation(conv);
      }
    }).finally(() => setLoading(false));
  }, []);

  const selectConversation = (conv) => {
    setActiveConv(conv);
    socket?.emit('join_conversation', conv._id);
    api.get(`/messages/conversations/${conv._id}`).then(r => setMessages(r.data));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      await api.post(`/messages/conversations/${activeConv._id}/send`, { content: newMsg });
      setNewMsg('');
      socket?.emit('stop_typing', { convId: activeConv._id, userId: user._id });
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const handleTyping = () => {
    if (!activeConv || !socket) return;
    socket.emit('typing', { convId: activeConv._id, userId: user._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { convId: activeConv._id, userId: user._id });
    }, 1500);
  };

  const getOtherUser = (conv) => conv.participants?.find(p => p._id !== user?._id);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Messages 💬</h1>
      <div className="card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-72 border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-slate-100">
              <input className="input text-sm" placeholder="Search conversations..." />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && [...Array(5)].map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" /><div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded animate-pulse" /><div className="h-2 w-2/3 bg-slate-200 rounded animate-pulse" /></div></div>
              ))}
              {conversations.length === 0 && !loading && (
                <div className="p-6 text-center text-slate-400 text-sm">
                  <p className="text-3xl mb-2">💬</p>
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Connect with startups or corporates to start chatting</p>
                </div>
              )}
              {conversations.map(conv => {
                const other = getOtherUser(conv);
                return (
                  <button key={conv._id} onClick={() => selectConversation(conv)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${activeConv?._id === conv._id ? 'bg-indigo-50' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6366f1&color=fff`}
                        className="w-10 h-10 rounded-full object-cover" alt={other?.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{other?.name || 'Unknown'}</p>
                      <p className="text-slate-500 text-xs truncate">{conv.lastMessage?.content || 'Start a conversation'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConv ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                  {(() => {
                    const other = getOtherUser(activeConv);
                    return (
                      <>
                        <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=6366f1&color=fff`}
                          className="w-9 h-9 rounded-full" alt={other?.name} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{other?.name}</p>
                          <p className="text-slate-400 text-xs capitalize">{other?.role}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                    return (
                      <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff`}
                            className="w-7 h-7 rounded-full mr-2 flex-shrink-0 mt-1" alt="" />
                        )}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
                          {msg.isDeleted ? <em className="opacity-60">Message deleted</em> : msg.content}
                          <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {typing && (
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 px-4 py-3 rounded-2xl text-slate-500 text-sm">
                        <span className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 flex gap-2">
                  <input value={newMsg} onChange={e => { setNewMsg(e.target.value); handleTyping(); }}
                    className="input flex-1 text-sm" placeholder="Type a message..." />
                  <button type="submit" disabled={sending || !newMsg.trim()}
                    className="btn-primary px-4 disabled:opacity-50">
                    {sending ? '...' : '→'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <p className="text-5xl mb-4">💬</p>
                  <p className="font-semibold text-slate-600">Select a conversation</p>
                  <p className="text-sm mt-1">Choose from the list on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
