import { useState } from 'react';
import { BrandSymbol } from './BrandLogo';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  loading?: 'eager' | 'lazy';
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
  loading = 'lazy',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF7F2] via-[#E8D8BD]/45 to-[#0E5A78]/15 text-[#082B3A] p-4 text-center"
      >
        <BrandSymbol className="w-10 h-10 mb-2" strokeColor="#0E5A78" accentColor="#B89B5E" />
        <span className="text-xs font-medium tracking-wider uppercase text-[#082B3A]/75">
          {fallbackLabel || 'BEACH POLO'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
