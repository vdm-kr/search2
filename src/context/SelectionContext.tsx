import { createContext, useContext, useState, ReactNode } from 'react';
import { SelectionState } from '../types';

interface SelectionContextType {
  state: SelectionState;
  updateState: (updates: Partial<SelectionState>) => void;
  resetState: () => void;
}

const initialState: SelectionState = {
  selectedCommodityGroup: null,
  selectedCommodity: null,
  selectedSources: [],
  selectedDataTypes: {}, // sourceId -> dataTypeId[]
  selectedWidgets: [],
  searchQuery: '',
  currentStep: 1,
  selectedDataTypeCategory: null,
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SelectionState>(initialState);

  const updateState = (updates: Partial<SelectionState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
  };

  return (
    <SelectionContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
};

