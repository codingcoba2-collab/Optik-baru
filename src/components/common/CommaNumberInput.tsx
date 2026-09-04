import React, { useEffect, useState } from 'react';

interface CommaNumberInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
}

export const CommaNumberInput: React.FC<CommaNumberInputProps> = ({
  id,
  value,
  onChange,
  prefix = 'Rp',
  suffix,
  placeholder = '0',
  className = '',
  disabled = false,
  min = 0,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value === 0 && !displayValue) {
      setDisplayValue('0');
    } else if (value !== undefined && value !== null) {
      setDisplayValue(value.toLocaleString('id-ID'));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    const clamped = min !== undefined ? Math.max(min, num) : num;
    setDisplayValue(clamped ? clamped.toLocaleString('id-ID') : '0');
    onChange(clamped);
  };

  return (
    <div className={`relative flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-sky-500 overflow-hidden ${className}`}>
      {prefix && (
        <span className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 select-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-medium"
      />
      {suffix && (
        <span className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 select-none">
          {suffix}
        </span>
      )}
    </div>
  );
};
