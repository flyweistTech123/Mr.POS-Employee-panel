import React, { useState, useEffect } from "react";
import editIcon from "@/assets/Edit_2.svg";
import WorkSummary from "./WorkSummary";
import LogoutModal from "@/components/common/LogoutModal";
import SignOutSuccessModal from "@/components/common/SignOutSuccessModal";
import eyeIcon from "@/assets/eye_icon.svg";
import { useNavigate, useLocation } from "react-router-dom";
import chefImg from '@/assets/chef.svg';
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { useAuthStore } from "@/store/zustandStores";
import { useChangePasswordMutation } from '@/redux/api/settingsApi';
import toast from "react-hot-toast";

interface User {
  _id: string;
  Name: string;
  Responsibility_id: {
    Responsibility_id: number;
    Responsibility_name: string;
  };
  Role_id: {
    Role_id: number;
    role_name: string;
  };
  Employee_id: string;
  email: string;
  phone: string;
  user_image: string;
  OnboardingDate: string;
  yearsWithus: number;
  shift_timings?: string;
  total_leave_days?: number;
  leave_left_days?: number;
}

interface ProfileDesktopProps {
  forceSecurityTab?: boolean;
  forceWorkTab?: boolean;
  user?: User;
}

const fieldGradient =
  "linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)";
const tabGradient = "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)";

const ProfileDesktop: React.FC<ProfileDesktopProps> = ({ forceSecurityTab, forceWorkTab, user }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const { isActive, activeTraining, steps, currentStep, complete } = useWalkthroughStore();

  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [selectedTab, setSelectedTab] = useState<
    null | "work" | "personal" | "security" | "sign-out"
  >(null);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  
  // Password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showReNewPassword, setShowReNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");

  useEffect(() => {
    if (location.state && location.state.tab) {
      setSelectedTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeTraining !== 'profile') {
      if (forceSecurityTab && selectedTab !== 'security') {
        setSelectedTab('security');
      } else if (forceWorkTab && selectedTab !== 'work') {
        setSelectedTab('work');
      }
    }
  }, [forceSecurityTab, forceWorkTab, selectedTab, activeTraining]);

  useEffect(() => {
    if (isActive && activeTraining === 'profile') {
      if (steps[currentStep]?.selector === '.profile-work-tab' && selectedTab !== 'work') {
        setSelectedTab('work');
      } else if (steps[currentStep]?.selector === '.profile-personal-tab' && selectedTab !== 'personal') {
        setSelectedTab('personal');
      } else if (steps[currentStep]?.selector === '.profile-security-tab' && selectedTab !== 'security') {
        setSelectedTab('security');
      } else if (steps[currentStep]?.selector === '.profile-sign-out-tab' && selectedTab !== 'sign-out') {
        setSelectedTab('sign-out');
      }
    }
    if (
      isActive &&
      activeTraining === 'profile' &&
      steps[currentStep]?.selector === '.profile-sign-out-tab'
    ) {
      setTimeout(() => {
        complete();
        navigate('/training');
      }, 2000);
    }
  }, [isActive, activeTraining, steps, currentStep, complete, navigate, selectedTab]);

  const handleSignOutClick = () => {
    setLogoutModalOpen(true);
    setSelectedTab("sign-out");
  };

  const handleCloseLogoutModal = () => {
    setLogoutModalOpen(false);
    setSelectedTab(null);
  };

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    setSuccessModalOpen(true);
    setTimeout(() => {
      setSuccessModalOpen(false);
      logout();
      setSelectedTab(null);
    }, 2000);
  };

  const handleSavePassword = async () => {
    if (newPassword !== reNewPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: reNewPassword,
      }).unwrap();
      
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setReNewPassword("");
    } catch (error: any) {
      console.error("Failed to change password", error);
      toast.error(error?.data?.message || "Failed to change password. Please check your current password.");
    }
  };

  return (
    <div className={`pt-10 px-10 profile-highlight relative`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">
          My Profile
          {selectedTab === "personal" && (
            <span className="text-lg font-semibold ml-2">&gt; Personal</span>
          )}
          {selectedTab === "work" && (
            <span className="text-lg font-semibold ml-2">&gt; Work Summary</span>
          )}
          {selectedTab === "security" && (
            <span className="text-lg font-semibold ml-2">&gt; Security</span>
          )}
        </h1>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-lg font-medium text-white profile-work-tab"
            style={{ background: tabGradient, opacity: selectedTab === "work" ? 1 : 0.4 }}
            onClick={() => setSelectedTab("work")}
          >
            Work Summary
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium text-white profile-personal-tab"
            style={{ background: tabGradient, opacity: selectedTab === "personal" ? 1 : 0.4 }}
            onClick={() => setSelectedTab("personal")}
          >
            Personal
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-white profile-security-tab ${selectedTab === 'security' ? 'selected' : ''}`}
            style={{ background: tabGradient, opacity: selectedTab === "security" ? 1 : 0.4 }}
            onClick={() => setSelectedTab("security")}
          >
            Security
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium text-white profile-sign-out-tab"
            style={{ background: tabGradient, opacity: selectedTab === "sign-out" ? 1 : 0.4 }}
            onClick={handleSignOutClick}
          >
            Sign out
          </button>
        </div>
      </div>

      {selectedTab === null && (
        <>
          <div className="font-semibold text-lg mb-4">Employee Details</div>
          <div className="flex gap-8 items-start">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <img
                  src={user?.user_image || chefImg}
                  alt="Profile"
                  className="w-38 h-44 rounded-xl object-cover"
                />
                <button className="absolute top-0 -right-1 bg-white rounded-full shadow">
                  <img src={editIcon} alt="Edit" className="h-7 w-7" />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-6 w-full">
                <div>
                  <div className="font-bold text-gray-700 mb-1">Role</div>
                  <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                    {user?.Role_id?.role_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 mb-1">Responsibility</div>
                  <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                    {user?.Responsibility_id?.Responsibility_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 mb-1">Name</div>
                  <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                    {user?.Name}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 mb-1">Employee id</div>
                  <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                    {user?.Employee_id}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 mb-1">Email</div>
                  <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                    {user?.email}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 mb-1">Phone</div>
                  <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                    {user?.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {selectedTab === "work" && <div className="profile-work-tab"><WorkSummary layout="desktop" /></div>}
      
      {selectedTab === "personal" && (
        <>
          <div className="font-semibold text-lg mb-4 text-[#888]">
            Employee Details
          </div>
          <div className="grid grid-cols-3 gap-6 w-full mb-8">
            <div>
              <div className="font-bold text-gray-700 mb-1">Employee id</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.Employee_id || 'N/A'}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Role</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.Role_id?.role_name || 'N/A'}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Responsibility</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.Responsibility_id?.Responsibility_name || 'N/A'}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Name</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.Name}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Email</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.email}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Phone</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.phone}
              </div>
            </div>
          </div>

          <div className="font-semibold text-lg mb-4 text-[#888]">
            Work Details
          </div>
          <div className="grid grid-cols-3 gap-6 w-full">
            <div>
              <div className="font-bold text-gray-700 mb-1">
                Onboarding Date
              </div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.OnboardingDate}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">year's with us</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.yearsWithus} Year's
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Shift Timings</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.shift_timings || 'N/A'}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Total Leave</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.total_leave_days ? `${user.total_leave_days} Day's` : "0 Day's"}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-1">Leave Left</div>
              <div className="rounded-lg px-4 py-2" style={{ background: fieldGradient }}>
                {user?.leave_left_days ? `${user.leave_left_days} Day's` : "0 Day's"}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedTab === "security" && (
        <div className="mt-8 profile-security-tab">
          <div className="font-semibold text-xl mb-6">Privacy and Password</div>
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <div className="font-bold text-gray-700 mb-1">Email</div>
              <div className="rounded-lg px-4 py-2 bg-gradient-to-r from-[#F8EAEE] to-[#F9F6FB] text-black/80 font-medium">
                {user?.email}
              </div>
            </div>
          </div>
          <div className="font-semibold text-xl mb-4 mt-8">Change Password</div>
          <div className="grid grid-cols-2 gap-8 items-end">
            <div className="mb-4">
              <div className="font-bold text-gray-700 mb-1">
                Enter Current Password
              </div>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="rounded-lg px-4 py-2 w-full bg-gradient-to-r from-[#F8EAEE] to-[#F9F6FB] border border-[#E0E0E0] font-medium"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                >
                  <img src={eyeIcon} alt="Show" className="w-5 h-5" />
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow"
                style={{ minWidth: "170px" }}
                onClick={() => toast.error("Please enter your current password below to change it.")}
              >
                Forget Password
              </button>
            </div>
            
            <div className="mb-4">
              <div className="font-bold text-gray-700 mb-1">
                Enter New Password
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="rounded-lg px-4 py-2 w-full bg-gradient-to-r from-[#F8EAEE] to-[#F9F6FB] border border-[#E0E0E0] font-medium"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowNewPassword((v) => !v)}
                >
                  <img src={eyeIcon} alt="Show" className="w-5 h-5" />
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="font-bold text-gray-700 mb-1">
                Re-enter New Password
              </div>
              <div className="relative">
                <input
                  type={showReNewPassword ? "text" : "password"}
                  className="rounded-lg px-4 py-2 w-full bg-gradient-to-r from-[#F8EAEE] to-[#F9F6FB] border border-[#E0E0E0] font-medium"
                  value={reNewPassword}
                  onChange={(e) => setReNewPassword(e.target.value)}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowReNewPassword((v) => !v)}
                >
                  <img src={eyeIcon} alt="Show" className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSavePassword}
            className="w-full mt-8 py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] disabled:opacity-50 transition-all"
            disabled={
              isChangingPassword || !(currentPassword && newPassword && newPassword === reNewPassword)
            }
          >
            {isChangingPassword ? "Saving..." : "Save Password"}
          </button>
        </div>
      )}

      {isActive && activeTraining === 'profile' && steps[currentStep]?.selector === '.profile-training-tooltip' && (
        <img
          src={chefImg}
          alt="Chef Illustration"
          className="profile-training-tooltip"
          style={{
            position: 'absolute',
            right: 40,
            bottom: 0,
            height: 180,
            zIndex: 20,
          }}
        />
      )}
      
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
      />
      <SignOutSuccessModal isOpen={isSuccessModalOpen} />
    </div>
  );
};

export default ProfileDesktop;