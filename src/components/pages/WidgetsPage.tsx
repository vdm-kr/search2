import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../../context/SelectionContext';
import { SearchInput } from '../global/SearchInput';
import { loadWidgets } from '../../utils/dataLoader';
import { Widget } from '../../types';

export const WidgetsPage = () => {
  const navigate = useNavigate();
  const { state, updateState } = useSelection();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const widgetsData = await loadWidgets();
        setWidgets(widgetsData);
      } catch (error) {
        console.error('Failed to load widgets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter widgets by search query
  const filteredWidgets = useMemo(() => {
    if (!searchQuery.trim()) {
      return widgets;
    }
    const query = searchQuery.toLowerCase().trim();
    return widgets.filter(
      (w) =>
        w.title.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query) ||
        w.category?.toLowerCase().includes(query)
    );
  }, [widgets, searchQuery]);

  // Get selected widgets from filtered list
  const selectedFilteredWidgets = useMemo(() => {
    return filteredWidgets.filter((w) => state.selectedWidgets.includes(w.id));
  }, [filteredWidgets, state.selectedWidgets]);

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

  const handleDeselectAll = () => {
    const filteredIds = filteredWidgets.map((w) => w.id);
    updateState({
      selectedWidgets: state.selectedWidgets.filter(
        (id) => !filteredIds.includes(id)
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] shadow-[0px_30px_60px_0px_rgba(0,0,0,0.15)] w-[800px] h-[640px] mx-auto my-8 relative overflow-hidden">
      {/* Sticky Top Bar */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10 flex items-center gap-2 p-4">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search widgets"
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
        <div className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/step1')}
            className="flex items-center gap-2 h-10 px-3 rounded-[4px] text-sm font-medium text-[#1e1b4b] tracking-[-0.07px] transition-all duration-200 ease-in-out hover:bg-gray-50"
          >
            <span>Commodities</span>
          </button>
          <div className="bg-indigo-50 flex items-center gap-2 h-10 px-3 rounded-[4px]">
            <span className="text-sm font-medium text-indigo-600 tracking-[-0.07px]">
              Widgets
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="absolute left-[216px] top-16 right-4 overflow-y-auto"
        style={{ 
          height: selectedFilteredWidgets.length > 0 ? 'calc(640px - 64px - 64px)' : 'calc(640px - 64px)'
        }}
      >
        <div className="flex flex-col gap-2 py-4">
          {filteredWidgets.map((widget) => {
            const isSelected = state.selectedWidgets.includes(widget.id);
            return (
              <div
                key={widget.id}
                className={`flex gap-4 items-center p-4 rounded-[12px] transition-all duration-200 ease-in-out cursor-pointer ${
                  isSelected
                    ? 'border border-indigo-600'
                    : 'border border-transparent'
                }`}
                onClick={() => handleToggleWidget(widget.id)}
              >
                {/* Widget Icon */}
                <div className="bg-indigo-50 rounded-[8px] w-[72px] h-[72px] flex items-center justify-center shrink-0 overflow-hidden">
                  {widget.icon ? (
                    <img
                      src={`/widget-icons/${widget.icon}`}
                      alt={widget.title}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        // Fallback to default chart icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className =
                          'w-full h-full flex items-center justify-center';
                        fallback.innerHTML =
                          '<i class="fas fa-chart-line text-indigo-600 text-2xl"></i>';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <i className="fas fa-chart-line text-indigo-600 text-2xl"></i>
                  )}
                </div>

                {/* Widget Info */}
                <div className="flex-1 flex flex-col gap-0 min-w-0">
                  <p className="text-sm font-medium text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                    {widget.title}
                  </p>
                  <p className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                    {widget.description}
                  </p>
                </div>

                {/* Checkbox */}
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  {isSelected ? (
                    <i className="fas fa-square-check text-[20px] text-indigo-600"></i>
                  ) : (
                    <i className="fal fa-square text-[20px] text-[#cbd5e1]"></i>
                  )}
                </div>
              </div>
            );
          })}

          {filteredWidgets.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">No widgets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Always visible when items are selected */}
      {selectedFilteredWidgets.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e8ebef] h-16 flex items-center">
          <div className="flex items-center justify-between px-6 w-full">
            <div className="flex items-center gap-2">
              <p className="text-sm font-normal text-[#1e1b4b] leading-6 tracking-[-0.07px]">
                {selectedFilteredWidgets.length} selected
              </p>
              <button
                onClick={handleDeselectAll}
                className="px-4 py-1.5 text-sm font-medium text-indigo-600 rounded-[6px] transition-all duration-200 ease-in-out hover:bg-indigo-50"
              >
                Deselect all
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="border border-[#e2e8f0] h-8 px-4 rounded-[6px] text-sm font-medium text-indigo-600 transition-all duration-200 ease-in-out hover:bg-gray-50">
                Add to dashboard
              </button>
              <button className="bg-indigo-600 h-8 px-4 rounded-[6px] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-indigo-700">
                Save as new
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

