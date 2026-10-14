import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Combobox } from './Combobox';

interface SearchBoxProps {
  agencyOptions: string[];
  locationOptions: string[];
  streetOptions: string[];
  selectedAgency: string;
  selectedLocation: string;
  selectedStreet: string;
  onAgencyChange: (agency: string) => void;
  onLocationChange: (location: string) => void;
  onStreetChange: (street: string) => void;
  onSearch: () => void;
  onReset: () => void;
  isSearching?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  agencyOptions,
  locationOptions,
  streetOptions,
  selectedAgency,
  selectedLocation,
  selectedStreet,
  onAgencyChange,
  onLocationChange,
  onStreetChange,
  onSearch,
  onReset,
  isSearching = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
      <form onSubmit={handleSubmit}>
        {/* 3 Dropdowns in a Single Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Agency Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="agency-select"
              className="text-sm font-semibold text-slate-800"
            >
              Agency
            </label>
            <div className="relative">
              <select
                id="agency-select"
                value={selectedAgency}
                onChange={(e) => onAgencyChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 px-3.5 pr-10 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition-all cursor-pointer"
              >
                <option value="">Select Agency</option>
                {agencyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Location Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="location-select"
              className="text-sm font-semibold text-slate-800"
            >
              Location
            </label>
            <div className="relative">
              <select
                id="location-select"
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 px-3.5 pr-10 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition-all cursor-pointer"
              >
                <option value="">Select Location</option>
                {locationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. Street name/Village Name Dropdown with Typing Assistance */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="street-select"
              className="text-sm font-semibold text-slate-800"
            >
              Street name/Village Name
            </label>
            <Combobox
              id="street-select"
              options={streetOptions}
              value={selectedStreet}
              onChange={onStreetChange}
              placeholder={
                selectedLocation
                  ? 'Type or select Street / Village Name'
                  : 'Select Location first'
              }
              disabled={!selectedLocation}
            />
          </div>
        </div>

        {/* Search & Reset Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};
