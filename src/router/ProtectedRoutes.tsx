import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

import Dashboard from "@/pages/Dashboard/Dashboard";
import Orders from "@/pages/Orders/Orders";
import Tables from "@/pages/Tables/Tables";
import Payments from "@/pages/Payments/Payments";
import Employees from "@/pages/Employees/Employees";
import Profile from "@/pages/Profile/Profile";
import OrderHistory from "@/pages/OrderHistory/OrderHistory";
import Settings from "@/pages/Setting/Settings";
import NotificationList from "@/pages/Notifications/Notifications";
import ContactSupport from "@/pages/Setting/ContactSupport";
import CreateSupportTicket from "@/pages/Setting/CreateSupportTicket";
import SupportTickets from "@/pages/Setting/SupportTickets";
import SupportTicketDetail from "@/pages/Setting/SupportTicketDetail";
import TeamChats from "@/pages/Chats/TeamChats";
import ClockInOut from "@/pages/Setting/ClockInOut";
import Sale from "@/pages/Sales/Sale";
import TrainingPage from "@/pages/Training/TrainingPage";
import AttendancePage from "@/pages/Attendance/AttendancePage";
// Placeholder Pages (replace with your actual pages)
// const ChatsPage = () => <div className="p-8">Chats Page</div>;
const ProfilePage = () => <div className="p-8">Profile Page</div>;
// const OrderHistoryPage = () => <div className="p-8">Order History Page</div>;
// const TrainingPage = () => <div className="p-8">Training Page</div>;
// const SettingsPage = () => <div className="p-8">Settings Page</div>;

export const ProtectedRoutes = () => (
  <Routes>
    <Route path="/" element={<AppLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="orders" element={<Orders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="table" element={<Tables />} />
      <Route path="payments" element={<Payments />} />
      <Route path="employees" element={<Employees />} />
      {/* <Route path="chats" element={<ChatsPage />} /> */}
      <Route path="profile" element={<ProfilePage />} />
      <Route path="order-history" element={<OrderHistory />} />
      <Route path="training" element={<TrainingPage />} />
      {/* <Route path="team-chats" element={<TrainingPage />} /> */}
      <Route path="settings" element={<Settings />} />
      <Route path="/notifications" element={<NotificationList />} />
      <Route path="settings/contact-support" element={<ContactSupport />} />
      <Route path="settings/create-ticket" element={<CreateSupportTicket />} />
      <Route path="settings/tickets" element={<SupportTickets />} />
      <Route path="settings/clock-in-out" element={<ClockInOut />} />

      <Route path="settings/tickets/:id" element={<SupportTicketDetail />} />
      <Route path="team-chats" element={<TeamChats />} />
      <Route path="sales-performance" element={<Sale />} />
      <Route path="attendance" element={<AttendancePage/>}/>







    </Route>
    {/* Redirect any unmatched protected routes to the default page */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
); 