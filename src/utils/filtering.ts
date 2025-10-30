import { Commodity, DataType, Widget, Source } from '../types';

export interface CountryGroup {
  id: string;
  name: string;
  flag: string;
  sources: Source[];
}

/**
 * Groups sources by country/region based on flag emoji
 */
export function groupSourcesByCountry(sources: Source[]): CountryGroup[] {
  const groupsMap = new Map<string, CountryGroup>();

  sources.forEach((source) => {
    // Use flag as the key for grouping
    // Extract a country name from the label (e.g., "US — VPI" -> "US", "EU — VPI" -> "EU")
    let countryId = source.flag;
    let countryName = '';

    // Extract country name from label
    if (source.label.includes(' — ')) {
      countryName = source.label.split(' — ')[0];
    } else if (source.label.includes('(')) {
      // For "East-EU (VPI)" -> "East-EU"
      countryName = source.label.split(' (')[0];
    } else {
      // Fallback: try to extract from label
      countryName = source.label.split(' ')[0];
    }

    // Use first source's label prefix as the country name if not set
    // Prefer actual country names over generic region names (e.g., "Netherlands" over "East-EU")
    if (!groupsMap.has(countryId)) {
      groupsMap.set(countryId, {
        id: countryId,
        name: countryName,
        flag: source.flag,
        sources: [],
      });
    } else {
      // If we already have a group, check if the new name is better
      // Prefer country names that don't contain "East-", "West-", etc. over generic region names
      const existingGroup = groupsMap.get(countryId)!;
      const existingName = existingGroup.name;
      
      // Prefer names that look like actual country names (not starting with generic prefixes)
      const isGenericName = /^(East|West|North|South)[\s-]/.test(existingName);
      const isBetterName = !/^(East|West|North|South)[\s-]/.test(countryName);
      
      if (isGenericName && isBetterName) {
        // Replace generic name with better country name
        existingGroup.name = countryName;
      }
    }

    groupsMap.get(countryId)!.sources.push(source);
  });

  return Array.from(groupsMap.values());
}

/**
 * Gets all source IDs for the selected countries
 */
export function getSourceIdsForCountries(
  selectedCountries: string[],
  countryGroups: CountryGroup[]
): string[] {
  const sourceIds: string[] = [];
  selectedCountries.forEach((countryId) => {
    const group = countryGroups.find((g) => g.id === countryId);
    if (group) {
      sourceIds.push(...group.sources.map((s) => s.id));
    }
  });
  return sourceIds;
}

/**
 * Gets selected countries based on selected sources
 */
export function getSelectedCountriesFromSources(
  selectedSources: string[],
  countryGroups: CountryGroup[]
): string[] {
  const selectedCountries: string[] = [];
  countryGroups.forEach((group) => {
    const allSelected = group.sources.every((source) =>
      selectedSources.includes(source.id)
    );
    if (allSelected && group.sources.length > 0) {
      selectedCountries.push(group.id);
    }
  });
  return selectedCountries;
}

export function filterCommodities(
  commodities: Commodity[],
  searchQuery: string,
  selectedSources: string[]
): Commodity[] {
  let filtered = commodities;

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
  }

  // Filter by selected sources (if any sources are selected)
  if (selectedSources.length > 0) {
    filtered = filtered.filter((commodity) => {
      // Check if commodity has any sources that match selected sources
      const commoditySources = commodity.sources || [];
      return selectedSources.some((sourceId) =>
        commoditySources.includes(sourceId)
      );
    });
  }

  return filtered;
}

export function filterDataTypes(
  dataTypes: DataType[],
  selectedCommodity: Commodity | null,
  selectedSources: string[],
  category: string | null
): DataType[] {
  let filtered = dataTypes;

  // Filter by selected sources (if any sources are selected)
  if (selectedSources.length > 0) {
    filtered = filtered.filter((dt) =>
      dt.sources.some((sourceId) => selectedSources.includes(sourceId))
    );
  }

  // Filter by commodity's available data types
  if (selectedCommodity) {
    filtered = filtered.filter((dt) =>
      selectedCommodity.availableDataTypes.includes(dt.id)
    );
  }

  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter((dt) => dt.group === category);
  }

  return filtered;
}

export function filterWidgets(
  widgets: Widget[],
  selectedDataTypes: Record<string, string[]>, // sourceId -> dataTypeId[]
  selectedSources: string[],
  category: string | null
): Widget[] {
  let filtered = widgets;

  // Filter by selected data types (if any are selected)
  // A widget is shown if it has at least one dataType+source combination that is selected
  const hasSelectedDataTypes = Object.keys(selectedDataTypes).length > 0;
  if (hasSelectedDataTypes) {
    filtered = filtered.filter((widget) => {
      // Check if widget has any source+datatype combination that is selected
      return widget.sources.some((widgetSourceId) => {
        const selectedTypesForSource = selectedDataTypes[widgetSourceId] || [];
        // Widget matches if it has at least one dataType that's selected for this source
        return widget.dataTypes.some((widgetDataTypeId) =>
          selectedTypesForSource.includes(widgetDataTypeId)
        );
      });
    });
  }

  // Filter by selected sources (if any sources are selected)
  if (selectedSources.length > 0) {
    filtered = filtered.filter((widget) =>
      widget.sources.some((sourceId) => selectedSources.includes(sourceId))
    );
  }

  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter((widget) => widget.category === category);
  }

  return filtered;
}

export function groupDataTypesBySource(
  dataTypes: DataType[],
  sources: Array<{ id: string; label: string; flag: string }>
): Array<{ source: { id: string; label: string; flag: string }; dataTypes: DataType[] }> {
  const grouped: Record<string, DataType[]> = {};

  dataTypes.forEach((dt) => {
    dt.sources.forEach((sourceId) => {
      if (!grouped[sourceId]) {
        grouped[sourceId] = [];
      }
      if (!grouped[sourceId].find((d) => d.id === dt.id)) {
        grouped[sourceId].push(dt);
      }
    });
  });

  return sources
    .filter((source) => grouped[source.id])
    .map((source) => ({
      source,
      dataTypes: grouped[source.id],
    }));
}

