"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface EthioDvLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: { height: 24, width: 58, className: "h-6 w-auto" },
  sm: { height: 32, width: 78, className: "h-8 w-auto" },
  md: { height: 40, width: 97, className: "h-10 w-auto" },
  lg: { height: 56, width: 136, className: "h-14 w-auto" },
  xl: { height: 80, width: 194, className: "h-20 w-auto" },
};

export const EthioDvLogo: React.FC<EthioDvLogoProps> = ({
  className,
  size = "md",
  showText = false,
  priority = false,
}) => {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className="relative shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105">
        <Image
          src="/logo.png"
          alt="Ethio DV Proxy Logo"
          width={currentSize.width}
          height={currentSize.height}
          priority={priority}
          className={cn(
            "object-contain drop-shadow-xs transition-all",
            currentSize.className
          )}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center font-extrabold tracking-tight text-sm sm:text-base">
            <span className="text-emerald-600 dark:text-emerald-400">Ethio</span>
            <span className="text-amber-500 mx-1">DV</span>
            <span className="text-rose-600 dark:text-rose-400">Proxy</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Electronic Diversity Visa Gateway
          </span>
        </div>
      )}
    </div>
  );
};

export default EthioDvLogo;
