import { useState, useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Source } from '../../types';
import {
  groupSourcesByCountry,
  getSourceIdsForCountries,
  getSelectedCountriesFromSources,
  CountryGroup,
} from '../../utils/filtering';

interface SourceFilterProps {
  sources: Source[];
  selectedSources: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

const ALL_COUNTRIES_ID = '__all__';

export const SourceFilter = ({
  sources,
  selectedSources,
  onChange,
  label = 'All countries',
}: SourceFilterProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Group sources by country
  const countryGroups = useMemo(
    () => groupSourcesByCountry(sources),
    [sources]
  );

  // Get all source IDs for "All countries" option
  const allSourceIds = useMemo(
    () => sources.map((s) => s.id),
    [sources]
  );

  // Determine which country or "All" is currently selected
  const selectedCountryId = useMemo(() => {
    // Check if all sources are selected (means "All countries" is selected)
    const allSourcesSelected =
      selectedSources.length > 0 &&
      allSourceIds.length > 0 &&
      allSourceIds.every((id) => selectedSources.includes(id));

    if (allSourcesSelected || selectedSources.length === 0) {
      return ALL_COUNTRIES_ID;
    }

    // Check if exactly one country's sources are selected
    const selectedCountries = getSelectedCountriesFromSources(
      selectedSources,
      countryGroups
    );
    if (selectedCountries.length === 1) {
      return selectedCountries[0];
    }

    // If multiple countries or partial selection, default to "All"
    return ALL_COUNTRIES_ID;
  }, [selectedSources, countryGroups, allSourceIds]);

  const handleSelectCountry = (countryId: string) => {
    if (countryId === ALL_COUNTRIES_ID) {
      // Select all sources
      onChange(allSourceIds);
    } else {
      // Select only sources from this country
      const countryGroup = countryGroups.find((g) => g.id === countryId);
      if (countryGroup) {
        onChange(countryGroup.sources.map((s) => s.id));
      }
    }
    setOpen(false);
  };

  // Filter countries based on search query
  const filteredCountryGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return countryGroups;
    }
    const query = searchQuery.toLowerCase().trim();
    return countryGroups.filter((country) =>
      country.name.toLowerCase().includes(query)
    );
  }, [countryGroups, searchQuery]);

  const displayLabel =
    selectedCountryId === ALL_COUNTRIES_ID
      ? label
      : countryGroups.find((g) => g.id === selectedCountryId)?.name || label;

  // Reset search when dropdown closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button className="border border-[#e2e8f0] rounded-[6px] h-8 flex items-center gap-1 px-2 py-2.5 transition-all duration-200 ease-in-out hover:bg-gray-50">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <i className="far fa-globe text-[14px] text-[#1e1b4b]"></i>
          </div>
          <span className="text-sm text-[#1e1b4b] tracking-[-0.07px] leading-6 whitespace-nowrap">
            {displayLabel}
          </span>
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <i className="far fa-chevron-down text-[13px] text-[#1e1b4b]"></i>
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          sideOffset={5}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="far fa-search text-[12px] text-[#64748b]"></i>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-in-out"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            {/* All countries option */}
          <DropdownMenu.Item
            onClick={() => handleSelectCountry(ALL_COUNTRIES_ID)}
            className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm transition-all duration-200 ease-in-out ${
              selectedCountryId === ALL_COUNTRIES_ID ? 'bg-gray-50' : ''
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              {selectedCountryId === ALL_COUNTRIES_ID ? (
                <i className="fas fa-circle-check text-[14px] text-indigo-600"></i>
              ) : (
                <div className="w-3 h-3 rounded-full border border-[#cbd5e1]"></div>
              )}
            </div>
            <span>All countries</span>
          </DropdownMenu.Item>

            {/* Country options */}
            {filteredCountryGroups.length > 0 ? (
              filteredCountryGroups.map((country) => {
            const isSelected = selectedCountryId === country.id;
            return (
              <DropdownMenu.Item
                key={country.id}
                onClick={() => handleSelectCountry(country.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm transition-all duration-200 ease-in-out ${
                  isSelected ? 'bg-gray-50' : ''
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {isSelected ? (
                    <i className="fas fa-circle-check text-[14px] text-indigo-600"></i>
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-[#cbd5e1]"></div>
                  )}
                </div>
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </DropdownMenu.Item>
            );
          })
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

