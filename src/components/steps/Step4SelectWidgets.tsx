import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelection } from '../../context/SelectionContext';
import { loadWidgets, loadSources, loadCommodities } from '../../utils/dataLoader';
import { filterWidgets } from '../../utils/filtering';
import { Widget, Source, Commodity } from '../../types';

export const Step4SelectWidgets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, updateState } = useSelection();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [commodity, setCommodity] = useState<Commodity | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [widgetsData, sourcesData, commoditiesData] = await Promise.all([
          loadWidgets(),
          loadSources(),
          loadCommodities(),
        ]);
        setWidgets(widgetsData);
        setSources(sourcesData);
        const foundCommodity = commoditiesData.find(
          (c) => c.id === state.selectedCommodity
        );
        setCommodity(foundCommodity || null);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [state.selectedCommodity, navigate]);

  const filteredWidgets = filterWidgets(
    widgets,
    state.selectedDataTypes,
    state.selectedSources,
    selectedCategory
  );

  const categories = Array.from(
    new Set(
      widgets
        .filter((w) =>
          filterWidgets(
            [w],
            state.selectedDataTypes,
            state.selectedSources,
            null
          ).length > 0
        )
        .map((w) => w.category)
        .filter((c): c is string => !!c)
    )
  );

  const widgetsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = filteredWidgets.filter((w) => w.category === cat);
    return acc;
  }, {} as Record<string, Widget[]>);

  const handleToggleWidget = (widgetId: string) => {
    if (state.selectedWidgets.includes(widgetId)) {
      updateState({
        selectedWidgets: state.selectedWidgets.filter((id) => id !== widgetId),
      });
    } else {
      updateState({
        selectedWidgets: [...state.selectedWidgets, widgetId],
      });
    }
  };

  const isAllSelected = (): boolean => {
    if (filteredWidgets.length === 0) return false;
    return filteredWidgets.every((widget) =>
      state.selectedWidgets.includes(widget.id)
    );
  };

  const handleSelectAll = () => {
    const allWidgetIds = filteredWidgets.map((w) => w.id);
    updateState({ selectedWidgets: allWidgetIds });
  };

  const handleDeselectAll = () => {
    updateState({ selectedWidgets: [] });
  };

  const handleDeselectCategory = (category: string) => {
    const categoryWidgetIds = widgetsByCategory[category]?.map((w) => w.id) || [];
    updateState({
      selectedWidgets: state.selectedWidgets.filter(
        (id) => !categoryWidgetIds.includes(id)
      ),
    });
  };

  const handleAddToDashboard = () => {
    // TODO: Implement add to dashboard logic
    console.log('Add to dashboard:', state.selectedWidgets);
  };

  const handleSaveAsNew = () => {
    // TODO: Implement save as new logic
    console.log('Save as new:', state.selectedWidgets);
  };

  const getSourceLabels = (widget: Widget) => {
    return widget.sources
      .map((sourceId) => sources.find((s) => s.id === sourceId))
      .filter((s): s is Source => !!s)
      .slice(0, 2); // Show max 2 sources as per screenshot
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] shadow-[0px_30px_60px_0px_rgba(0,0,0,0.15)] w-[800px] h-[640px] mx-auto my-8 flex flex-col relative overflow-clip">
      {/* Header */}
      <div className="bg-white border-b border-[#f1f5f9] sticky top-0 z-[5] flex items-center gap-2 p-4">
        <button
          onClick={() => navigate('/step3')}
          className="border border-[#e2e8f0] rounded-[6px] w-8 h-8 flex items-center justify-center shrink-0 transition-all duration-200 ease-in-out hover:bg-gray-50 z-[4]"
        >
          <i className="far fa-chevron-left text-[14px] text-indigo-600"></i>
        </button>
        <h1 className="text-sm font-medium text-[#1e1b4b] leading-6 tracking-[-0.07px] whitespace-nowrap flex-1 pl-1">
          Select widgets
        </h1>
        <button
          onClick={() => navigate('/')}
          className="border border-[#e2e8f0] rounded-[6px] w-8 h-8 flex items-center justify-center shrink-0 transition-all duration-200 ease-in-out hover:bg-gray-50 z-[1]"
        >
          <i className="far fa-times text-[14px] text-indigo-600"></i>
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 overflow-y-auto"
      >
        {/* Title Section */}
        <div className="px-6 pt-5 pb-0">
          <h2 className="text-base font-medium text-[#1e1b4b] leading-6 tracking-[-0.08px] mb-1">
            {commodity?.name || 'Commodity'}
          </h2>
          <p className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px]">
            Select how you want to view and compare data.
          </p>
        </div>

        {/* Widget Groups */}
        <div className="px-6 py-0">
          {categories.map((category) => {
            const categoryWidgets = widgetsByCategory[category] || [];
            if (categoryWidgets.length === 0) return null;
            const hasSelected = categoryWidgets.some((w) =>
              state.selectedWidgets.includes(w.id)
            );

            return (
              <div key={category} className="mb-0 pt-5">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-[#1e1b4b] leading-6 tracking-[-0.08px]">
                    {category}
                  </h3>
                  {hasSelected && (
                    <button
                      onClick={() => handleDeselectCategory(category)}
                      className="h-8 px-4 py-1.5 rounded-[6px] text-sm font-medium text-indigo-600 tracking-[-0.07px] transition-all duration-200 ease-in-out hover:bg-indigo-50 whitespace-nowrap"
                    >
                      Deselect
                    </button>
                  )}
                </div>

                {/* Widget Cards */}
                <div className="flex flex-col gap-4">
                  {categoryWidgets.map((widget) => {
                    const isSelected = state.selectedWidgets.includes(widget.id);
                    const sourceLabels = getSourceLabels(widget);

                    return (
                      <button
                        key={widget.id}
                        onClick={() => handleToggleWidget(widget.id)}
                        className={`flex items-start border rounded-[12px] pb-5 pl-4 pr-6 pt-4 transition-all duration-200 ease-in-out text-left ${
                          isSelected
                            ? 'border-indigo-600 bg-white'
                            : 'border-[#e2e8f0] bg-white'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          {isSelected ? (
                            <i className="fas fa-square-check text-[20px] text-indigo-600"></i>
                          ) : (
                            <i className="fal fa-square text-[20px] text-[#cbd5e1]"></i>
                          )}
                        </div>

                        {/* Illustration */}
                        <div className="bg-white border border-[#f1f5f9] rounded-[8px] w-24 h-24 flex items-center justify-center shrink-0 ml-4 overflow-hidden">
                          {widget.icon ? (
                            <img
                              src={`/widget-icons/${widget.icon}`}
                              alt={widget.title}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                // Fallback to default icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling;
                                if (fallback) {
                                  (fallback as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center" style={{ display: widget.icon ? 'none' : 'flex' }}>
                            {widget.visualType === 'chart' ? (
                              <svg
                                className="w-16 h-16 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-16 h-16 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 flex flex-col gap-4 ml-2">
                          <div className="flex flex-col gap-0">
                            <h4 className="text-sm font-medium text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                              {widget.title}
                            </h4>
                            <p className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                              {widget.description}
                            </p>
                          </div>

                          {/* Source Tags */}
                          {sourceLabels.length > 0 && (
                            <div className="flex gap-2 items-start">
                              {sourceLabels.map((source) => (
                                <div
                                  key={source.id}
                                  className="group bg-[#f1f5f9] flex items-center gap-1.5 px-1.5 py-1.5 rounded-[4px] relative"
                                >
                                  <div className="w-[22px] h-4 rounded-[2px] overflow-hidden">
                                    <span className="text-base leading-4 block">
                                      {source.flag}
                                    </span>
                                  </div>
                                  <span className="text-sm font-normal text-[#1e1b4b] leading-4 tracking-[-0.07px] whitespace-nowrap">
                                    {source.label}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateState({
                                        selectedSources: state.selectedSources.filter(
                                          (id) => id !== source.id
                                        ),
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out ml-1.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300 shrink-0"
                                    aria-label="Remove source"
                                  >
                                    <i className="far fa-times text-[14px] text-[#1e1b4b]"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredWidgets.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No widgets available for the selected data types and sources
            </div>
          )}
        </div>
      </motion.div>

      {/* Sticky Footer */}
      <div className="bg-white border-t border-[#e8ebef] sticky bottom-0 left-0 right-0 z-[1]">
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px] whitespace-nowrap">
              {state.selectedWidgets.length} selected
            </span>
            <button
              onClick={isAllSelected() ? handleDeselectAll : handleSelectAll}
              className="h-8 px-4 py-1.5 rounded-[6px] text-sm font-medium text-indigo-600 tracking-[-0.07px] transition-all duration-200 ease-in-out hover:bg-indigo-50 whitespace-nowrap"
            >
              {isAllSelected() ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddToDashboard}
              className="border border-[#e2e8f0] h-8 px-4 py-1.5 rounded-[6px] text-sm font-medium text-indigo-600 tracking-[-0.07px] transition-all duration-200 ease-in-out hover:bg-gray-50 whitespace-nowrap"
            >
              Add to dashboard
            </button>
            <button
              onClick={handleSaveAsNew}
              className="bg-indigo-600 h-8 px-4 py-1.5 rounded-[6px] text-sm font-medium text-white tracking-[-0.07px] transition-all duration-200 ease-in-out hover:bg-indigo-700 whitespace-nowrap"
            >
              Save as new
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

