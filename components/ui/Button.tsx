import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:
    'bg-primaryAccent text-white shadow-soft transition duration-300 hover:bg-primary-hover focus:ring-primaryAccent focus:ring-offset-2 focus:ring-offset-pageBg',
  secondary:
    'border border-primaryAccent bg-transparent text-darkBase transition duration-300 hover:bg-primaryAccent hover:text-white focus:ring-primaryAccent dark:border-primaryAccent dark:text-white/90 dark:hover:bg-primaryAccent dark:hover:text-white',
  outline:
    'border border-[rgb(var(--color-border))] bg-transparent text-foreground transition hover:bg-cardBg focus:ring-border dark:border-white/20 dark:hover:bg-white/10',
  ghost: 'bg-transparent text-foreground transition hover:bg-cardBg focus:ring-muted-foreground',
  danger: 'bg-danger text-danger-foreground transition hover:opacity-90 focus:ring-danger',
};

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-xl',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-semibold
          focus:outline-none focus:ring-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="-ml-1 mr-2 h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
