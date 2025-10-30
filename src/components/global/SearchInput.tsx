import { useState, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search product',
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative flex-1">
      <div className={`border rounded-[6px] h-8 flex items-center gap-1 pl-2 ${localValue ? 'pr-2 border-indigo-600' : 'pr-3 border-[#e2e8f0]'}`}>
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          <i className={`far fa-search ${localValue ? 'text-[14px] text-[#1e1b4b]' : 'text-[13px] text-[#64748b]'}`}></i>
        </div>
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`flex-1 text-sm bg-transparent outline-none tracking-[-0.07px] leading-6 ${localValue ? 'text-[#1e1b4b] placeholder:text-[#1e1b4b]' : 'text-[#64748b] placeholder:text-[#64748b]'}`}
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="w-6 h-6 flex items-center justify-center shrink-0 hover:bg-gray-100 rounded transition-all duration-200 ease-in-out"
          >
            <i className="far fa-times text-[14px] text-[#1e1b4b]"></i>
          </button>
        )}
      </div>
    </div>
  );
};

