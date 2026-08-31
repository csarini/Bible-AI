import React from 'react';

// Si utilizas Vite o Create React App, puedes importar la imagen directamente
// import logoImg from '../assets/El Shaddai_logo.jpg';

interface ChurchLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'full' | 'symbol' | 'horizontal';
  theme?: 'light' | 'dark' | 'sepia' | 'auto';
  imagePath?: string; // Permitir ruta personalizada
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
  variant = 'full',
  theme = 'light',
  imagePath = '/shaddai-logo.png' // Coloca la imagen en tu carpeta /public
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'xs':
        return 'w-8 h-auto';
      case 'sm':
        return 'w-12 h-auto';
      case 'md':
        return 'w-16 h-auto';
      case 'lg':
        return 'w-24 sm:w-32 h-auto';
      case 'xl':
        return 'w-40 sm:w-56 h-auto';
      case 'custom':
      default:
        return 'w-full h-auto';
    }
  };

  const imageSizeClass = getDimensions();
  const isDarkTheme = theme === 'dark';
  const isSepiaTheme = theme === 'sepia';

  const titleTextColor = isDarkTheme
    ? 'text-white'
    : isSepiaTheme
    ? 'text-[#2D2319]'
    : 'text-[#2B3990]'; // Azul marino oficial extraído del logo

  const subtitleTextColor = isDarkTheme
    ? 'text-[#F47B20]'
    : isSepiaTheme
    ? 'text-[#705335]'
    : 'text-[#1A1A1A]';

  // Componente de Imagen del Logotipo
  const LogoImage = (
    <img
      src={imagePath}
      alt="El-Shaddai Logo"
      className={`${imageSizeClass} object-contain drop-shadow-sm`}
    />
  );

  if (variant === 'symbol') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoImage}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
        {LogoImage}
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
        {LogoImage}
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