'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Clock, User, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function AdminChatsPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, [filter]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const data = await api.getAllChats({ status: filter });
      setChats(data.chats || []);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chatId) => {
    try {
      const data = await api.getChat(chatId);
      setChatMessages(data);
      setSelectedChat(chatId);
      fetchChats();
    } catch (error) {
      toast.error('Failed to load chat');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sending || !selectedChat) return;

    setSending(true);
    try {
      const data = await api.adminReply(selectedChat, reply.trim());
      setChatMessages(data);
      setReply('');
      fetchChats();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (chatId) => {
    try {
      await api.closeChat(chatId);
      toast.success('Chat closed');
      if (selectedChat === chatId) {
        setChatMessages(null);
        setSelectedChat(null);
      }
      fetchChats();
    } catch (error) {
      toast.error('Failed to close chat');
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Chat Support</h2>
          <p className="text-neutral-500 text-sm mt-1">Manage customer conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Chat List */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden">
          {/* Filter Tabs */}
          <div className="flex border-b border-neutral-800">
            {['open', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  filter === tab
                    ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-400/5'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'open' && chats.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary-500/20 text-primary-400 rounded-full">
                    {chats.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Chat Items */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <MessageSquare className="w-10 h-10 text-neutral-700 mb-3" />
                <p className="text-sm text-neutral-500">No {filter} chats</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => selectChat(chat._id)}
                  className={`w-full text-left p-4 border-b border-neutral-800/50 hover:bg-white/5 transition-colors ${
                    selectedChat === chat._id ? 'bg-primary-500/10 border-l-2 border-l-primary-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{chat.userName}</p>
                        {chat.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{chat.subject}</p>
                      <p className="text-xs text-neutral-400 mt-1 truncate">{chat.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-neutral-600">{timeAgo(chat.lastMessageAt)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Detail */}
        <div className="lg:col-span-2 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden">
          {!chatMessages ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-neutral-600" />
              </div>
              <p className="text-neutral-400 font-medium">Select a conversation</p>
              <p className="text-neutral-600 text-sm mt-1">Choose a chat from the list to view messages</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {chatMessages.userName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{chatMessages.userName}</p>
                    <p className="text-xs text-neutral-500">{chatMessages.subject} &middot; {chatMessages.userEmail}</p>
                  </div>
                </div>
                {chatMessages.status === 'open' && (
                  <button
                    onClick={() => handleClose(chatMessages._id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Close Chat
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {chatMessages.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                        msg.sender === 'admin'
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-neutral-800 text-neutral-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.sender === 'customer' && (
                        <p className="text-[10px] font-semibold text-primary-400 mb-1 uppercase tracking-wider">
                          {chatMessages.userName}
                        </p>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${
                        msg.sender === 'admin' ? 'text-primary-200' : 'text-neutral-500'
                      }`}>
                        {formatDate(msg.createdAt)} {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {chatMessages.status === 'open' ? (
                <form onSubmit={handleReply} className="p-4 border-t border-neutral-800">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!reply.trim() || sending}
                      className="w-11 h-11 bg-primary-600 hover:bg-primary-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-800/50 text-center">
                  <p className="text-xs text-neutral-500">This conversation has been closed</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
