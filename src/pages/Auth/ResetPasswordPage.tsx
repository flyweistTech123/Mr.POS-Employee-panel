import React from 'react';
import { Link } from 'react-router-dom';
import LeftPanel from '@/components/common/LeftPanel';

import TriaxxLogoImg from '@/assets/tiaxx_logo.svg';
import SuccessCheckIcon from '@/assets/auth/right_tick.svg';

const PasswordUpdatedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-background-mobile p-4 lg:p-0 lg:bg-[#F8F8F8]">
      <div className="flex w-full max-w-sm flex-col rounded-3xl bg-white p-6 shadow-2xl lg:h-screen lg:max-w-none lg:flex-row lg:p-0 lg:shadow-none lg:rounded-none">
        <LeftPanel />

        <div className="w-full lg:w-2/5 lg:p-10 xl:px-20 flex flex-col justify-center">
          <div className="text-center">
            <img
              src={TriaxxLogoImg}
              alt="TRIAXX Logo"
              className="h-10 mx-auto mb-8"
            />
            <img
              src={SuccessCheckIcon}
              alt="Success"
              className="h-16 w-16 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold mb-4">
              <span className="text-green-500">✔</span> Password Updated
            </h1>
            <p className="text-gray-600 mb-8">
              Your new password is ready to use. Please log back into your
              Triaxx account and start your day!
            </p>
            <Link
              to="/login"
              className="inline-block w-full max-w-sm bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdatedPage;