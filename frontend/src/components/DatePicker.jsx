import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';

/**
 * Themed date picker — ISO (yyyy-MM-dd) string in, string out.
 * Drop-in replacement for <input type="date"> in the glass dark theme.
 */
const DatePicker = ({
  value,            // 'yyyy-MM-dd' or ''
  onChange,         // (iso: string) => void
  placeholder = 'Pick a date',
  testId,
  className = '',
  allowClear = true,
}) => {
  const dateObj = (() => {
    if (!value) return undefined;
    try {
      const d = parseISO(value);
      return isValid(d) ? d : undefined;
    } catch { return undefined; }
  })();

  const display = dateObj ? format(dateObj, 'MMM d, yyyy') : '';

  const handleSelect = (d) => {
    if (!d) { onChange(''); return; }
    onChange(format(d, 'yyyy-MM-dd'));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className={`flex items-center gap-2 w-full px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-left text-white hover:bg-white/[0.08] focus:outline-none focus:border-[#066DF7] transition-all ${className}`}
        >
          <CalendarDays className="w-3.5 h-3.5 text-[#7E88B7] shrink-0" />
          <span className={`flex-1 truncate ${display ? 'text-white' : 'text-[#7E88B7]'}`}>
            {display || placeholder}
          </span>
          {allowClear && value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(''); } }}
              data-testid={testId ? `${testId}-clear` : undefined}
              className="p-0.5 rounded-full hover:bg-white/10 text-[#7E88B7] hover:text-white transition-colors cursor-pointer"
              aria-label="Clear date"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0 bg-[#171718] border-white/10 rounded-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-white"
      >
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={handleSelect}
          initialFocus
          className="rounded-[22px]"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
