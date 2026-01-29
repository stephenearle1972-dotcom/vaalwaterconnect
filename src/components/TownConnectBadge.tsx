const TownConnectBadge = () => (
  <div className="flex flex-col items-center justify-center py-6 border-t border-gray-200 mt-8 bg-gray-50">
    <a
      href="https://townconnect.co.za"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="h-10 w-10"
      >
        <rect width="100" height="100" rx="20" fill="#0891b2" />
        <text
          x="50"
          y="65"
          fontFamily="Georgia, serif"
          fontSize="40"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          TC
        </text>
      </svg>
      <div className="flex flex-col">
        <span className="text-base font-semibold text-gray-700">TownConnect</span>
        <span className="text-xs text-gray-500">Part of the TownConnect Network</span>
      </div>
    </a>
    <a
      href="mailto:hello@townconnect.co.za"
      className="text-xs text-gray-500 hover:text-teal-600 mt-3 transition-colors"
    >
      hello@townconnect.co.za
    </a>
  </div>
);

export default TownConnectBadge;
