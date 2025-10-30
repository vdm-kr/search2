export interface Source {
  id: string;
  label: string;
  flag: string;
  providerType: string;
}

export interface CommodityGroup {
  id: string;
  name: string;
  commodities: string[];
}

export interface Commodity {
  id: string;
  name: string;
  description: string;
  availableDataTypes: string[];
  group?: string;
  popular?: boolean;
  sources?: string[];
  dataTypeSourceStatus?: Record<string, Record<string, 'outdated' | 'current'>>; // sourceId -> dataTypeId -> status
}

export interface DataType {
  id: string;
  name: string;
  group: string;
  sources: string[];
}

export interface Widget {
  id: string;
  title: string;
  description: string;
  dataTypes: string[];
  sources: string[];
  visualType: 'chart' | 'table';
  category?: string;
  icon?: string;
}

export interface SelectionState {
  selectedCommodityGroup: string | null;
  selectedCommodity: string | null;
  selectedSources: string[];
  selectedDataTypes: Record<string, string[]>; // sourceId -> dataTypeId[]
  selectedWidgets: string[];
  searchQuery: string;
  currentStep: number;
  selectedDataTypeCategory: string | null;
}

