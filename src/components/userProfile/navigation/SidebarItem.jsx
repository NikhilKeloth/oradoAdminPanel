import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShoppingBag, 
  Crown, 
  Heart, 
  CreditCard, 
  MapPin, 
  Settings 
} from 'lucide-react';

const SidebarItem = ({ name, path }) => {
  const renderIcon = () => {
    const iconClass = "w-5 h-5";
    
    switch(name.toLowerCase()) {
      case 'orders':
        return <ShoppingBag className={iconClass} />;
      case 'swiggy one':
        return <Crown className={iconClass} />;
      case 'favourites':
        return <Heart className={iconClass} />;
      case 'payments':
        return <CreditCard className={iconClass} />;
      case 'addresses':
        return <MapPin className={iconClass} />;
      case 'settings':
        return <Settings className={iconClass} />;
      default:
        return <ShoppingBag className={iconClass} />;
    }
  };

  return (
    <li>
      <NavLink
        to={path}
        className={({ isActive }) => 
          `flex items-center px-4 py-3 rounded-lg transition-colors ${
            isActive 
              ? 'bg-orange-100 text-orange-600' 
              : 'hover:bg-gray-100 text-gray-700'
          }`
        }
      >
        <div className="mr-3">
          {renderIcon()}
        </div>
        <span className="font-medium">{name}</span>
      </NavLink>
    </li>
  );
};

export default SidebarItem;