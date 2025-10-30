interface SelectionFooterProps {
  selectedCount: number;
  onDeselectAll: () => void;
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const SelectionFooter = ({
  selectedCount,
  onDeselectAll,
  primaryAction,
  secondaryAction,
}: SelectionFooterProps) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg z-10">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} selected
        </span>
        <button
          onClick={onDeselectAll}
          className="text-sm text-purple-600 hover:text-purple-700 transition-all duration-200 ease-in-out"
        >
          Deselect all
        </button>
      </div>
      <div className="flex items-center gap-3">
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition-all duration-200 ease-in-out"
          >
            {secondaryAction.label}
          </button>
        )}
        <button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          {primaryAction.label}
        </button>
      </div>
    </div>
  );
};

