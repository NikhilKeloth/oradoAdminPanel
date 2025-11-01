import { useState, useEffect } from 'react';
import { MessageCircle, Search, Clock } from 'lucide-react';
import socket from '../AdminUtils/socket'; 

const AdminChatList = ({ onSelectChat, selectedUserId }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://orado.work.gd/api/chat/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch chats');

        const data = await response.json();
        console.log('data', data)
        const uniqueChats = [];
        const seenUserIds = new Set();

        data.data.forEach(chat => {
          const user = chat.participants.find(p => p.modelType === 'user')?.id?._id;
          if (user && !seenUserIds.has(user)) {
            seenUserIds.add(user);
            uniqueChats.push({
              ...chat,
              unreadCount: 0 // Set default
            });
          }
        });

        setChats(uniqueChats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    const handleNewMessage = (data) => {
      setChats(prevChats => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(chat => chat._id === data.chatId);

        if (chatIndex !== -1) {
          const chat = updatedChats[chatIndex];
          const senderIsUser = data.message.sender.modelType === 'user';
          const updatedChat = {
            ...chat,
            lastMessage: data.message,
            updatedAt: new Date(),
            unreadCount: senderIsUser ? (chat.unreadCount || 0) + 1 : 0
          };
          updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(updatedChat);
        }

        return updatedChats;
      });
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, []);

  const filteredChats = chats.filter(chat => {
    const user = chat.participants.find(p => p.modelType === 'user')?.id;
    const name = typeof user?.name === 'string' ? user.name.toLowerCase() : '';
    const email = typeof user?.email === 'string' ? user.email.toLowerCase() : '';
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    return diffInHours < 24
      ? messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : messageTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-96 border-r border-orange-200 h-full bg-white flex flex-col">
        <div className="p-4 bg-orange-500 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle size={24} />
            Customer Chats
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-96 border-r border-orange-200 h-full bg-white flex flex-col">
        <div className="p-4 bg-orange-500 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle size={24} />
            Customer Chats
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-r border-orange-200 h-full bg-white flex flex-col">
      <div className="p-4 bg-orange-500 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle size={24} />
          Customer Chats
        </h2>
      </div>

      <div className="p-4 border-b border-orange-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No chats found</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const user = chat.participants.find(p => p.modelType === 'user')?.id;
            const isSelected = selectedUserId === user?._id;

            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(user?._id, chat._id)}
                className={`p-4 cursor-pointer border-b border-orange-100 transition-colors
                ${isSelected ? 'bg-orange-100 border-l-4 border-l-orange-500' : ''}
                ${chat.unreadCount > 0 && !isSelected ? 'bg-orange-50' : 'hover:bg-orange-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`truncate ${chat.unreadCount > 0 ? 'font-extrabold text-black' : 'font-semibold text-gray-900'}`}>
                        {user?.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(chat.lastMessage?.timestamp || chat.updatedAt)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminChatList;
