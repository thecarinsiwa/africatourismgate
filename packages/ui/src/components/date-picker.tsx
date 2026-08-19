import { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { Input, type InputProps } from './input';

export type DatePickerProps = Omit<InputProps, 'type'> & {
  min?: string;
  max?: string;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { className, inputClassName, min, max, ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      type="date"
      min={min}
      max={max}
      className={cn('[color-scheme:light] dark:[color-scheme:dark]', className)}
      inputClassName={cn(
        '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70',
        'dark:[&::-webkit-calendar-picker-indicator]:invert',
        inputClassName,
      )}
      {...props}
    />
  );
});
