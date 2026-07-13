import * as React from 'react';
import { cn } from '@/lib/utils';

interface OTPContextValue {
  value: string;
  maxLength: number;
  onChange?: (value: string) => void;
  isFocused: boolean;
}

const OTPContext = React.createContext<OTPContextValue | null>(null);

export interface InputOTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  autoFocus?: boolean;
  autoComplete?: string;
}

export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  ({ value, onChange, maxLength, autoFocus, autoComplete, children, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    const handleContainerClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    return (
      <OTPContext.Provider value={{ value, maxLength, onChange, isFocused }}>
        <div
          ref={ref}
          onClick={handleContainerClick}
          className={cn('relative flex items-center gap-2 cursor-text', className)}
          {...props}
        >
          {children}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={maxLength}
            value={value}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              onChange(val);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete={autoComplete}
            className="absolute inset-0 w-full h-full opacity-0 cursor-default pointer-events-none"
            style={{ fontSize: '16px' }}
          />
        </div>
      </OTPContext.Provider>
    );
  }
);
InputOTP.displayName = 'InputOTP';

export type InputOTPGroupProps = React.HTMLAttributes<HTMLDivElement>;

export const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center', className)}
        {...props}
      />
    );
  }
);
InputOTPGroup.displayName = 'InputOTPGroup';

export interface InputOTPSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

export const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const context = React.useContext(OTPContext);
    if (!context) {
      throw new Error('InputOTPSlot must be used within InputOTP');
    }

    const { value, isFocused } = context;
    const char = value[index] || '';
    const isActive = isFocused && value.length === index;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-12 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md bg-transparent text-foreground',
          isActive && 'z-10 ring-1 ring-ring border-ring',
          className
        )}
        {...props}
      >
        {char}
        {isActive && (
          <div className="absolute inset-y-0 right-1/2 translate-x-1/2 w-[2px] h-5 bg-primary animate-pulse" />
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = 'InputOTPSlot';
