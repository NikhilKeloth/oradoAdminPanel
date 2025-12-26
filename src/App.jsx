import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import RequireAdminAuth from "./components/auth/RequireAdminAuth";
import RequireManagerAuth from "./components/auth/RequireManagerAuth";
import Login from "./pages/Auth/Login";
import Home from "./pages/Home/Home";
import MerchantsPermission from "./pages/Admin/Merchants/Permission";

import AddToCart from "./pages/AddToCart/AddToCart";
import OrderManagement from "./pages/OrderManagement/OrderManagement";

import RestaurantDeatils from "./pages/RestaurantDetails/RestaurantDeatils";
import Signup from "./pages/Auth/SignUp";
import Faq from "./pages/Faq/Faq";

import OrdersPage from "./pages/UserProfile/OrdersPage";
import SettingsPage from "./pages/UserProfile/SettingsPage";
import NotificationPage from "./pages/Notification/NotificationPage";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import { toast,ToastContainer } from "react-toastify";
import RestaurantApprovalsPage from "./pages/Admin/RestaurantApprovalsPage";
import AddRestaurantPage from "./pages/Admin/AddRestaurant";
import RestaurantList from "./pages/Admin/RestaurantList";
import CreateMenu from "./pages/Admin/CreateMenu";
import RestaurantCategories from "./pages/Admin/RestaurantCategories";
import CategoryItems from "./pages/Admin/CategoryItems";
import RestaurantPermissions from "./pages/Admin/RestaurantPermissions";
import Dashboard from "./pages/Admin/Dashboard";
import AddAdmin from "./pages/Admin/AddAdmin";
import AdminManage from "./pages/Admin/AdminManage";
import Ticket from "./pages/Admin/ticketSystem/Ticket";
import RestaurantCommission from "./pages/Admin/RestaurantCommission";
import AdminCustomerChatDashboard from "./pages/Admin/CustomerChats/AdminCustomerChatDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import AdminCustomerOrderPage from "./pages/Admin/customer/AdminCustomerOrderPage";
import RefundComponent from "./pages/Admin/customer/RefundComponent";
import RefundTransactionsPage from "./pages/Admin/RefundTransactionsPage";
import AccessLogs from "./pages/Admin/AdminAccessLogs";
import RestaurantOrderList from "./pages/Admin/RestaurantOrderList";
import RestaurantReviewsPage from "./pages/Admin/reviews/RestaurantReviewPage";
import RestaurantListforReviews from "./pages/Admin/reviews/RestaurantListforReviews";

import OrderAdminPanel from "./pages/Admin/Analytics/OrderAdminPanel";
import OffersManagement from "./pages/Admin/Marketing/promotions/offers/OffersManagement"

import CreateOffer from "./pages/Admin/Offer/CreateOffer";
import AssignOffer from "./pages/Admin/Offer/AssignOffer";
import RestaurantEarningsTable from "./pages/Admin/RestaurantEarningsTable";
import RestaurantListForOrders from "./pages/Admin/RestaurantListForOrders";
import SurgeAreaSelector from "./pages/Admin/Surge/SurgeAreaSelector";
import AdminNotificationSender from "./pages/Admin/notifications/AdminNotificationSender";
import SurgeAreaList from "./pages/Admin/Surge/SurgeAreaList";
import TaxManagementPanel from "./pages/Admin/FeeAndTaxSettings/TaxManagementPanel";
import DeliveryFeeSettings from "./pages/Admin/FeeAndTaxSettings/DeliveryFeeSettings";
import RestaurantEarningsv from "./pages/Admin/restauratnsEarnigs/RestaurantEarningsv";
import AdminRestaurantChatDashboard from "./pages/Admin/RestaurantChats/AdminRestaurantChatDashboard";
import OrderTable from "./pages/Admin/order/OrderTable";
import CityCreationMap from "./pages/Admin/city/CityCreationMap";
import PromoCodeManager from "./pages/Admin/Marketing/promotions/promoCode/ PromoCodeManager";
import CreateLoyaltyPoints from "./pages/Admin/Marketing/promotions/loyalityPoints/CreateLoyaltyPoints";
import RestaurantTables from "./pages/Admin/Restaurants/RestaurantTables";
import RestaurantConfigPage from "./pages/Admin/Restaurants/RestaurantConfigPage";
import AdminAgentDashboardLayout from "./layouts/AdminAgentDashboardLayout";
import AgentDashboardSettings from "./pages/AgentAdminDashboard/AgentDashboardSettings";
import CustomerCampaigns from "./pages/Admin/Marketing/pushCampaigns/CustomerCampaigns";
import RestaurantCampaigns from "./pages/Admin/Marketing/pushCampaigns/RestaurantCampaigns";
import RolesPage from "./pages/Admin/configure/userSettings/Rolepage";
import AddRolePage from "./pages/Admin/configure/userSettings/AddRolepage";
import ManagerManagement from "./pages/Admin/configure/userSettings/ManagerManagement";
import AddManager from "./pages/Admin/configure/userSettings/AddManager";
import EditRolePage from "./pages/Admin/configure/userSettings/EditRolePage";
import EditManager from "./pages/Admin/configure/userSettings/EditManager";
import CatalogPage  from "./pages/Admin/products/CatalogPage ";
import ReferralPromotions from "./pages/Admin/Marketing/promotions/referal/ReferralPromotions";
import CommissionPage from "./pages/Admin/configure/orderSettings/CommissionPage";
import DeliverySettings from "./pages/Admin/configure/orderSettings/DeliverySettings";
import TerminologyPage from "./pages/Admin/configure/generalSettings/TerminologyPage";
import ManagerLogin from "./pages/Admin/manager/ManagerLogin";
import PreferencesPage from "./pages/Admin/configure/generalSettings/PerferencePage";
import OrderSettings from "./pages/Admin/configure/orderSettings/OrderSettings";
import CancellationSettings from "./pages/Admin/configure/orderSettings/CancellationSettings";
import DiscountPage from "./pages/Admin/Marketing/promotions/discount/DiscountPage";
import OrderDetails from "./pages/Admin/order/OrderDetail";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import CustomerDetailsPage from "./pages/Admin/customer/CustomerDetails";
import MerchantDetailsPage from "./pages/Admin/Restaurants/MerchantDetailsPage";
import MerchantConfiguration from "./pages/Admin/Restaurants/MerchantConfiguration";

//  import MerchantCataloguePage from "./pages/Admin/Restaurants/CataloguePage";
import RestaurantsPrepDelay from "./pages/Admin/RestaurantsPrepDelay"

import MerchantCataloguePage from "./pages/Admin/Restaurants/MerchentCataloguePage";
import CatelogTreeView from "./pages/Admin/Restaurants/CatelogTreeView";


import GeofencePage from "./pages/Admin/configure/cityConfig/GeofencePage";
import GeofenceAdder from "./pages/Admin/configure/cityConfig/GeofenceAdder";
import CityList from "./pages/Admin/configure/cityConfig/CityList";
import TemplatesPage from "./pages/AgentAdminDashboard/settings/templates/TemplatesPage";
import SettingsPageLayout from "./pages/AgentAdminDashboard/SettingsPageLayout";
import AllocationMethodSelector from "./components/AgentAdminDashboard/SettingPage/AutoAllocation/AllocationMethodSelector";
import AutoAllocationPage from "./pages/AgentAdminDashboard/AutoAllocationPage";
import ThemeSettingsPage from "./pages/AgentAdminDashboard/settings/ThemeSettingsPage/ThemeSettingsPage";
import MerchantCampaigns from "./pages/Admin/Marketing/pushCampaigns/MerchantCampaigns";
import AddTemplate from "./pages/AgentAdminDashboard/settings/templates/AddTemplate";
import TaxesFeesCharges from "./pages/Admin/configure/orderSettings/TaxFeesCharge/TaxesFeesCharges";
import PromoCodesPage from "./pages/Admin/Marketing/promotions/promoCode/PromoCodesPage";
import AnalyticsDashboardSwitcher from "./pages/Admin/Analytics/AnalyticsDashboardSwitcher";
import OrderAnalytics from "./pages/Admin/Analytics/OrderAnalytics";
import UserAnalytics from "./pages/Admin/Analytics/UserAnalytics";
import OfferPage from "./pages/Admin/Offer/OfferManagement";



import IncentivePlanModal from "./components/AgentAdminDashboard/IncentivePlan/IncentivePlanModal";
import IncentivePlan from "./pages/AgentAdminDashboard/IncentivePlan/IncentivePlan";
import MitlestonManagment from "./pages/AgentAdminDashboard/milteStoneRule/MitlestonManagment";
import AgentDeliveryDash from "./pages/AgentAdminDashboard/AgentDeliveryDash";
import AgentDetails from "./pages/AgentAdminDashboard/AgentDetails";
import AgentList from "./pages/AgentAdminDashboard/AgentList";
import AgentSelfieLogs from "./pages/AgentAdminDashboard/AgentSelfieLogs";
import AdminOfferUsage from "./pages/AgentAdminDashboard/AdminOfferUsage";
import AdminPromoCodeUsage from "./pages/AgentAdminDashboard/AdminPromoCodeUsage";
import { onMessageListener, requestFirebaseNotificationPermission } from "./services/firebase";
import { saveFcmToken } from "./apis/adminApis/adminFuntionsApi";



import AgentKYCApproval from "./pages/AgentAdminDashboard/AgentKYCApproval";
import AgentLeave from "./pages/AgentAdminDashboard/AgentLeave";
import AgentWarningsApprovalsTerminationsDash from "./pages/AgentAdminDashboard/AgentWarningsApprovalsTerminationsDash";
import AgentWarningTerm from "./pages/AgentAdminDashboard/AgentWarningTerm";
import AgentDeliveryFeeSettings from "./pages/AgentAdminDashboard/AgentDeliveryFeeSettings";
import AgentMilestonePanel from "./pages/AgentAdminDashboard/AgentMilestonePanel"
import AgentIncentivePlanSettings from "./pages/AgentAdminDashboard/AgentIncentivePlanSettings"
import AgentCODDashboard from "./pages/AgentAdminDashboard/AgentCODDashboard";
import PushNotificationPanel from "./pages/Admin/Marketing/pushCampaigns/PushNotificationPanel";
import AgentDashboardLayout from "./layouts/AgentDashboardLayout";
import AgentAdminPayout from "./pages/AgentAdminDashboard/AgentAdminPayout";
import DetailedOrderTable from "./pages/Admin/Analytics/DetailedOrderTable";
// In your App.js or routing file
// import CreateOrderPage from './pages/Admin/order/CreateOrderPage';
import CreateOrderPage from "./pages/Admin/order/CreateOrderPage";

function App() {
  // const [count, setCount] = useState(0);

useEffect(() => {
  const initFCM = async () => {
    try {
      const token = await requestFirebaseNotificationPermission();
      if (token) {
        console.log("Token ready to send:", token);

        const storedUser =  localStorage.getItem("adminToken");
        console.log("User from localStorage:", storedUser);

        if (storedUser) {
          const platform = "web"; // Set platform as 'web'
          const appVersion = "1.0.0"; // Example app version
          const osVersion = navigator.userAgent; // Example OS version
          const deviceId = "web-browser"; // Example device ID for web

          await saveFcmToken({
            token,
            platform,
            deviceId,
            appVersion,
            osVersion,
          });
        }
      }
    } catch (err) {
      console.error("FCM token error:", err);
    }
  };

  initFCM();

  const unsubscribe = onMessageListener((payload) => {
    const title = payload?.notification?.title || "Notification";
    const body = payload?.notification?.body || "";

    // Show toast
    toast.info(`${title}: ${body}`, {
      position: "top-right",
      autoClose: 5000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Play notification sound
    const audio = new Audio("/sound/bell.wav");
    audio.addEventListener("ended", () => {
      const speech = new SpeechSynthesisUtterance(body);
      speech.lang = "en-IN";
      window.speechSynthesis.speak(speech);
    });
    audio.play().catch((e) => console.log("Audio play error:", e));
  });

  return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
  };
}, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard/order/table" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard/order/table" replace />} />
        {/* <Route 
  path="/admin/dashboard/order/create" 
  element={<CreateOrderPage />} 
/> */}
        {/* <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />

        <Route path="/add-to-cart" element={<AddToCart />} />
        <Route path="/order-management" element={<OrderManagement />} /> */}
{/* 
        <Route path="/restaurant/details/:restaurantId" element={<RestaurantDeatils />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/notifications" element={<NotificationPage />} /> */}

        {/* User Profile */}
        {/* <Route path="/my-account" element={<OrdersPage />} />
        <Route path="/my-account/orders" element={<OrdersPage />} />
        <Route path="/my-account/settings" element={<SettingsPage />} /> */}





        






        {/* Admin-Side */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdminAuth>
              <AdminDashboard />
            </RequireAdminAuth>
          }
        >      
      



          <Route index element={<Dashboard />} />
          {/* restaurant-section */}
          <Route path="restaurant-approvals" element={<RestaurantApprovalsPage />} />
          <Route path="restaurant-add" element={<AddRestaurantPage />} />
          <Route path="restaurant-edit" element={<RestaurantList />} />

          <Route path="restaurant-table" element={<RestaurantTables/>} />
            <Route path="restaurant-config" element={<RestaurantConfigPage/>}  />
         


          <Route path="restaurant-createmenu" element={<CreateMenu />} />
          <Route path="restaurant-permission" element={<RestaurantPermissions />} />
          <Route path="restaurant-commission" element={<RestaurantCommission />} />
          <Route path="restaurant-order" element={<RestaurantListForOrders />} />
          <Route path="restaurant-feedback" element={<RestaurantListforReviews />} />
          <Route path="restaurant-earnings" element={<RestaurantEarningsTable />} />
          <Route path="restaurant-chats" element={<AdminRestaurantChatDashboard />} />
          <Route path="restaurant-earnings-summary/:restaurantId" element={<RestaurantEarningsv />} />
           <Route path="restaurant-delay-report" element={<RestaurantsPrepDelay/>} />
        {/* Restuarnt */}
            <Route path="merchants/merchant-details/:id" element={<MerchantDetailsPage/>}  />
               <Route path="merchants/merchant-config/:id" element={<MerchantConfiguration/>}/>
               {/* <Route path="merchants/merchant-catelogue/:id" element={<MerchantCataloguePage/>}/> */}
               <Route path="merchants/merchant-catelogue/:id" element={<CatelogTreeView/>}/>

               



        

          {/* offer section */}
          <Route path="create-offer" element={<CreateOffer />} />
          <Route path="assign-offer" element={<AssignOffer />} />
          <Route path="manage-offer" element={<OfferPage />} />

          
          {/* admin-section */}
          <Route path="admin-add" element={<AddAdmin />} />
          <Route path="admin-manage" element={<AdminManage />} />
          <Route path="admin-ticket" element={<Ticket />} />
          <Route path="access-logs" element={<AccessLogs />} />
          <Route path="admin-surge" element={<SurgeAreaSelector />} />
          <Route path="admin-surge-list" element={<SurgeAreaList/>}    />

          
          {/* products */}
              {/* CatalogPage */}
       
                <Route path="merchants/catalogue" element={<CatalogPage />} />


          {/* Customer  */}

              <Route path="customer/:customerId/details" element={<CustomerDetailsPage/>}  />

       {/* Add Merchants Permission route */}
        <Route path="merchants-permission" element={<MerchantsPermission />} />   

       {/* alaytics */}

       <Route path="analytics/order" element={<OrderAnalytics/>  }    />

       <Route path="analytics/user" element={<UserAnalytics/>  }    />

       <Route path="analytics/order-details" element={<DetailedOrderTable/>} />

          {/* marketing */}

             { /* >>  promotions */}
                {/* promocodes */}
                {/* <Route path="admin-promotions-promo" element={<PromoCodeManager/>}  /> */}
                <Route path="admin-promotions-promo" element={<PromoCodesPage/>}  />
                <Route  path="promotions-offer"  element={<OffersManagement/>} />
            
                <Route  path="promotions-offer-report"  element={<AdminOfferUsage/>} />
                <Route  path="promotions-promo-report"  element={<AdminPromoCodeUsage/>} />


             
                {/* <Route  path="promotions-discount"  element={<DiscountPage/>} /> */}
                <Route path="promotion-loyalty-points" element={<CreateLoyaltyPoints/>} />
                <Route path="promotion-referal" element={<ReferralPromotions/>}  />
                {/* push campings */}
                <Route path="campaigns-customer" element={<CustomerCampaigns/>} />
                <Route path="campaigns-customer" element={<CustomerCampaigns/>} />

                <Route path="campaigns-restaurant" element={<RestaurantCampaigns/>} />
               
                <Route path="campaigns-merchant" element={<MerchantCampaigns/>} />
                <Route path="campaigns-pushnotification" element={<PushNotificationPanel/>} />
                








                {/* configration menu */}
                   {/* >  user settings */}
                <Route path="role-management" element={<RolesPage/>} />
                <Route path="role-add" element={<AddRolePage/>} />
                <Route path="role-edit/:roleId" element={<EditRolePage/>}  />

                <Route path="manger-managment" element={<ManagerManagement/>}  />
                <Route path="manger-add" element={<AddManager/>}  />
                <Route path="manger-edit/:mangerId" element={<EditManager/>}  />

                 {/* order settings */}
                <Route path="order/settings" element={<OrderSettings/>} />
                <Route path="order/cancel-settings" element={<CancellationSettings/>}  />
                <Route path="commission/setup" element={<CommissionPage/>}  />

                <Route path="delivery-settings"  element={<DeliverySettings/>}  />

                <Route path="taxes-charges"  element={<TaxesFeesCharges/>}  />

                    
             {/* general settings */}
             <Route path="general/terminology" element={<TerminologyPage/>} />
             <Route path="general/preference" element={<PreferencesPage/>} />


            {/* city config */}
            <Route path="geofence" element={<GeofencePage/>} />
            <Route path="geofence/add" element={<GeofenceAdder/>} />
            <Route path="city/list" element={<CityList/>} />


            <Route path="admin-tax-management" element={<TaxManagementPanel />}    />
             <Route path="admin-deliveryfee-management" element={<DeliveryFeeSettings />}    />



          {/* admin-customer section */}
          <Route path="admin-customer-chat" element={<AdminCustomerChatDashboard />} />
          <Route path="user-managemnet" element={<UserManagement />} />
          <Route path="customer/:userId/orders" element={<AdminCustomerOrderPage />} />
          <Route path="order/refund" element={<RefundComponent />} />
          <Route path="refund/transactions" element={<RefundTransactionsPage />} />
        
          <Route path="notification-sender"  element={<AdminNotificationSender/>} />
        <Route path="order/table" element={<OrderTable/>} />
        <Route path="order/table/details/:orderId" element={<OrderDetails/>}  />
        <Route path="add-city" element={<CityCreationMap/>}  />
         <Route path="order/create" element={<CreateOrderPage />} />
          {/* Add more nested routes as needed */}
        </Route>
        <Route path="/restaurants/:restaurantId/orders" element={<RestaurantOrderList />} />

        <Route path="/restaurants/:restaurantId/categories" element={<RestaurantCategories />} />
        <Route path="/feedback/restaurants/:restaurantId" element={<RestaurantReviewsPage />} />
        <Route
          path="/restaurants/:restaurantId/categories/:categoryId/items"
          element={<CategoryItems />}
/>














<Route path="admin/agent-slider" element={<AgentDashboardLayout />}>
  {/* Index route (default child route) */}
  <Route index element={<AdminAgentDashboardLayout />} />
  
  {/* Nested routes */}
  <Route path="theme-settings" element={<ThemeSettingsPage />} />
  <Route path="agent/approval" element={<AgentKYCApproval />} />
  
  {/* Settings routes */}
  <Route path="settings/incentive-plan" element={<AgentIncentivePlanSettings/>} />
  <Route path="settings/milestone" element={<MitlestonManagment/>} />
  <Route path="settings/allocation-method" element={<AutoAllocationPage/>} />
  
  {/* Agent management routes */}
  <Route path="agent/list" element={<AgentList/>} />
  <Route path="agent/details/:agentId" element={<AgentDetails/>} />
  <Route path="agent-selfie" element={<AgentSelfieLogs/>} />
  <Route path="agent-leave" element={<AgentLeave/>} />
  <Route path="warnings-termination" element={<AgentWarningTerm/>} />
  

  
  
  {/* Agent settings routes */}
  <Route path="agent-earnings-settings" element={<AgentDeliveryFeeSettings/>} />
  <Route path="agent-milestone-rules" element={<AgentMilestonePanel/>} />
  <Route path="agent-incentive-plan" element={<AgentIncentivePlanSettings />} />
  <Route path="agent-cod-limit" element={<AgentCODDashboard />} />
  <Route path="agent-payout" element={<AgentAdminPayout />} />

</Route>









<Route  path="/admin/agent-dashboard" element={<AdminAgentDashboardLayout/>} />

{/* <Route path="/admin/agent-dashboard/settings" element={<AgentDashboardSettings />} /> */}

{/* <Route path="/admin/agent-dashboard/settings/template"  element={<TemplatesPage/>}   /> */}

<Route path="/admin/agent-dashboard/settings" element={<SettingsPageLayout />}>


     <Route path="allocation-method" element={<AutoAllocationPage/>}  />
     <Route path="template"  element={<TemplatesPage/>}/>
     <Route path="template/add"  element={<AddTemplate/>}/>

     <Route path="theme-settings" element={<ThemeSettingsPage/>}  />
    
  {/* <Route path="preferences" element={<PreferencesPage />} /> */}
  {/* <Route path="theme" element={<ThemeSettingsPage />} />
  <Route path="profile" element={<ProfilePage />} />
  <Route path="geo-fence" element={<GeoFencePage />} />
  <Route path="auto-allocation" element={<AutoAllocationPage />} /> */}
</Route>

{/* manager logins */}
    <Route path="/manger/login" element={<ManagerLogin/>}/>

<Route
  path="/manager/dashboard"
  element={
    <RequireManagerAuth>
      <ManagerDashboard/>
    </RequireManagerAuth>
  }
></Route>
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
