import React, { useState } from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (savePassword: boolean) => void;
  isLoading?: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [savePassword, setSavePassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl p-16 bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Would you like to Sign out?
        </h2>

        <div className="flex items-center justify-center mb-10">
          <div
            className={`w-6 h-6 mr-4 rounded-md flex items-center justify-center cursor-pointer border-2 ${
              savePassword ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}
            onClick={() => setSavePassword(!savePassword)}
          >
            {savePassword && (
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            )}
          </div>
          <span
            className="text-gray-600 select-none cursor-pointer text-lg"
            onClick={() => setSavePassword(!savePassword)}
          >
            Do you want to save Password
          </span>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-12 py-3 font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            No, Stay
          </button>
          <button
            onClick={() => onConfirm(savePassword)}
            disabled={isLoading}
            className="px-12 py-3 font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {isLoading ? 'Signing out...' : 'Yes, Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;