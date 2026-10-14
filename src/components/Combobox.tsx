import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface ComboboxProps {
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select or type to search...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Sync input text with external value
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Filter options based on user typing
  const filteredOptions = query.trim() === ''
    ? options
    : options.filter((opt) =>
        opt.toLowerCase().includes(query.trim().toLowerCase())
      );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If the user typed something that matches an option exactly, keep it;
        // if they left it partially typed, revert to the currently selected value
        if (value && query !== value) {
          const exactMatch = options.find(
            (o) => o.toLowerCase() === query.trim().toLowerCase()
          );
          if (exactMatch) {
            onChange(exactMatch);
            setQuery(exactMatch);
          } else {
            setQuery(value);
          }
        } else if (!value && query) {
          const exactMatch = options.find(
            (o) => o.toLowerCase() === query.trim().toLowerCase()
          );
          if (exactMatch) {
            onChange(exactMatch);
            setQuery(exactMatch);
          } else {
            setQuery('');
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, query, options, onChange]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    setHighlightedIndex(0);

    // If matches exactly one option or cleared
    if (newQuery === '') {
      onChange('');
    } else {
      const exactMatch = options.find(
        (o) => o.toLowerCase() === newQuery.trim().toLowerCase()
      );
      if (exactMatch) {
        onChange(exactMatch);
      }
    }
  };

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setQuery(opt);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length > 0) {
          handleSelectOption(filteredOptions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery(value || '');
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-3.5 pr-16 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
        />

        {/* Action icons on right: Clear and Dropdown Arrow */}
        <div className="absolute right-0 inset-y-0 flex items-center pr-2.5 gap-1">
          {query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                inputRef.current?.focus();
              }
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:text-slate-300"
            title="Toggle dropdown list"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Floating Options Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 focus:outline-hidden">
          {filteredOptions.length > 0 ? (
            <ul ref={listboxRef} role="listbox" className="divide-y divide-slate-50">
              {filteredOptions.map((opt, index) => {
                const isSelected = opt === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : isSelected
                        ? 'bg-slate-50 text-slate-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3.5 py-4 text-center text-xs text-slate-500">
              No matching street or village name found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
