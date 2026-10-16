import React from 'react';
import SuccessIcon from '@/assets/auth/right_tick.svg';

interface SignOutSuccessModalProps {
  isOpen: boolean;
}

const SignOutSuccessModal: React.FC<SignOutSuccessModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-sm p-8 bg-white rounded-3xl shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center">
          <img src={SuccessIcon} alt="Success" className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">Signed Out</h2>
      </div>
    </div>
  );
};

export default SignOutSuccessModal;