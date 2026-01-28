import React, { useState } from 'react';

interface ChatWidgetProps {
  assistantUrl: string;
  brandColor?: string;
  enabled?: boolean; // Only render if enabled
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  assistantUrl,
  brandColor = '#0891b2', // Default to cyan/teal
  enabled = true
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if not enabled for this town
  if (!enabled) return null;

  return (
    <>
      {/* Floating Button - Teal color, positioned at bottom */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group ${isOpen ? 'hidden' : ''}`}
        style={{ backgroundColor: brandColor }}
        aria-label="Open chat assistant"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          AI Assistant
        </span>
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
