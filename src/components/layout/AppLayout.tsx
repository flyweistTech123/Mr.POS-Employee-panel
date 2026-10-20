import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNavBar from "./MobileNavBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import LogoutModal from "../common/LogoutModal";
import Header from "./Header";
import MobileLogoutConfirmation from "../common/MobileLogoutConfirmation";
import { useLogout } from "@/hooks/useLogout"; 

const mobileRoutes = [
  "/orders", "/table", "/chats", "/profile", "/notifications", "/team-chats",
];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isMobileConfirmOpen, setMobileConfirmOpen] = useState(false);
  
  // 👈 Use the unified logout hook
  const { handleLogout, isLoggingOut } = useLogout();

  useEffect(() => {
    if (isMobile && !mobileRoutes.some((route) => location.pathname.startsWith(route))) {
      navigate("/orders", { replace: true });
    }
  }, [location, isMobile, navigate]);

  const handleOpenLogoutModal = () => {
    if (isMobile) setMobileConfirmOpen(true);
    else setLogoutModalOpen(true);
  };

  const onConfirmLogout = async (savePassword: boolean) => {
    setLogoutModalOpen(false);
    await handleLogout(savePassword);
  };

  const onConfirmMobileLogout = async () => {
    setMobileConfirmOpen(false);
    await handleLogout();
  };

  return (
    <div className="flex bg-gray-50">
      <Sidebar onLogoutClick={handleOpenLogoutModal} />
      <Header />

      <main className="flex flex-col w-full min-h-0 lg:pt-[88px] lg:pl-[260px]">
        <Outlet />
      </main>

      <MobileNavBar />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setLogoutModalOpen(false)}
        onConfirm={onConfirmLogout}
        isLoading={isLoggingOut}
      />

      <MobileLogoutConfirmation
        isOpen={isMobileConfirmOpen}
        onClose={() => !isLoggingOut && setMobileConfirmOpen(false)}
        onConfirm={onConfirmMobileLogout}
      />
    </div>
  );
};

export default AppLayout;