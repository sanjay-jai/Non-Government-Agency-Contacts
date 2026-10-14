/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SearchBox } from './components/SearchBox';
import { ContactCard } from './components/ContactCard';
import { ContactRecord } from './types';
import { fetchLiveSheetData, getInitialRecords } from './services/sheetService';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<ContactRecord[]>(() => getInitialRecords());
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedStreet, setSelectedStreet] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ContactRecord[]>([]);

  // Fetch live Google Sheet data on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingLive(true);
    fetchLiveSheetData()
      .then((data) => {
        if (isMounted && data.length > 0) {
          setRecords(data);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingLive(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Unique values of Sheet3 Column B (Agency)
  const agencyOptions = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.agency) set.add(r.agency);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [records]);

  // 2. Unique values of Sheet3 Column C (Location)
  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.location) set.add(r.location);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [records]);

  // 3. Street name / Village Name from Column H for respective Location
  const streetOptions = useMemo(() => {
    if (!selectedLocation) return [];
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.location === selectedLocation) {
        if (selectedAgency) {
          if (r.agency === selectedAgency && r.streetName) {
            set.add(r.streetName);
          }
        } else if (r.streetName) {
          set.add(r.streetName);
        }
      }
    });

    // If filtered by agency yielded nothing, fallback to all streets for that location
    if (set.size === 0 && selectedLocation) {
      records.forEach((r) => {
        if (r.location === selectedLocation && r.streetName) {
          set.add(r.streetName);
        }
      });
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [records, selectedLocation, selectedAgency]);

  // Handle Location change (reset street when location changes)
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setSelectedStreet('');
    setSearchError(null);
  };

  const handleAgencyChange = (agency: string) => {
    setSelectedAgency(agency);
    // If the currently selected street is not valid for this agency, reset street
    setSearchError(null);
  };

  const handleStreetChange = (street: string) => {
    setSelectedStreet(street);
    setSearchError(null);
  };

  // Perform search
  const handleSearch = () => {
    if (!selectedAgency && !selectedLocation && !selectedStreet) {
      setSearchError('Please select Agency, Location, or Street name/Village Name to search.');
      return;
    }

    setSearchError(null);
    setHasSearched(true);

    const filtered = records.filter((r) => {
      const matchAgency = selectedAgency ? r.agency === selectedAgency : true;
      const matchLocation = selectedLocation ? r.location === selectedLocation : true;
      const matchStreet = selectedStreet
        ? r.streetName.toLowerCase() === selectedStreet.trim().toLowerCase() ||
          r.streetName.toLowerCase().includes(selectedStreet.trim().toLowerCase())
        : true;
      return matchAgency && matchLocation && matchStreet;
    });

    setSearchResults(filtered);
  };

  // Reset all filters and search state
  const handleReset = () => {
    setSelectedAgency('');
    setSelectedLocation('');
    setSelectedStreet('');
    setHasSearched(false);
    setSearchResults([]);
    setSearchError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Contact Directory
            </h1>
          </div>
          {isLoadingLive && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Syncing sheet...</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Search Box containing 3 Dropdowns in a single grid */}
        <section aria-label="Search Filters">
          <SearchBox
            agencyOptions={agencyOptions}
            locationOptions={locationOptions}
            streetOptions={streetOptions}
            selectedAgency={selectedAgency}
            selectedLocation={selectedLocation}
            selectedStreet={selectedStreet}
            onAgencyChange={handleAgencyChange}
            onLocationChange={handleLocationChange}
            onStreetChange={handleStreetChange}
            onSearch={handleSearch}
            onReset={handleReset}
          />

          {/* Validation message if needed */}
          {searchError && (
            <div className="mt-3 flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{searchError}</span>
            </div>
          )}
        </section>

        {/* Results Section */}
        <section aria-label="Search Results" className="flex-1">
          {hasSearched ? (
            <div>
              {/* Results Bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Search Results</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {searchResults.length} {searchResults.length === 1 ? 'contact' : 'contacts'}
                  </span>
                </div>
                {(selectedAgency || selectedLocation || selectedStreet) && (
                  <div className="text-xs text-slate-500 hidden sm:block">
                    Filtered by:{' '}
                    {[selectedAgency, selectedLocation, selectedStreet]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                )}
              </div>

              {/* Contact Cards Grid */}
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchResults.map((contact, index) => (
                    <ContactCard
                      key={`${contact.sNo || index}-${contact.registrationNumber || contact.mobileNumber}-${index}`}
                      contact={contact}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">No contacts found</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    No records found matching your selected Agency, Location, and Street/Village name. Try selecting a different street or resetting the filters.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 text-blue-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Ready to Search</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Select your Agency, Location, and Street name/Village Name from the dropdowns above and click Search to view contact details.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
