import { useState, useEffect } from 'react';
import { MessageCircle, ChevronLeft, Menu } from 'lucide-react';
import AdminChatList from './CustomerChatList';
import AdminChatWindow from './AdminCustomerChatWindow';

const AdminCustomerChatDashboard = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectChat = (userId, chatId) => {
    setSelectedUserId(userId);
    setSelectedChatId(chatId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToList = () => {
    setShowSidebar(true);
  };

return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar/Chat List */}
      {(showSidebar || !isMobile) && (
        <div className={`${isMobile ? 'w-full absolute z-10' : 'w-1/3'} h-full bg-white border-r border-gray-200`}>
          <AdminChatList 
            onSelectChat={handleSelectChat} 
            selectedUserId={selectedUserId} 
          />
        </div>
      )}

      {/* Chat Window or Welcome Screen */}
      {(!showSidebar || !isMobile) && (
        <div className={`${isMobile ? 'w-full' : 'flex-1'} h-full flex flex-col`}>
          {selectedUserId ? (
            <AdminChatWindow 
              userId={selectedUserId} 
              chatId={selectedChatId}
              onBack={isMobile ? handleBackToList : null}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-orange-50">
              <div className="text-center p-4">
                <MessageCircle size={64} className="text-orange-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Admin Chat</h3>
                <p className="text-gray-500">Select a customer chat to start messaging</p>
                {isMobile && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    View Chat List
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile menu button when sidebar is hidden */}
      {isMobile && !showSidebar && !selectedUserId && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg"
        >
          <Menu size={24} />
        </button>
      )}
    </div>
  );
};

export default AdminCustomerChatDashboard;