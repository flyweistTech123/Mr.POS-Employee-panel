import React from "react";
import { useTranslation } from "react-i18next";
import ChevronDownIconImg from "@/assets/header/down_arrow.svg";

export interface Language {
  code: 'en' | 'fr';
  label: string;
  emoji: string;
}

interface LeftPanelProps {
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  children?: React.ReactNode;
  
  langRef?: React.RefObject<HTMLDivElement | null>;
  langOpen?: boolean;
  setLangOpen?: (v: boolean) => void;
  currentLanguage?: Language;
  currentLanguageCode?: string;
  languages?: Language[];
  onSelectLanguage?: (lang: Language) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  // We remove the hardcoded heading and subheading here
  heading,
  subheading,
  children,
  
  langRef,
  langOpen = false,
  setLangOpen = () => {},
  currentLanguage = { code: 'en', label: 'English', emoji: '🇺🇸' },
  currentLanguageCode = 'en',
  languages = [],
  onSelectLanguage = () => {},
}) => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:relative lg:flex lg:w-3/5 flex-col justify-center items-center text-center text-white p-12 gradient-background overflow-visible">
      <div>
        {/* Use t() for the default text. If a custom heading is passed, use that instead. */}
        {heading || (
          <h1 className="text-[#002B6B] font-bold text-4xl">
            {t('POS that works as hard as you.')} <br />
            {t('and Faster than you.')}
          </h1>
        )}
        
        {subheading || (
          <p className="mt-6 text-lg text-[#414D60] max-w-md">
            {t('Grow without limit with')} <span className="text-primary-gradient">Triaxx</span> {t('and Make timely and accurate decision with real-time reports')}
          </p>
        )}
        
        {children}
      </div>

      {/* Language Dropdown */}
      <div 
        className="lg:absolute mt-8 lg:bottom-12 lg:left-12 relative z-[9999]" 
        ref={langRef}
      >
        <button
          type="button"
          onClick={() => setLangOpen(!langOpen)}
          onMouseDown={(e) => e.stopPropagation()}
          className="bg-white text-[#372B4C] px-4 py-3 rounded-lg flex items-center text-sm font-medium shadow-md hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
        >
          <span className="text-lg leading-none mr-2" aria-hidden="true">
            {currentLanguage.emoji}
          </span>
          <span>{t(currentLanguage.label)}</span>
          <img
            src={ChevronDownIconImg}
            alt="dropdown arrow"
            className={`w-4 h-4 ml-3 transition-transform duration-200 ${
              langOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {langOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[99999]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm text-[#372B4C] hover:bg-gray-50 transition-colors ${
                  lang.code === currentLanguageCode ? "bg-gray-50 font-semibold" : ""
                }`}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {lang.emoji}
                </span>
                <span>{t(lang.label)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;