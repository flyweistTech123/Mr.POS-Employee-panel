// src/pages/Setting/ContactSupport.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // ✅ Added i18n
import { useNavigate } from "react-router-dom";
import mailIcon from "@/assets/setting/Mail.svg";
import FAQAccordion from "./FAQAccordion";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { profileTrainingSteps } from "@/walkthrough/steps";

const ContactSupport: React.FC = () => {
  const { t } = useTranslation(); // ✅ Added i18n hook
  
  const navigate = useNavigate();
  const { settingsHighlight, setSettingsHighlight, startTraining } = useWalkthroughStore();
  
  // ✅ Moved inside component so it translates properly
  const FALLBACK_FAQ_DATA = [
    {
      heading: t("General"),
      items: [
        {
          id: 1,
          question: t("How do I create a support ticket?"),
          answer: t("Click the 'Create Ticket' button on this page and fill out the form."),
        },
      ],
    }
  ];

  const [faqs, setFaqs] = useState<any[]>(FALLBACK_FAQ_DATA);

  // Update FAQ when language changes
  useEffect(() => {
    setFaqs(FALLBACK_FAQ_DATA);
  }, [t]);

  useEffect(() => {
    if (settingsHighlight === "contact-support") {
      const timer = setTimeout(() => {
        setSettingsHighlight("");
        navigate("/");
        setTimeout(() => {
          startTraining("profile", profileTrainingSteps);
        }, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [settingsHighlight, setSettingsHighlight, navigate, startTraining]);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span
          className="text-[#00000099] font-bold text-[32px] cursor-pointer"
          onClick={() => navigate("/settings")}
        >
          {t('Settings')}{" "}
        </span>
        <span className="text-black font-bold text-[32px]">
          &gt; {t('Contact Support')}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-8 contact-support-highlight">
        {/* Need Help Card */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div className="border rounded-3xl p-6 flex-1 max-w-[420px] flex flex-col justify-between">
            <div>
              <div className="font-bold text-xl mb-2">{t('Need Help?')}</div>
              <div className="text-sm text-black/80 mb-2">
                {t('Facing any issues, Custom Feature, New App Development, New Project, connect with us we will respond in 24 hrs.')}
                <br />
                <span className="font-bold">{t('Mail')}: hi@uiflow.in</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-t from-[#D32F2F] to-[#6A1B9A] text-white font-semibold text-base shadow">
              <img src={mailIcon} alt="mail" className="w-6 h-6" />
              hi@uiflow.in
            </div>
          </div>
        </div>

        {/* Support Ticket Card */}
        <div className="flex-1 max-w-[420px] border border-[#00000099] rounded-3xl p-6 flex flex-col items-center">
          <div className="font-bold text-2xl mb-6">{t('Support Ticket')}</div>
          <button
            className="w-full max-w-xs py-2 rounded-lg font-semibold text-white text-base mb-6 bg-gradient-to-t from-[#D32F2F] to-[#6A1B9A] shadow hover:opacity-90"
            onClick={() => navigate("/settings/create-ticket")}
          >
            {t('Create Ticket')}
          </button>
          <div className="gradient-border">
            <button
              className="w-[320px] max-w-xs rounded-lg font-semibold gradient-border-inner bg-white hover:bg-gray-50 transition-colors"
              onClick={() => navigate("/settings/tickets")}
            >
              {t('View Raised Ticket')}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="text-3xl font-bold mb-8">{t("FAQ's")}</div>
          <FAQAccordion sections={faqs} />
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;