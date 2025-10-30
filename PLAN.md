# Commodity Data Selection Flow - Implementation Plan

## Project Overview
A 4-step commodity data selection flow for Vesper built with React + TypeScript + TailwindCSS.

## Architecture

### 1. Technology Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Radix UI (for accessible components like Accordion, Dialog, etc.)
- **Routing**: React Router v6
- **State Management**: React Context API (or simple useState/useReducer pattern)
- **Build Tool**: Vite (recommended) or Create React App
- **Package Manager**: npm/yarn/pnpm

### 2. Project Structure

```
/search
├── public/
│   └── data/              # Mock JSON data files
│       ├── commodityGroups.json
│       ├── commodities.json
│       ├── sources.json
│       ├── dataTypes.json
│       └── widgets.json
├── src/
│   ├── components/
│   │   ├── global/        # Global reusable components
│   │   │   ├── SearchInput.tsx
│   │   │   ├── SourceFilter.tsx
│   │   │   ├── AccordionList.tsx
│   │   │   └── SelectionFooter.tsx
│   │   ├── steps/         # Step-specific components
│   │   │   ├── Step1SelectCommodity.tsx
│   │   │   ├── Step2CommodityOverview.tsx
│   │   │   ├── Step3SelectDataTypes.tsx
│   │   │   └── Step4SelectWidgets.tsx
│   │   └── common/        # Shared UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Checkbox.tsx
│   ├── context/           # State management
│   │   └── SelectionContext.tsx
│   ├── hooks/             # Custom hooks
│   │   ├── useCommodityData.ts
│   │   ├── useFiltering.ts
│   │   └── useNavigation.ts
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── filtering.ts
│   │   └── dataLoader.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css          # Tailwind imports
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 3. Global State Structure

```typescript
interface SelectionState {
  // Step 1 selections
  selectedCommodityGroup: string | null;
  selectedCommodity: string | null;
  
  // Step 1 filters
  selectedSources: string[];  // Multi-select
  
  // Step 3 selections
  selectedDataTypes: string[];
  
  // Step 4 selections
  selectedWidgets: string[];
  
  // UI state
  searchQuery: string;
  currentStep: number;
}
```

### 4. Component Breakdown

#### Global Components
- **SearchInput.tsx**: Reusable search input with debouncing
- **SourceFilter.tsx**: Multi-select dropdown for source filtering
- **AccordionList.tsx**: Expandable list component (using Radix Accordion)
- **SelectionFooter.tsx**: Sticky footer with selected count, deselect all, and action buttons

#### Step Components
- **Step1SelectCommodity.tsx**: 
  - Search commodities input
  - Source filter dropdown
  - Accordion for commodity categories
  - Commodity cards/list
  - Filtering: disable commodities with no coverage for selected sources

- **Step2CommodityOverview.tsx**:
  - Commodity name + description
  - Preview of available data types (non-selectable badges)
  - "Select data types" CTA button

- **Step3SelectDataTypes.tsx**:
  - Group data types by category
  - Checkbox selection for each data type
  - Only show data types available for selectedCommodity + selectedSources
  - "Select widgets" CTA (disabled until >=1 selected)

- **Step4SelectWidgets.tsx**:
  - Widget cards grid
  - Checkbox on each card
  - Filter by selectedDataTypes + selectedSources
  - Sticky footer with:
    - "X selected" counter
    - "Deselect all" button
    - "Add to dashboard" button
    - "Save as new" button
  - Back button to Step 3

### 5. Filtering Logic

#### Step 1 Filtering
```typescript
filterCommodities(commodities, selectedSources, searchQuery) {
  // 1. Filter by search query (name matching)
  // 2. Filter by selectedSources:
  //    - Get all dataTypes for commodity
  //    - Check if any dataType has sources that intersect with selectedSources
  //    - If no intersection, disable or hide commodity
}
```

#### Step 3 Filtering
```typescript
filterDataTypes(dataTypes, selectedCommodity, selectedSources) {
  // 1. Check if dataType.sources intersects with selectedSources
  // 2. Check if commodity.availableDataTypes includes dataType.id
  // 3. Show only matching data types
}
```

#### Step 4 Filtering
```typescript
filterWidgets(widgets, selectedDataTypes, selectedSources) {
  // 1. Check if widget.dataTypes intersects with selectedDataTypes
  // 2. Check if widget.sources intersects with selectedSources
  // 3. Show only matching widgets
}
```

### 6. Data Types (TypeScript)

```typescript
interface Source {
  id: string;
  label: string;
  flag: string;
  providerType: string;
}

interface CommodityGroup {
  id: string;
  name: string;
  commodities: string[];  // IDs
}

interface Commodity {
  id: string;
  name: string;
  description: string;
  availableDataTypes: string[];  // IDs
}

interface DataType {
  id: string;
  name: string;
  group: string;
  sources: string[];  // IDs
}

interface Widget {
  id: string;
  title: string;
  description: string;
  dataTypes: string[];  // IDs
  sources: string[];  // IDs
  visualType: 'chart' | 'table';
}
```

### 7. Routing Strategy

Using React Router:
- `/step1` - Select Commodity
- `/step2` - Commodity Overview
- `/step3` - Select Data Types
- `/step4` - Select Widgets

Navigation:
- Step 1 → Step 2: Automatic on commodity selection
- Step 2 → Step 3: Via "Select data types" button
- Step 3 → Step 4: Via "Select widgets" button (enabled when >=1 selected)
- Step 4 → Step 3: Via "Back" button
- Can also use step numbers directly: `navigate('/step3')`

### 8. UI/UX Considerations

- **Transitions**: Use `transition-all duration-200 ease-in-out` for smooth animations
- **Theme**: Use Tailwind color variables
- **Accessibility**: 
  - Keyboard navigation
  - ARIA labels
  - Focus management
- **Loading States**: Show loading spinners while fetching JSON data
- **Empty States**: Handle cases with no results
- **Disabled States**: Visual indication for disabled commodities/options

### 9. Implementation Phases

**Phase 1: Project Setup**
- Initialize project (Vite + React + TypeScript)
- Setup TailwindCSS and Radix UI
- Create project structure
- Setup routing

**Phase 2: Data & Types**
- Create mock JSON files
- Define TypeScript interfaces
- Create data loading utilities
- Setup Context API for state management

**Phase 3: Global Components**
- Build SearchInput
- Build SourceFilter (multi-select dropdown)
- Build AccordionList
- Build SelectionFooter

**Phase 4: Step 1 (Select Commodity)**
- Implement search + filter logic
- Build commodity list/cards
- Integrate accordion for categories
- Handle commodity selection

**Phase 5: Step 2 (Commodity Overview)**
- Display commodity details
- Show data type previews
- Implement navigation to Step 3

**Phase 6: Step 3 (Select Data Types)**
- Group data types by category
- Implement checkbox selection
- Apply filtering logic
- Enable/disable CTA based on selections

**Phase 7: Step 4 (Select Widgets)**
- Display widget cards
- Implement checkbox selection
- Apply filtering logic
- Build sticky footer with actions
- Add back navigation

**Phase 8: Polish & Testing**
- Add transitions and animations
- Test filtering edge cases
- Test navigation flow
- Accessibility audit

## Next Steps

Wait for screenshots and design guidance before implementing each step. The plan will be refined based on visual requirements.
