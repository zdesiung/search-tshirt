interface BrandLogoProps {
  tone?: 'light' | 'dark';
  showSymbol?: boolean;
  className?: string;
}

export function BrandSymbol({
  className = 'w-6 h-6',
  strokeColor = 'currentColor',
  accentColor = '#B89B5E',
}: {
  className?: string;
  strokeColor?: string;
  accentColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="14" r="5.5" stroke={accentColor} strokeWidth="1.75" />
      <path
        d="M4 21.5C7.5 18.5 11.5 18.5 15 21.5C18.5 24.5 22.5 24.5 26 21.5C28.5 19.4 30.8 19.2 32 20"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 26.5C9.5 24.2 13 24.2 16.5 26.5C20 28.8 23.5 28.8 27 26.5C28.8 25.3 30.2 25.1 31.2 25.4"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
    </svg>
  );
}

export function BrandLogo({
  tone = 'dark',
  showSymbol = true,
  className = '',
}: BrandLogoProps) {
  const textColor = tone === 'light' ? 'text-white' : 'text-[#0B0D0F]';
  const stroke = tone === 'light' ? '#FFFFFF' : '#0B0D0F';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${textColor} ${className}`}>
      {showSymbol && (
        <BrandSymbol className="w-6 h-6 shrink-0" strokeColor={stroke} accentColor="#B89B5E" />
      )}
      <span className="font-display font-extrabold tracking-[0.16em] text-base sm:text-lg whitespace-nowrap">
        BEACH POLO
      </span>
    </span>
  );
}
