/**
 * HistoryLogo - Official History Channel logo component
 * Supports multiple variants and sizes with optional red underline
 */

interface HistoryLogoProps {
  variant?: 'full' | 'compact' | 'mark' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withUnderline?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
  xl: 'h-12',
};

const logoSources: Record<string, string> = {
  full: '/assets/brand/history-logo-full.svg',
  compact: '/assets/brand/history-logo-full.svg', // fallback to full
  mark: '/assets/brand/history-logo-h-only.svg',
  icon: '/assets/brand/history-logo-h-only.svg', // alias for mark
};

export function HistoryLogo({
  variant = 'full',
  size = 'md',
  withUnderline = true,
  className = '',
}: HistoryLogoProps) {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <img
        src={logoSources[variant]}
        alt="HISTORY"
        className={`${sizeClasses[size]} w-auto`}
      />
      {withUnderline && (
        <div className="mt-1 w-full h-[3px] bg-hc-red rounded-full" />
      )}
    </div>
  );
}

export default HistoryLogo;
