import React from 'react';

interface RetroChevronBannerProps {
  variant?: 'onboarding' | 'stage' | 'report';
  children?: React.ReactNode;
}

export const RetroChevronBanner: React.FC<RetroChevronBannerProps> = ({
  variant = 'onboarding',
  children,
}) => {
  if (variant === 'stage') {
    return (
      <div className="w-full overflow-hidden border-y-[2.5px] border-[#2B1829]">
        <div className="h-2.5 w-full bg-[#E05A47]" />
        <div className="h-2.5 w-full bg-[#FDB827]" />
        <div className="h-2.5 w-full bg-[#F7C1BB]" />
        <div className="h-2 w-full bg-[#2B1829]" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-t-[14px] border-b-[2.5px] border-[#2B1829] bg-[#FFF9E6]">
      <svg
        viewBox="0 0 440 96"
        className="w-full h-auto block"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Background base */}
        <rect width="440" height="96" fill="#2B1829" />
        {/* Tier 1: Deep Plum */}
        <polygon points="0,0 440,0 440,36 220,78 0,36" fill="#2B1829" />
        {/* Tier 2: Crimson Burgundy */}
        <polygon points="0,10 220,54 440,10 440,48 220,90 0,48" fill="#7C1D26" />
        {/* Tier 3: Burnt Terracotta */}
        <polygon points="0,24 220,68 440,24 440,62 220,96 0,62" fill="#C84332" />
        {/* Tier 4: Warm Coral Orange */}
        <polygon points="0,38 220,82 440,38 440,76 220,96 0,76" fill="#E05A47" />
        {/* Tier 5: Mustard Amber */}
        <polygon points="0,52 220,94 440,52 440,88 220,96 0,88" fill="#F5A623" />
        {/* Tier 6: Rose Blush corners */}
        <polygon points="0,68 150,96 0,96" fill="#F7C1BB" />
        <polygon points="440,68 290,96 440,96" fill="#F7C1BB" />
      </svg>
      {children && <div className="px-4 pb-5 pt-2 text-center">{children}</div>}
    </div>
  );
};

export const RetroFooterOrnaments: React.FC<{ variant?: 'onboarding' | 'stage' | 'report' }> = ({
  variant = 'onboarding',
}) => {
  if (variant === 'stage') {
    return (
      <div className="flex items-center justify-center gap-3 py-4" aria-hidden="true">
        <span className="w-3 h-3 rounded-full bg-[#C04332] border border-[#2B1829]" />
        <span className="w-4 h-4 rotate-45 bg-[#FDB827] border border-[#2B1829]" />
        <span className="w-3 h-3 rounded-full bg-[#F29C9F] border border-[#2B1829]" />
        <span className="w-6 h-1.5 rounded-full bg-[#2B1829]" />
        <span className="w-3 h-3 rounded-full bg-[#4D7796] border border-[#2B1829]" />
        <span className="w-4 h-4 rotate-45 bg-[#E05A47] border border-[#2B1829]" />
        <span className="w-3 h-3 rounded-full bg-[#C04332] border border-[#2B1829]" />
      </div>
    );
  }

  if (variant === 'report') {
    return (
      <div className="flex items-center justify-around px-8 py-4" aria-hidden="true">
        <div className="flex flex-col items-center">
          <div className="w-5 h-2.5 rounded-t-full bg-[#E05A47] border border-[#2B1829]" />
          <div className="w-1.5 h-2.5 bg-[#E05A47] border-x border-b border-[#2B1829]" />
        </div>
        <div className="flex items-center -space-x-1">
          <span className="w-4 h-4 rotate-45 bg-[#FDB827] border border-[#2B1829]" />
          <span className="w-3.5 h-3.5 rotate-45 bg-[#F29C9F] border border-[#2B1829] z-10" />
          <span className="w-4 h-4 rotate-45 bg-[#C04332] border border-[#2B1829]" />
        </div>
        <div className="relative w-6 h-6 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] border border-[#2B1829]" />
          <span className="absolute top-0 w-1.5 h-1.5 rounded-full bg-[#5E548E]" />
          <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#5E548E]" />
          <span className="absolute left-0 w-1.5 h-1.5 rounded-full bg-[#5E548E]" />
          <span className="absolute right-0 w-1.5 h-1.5 rounded-full bg-[#5E548E]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-6 py-4" aria-hidden="true">
      <span className="text-[#E05A47] text-lg font-bold">✴</span>
      <div className="relative w-5 h-5 flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] border border-[#2B1829]" />
        <span className="absolute -top-0.5 w-1.5 h-1.5 rounded-full bg-[#2B1829]" />
        <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#2B1829]" />
        <span className="absolute -left-0.5 w-1.5 h-1.5 rounded-full bg-[#2B1829]" />
        <span className="absolute -right-0.5 w-1.5 h-1.5 rounded-full bg-[#2B1829]" />
      </div>
      <span className="w-3.5 h-3.5 rotate-45 bg-[#C04332] border-[1.5px] border-[#2B1829]" />
      <span className="text-[#7C1D26] text-lg font-bold">✴</span>
    </div>
  );
};
