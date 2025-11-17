import React, { useState, useEffect } from 'react';
import {
  FiHome,
  FiList,
  FiCalendar,
  FiShoppingBag,
  FiUsers,
  FiPieChart,
  FiTag,
  FiMail,
  FiSettings,
  FiLayers,
  FiImage,
  FiLogOut,
  FiClipboard,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { FaChevronRight, FaChevronDown as FaChevronDownIcon, FaUserSecret } from 'react-icons/fa';
import { CiDeliveryTruck } from "react-icons/ci";
import { MdDeliveryDining, MdOutlineLocalOffer } from "react-icons/md";
import { GrUserAdmin, GrUser } from "react-icons/gr";
import { TicketCheck, Receipt, SquareGanttChart } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    getStarted: true,
    dashboard: false,
    approvals: false,
    restaurants: false,
    offers: false,
    orders: false,
    marketing: false,
    surge: false,
    agents: false,
    admins: false,
    customers: false,
    ticket: false,
    transactions: false,
    taxDelivery: false,
    configure: false,
    settings: false,
    merchants: false,
    promotions: false,
    campaigns: false,
    orderSettings: false,
    generalSettings: false,
    cityConfig: false
  });

  const topLevelSections = ['getStarted', 'marketing', 'surge', 'admins', 'configure', 'settings'];

  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const newState = { ...prev };
      const isCurrentlyExpanded = !!newState[section];
      
      if (isCurrentlyExpanded) {
        newState[section] = false;
      } else {
        if (topLevelSections.includes(section)) {
          topLevelSections.forEach(key => {
            newState[key] = false;
          });
          ['merchants', 'customers', 'promotions', 'campaigns', 'orderSettings', 'generalSettings', 'cityConfig'].forEach(subKey => {
            newState[subKey] = false;
          });
        }
        newState[section] = true;
      }
      return newState;
    });
  };

  const toggleSubSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActivePath = (path) => {
    if (path === '' && location.pathname === '/admin/dashboard') return true;
    return location.pathname.includes(path);
  };

  const isLinkActive = (linkPath) => {
    if (linkPath === '' && location.pathname === '/admin/dashboard') return true;
    if (linkPath && location.pathname.includes(linkPath)) return true;
    return false;
  };

  useEffect(() => {
    const path = location.pathname;
   
    const newExpandedState = { ...expandedSections };
   
    if (path.includes('/admin/dashboard/analytics')) {
      newExpandedState.getStarted = true;
    }
    if (path.includes('restaurant-approvals') || path.includes('approvals')) {
      newExpandedState.approvals = true;
    }
    if (path.includes('restaurant-') || path.includes('products')) {
      newExpandedState.restaurants = true;
      newExpandedState.getStarted = true;
    }
    if (path.includes('marketing') || path.includes('promotions') || path.includes('campaigns')) {
      newExpandedState.marketing = true;
    }
    if (path.includes('surge')) {
      newExpandedState.surge = true;
    }
    if (path.includes('admin-') && (path.includes('add') || path.includes('manage'))) {
      newExpandedState.admins = true;
    }
    if (path.includes('user-') || path.includes('customer')) {
      newExpandedState.customers = true;
      newExpandedState.getStarted = true;
    }
    if (path.includes('merchants')) {
      newExpandedState.merchants = true;
      newExpandedState.getStarted = true;
    }
    if (path.includes('configure') || path.includes('settings') || path.includes('commission') || path.includes('taxes') || path.includes('deliveryfee') || path.includes('city') || path.includes('geofence')) {
      newExpandedState.configure = true;
    }
    if (path.includes('order/table')) {
      newExpandedState.getStarted = true;
    }

    setExpandedSections(newExpandedState);
  }, [location.pathname]);

  const styles = {
    sidebar: {
      background: 'linear-gradient(180deg, #FC8019 0%, #E67300 100%)',
      color: '#FFFFFF',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: '8px 0 25px rgba(252, 128, 25, 0.4)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
    },
    logoSection: {
      padding: '20px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontWeight: '800',
      fontSize: '20px',
      letterSpacing: '-0.01em'
    },
    logoIcon: {
      width: '36px',
      height: '36px',
      background: '#FFFFFF',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      border: '2px solid rgba(255, 255, 255, 0.8)'
    },
    logoText: {
      color: '#FFFFFF',
      fontWeight: '700',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
    },
    panelTitle: {
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.05)'
    },
    panelBadge: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#FC8019',
      borderRadius: '8px',
      padding: '6px 12px',
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    scrollContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px 0',
      '&::-webkit-scrollbar': {
        width: '4px'
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.1)'
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '2px'
      }
    },
    menuSection: {
      marginBottom: '6px'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      borderRadius: '8px',
      margin: '0 8px 4px 8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      fontSize: '14px',
      fontWeight: '600'
    },
    sectionHeaderHover: {
      background: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    sectionHeaderActive: {
      background: 'rgba(255, 255, 255, 0.2)',
      borderLeft: '3px solid #FFFFFF'
    },
    sectionContent: {
      marginLeft: '20px',
      marginTop: '4px'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px',
      color: '#FFFFFF',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      borderRadius: '8px',
      margin: '2px 8px',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      fontSize: '14px'
    },
    menuItemHover: {
      background: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateX(3px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    menuItemActive: {
      background: 'rgba(255, 255, 255, 0.2)',
      borderLeft: '3px solid #FFFFFF',
      transform: 'translateX(3px)'
    },
    subMenu: {
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#FC8019',
      borderRadius: '8px',
      marginTop: '4px',
      padding: '6px 0',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(252, 128, 25, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    subMenuItem: {
      display: 'block',
      padding: '8px 16px',
      color: '#666666',
      textDecoration: 'none',
      transition: 'all 0.15s ease',
      borderRadius: '6px',
      margin: '1px 6px',
      fontSize: '13px',
      fontWeight: '500'
    },
    subMenuItemHover: {
      color: '#FC8019',
      background: 'rgba(252, 128, 25, 0.08)',
      transform: 'translateX(2px)'
    },
    subMenuItemActive: {
      color: '#FC8019',
      background: 'rgba(252, 128, 25, 0.12)',
      fontWeight: '600'
    },
    icon: {
      marginRight: '10px',
      fontSize: '16px',
      minWidth: '20px',
      textAlign: 'center',
      opacity: '0.9'
    },
    navText: {
      fontSize: '13px',
      fontWeight: '500',
      flex: 1
    },
    logoutSection: {
      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.05)'
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#FFFFFF',
      background: 'rgba(255, 255, 255, 0.1)',
      transition: 'all 0.2s ease',
      borderRadius: '8px',
      padding: '12px 14px',
      cursor: 'pointer',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      fontSize: '14px',
      fontWeight: '500'
    },
    logoutButtonHover: {
      background: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoSection}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <span style={{ color: '#FC8019', fontWeight: 'bold', fontSize: '16px' }}>O</span>
          </div>
          <span style={styles.logoText}>ORADO Admin</span>
        </div>
      </div>

      <div style={styles.panelTitle}>
        <div style={styles.panelBadge}>
          Admin Panel
        </div>
      </div>

      <div style={styles.scrollContainer}>
        <div style={{ padding: '6px 0' }}>
          <div style={styles.menuSection}>
            <div
              style={{
                ...styles.sectionHeader,
                ...(expandedSections.getStarted ? styles.sectionHeaderActive : {})
              }}
              onClick={() => toggleSection('getStarted')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.sectionHeaderHover.background;
                e.currentTarget.style.transform = styles.sectionHeaderHover.transform;
                e.currentTarget.style.boxShadow = styles.sectionHeaderHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = expandedSections.getStarted ?
                  styles.sectionHeaderActive.background : styles.sectionHeader.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FiHome style={styles.icon} />
                <span style={{ ...styles.navText, fontWeight: '600' }}>Get Started</span>
              </div>
              {expandedSections.getStarted ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </div>
            {expandedSections.getStarted && (
              <div style={styles.sectionContent}>
                <Link
                  to=""
                  style={styles.menuItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = styles.menuItemHover.background;
                    e.currentTarget.style.transform = styles.menuItemHover.transform;
                    e.currentTarget.style.boxShadow = styles.menuItemHover.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isLinkActive('') ?
                      styles.menuItemActive.background : styles.menuItem.background;
                    e.currentTarget.style.transform = isLinkActive('') ?
                      styles.menuItemActive.transform : 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FiHome style={styles.icon} />
                  <span style={styles.navText}>Home</span>
                </Link>

                <Link
                  to="order/table"
                  style={{
                    ...styles.menuItem,
                    ...(isLinkActive('order/table') ? styles.menuItemActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!isLinkActive('order/table')) {
                      e.currentTarget.style.background = styles.menuItemHover.background;
                      e.currentTarget.style.transform = styles.menuItemHover.transform;
                      e.currentTarget.style.boxShadow = styles.menuItemHover.boxShadow;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLinkActive('order/table')) {
                      e.currentTarget.style.background = styles.menuItem.background;
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <CiDeliveryTruck style={styles.icon} />
                  <span style={styles.navText}>Orders</span>
                </Link>

                <div style={styles.menuSection}>
                  <div
                    style={{
                      ...styles.menuItem,
                      ...(isLinkActive('merchants') || isLinkActive('restaurant-') ? styles.menuItemActive : {})
                    }}
                    onClick={() => toggleSubSection('merchants')}
                    onMouseEnter={(e) => {
                      if (!isLinkActive('merchants') && !isLinkActive('restaurant-')) {
                        e.currentTarget.style.background = styles.menuItemHover.background;
                        e.currentTarget.style.transform = styles.menuItemHover.transform;
                        e.currentTarget.style.boxShadow = styles.menuItemHover.boxShadow;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLinkActive('merchants') && !isLinkActive('restaurant-')) {
                        e.currentTarget.style.background = styles.menuItem.background;
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <FiUsers style={styles.icon} />
                    <span style={styles.navText}>Merchants</span>
                    {expandedSections.merchants ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.merchants && (
                    <div style={styles.subMenu}>
                      <Link
                        to="restaurant-table"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('restaurant-table') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('restaurant-table')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('restaurant-table')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        All Restaurants
                      </Link>
                      <Link
                        to="restaurant-add"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('restaurant-add') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('restaurant-add')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('restaurant-add')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Add Restaurant
                      </Link>
                      <Link
                        to="restaurant-approvals"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('restaurant-approvals') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('restaurant-approvals')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('restaurant-approvals')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Restaurant Approvals
                      </Link>
                      <Link
                        to="restaurant-chats"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('restaurant-chats') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('restaurant-chats')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('restaurant-chats')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Restaurant Chats
                      </Link>
                      <Link
                        to="restaurant-feedback"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('restaurant-feedback') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('restaurant-feedback')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('restaurant-feedback')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Restaurant Reviews
                      </Link>
                      <Link
                        to="merchants-permission"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('merchants-permission') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('merchants-permission')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('merchants-permission')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Permission Management
                      </Link>
                      <Link
                        to="restaurant-permission"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('restaurant-permission') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('restaurant-permission')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('restaurant-permission')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Restaurant Permission
                      </Link>
                    </div>
                  )}
                </div>

                <div style={styles.menuSection}>
                  <div
                    style={{
                      ...styles.menuItem,
                      ...(isLinkActive('user-') || isLinkActive('customer') ? styles.menuItemActive : {})
                    }}
                    onClick={() => toggleSubSection('customers')}
                    onMouseEnter={(e) => {
                      if (!isLinkActive('user-') && !isLinkActive('customer')) {
                        e.currentTarget.style.background = styles.menuItemHover.background;
                        e.currentTarget.style.transform = styles.menuItemHover.transform;
                        e.currentTarget.style.boxShadow = styles.menuItemHover.boxShadow;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLinkActive('user-') && !isLinkActive('customer')) {
                        e.currentTarget.style.background = styles.menuItem.background;
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <GrUser style={styles.icon} />
                    <span style={styles.navText}>Customers</span>
                    {expandedSections.customers ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </div>
                  {expandedSections.customers && (
                    <div style={styles.subMenu}>
                      <Link
                        to="user-managemnet"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('user-managemnet') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('user-managemnet')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('user-managemnet')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Customer Management
                      </Link>
                      <Link
                        to="admin-customer-chat"
                        style={{
                          ...styles.subMenuItem,
                          ...(isLinkActive('admin-customer-chat') ? styles.subMenuItemActive : {})
                        }}
                        onMouseEnter={(e) => {
                          if (!isLinkActive('admin-customer-chat')) {
                            e.currentTarget.style.color = styles.subMenuItemHover.color;
                            e.currentTarget.style.background = styles.subMenuItemHover.background;
                            e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLinkActive('admin-customer-chat')) {
                            e.currentTarget.style.color = styles.subMenuItem.color;
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        Customer Chats
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/admin/dashboard/analytics/order"
                  style={{
                    ...styles.menuItem,
                    ...(isLinkActive('analytics') ? styles.menuItemActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!isLinkActive('analytics')) {
                      e.currentTarget.style.background = styles.menuItemHover.background;
                      e.currentTarget.style.transform = styles.menuItemHover.transform;
                      e.currentTarget.style.boxShadow = styles.menuItemHover.boxShadow;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLinkActive('analytics')) {
                      e.currentTarget.style.background = styles.menuItem.background;
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <FiPieChart style={styles.icon} />
                  <span style={styles.navText}>Analytics</span>
                </Link>
              </div>
            )}
          </div>

          <div style={styles.menuSection}>
            <a
              href="/oradoadmin/admin/agent-slider"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.menuItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.menuItemHover.background;
                e.currentTarget.style.transform = styles.menuItemHover.transform;
                e.currentTarget.style.boxShadow = styles.menuItemHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = styles.menuItem.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FiPieChart style={styles.icon} />
              <span style={styles.navText}>Agent Dashboard</span>
            </a>
          </div>

          <div style={styles.menuSection}>
            <div
              style={{
                ...styles.sectionHeader,
                ...(isLinkActive('marketing') || isLinkActive('promotions') || isLinkActive('campaigns') ? styles.sectionHeaderActive : {})
              }}
              onClick={() => toggleSection('marketing')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.sectionHeaderHover.background;
                e.currentTarget.style.transform = styles.sectionHeaderHover.transform;
                e.currentTarget.style.boxShadow = styles.sectionHeaderHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = (isLinkActive('marketing') || isLinkActive('promotions') || isLinkActive('campaigns')) ?
                  styles.sectionHeaderActive.background : styles.sectionHeader.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SquareGanttChart style={styles.icon} size={16} />
                <span style={{ ...styles.navText, fontWeight: '600' }}>Marketing</span>
              </div>
              {expandedSections.marketing ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </div>
            {expandedSections.marketing && (
              <div style={styles.sectionContent}>
                <div style={styles.subMenu}>
                  <div style={styles.menuSection}>
                    <div
                      style={{
                        ...styles.subMenuItem,
                        ...(isLinkActive('promotions') ? styles.subMenuItemActive : {})
                      }}
                      onClick={() => toggleSubSection('promotions')}
                      onMouseEnter={(e) => {
                        if (!isLinkActive('promotions')) {
                          e.currentTarget.style.color = styles.subMenuItemHover.color;
                          e.currentTarget.style.background = styles.subMenuItemHover.background;
                          e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLinkActive('promotions')) {
                          e.currentTarget.style.color = styles.subMenuItem.color;
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      <span>Promotions</span>
                      {expandedSections.promotions ? <FiChevronUp size={12} style={{ marginLeft: 'auto' }} /> : <FiChevronDown size={12} style={{ marginLeft: 'auto' }} />}
                    </div>
                    {expandedSections.promotions && (
                      <div style={{ marginLeft: '12px', marginTop: '2px' }}>
                        <Link
                          to="admin-promotions-promo"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('admin-promotions-promo') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('admin-promotions-promo')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('admin-promotions-promo')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Promo codes
                        </Link>
                        <Link
                          to="promotions-offer"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('promotions-offer') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('promotions-offer')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('promotions-offer')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Offer
                        </Link>
                        <Link
                          to="promotion-loyalty-points"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('promotion-loyalty-points') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('promotion-loyalty-points')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('promotion-loyalty-points')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Loyalty Points
                        </Link>
                        <Link
                          to="promotion-referal"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('promotion-referal') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('promotion-referal')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('promotion-referal')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Referral
                        </Link>
                      </div>
                    )}
                  </div>
                  <div style={styles.menuSection}>
                    <div
                      style={{
                        ...styles.subMenuItem,
                        ...(isLinkActive('campaigns') ? styles.subMenuItemActive : {})
                      }}
                      onClick={() => toggleSubSection('campaigns')}
                      onMouseEnter={(e) => {
                        if (!isLinkActive('campaigns')) {
                          e.currentTarget.style.color = styles.subMenuItemHover.color;
                          e.currentTarget.style.background = styles.subMenuItemHover.background;
                          e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLinkActive('campaigns')) {
                          e.currentTarget.style.color = styles.subMenuItem.color;
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      <span>Push Campaigns</span>
                      {expandedSections.campaigns ? <FiChevronUp size={12} style={{ marginLeft: 'auto' }} /> : <FiChevronDown size={12} style={{ marginLeft: 'auto' }} />}
                    </div>
                    {expandedSections.campaigns && (
                      <div style={{ marginLeft: '12px', marginTop: '2px' }}>
                        <Link
                          to="/admin/dashboard/campaigns-pushnotification"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('campaigns-pushnotification') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('campaigns-pushnotification')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('campaigns-pushnotification')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Push notification
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.menuSection}>
            <div
              style={{
                ...styles.sectionHeader,
                ...(isLinkActive('surge') ? styles.sectionHeaderActive : {})
              }}
              onClick={() => toggleSection('surge')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.sectionHeaderHover.background;
                e.currentTarget.style.transform = styles.sectionHeaderHover.transform;
                e.currentTarget.style.boxShadow = styles.sectionHeaderHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isLinkActive('surge') ?
                  styles.sectionHeaderActive.background : styles.sectionHeader.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SquareGanttChart style={styles.icon} size={16} />
                <span style={{ ...styles.navText, fontWeight: '600' }}>Surge</span>
              </div>
              {expandedSections.surge ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </div>
            {expandedSections.surge && (
              <div style={styles.sectionContent}>
                <div style={styles.subMenu}>
                  <Link
                    to="admin-surge"
                    style={{
                      ...styles.subMenuItem,
                      ...(isLinkActive('admin-surge') ? styles.subMenuItemActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!isLinkActive('admin-surge')) {
                        e.currentTarget.style.color = styles.subMenuItemHover.color;
                        e.currentTarget.style.background = styles.subMenuItemHover.background;
                        e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLinkActive('admin-surge')) {
                        e.currentTarget.style.color = styles.subMenuItem.color;
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    Surge Selector
                  </Link>
                  <Link
                    to="admin-surge-list"
                    style={{
                      ...styles.subMenuItem,
                      ...(isLinkActive('admin-surge-list') ? styles.subMenuItemActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!isLinkActive('admin-surge-list')) {
                        e.currentTarget.style.color = styles.subMenuItemHover.color;
                        e.currentTarget.style.background = styles.subMenuItemHover.background;
                        e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLinkActive('admin-surge-list')) {
                        e.currentTarget.style.color = styles.subMenuItem.color;
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    List Surge
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div style={styles.menuSection}>
            <div
              style={{
                ...styles.sectionHeader,
                ...(isLinkActive('admin-') && (isLinkActive('add') || isLinkActive('manage')) ? styles.sectionHeaderActive : {})
              }}
              onClick={() => toggleSection('admins')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.sectionHeaderHover.background;
                e.currentTarget.style.transform = styles.sectionHeaderHover.transform;
                e.currentTarget.style.boxShadow = styles.sectionHeaderHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = (isLinkActive('admin-') && (isLinkActive('add') || isLinkActive('manage'))) ?
                  styles.sectionHeaderActive.background : styles.sectionHeader.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GrUserAdmin style={styles.icon} size={16} />
                <span style={{ ...styles.navText, fontWeight: '600' }}>Admins</span>
              </div>
              {expandedSections.admins ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </div>
            {expandedSections.admins && (
              <div style={styles.sectionContent}>
                <div style={styles.subMenu}>
                  <Link
                    to="admin-add"
                    style={{
                      ...styles.subMenuItem,
                      ...(isLinkActive('admin-add') ? styles.subMenuItemActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!isLinkActive('admin-add')) {
                        e.currentTarget.style.color = styles.subMenuItemHover.color;
                        e.currentTarget.style.background = styles.subMenuItemHover.background;
                        e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLinkActive('admin-add')) {
                        e.currentTarget.style.color = styles.subMenuItem.color;
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    Add Admins
                  </Link>
                  <Link
                    to="admin-manage"
                    style={{
                      ...styles.subMenuItem,
                      ...(isLinkActive('admin-manage') ? styles.subMenuItemActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!isLinkActive('admin-manage')) {
                        e.currentTarget.style.color = styles.subMenuItemHover.color;
                        e.currentTarget.style.background = styles.subMenuItemHover.background;
                        e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLinkActive('admin-manage')) {
                        e.currentTarget.style.color = styles.subMenuItem.color;
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    Manage Admins
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div style={styles.menuSection}>
            <Link
              to="admin-ticket"
              style={{
                ...styles.menuItem,
                ...(isLinkActive('admin-ticket') ? styles.menuItemActive : {})
              }}
              onMouseEnter={(e) => {
                if (!isLinkActive('admin-ticket')) {
                  e.currentTarget.style.background = styles.menuItemHover.background;
                  e.currentTarget.style.transform = styles.menuItemHover.transform;
                  e.currentTarget.style.boxShadow = styles.menuItemHover.boxShadow;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLinkActive('admin-ticket')) {
                  e.currentTarget.style.background = styles.menuItem.background;
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <TicketCheck style={styles.icon} size={16} />
              <span style={styles.navText}>Ticket</span>
            </Link>
          </div>

          <div style={styles.menuSection}>
            <div
              style={{
                ...styles.sectionHeader,
                ...(isLinkActive('configure') || isLinkActive('settings') || isLinkActive('commission') || isLinkActive('taxes') || isLinkActive('deliveryfee') || isLinkActive('city') || isLinkActive('geofence') ? styles.sectionHeaderActive : {})
              }}
              onClick={() => toggleSection('configure')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.sectionHeaderHover.background;
                e.currentTarget.style.transform = styles.sectionHeaderHover.transform;
                e.currentTarget.style.boxShadow = styles.sectionHeaderHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = (isLinkActive('configure') || isLinkActive('settings') || isLinkActive('commission') || isLinkActive('taxes') || isLinkActive('deliveryfee') || isLinkActive('city') || isLinkActive('geofence')) ?
                  styles.sectionHeaderActive.background : styles.sectionHeader.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FiSettings style={styles.icon} />
                <span style={{ ...styles.navText, fontWeight: '600' }}>Configure</span>
              </div>
              {expandedSections.configure ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </div>
            {expandedSections.configure && (
              <div style={styles.sectionContent}>
                <div style={styles.subMenu}>
                  <div style={styles.menuSection}>
                    <div
                      style={{
                        ...styles.subMenuItem,
                        ...(isLinkActive('commission') || isLinkActive('deliveryfee') || isLinkActive('taxes') ? styles.subMenuItemActive : {})
                      }}
                      onClick={() => toggleSubSection('orderSettings')}
                      onMouseEnter={(e) => {
                        if (!isLinkActive('commission') && !isLinkActive('deliveryfee') && !isLinkActive('taxes')) {
                          e.currentTarget.style.color = styles.subMenuItemHover.color;
                          e.currentTarget.style.background = styles.subMenuItemHover.background;
                          e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLinkActive('commission') && !isLinkActive('deliveryfee') && !isLinkActive('taxes')) {
                          e.currentTarget.style.color = styles.subMenuItem.color;
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      <span>Order Settings</span>
                      {expandedSections.orderSettings ? <FiChevronUp size={12} style={{ marginLeft: 'auto' }} /> : <FiChevronDown size={12} style={{ marginLeft: 'auto' }} />}
                    </div>
                    {expandedSections.orderSettings && (
                      <div style={{ marginLeft: '12px', marginTop: '2px' }}>
                        <Link
                          to="/admin/dashboard/commission/setup"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('commission') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('commission')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('commission')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Commission
                        </Link>
                        <Link
                          to="admin-deliveryfee-management"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('deliveryfee') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('deliveryfee')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('deliveryfee')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Delivery Fee Settings
                        </Link>
                        <Link
                          to="/admin/dashboard/taxes-charges"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('taxes') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('taxes')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('taxes')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Tax,Fee, & Charges
                        </Link>
                      </div>
                    )}
                  </div>
                  <div style={styles.menuSection}>
                    <div
                      style={{
                        ...styles.subMenuItem,
                        ...(isLinkActive('general') ? styles.subMenuItemActive : {})
                      }}
                      onClick={() => toggleSubSection('generalSettings')}
                      onMouseEnter={(e) => {
                        if (!isLinkActive('general')) {
                          e.currentTarget.style.color = styles.subMenuItemHover.color;
                          e.currentTarget.style.background = styles.subMenuItemHover.background;
                          e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLinkActive('general')) {
                          e.currentTarget.style.color = styles.subMenuItem.color;
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      <span>General Settings</span>
                      {expandedSections.generalSettings ? <FiChevronUp size={12} style={{ marginLeft: 'auto' }} /> : <FiChevronDown size={12} style={{ marginLeft: 'auto' }} />}
                    </div>
                    {expandedSections.generalSettings && (
                      <div style={{ marginLeft: '12px', marginTop: '2px' }}>
                        <Link
                          to="/admin/dashboard/general/preference"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('preference') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('preference')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('preference')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Preference
                        </Link>
                        <Link
                          to="/admin/dashboard/general/terminology"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('terminology') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('terminology')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('terminology')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Terminology
                        </Link>
                      </div>
                    )}
                  </div>
                  <div style={styles.menuSection}>
                    <div
                      style={{
                        ...styles.subMenuItem,
                        ...(isLinkActive('city') || isLinkActive('geofence') ? styles.subMenuItemActive : {})
                      }}
                      onClick={() => toggleSubSection('cityConfig')}
                      onMouseEnter={(e) => {
                        if (!isLinkActive('city') && !isLinkActive('geofence')) {
                          e.currentTarget.style.color = styles.subMenuItemHover.color;
                          e.currentTarget.style.background = styles.subMenuItemHover.background;
                          e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLinkActive('city') && !isLinkActive('geofence')) {
                          e.currentTarget.style.color = styles.subMenuItem.color;
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      <span>City Configuration</span>
                      {expandedSections.cityConfig ? <FiChevronUp size={12} style={{ marginLeft: 'auto' }} /> : <FiChevronDown size={12} style={{ marginLeft: 'auto' }} />}
                    </div>
                    {expandedSections.cityConfig && (
                      <div style={{ marginLeft: '12px', marginTop: '2px' }}>
                        <Link
                          to="/admin/dashboard/city/list"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('city') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('city')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('city')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          City Management
                        </Link>
                        <Link
                          to="/admin/dashboard/geofence"
                          style={{
                            ...styles.subMenuItem,
                            ...(isLinkActive('geofence') ? styles.subMenuItemActive : {})
                          }}
                          onMouseEnter={(e) => {
                            if (!isLinkActive('geofence')) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.background = styles.subMenuItemHover.background;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLinkActive('geofence')) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'none';
                            }
                          }}
                        >
                          Geofence Management
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.menuSection}>
            <div
              style={{
                ...styles.sectionHeader,
                ...(isLinkActive('access-logs') ? styles.sectionHeaderActive : {})
              }}
              onClick={() => toggleSection('settings')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.sectionHeaderHover.background;
                e.currentTarget.style.transform = styles.sectionHeaderHover.transform;
                e.currentTarget.style.boxShadow = styles.sectionHeaderHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isLinkActive('access-logs') ?
                  styles.sectionHeaderActive.background : styles.sectionHeader.background;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FiSettings style={styles.icon} />
                <span style={{ ...styles.navText, fontWeight: '600' }}>Settings</span>
              </div>
              {expandedSections.settings ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </div>
            {expandedSections.settings && (
              <div style={styles.sectionContent}>
                <div style={styles.subMenu}>
                  <Link
                    to="#"
                    style={styles.subMenuItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = styles.subMenuItemHover.color;
                      e.currentTarget.style.background = styles.subMenuItemHover.background;
                      e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = styles.subMenuItem.color;
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="#"
                    style={styles.subMenuItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = styles.subMenuItemHover.color;
                      e.currentTarget.style.background = styles.subMenuItemHover.background;
                      e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = styles.subMenuItem.color;
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Change Password
                  </Link>
                  <Link
                    to="access-logs"
                    style={{
                      ...styles.subMenuItem,
                      ...(isLinkActive('access-logs') ? styles.subMenuItemActive : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!isLinkActive('access-logs')) {
                        e.currentTarget.style.color = styles.subMenuItemHover.color;
                        e.currentTarget.style.background = styles.subMenuItemHover.background;
                        e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLinkActive('access-logs')) {
                        e.currentTarget.style.color = styles.subMenuItem.color;
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    Access Logs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.logoutSection}>
          <div
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.logoutButtonHover.background;
              e.currentTarget.style.transform = styles.logoutButtonHover.transform;
              e.currentTarget.style.boxShadow = styles.logoutButtonHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = styles.logoutButton.background;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FiLogOut size={16} />
              <span style={{ ...styles.navText, marginLeft: '10px' }}>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;