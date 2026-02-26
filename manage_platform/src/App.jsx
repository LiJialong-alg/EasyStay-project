import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import AuthBootstrap from './components/AuthBootstrap';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const MerchantLayout = lazy(() => import('./layout/MerchantLayout'));
const AdminLayout = lazy(() => import('./layout/AdminLayout'));
const MerchantDashboard = lazy(() => import('./pages/merchant/Dashboard'));
const HotelInfo = lazy(() => import('./pages/merchant/HotelInfo'));
const OrderList = lazy(() => import('./pages/merchant/order/OrderList'));
const ReceptionSettings = lazy(() => import('./pages/merchant/order/ReceptionSettings'));
const RoomStatusCalendar = lazy(() => import('./pages/merchant/room/RoomStatusCalendar'));
const Campaigns = lazy(() => import('./pages/merchant/marketing/Campaigns'));
const Reviews = lazy(() => import('./pages/merchant/Reviews'));
const FinanceManagement = lazy(() => import('./pages/merchant/FinanceManagement'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const MerchantList = lazy(() => import('./pages/admin/merchant/MerchantList'));
const HotelList = lazy(() => import('./pages/admin/hotel/HotelList'));
const AdminOrderList = lazy(() => import('./pages/admin/hotel/OrderList'));
const HotelListingAudit = lazy(() => import('./pages/admin/hotel/HotelListingAudit'));
const HotelRegistrationAudit = lazy(() => import('./pages/admin/hotel/HotelRegistrationAudit'));
const WithdrawalAudit = lazy(() => import('./pages/admin/finance/WithdrawalAudit'));
const PlatformReport = lazy(() => import('./pages/admin/finance/PlatformReport'));
const Announcement = lazy(() => import('./pages/admin/system/Announcement'));
const BannerSettings = lazy(() => import('./pages/admin/system/BannerSettings'));

function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Merchant Routes */}
            <Route path="/merchant" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<MerchantDashboard />} />
              <Route path="hotel/info" element={<HotelInfo />} />
              
              {/* Order Management */}
              <Route path="order/list" element={<OrderList />} />
              <Route path="order/settings" element={<ReceptionSettings />} />
              <Route path="orders" element={<Navigate to="order/list" replace />} /> {/* Legacy redirect */}

              {/* Room Status */}
              <Route path="room/calendar" element={<RoomStatusCalendar />} />
              <Route path="room/price" element={<Navigate to="room/calendar" replace />} />
              <Route path="property-status" element={<Navigate to="room/calendar" replace />} /> {/* Legacy redirect */}

              {/* Marketing */}
              <Route path="marketing/campaigns" element={<Campaigns />} />
              <Route path="marketing" element={<Navigate to="marketing/campaigns" replace />} /> {/* Legacy redirect */}

              <Route path="reviews" element={<Reviews />} />
              <Route path="finance" element={<FinanceManagement />} />
              
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              
              {/* Merchant Management */}
              <Route path="merchant/list" element={<MerchantList />} />
              
              {/* Hotel Management */}
               <Route path="hotel/list" element={<HotelList />} />
               <Route path="hotel/registration-audit" element={<HotelRegistrationAudit />} />
               <Route path="hotel/listing-audit" element={<HotelListingAudit />} />
               <Route path="hotel/orders" element={<AdminOrderList />} />
               
               {/* Finance */}
               <Route path="finance/withdrawals" element={<WithdrawalAudit />} />
               <Route path="finance/report" element={<PlatformReport />} />
               
               {/* System */}
              <Route path="system/announcement" element={<Announcement />} />
              <Route path="system/banner" element={<BannerSettings />} />
              
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthBootstrap>
    </BrowserRouter>
  );
}

export default App;
