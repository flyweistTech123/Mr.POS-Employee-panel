// src/pages/Setting/FAQAccordion.tsx
import React, { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQSection {
  heading: string;
  items: FAQItem[];
}

const FAQAccordion: React.FC<{ sections: FAQSection[] }> = ({ sections }) => {
  const [openIds, setOpenIds] = useState<number[]>([]);
  
  const toggleAccordion = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {sections.map((section) => (
        <div key={section.heading} className="mb-8">
          <div className="text-xl font-bold mb-4">{section.heading}</div>
          <div className="flex flex-col gap-6 mt-2">
            {section.items.map((item, idx) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="flex flex-col"
                  style={isOpen ? { background: '#F8EAEE' } : { background: '#F9F9F9' }}
                >
                  <div className={`flex items-center px-8 py-6 rounded-md transition cursor-pointer`}>
                    <div className="flex items-center gap-6 w-full">
                      <div className="text-3xl font-bold text-[#9D96A8] w-12 text-center select-none">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 text-lg font-medium text-black">
                        {item.question}
                      </div>
                      <button
                        className={`w-10 h-10 flex items-center font-extralight justify-center rounded-full ${!isOpen ? 'bg-[#F8EAEE]' : 'bg-white'} text-2xl font-bold focus:outline-none transition-colors`}
                        tabIndex={-1}
                        type="button"
                        onClick={() => toggleAccordion(item.id)}
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                      >
                        {isOpen ? '-' : '+'}
                      </button>
                    </div>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    style={{
                      paddingLeft: isOpen ? 80 : 80,
                      paddingRight: 32,
                      paddingBottom: isOpen ? 24 : 0,
                    }}
                  >
                    <div className="text-black text-lg">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;