import React from 'react';

interface ChurchLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'full' | 'symbol' | 'horizontal';
  theme?: 'light' | 'dark' | 'sepia' | 'auto';
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
  variant = 'full',
  theme = 'light'
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'xs':
        return { iconSize: 'w-6 h-6', width: 24, height: 24 };
      case 'sm':
        return { iconSize: 'w-8 h-8', width: 32, height: 32 };
      case 'md':
        return { iconSize: 'w-11 h-11', width: 48, height: 48 };
      case 'lg':
        return { iconSize: 'w-16 h-16 sm:w-20 sm:h-20', width: 80, height: 80 };
      case 'xl':
        return { iconSize: 'w-28 h-28 sm:w-36 sm:h-36', width: 144, height: 144 };
      case 'custom':
      default:
        return { iconSize: 'w-full h-full', width: 160, height: 160 };
    }
  };

  const { iconSize } = getDimensions();
  const isDarkTheme = theme === 'dark';
  const isSepiaTheme = theme === 'sepia';

  // Primary colors matching the official El-Shaddai identity
  const orangeRay = isDarkTheme ? '#FF7A00' : '#F57C00';
  const navyWave = isDarkTheme ? '#2A3B90' : '#142366';
  const cyanWave = isDarkTheme ? '#38BDF8' : '#00AEEF';

  const titleTextColor = isDarkTheme
    ? 'text-white'
    : isSepiaTheme
    ? 'text-[#2D2319]'
    : 'text-[#142366]';

  const subtitleTextColor = isDarkTheme
    ? 'text-[#FED65B]'
    : isSepiaTheme
    ? 'text-[#705335]'
    : 'text-[#142366]';

  // High-fidelity vector SVG symbol matching the exact church emblem
  const SymbolSVG = (
    <svg
      viewBox="0 0 400 280"
      className={`${iconSize} drop-shadow-xs overflow-visible`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rayOrangeGrad" x1="200" y1="20" x2="200" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="60%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        <linearGradient id="navyWaveGradMain" x1="10" y1="130" x2="390" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#142366" />
          <stop offset="40%" stopColor="#1E328A" />
          <stop offset="80%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="cyanWaveGradMain" x1="80" y1="180" x2="380" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00AEEF" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>

        {/* Mask to cut out the crisp Latin Cross in center ray */}
        <mask id="crossCutoutMask">
          <rect width="400" height="280" fill="white" />
          {/* Latin Cross Cutout */}
          <path
            d="M 188 38 H 212 V 58 H 234 V 74 H 212 V 170 H 188 V 74 H 166 V 58 H 188 Z"
            fill="black"
          />
        </mask>
      </defs>

      {/* Sunburst Rays Group (with Cross Cutout applied to center) */}
      <g id="sunburst-rays" mask="url(#crossCutoutMask)">
        {/* Ray 1 (Bottom-left horizontal wing) */}
        <path
          d="M 24 150 C 35 125 58 105 88 90 L 175 145 C 120 162 70 168 24 150 Z"
          fill="url(#rayOrangeGrad)"
        />
        {/* Ray 2 (Mid-left ascending) */}
        <path
          d="M 68 84 C 95 62 130 46 166 38 L 186 138 C 145 145 106 156 68 84 Z"
          fill="url(#rayOrangeGrad)"
        />
        {/* Ray 3 (Center large ray carrying the cross negative) */}
        <path
          d="M 148 30 C 182 20 218 20 252 30 L 222 155 C 208 156 192 156 178 155 Z"
          fill="url(#rayOrangeGrad)"
        />
        {/* Ray 4 (Mid-right ascending) */}
        <path
          d="M 234 38 C 270 46 305 62 332 84 L 332 84 C 294 156 255 145 214 138 Z"
          fill="url(#rayOrangeGrad)"
        />
        {/* Ray 5 (Bottom-right horizontal wing) */}
        <path
          d="M 312 90 C 342 105 365 125 376 150 C 330 168 280 162 225 145 Z"
          fill="url(#rayOrangeGrad)"
        />
      </g>

      {/* Central Solid White Cross for extra clarity and pop */}
      <path
        d="M 188 38 H 212 V 58 H 234 V 74 H 212 V 158 H 188 V 74 H 166 V 58 H 188 Z"
        fill={isDarkTheme ? '#141824' : isSepiaTheme ? '#FAF6EF' : '#FFFFFF'}
        opacity="0.98"
      />

      {/* Primary Bold Navy Wave Ribbon */}
      <path
        d="M 6 135 C 40 200 135 220 215 190 C 295 160 365 175 394 200 C 360 215 285 192 215 198 C 120 206 48 220 6 135 Z"
        fill="url(#navyWaveGradMain)"
      />

      {/* Secondary Vivid Cyan Water Ribbon */}
      <path
        d="M 95 210 C 165 218 250 202 320 196 C 362 192 384 200 396 216 C 368 225 320 212 258 214 C 185 218 135 216 95 210 Z"
        fill="url(#cyanWaveGradMain)"
      />
    </svg>
  );

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{SymbolSVG}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
        {SymbolSVG}
        {showText && (
          <div className="flex flex-col justify-center">
            <span
              className={`font-serif italic font-bold tracking-tight ${titleTextColor} text-xl sm:text-2xl leading-none`}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              El-Shaddai
            </span>
            {showSubtitle && (
              <span
                className={`font-sans font-black tracking-[0.2em] ${subtitleTextColor} text-[9px] sm:text-[10.5px] uppercase mt-1`}
              >
                DIOS TODOPODEROSO
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="flex items-center justify-center">
        {SymbolSVG}
      </div>
      {showText && (
        <div className="mt-3 flex flex-col items-center">
          <span
            className={`font-serif italic font-extrabold tracking-tight ${titleTextColor} text-3xl sm:text-4xl leading-none`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            El-Shaddai
          </span>
          {showSubtitle && (
            <span
              className={`mt-1.5 font-sans font-black tracking-[0.24em] ${subtitleTextColor} text-[11px] sm:text-[13px] uppercase`}
            >
              DIOS TODOPODEROSO
            </span>
          )}
        </div>
      )}
    </div>
  );
};


