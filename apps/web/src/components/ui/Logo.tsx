import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 80 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Metallic Blue Ring Gradient */}
        <linearGradient id="metallicBlue" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="40%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Metallic Gold Ring Gradient */}
        <linearGradient id="metallicGold" x1="160" y1="40" x2="40" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        {/* Medical Cross Gradient */}
        <linearGradient id="crossGradient" x1="90" y1="75" x2="110" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Soft Drop Shadow Filter for 3D appearance */}
        <filter id="shadowFilter" x="0" y="0" width="200" height="200" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#shadowFilter)">
        {/* Gold Ring - Back segment of crossover */}
        <ellipse
          cx="100"
          cy="100"
          rx="65"
          ry="28"
          transform="rotate(35 100 100)"
          stroke="url(#metallicGold)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Blue Ring - Intersecting front segment */}
        <ellipse
          cx="100"
          cy="100"
          rx="65"
          ry="28"
          transform="rotate(-35 100 100)"
          stroke="url(#metallicBlue)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Small gold overlay ring segment to simulate interlocking 3D weave */}
        <path
          d="M 125 65 A 65 28 0 0 1 153 95"
          transform="rotate(35 100 100)"
          stroke="url(#metallicGold)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Medical Cross Centered */}
        <path
          d="M 94 76 H 106 V 88 H 118 V 100 H 106 V 112 H 94 V 100 H 82 V 88 H 94 Z"
          fill="url(#crossGradient)"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="drop-shadow(0px 2px 3px rgba(15,23,42,0.3))"
        />
      </g>
    </svg>
  );
}
