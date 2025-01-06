import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', href, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-purple-600 text-white hover:bg-purple-700',
      outline: 'border border-current bg-transparent hover:bg-purple-950/10',
    };
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
    };
    
    const classes = twMerge(
      clsx(baseStyles, variants[variant], sizes[size], className)
    );
    
    if (href) {
      return (
        <a href={href} className={classes}>
          {props.children}
        </a>
      );
    }
    
    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
