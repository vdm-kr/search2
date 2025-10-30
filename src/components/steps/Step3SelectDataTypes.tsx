import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelection } from '../../context/SelectionContext';
import { SearchInput } from '../global/SearchInput';
import { SourceFilter } from '../global/SourceFilter';
import { loadCommodities, loadDataTypes, loadSources } from '../../utils/dataLoader';
import { filterDataTypes, groupDataTypesBySource } from '../../utils/filtering';
import { Commodity, DataType, Source } from '../../types';

export const Step3SelectDataTypes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, updateState } = useSelection();
  const [commodity, setCommodity] = useState<Commodity | null>(null);
  const [allDataTypes, setAllDataTypes] = useState<DataType[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!state.selectedCommodity) {
        navigate('/step1');
        return;
      }

      try {
        const [commoditiesData, dataTypesData, sourcesData] = await Promise.all([
          loadCommodities(),
          loadDataTypes(),
          loadSources(),
        ]);

        const foundCommodity = commoditiesData.find(
          (c) => c.id === state.selectedCommodity
        );
        setCommodity(foundCommodity || null);
        setAllDataTypes(dataTypesData);
        setSources(sourcesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [state.selectedCommodity, navigate]);

  // Get data types filtered by commodity and sources (but not by category, to get available categories)
  const availableDataTypes = commodity
    ? filterDataTypes(
        allDataTypes,
        commodity,
        state.selectedSources,
        null // Don't filter by category when getting available categories
      )
    : [];

  // Get categories only from data types available for this commodity
  const categories = Array.from(
    new Set(availableDataTypes.map((dt) => dt.group))
  );

  // Now filter with category filter applied (if any)
  const filteredDataTypes = commodity
    ? filterDataTypes(
        allDataTypes,
        commodity,
        state.selectedSources,
        state.selectedDataTypeCategory
      )
    : [];

  const groupedBySource = groupDataTypesBySource(filteredDataTypes, sources);

  const handleToggleDataType = (sourceId: string, dataTypeId: string) => {
    const sourceDataTypes = state.selectedDataTypes[sourceId] || [];
    const isSelected = sourceDataTypes.includes(dataTypeId);

    if (isSelected) {
      // Remove from this source
      const newSourceDataTypes = sourceDataTypes.filter((id) => id !== dataTypeId);
      // Clean up empty source entries
      const cleaned = { ...state.selectedDataTypes };
      if (newSourceDataTypes.length === 0) {
        delete cleaned[sourceId];
      } else {
        cleaned[sourceId] = newSourceDataTypes;
      }
      updateState({ selectedDataTypes: cleaned });
    } else {
      // Add to this source
      updateState({
        selectedDataTypes: {
          ...state.selectedDataTypes,
          [sourceId]: [...sourceDataTypes, dataTypeId],
        },
      });
    }
  };

  const handleSelectAllForSource = (sourceId: string, dataTypes: DataType[]) => {
    const sourceDataTypes = state.selectedDataTypes[sourceId] || [];
    const dataTypeIds = dataTypes.map((dt) => dt.id);
    const allSelected = dataTypeIds.every((id) =>
      sourceDataTypes.includes(id)
    );

    if (allSelected) {
      // Deselect all for this source
      const cleaned = { ...state.selectedDataTypes };
      delete cleaned[sourceId];
      updateState({ selectedDataTypes: cleaned });
    } else {
      // Select all for this source
      updateState({
        selectedDataTypes: {
          ...state.selectedDataTypes,
          [sourceId]: dataTypeIds,
        },
      });
    }
  };

  const handleDeselectAll = () => {
    updateState({ selectedDataTypes: {} });
  };

  const isDataTypeSelectedForSource = (sourceId: string, dataTypeId: string): boolean => {
    return (state.selectedDataTypes[sourceId] || []).includes(dataTypeId);
  };

  const getTotalSelectedCount = (): number => {
    return Object.values(state.selectedDataTypes).reduce(
      (sum, dataTypes) => sum + dataTypes.length,
      0
    );
  };

  const getAllAvailableDataTypes = (): { sourceId: string; dataTypeId: string }[] => {
    const allSelections: { sourceId: string; dataTypeId: string }[] = [];
    
    // Get all source-datatype combinations from filtered data types
    filteredDataTypes.forEach((dt) => {
      dt.sources.forEach((sourceId) => {
        // Only include sources that are in the filtered sources
        if (state.selectedSources.length === 0 || state.selectedSources.includes(sourceId)) {
          allSelections.push({ sourceId, dataTypeId: dt.id });
        }
      });
    });

    return allSelections;
  };

  const isAllSelected = (): boolean => {
    const allAvailable = getAllAvailableDataTypes();
    if (allAvailable.length === 0) return false;

    return allAvailable.every(({ sourceId, dataTypeId }) =>
      isDataTypeSelectedForSource(sourceId, dataTypeId)
    );
  };

  const handleSelectAll = () => {
    const allSelections = getAllAvailableDataTypes();
    const newSelectedDataTypes: Record<string, string[]> = {};

    allSelections.forEach(({ sourceId, dataTypeId }) => {
      if (!newSelectedDataTypes[sourceId]) {
        newSelectedDataTypes[sourceId] = [];
      }
      if (!newSelectedDataTypes[sourceId].includes(dataTypeId)) {
        newSelectedDataTypes[sourceId].push(dataTypeId);
      }
    });

    updateState({ selectedDataTypes: newSelectedDataTypes });
  };

  const handleSelectWidgets = () => {
    const totalCount = getTotalSelectedCount();
    if (totalCount > 0) {
      updateState({ currentStep: 4 });
      navigate('/step4');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!commodity) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Commodity not found</div>
      </div>
    );
  }

  // Group data types by their group/category for "Other" section
  const otherGroupedDataTypes = filteredDataTypes.filter(
    (dt) => !groupedBySource.some((group) => group.dataTypes.includes(dt))
  );

  return (
    <div className="bg-white rounded-[12px] shadow-[0px_30px_60px_0px_rgba(0,0,0,0.15)] w-[800px] h-[640px] mx-auto my-8 flex flex-col relative overflow-clip">
      {/* Sticky Top Bar */}
      <div className="bg-white border-b border-[#e8ebef] sticky top-0 z-[5] flex items-center gap-2 p-4">
        <button
          onClick={() => navigate('/step2')}
          className="border border-[#e2e8f0] rounded-[6px] w-8 h-8 flex items-center justify-center shrink-0 transition-all duration-200 ease-in-out hover:bg-gray-50 z-[4]"
        >
          <i className="far fa-chevron-left text-[14px] text-indigo-600"></i>
        </button>
        <div className="flex-1">
          <SearchInput
            value={state.searchQuery}
            onChange={(value) => updateState({ searchQuery: value })}
            placeholder="Search country or data type"
          />
        </div>
        <div className="flex-shrink-0">
          <SourceFilter
            sources={sources}
            selectedSources={state.selectedSources}
            onChange={(selected) => updateState({ selectedSources: selected })}
          />
        </div>
        <button
          onClick={() => navigate('/')}
          className="border border-[#e2e8f0] rounded-[6px] w-8 h-8 flex items-center justify-center shrink-0 transition-all duration-200 ease-in-out hover:bg-gray-50 z-[1]"
        >
          <i className="far fa-times text-[14px] text-indigo-600"></i>
        </button>
      </div>

      {/* Commodity Header */}
      <div className="flex flex-col gap-1 items-center justify-center pt-5 pb-0 px-6">
        <h1 className="text-[20px] font-medium text-[#1e1b4b] leading-6 tracking-[-0.1px] w-full">
          {commodity.name}
        </h1>
        <p className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px] w-full line-clamp-2">
          {commodity.description}
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => updateState({ selectedDataTypeCategory: null })}
            className={`px-4 py-1 rounded-[61px] text-sm font-normal transition-all duration-200 ease-in-out ${
              !state.selectedDataTypeCategory
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-white text-indigo-600'
            }`}
          >
            All data types
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateState({ selectedDataTypeCategory: category })}
              className={`px-4 py-1 rounded-[61px] text-sm font-normal transition-all duration-200 ease-in-out ${
                state.selectedDataTypeCategory === category
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-white text-indigo-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Data Types List */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 overflow-y-auto px-6 py-0"
      >
        {/* Most Relevant */}
        {groupedBySource.length > 0 && (
          <div className="mb-0">
            <div className="py-3">
              <h2 className="text-base font-medium text-[#1e1b4b] leading-6 tracking-[-0.08px]">
                Most relevant
              </h2>
            </div>
            <div className="flex flex-col gap-3 pb-5">
              {groupedBySource.map(({ source, dataTypes }) => {
                const sourceDataTypes = state.selectedDataTypes[source.id] || [];
                const allSelected = dataTypes.every((dt) =>
                  sourceDataTypes.includes(dt.id)
                );

                return (
                  <div key={source.id} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-4 rounded-[1.667px] overflow-hidden shrink-0">
                        <span className="text-base leading-4 block">{source.flag}</span>
                      </div>
                      <p className="flex-1 text-sm font-medium text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                        {source.label}
                      </p>
                      <button
                        onClick={() => handleSelectAllForSource(source.id, dataTypes)}
                        className="text-sm font-medium text-indigo-600 tracking-[-0.07px] whitespace-nowrap transition-all duration-200 ease-in-out hover:text-indigo-700"
                      >
                        {allSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pl-8">
                      {dataTypes.map((dt) => {
                        const isSelected = isDataTypeSelectedForSource(source.id, dt.id);
                        const isOutdated = commodity?.dataTypeSourceStatus?.[source.id]?.[dt.id] === 'outdated';
                        return (
                          <button
                            key={dt.id}
                            onClick={() => handleToggleDataType(source.id, dt.id)}
                            className={`border rounded-[6px] flex items-center gap-2 px-2.5 py-1.5 min-w-[170px] h-9 transition-all duration-200 ease-in-out relative ${
                              isSelected
                                ? 'border-indigo-600 bg-white'
                                : 'border-[#e2e8f0] bg-white'
                            }`}
                          >
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              {isSelected ? (
                                <i className="fas fa-square-check text-[16px] text-indigo-600"></i>
                              ) : (
                                <i className="fal fa-square text-[16px] text-[#cbd5e1]"></i>
                              )}
                            </div>
                            <span className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px] whitespace-nowrap">
                              {dt.name}
                            </span>
                            {isOutdated && (
                              <span 
                                className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-medium rounded-[4px] whitespace-nowrap cursor-help group relative"
                                title="We are working to update it as soon as possible."
                              >
                                Outdated
                                <span className="absolute bottom-full right-0 mb-2 px-2 py-1.5 bg-[#1e1b4b] text-white text-xs font-normal rounded-[6px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50 pointer-events-none">
                                  We are working to update it as soon as possible.
                                  <span className="absolute top-full right-4 -mt-1 w-2 h-2 bg-[#1e1b4b] rotate-45"></span>
                                </span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Section */}
        {otherGroupedDataTypes.length > 0 && (
          <div className="pb-5">
            <div className="py-3">
              <h2 className="text-base font-medium text-[#1e1b4b] leading-6 tracking-[-0.08px]">
                Other
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {groupedBySource
                .filter((group) => {
                  // Show sources that have data types not in "most relevant"
                  return group.dataTypes.some((dt) =>
                    otherGroupedDataTypes.includes(dt)
                  );
                })
                .map(({ source, dataTypes }) => {
                  const sourceOtherDataTypes = dataTypes.filter((dt) =>
                    otherGroupedDataTypes.includes(dt)
                  );
                  const sourceDataTypes = state.selectedDataTypes[source.id] || [];
                  const allSelected = sourceOtherDataTypes.every((dt) =>
                    sourceDataTypes.includes(dt.id)
                  );

                  return (
                    <div key={source.id} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-4 rounded-[1.667px] overflow-hidden shrink-0">
                          <span className="text-base leading-4 block">{source.flag}</span>
                        </div>
                        <p className="flex-1 text-sm font-medium text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                          {source.label}
                        </p>
                        {sourceOtherDataTypes.length > 1 && (
                          <button
                            onClick={() =>
                              handleSelectAllForSource(source.id, sourceOtherDataTypes)
                            }
                            className="text-sm font-medium text-indigo-600 tracking-[-0.07px] whitespace-nowrap transition-all duration-200 ease-in-out hover:text-indigo-700"
                          >
                            {allSelected ? 'Deselect all' : 'Select all'}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pl-8">
                        {sourceOtherDataTypes.map((dt) => {
                          const isSelected = isDataTypeSelectedForSource(source.id, dt.id);
                          const isOutdated = commodity?.dataTypeSourceStatus?.[source.id]?.[dt.id] === 'outdated';
                          return (
                            <button
                              key={dt.id}
                              onClick={() => handleToggleDataType(source.id, dt.id)}
                              className={`border rounded-[6px] flex items-center gap-2 px-2.5 py-1.5 min-w-[170px] h-9 transition-all duration-200 ease-in-out flex-1 max-w-full relative ${
                                isSelected
                                  ? 'border-indigo-600 bg-white'
                                  : 'border-[#e2e8f0] bg-white'
                              }`}
                            >
                              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                {isSelected ? (
                                  <i className="fas fa-square-check text-[16px] text-indigo-600"></i>
                                ) : (
                                  <i className="fal fa-square text-[16px] text-[#cbd5e1]"></i>
                                )}
                              </div>
                              <span className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px] whitespace-nowrap">
                                {dt.name}
                              </span>
                              {isOutdated && (
                                <span 
                                  className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-medium rounded-[4px] whitespace-nowrap cursor-help group relative"
                                  title="We are working to update it as soon as possible."
                                >
                                  Outdated
                                  <span className="absolute bottom-full right-0 mb-2 px-2 py-1.5 bg-[#1e1b4b] text-white text-xs font-normal rounded-[6px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50 pointer-events-none">
                                    We are working to update it as soon as possible.
                                    <span className="absolute top-full right-4 -mt-1 w-2 h-2 bg-[#1e1b4b] rotate-45"></span>
                                  </span>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {filteredDataTypes.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No data types available for the selected filters
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="bg-white border-t border-[#e8ebef] sticky bottom-0 left-0 right-0 z-[1]">
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px] whitespace-nowrap">
              {getTotalSelectedCount()} selected
            </span>
            <button
              onClick={isAllSelected() ? handleDeselectAll : handleSelectAll}
              className="h-8 px-4 py-1.5 rounded-[6px] text-sm font-medium text-indigo-600 tracking-[-0.07px] transition-all duration-200 ease-in-out hover:bg-indigo-50 whitespace-nowrap flex items-center justify-center"
            >
              {isAllSelected() ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectWidgets}
              disabled={getTotalSelectedCount() === 0}
              className="bg-indigo-600 h-8 px-4 rounded-[6px] text-sm font-medium text-white tracking-[-0.07px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:bg-indigo-700 whitespace-nowrap flex items-center justify-center"
            >
              Select widgets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
