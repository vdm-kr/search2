import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelection } from '../../context/SelectionContext';
import { SearchInput } from '../global/SearchInput';
import { SourceFilter } from '../global/SourceFilter';
import { loadCommodities, loadCommodityGroups, loadSources } from '../../utils/dataLoader';
import { filterCommodities } from '../../utils/filtering';
import { Commodity, CommodityGroup, Source } from '../../types';

export const Step1SelectCommodity = () => {
  const navigate = useNavigate();
  const { state, updateState } = useSelection();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [groups, setGroups] = useState<CommodityGroup[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [commoditiesData, groupsData, sourcesData] = await Promise.all([
          loadCommodities(),
          loadCommodityGroups(),
          loadSources(),
        ]);
        setCommodities(commoditiesData);
        setGroups(groupsData);
        setSources(sourcesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCommodities = filterCommodities(
    commodities,
    state.searchQuery,
    state.selectedSources
  );

  const isSearching = state.searchQuery.trim().length > 0;

  const handleCommoditySelect = (commodity: Commodity) => {
    updateState({
      selectedCommodity: commodity.id,
      selectedCommodityGroup: commodity.group || null,
      currentStep: 2,
    });
    // Navigate with state to pass commodity ID immediately
    navigate('/step2', {
      state: { commodityId: commodity.id, commodityGroupId: commodity.group || null },
    });
  };

  const getCommoditiesByGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];
    return filteredCommodities.filter((c) => group.commodities.includes(c.id));
  };

  const getSourceFlags = (commodity: Commodity) => {
    const commoditySources = commodity.sources || [];
    const visibleSources = sources.filter((s) =>
      commoditySources.includes(s.id)
    );
    const flagsToShow = visibleSources.slice(0, 5);
    const remainingCount = Math.max(0, visibleSources.length - 5);
    return { flagsToShow, remainingCount };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-[12px] shadow-[0px_30px_60px_0px_rgba(0,0,0,0.15)] w-[800px] h-[640px] mx-auto my-8 relative overflow-clip">
      {/* Sticky Top Bar */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10 flex items-center gap-2 p-4">
        <div className="flex-1">
          <SearchInput
            value={state.searchQuery}
            onChange={(value) => updateState({ searchQuery: value })}
            placeholder="Search product"
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

      {/* Left Sidebar */}
      <div className="absolute left-4 top-20 w-[200px]">
        <nav className="flex flex-col gap-1">
          <div className="bg-indigo-50 flex items-center gap-2 h-10 pl-3 pr-1 py-1 rounded-[4px]">
            <span className="text-sm font-medium text-indigo-600 tracking-[-0.07px] leading-6">
              Commodities
            </span>
          </div>
          <button
            onClick={() => navigate('/widgets')}
            className="flex items-center gap-2 h-10 pl-3 pr-4 py-1.5 rounded-[4px] text-sm font-medium text-[#1e1b4b] tracking-[-0.07px] leading-6 transition-all duration-200 ease-in-out hover:bg-gray-50"
          >
            <span>Widgets</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="absolute left-[216px] top-20 right-0 bottom-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isSearching ? (
            /* Search Results View */
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="px-3 py-0"
            >
            {filteredCommodities.map((commodity, index) => {
              const { flagsToShow, remainingCount } = getSourceFlags(commodity);
              const isLast = index === filteredCommodities.length - 1;

              return (
                <div
                  key={commodity.id}
                  onClick={() => handleCommoditySelect(commodity)}
                  className="bg-white rounded-[6px] px-3 py-0 cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-50"
                >
                  <div
                    className={`border-b border-[#e2e8f0] flex flex-col ${
                      isLast ? 'pb-5 pt-4' : 'py-4'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center flex-shrink-0">
                          <p className="text-sm font-medium text-[#1e1b4b] leading-6 tracking-[-0.07px] whitespace-nowrap">
                            {commodity.name}
                          </p>
                          {commodity.popular && (
                            <div className="bg-blue-50 flex items-center px-1 pr-3 rounded-[55px] shrink-0 ml-2">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <i className="fas fa-star text-[14px] text-blue-600"></i>
                              </div>
                              <span className="text-xs font-medium text-blue-600 leading-5">
                                Popular choice
                              </span>
                            </div>
                          )}
                        </div>
                        <i className="fas fa-chevron-right text-[12px] text-[#64748b] shrink-0"></i>
                      </div>
                      <p className="text-sm font-normal text-[#475569] leading-6 tracking-[-0.07px] line-clamp-2">
                        {commodity.description}
                      </p>
                      {flagsToShow.length > 0 && (
                        <div className="flex items-start pl-0 pr-[3px]">
                          {flagsToShow.map((source, idx) => (
                            <div
                              key={source.id}
                              className="border-2 border-white rounded-full w-5 h-5 -mr-1 relative"
                              style={{ zIndex: flagsToShow.length - idx }}
                            >
                              <span className="text-base block leading-5">
                                {source.flag}
                              </span>
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div className="border-2 border-white rounded-full w-5 h-5 -mr-1 bg-white flex items-center justify-center pl-2 pr-0">
                              <span className="text-sm font-medium text-indigo-600 tracking-[-0.07px]">
                                +{remainingCount}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCommodities.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No commodities found
              </div>
            )}
          </motion.div>
        ) : (
          /* Category Browsing View */
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="pl-5 pr-6 py-6"
          >
            <div className="space-y-6">
              {groups.map((group) => {
                const groupCommodities = getCommoditiesByGroup(group.id);
                if (groupCommodities.length === 0) return null;

                return (
                  <div key={group.id} className="flex flex-col gap-3">
                    <h2 className="text-base font-medium text-[#1e1b4b] leading-6 tracking-[-0.08px]">
                      {group.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {groupCommodities.map((commodity) => (
                        <button
                          key={commodity.id}
                          onClick={() => handleCommoditySelect(commodity)}
                          className="bg-[#f1f5f9] flex items-center gap-2 min-w-[230px] px-5 py-4 rounded-[8px] hover:bg-[#e2e8f0] transition-all duration-200 ease-in-out text-left flex-1 max-w-[245px] relative"
                        >
                          <span className="flex-1 text-sm font-medium text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                            {commodity.name}
                          </span>
                          <i className="fas fa-chevron-right text-[12px] text-[#64748b] shrink-0"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

