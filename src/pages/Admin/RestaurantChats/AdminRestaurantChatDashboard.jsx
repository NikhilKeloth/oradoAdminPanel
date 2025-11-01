import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import AdminRestaurantChatList from './AdminRestaurantChatList';
import AdminRestaurantChatWindow from './AdminRestaurantChatWindow';

const AdminRestaurantChatDashboard = () => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleSelectChat = (restaurantId, chatId) => {
    setSelectedRestaurantId(restaurantId);
    setSelectedChatId(chatId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminRestaurantChatList 
        onSelectChat={handleSelectChat} 
        selectedRestaurantId={selectedRestaurantId} 
      />
      {selectedRestaurantId ? (
        <AdminRestaurantChatWindow 
          restaurantId={selectedRestaurantId} 
          chatId={selectedChatId} 
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-orange-50">
          <div className="text-center">
            <MessageCircle size={64} className="text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Restaurant Chat</h3>
            <p className="text-gray-500">Select a restaurant chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurantChatDashboard;