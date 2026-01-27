import React, { useState } from 'react';

interface ChatWidgetProps {
  assistantUrl: string;
  brandColor?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  assistantUrl,
  brandColor = '#c4a35a'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-transform hover:scale-110 ${isOpen ? 'hidden' : ''}`}
        style={{ backgroundColor: brandColor }}
        aria-label="Open chat assistant"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-2xl h-[90vh] sm:h-[700px] bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              aria-label="Close chat"
            >
              ✕
            </button>

            {/* Iframe */}
            <iframe
              src={assistantUrl}
              className="w-full h-full border-0"
              title="Chat Assistant"
            />
          </div>
        </div>
      )}
    </>
  );
};
