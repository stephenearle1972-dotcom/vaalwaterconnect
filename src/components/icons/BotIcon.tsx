interface BotIconProps {
  className?: string;
  color?: string;
}

export const BotIcon = ({ className = "w-6 h-6", color = "currentColor" }: BotIconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Antenna */}
    <line x1="12" y1="7" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="2" r="1.5" fill={color} />

    {/* Robot head */}
    <rect x="4" y="7" width="16" height="13" rx="3" stroke={color} strokeWidth="2" />

    {/* Eyes */}
    <circle cx="9" cy="12" r="1.5" fill={color} />
    <circle cx="15" cy="12" r="1.5" fill={color} />

    {/* Mouth - speaker grille */}
    <line x1="8" y1="16" x2="16" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />

    {/* Ear attachments */}
    <rect x="1" y="10" width="3" height="4" rx="1" fill={color} />
    <rect x="20" y="10" width="3" height="4" rx="1" fill={color} />
  </svg>
);

export default BotIcon;
