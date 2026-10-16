import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNavBar from "./MobileNavBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import LogoutModal from "../common/LogoutModal";
import SignOutSuccessModal from "../common/SignOutSuccessModal";
import Header from "./Header";
import MobileLogoutConfirmation from "../common/MobileLogoutConfirmation";
import MobileLogoutSuccess from "../common/MobileLogoutSuccess";
import { useAuthStore } from "@/store/zustandStores";

const mobileRoutes = [
  "/orders",
  "/table",
  "/chats",
  "/profile",
  "/notifications",
  "/team-chats",
];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isMobileConfirmOpen, setMobileConfirmOpen] = useState(false);
  const [isMobileSuccessOpen, setMobileSuccessOpen] = useState(false);
  const { logout } = useAuthStore();

  useEffect(() => {
    if (
      isMobile &&
      !mobileRoutes.some((route) => location.pathname.startsWith(route))
    ) {
      navigate("/orders", { replace: true });
    }
  }, [location, isMobile, navigate]);

  const handleOpenLogoutModal = () => {
    if (isMobile) setMobileConfirmOpen(true);
    else setLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => setLogoutModalOpen(false);

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    setSuccessModalOpen(true);
    setTimeout(() => {
      setSuccessModalOpen(false);
      logout();
    }, 2000);
  };

  const handleCloseMobileConfirm = () => setMobileConfirmOpen(false);

  const handleConfirmMobileLogout = () => {
    setMobileConfirmOpen(false);
    setMobileSuccessOpen(true);
  };

  const handleContinueFromSuccess = () => {
    setMobileSuccessOpen(false);
    logout();
  };

  return (
    <div className="flex bg-gray-50">
      <Sidebar onLogoutClick={handleOpenLogoutModal} />
      <Header />

      {/* Main content: matches sidebar width via padding, not width override */}
      <main className="flex flex-col w-full min-h-0 lg:pt-[88px] lg:pl-[260px]">
        <Outlet />
      </main>

      <MobileNavBar />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
      />
      <SignOutSuccessModal isOpen={isSuccessModalOpen} />

      <MobileLogoutConfirmation
        isOpen={isMobileConfirmOpen}
        onClose={handleCloseMobileConfirm}
        onConfirm={handleConfirmMobileLogout}
      />
      <MobileLogoutSuccess
        isOpen={isMobileSuccessOpen}
        onContinue={handleContinueFromSuccess}
      />
    </div>
  );
};

export default AppLayout;