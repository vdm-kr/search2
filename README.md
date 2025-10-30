# Vesper Commodity Selection Flow

A 4-step commodity data selection flow built with React, TypeScript, and TailwindCSS.

## Features

- **Step 1**: Select Commodity - Browse by category or search with filtering
- **Step 2**: Commodity Overview - View commodity details and available data types
- **Step 3**: Select Data Types - Choose data types grouped by source and category
- **Step 4**: Select Widgets - Select widgets filtered by chosen data types and sources

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

## Project Structure

```
src/
├── components/
│   ├── global/          # Reusable components (SearchInput, SourceFilter, etc.)
│   ├── steps/           # Step-specific components
│   └── common/          # Shared UI components
├── context/             # State management (SelectionContext)
├── types/               # TypeScript definitions
└── utils/              # Utility functions (data loading, filtering)
public/data/            # Mock JSON data files
```

## Data Files

Mock data is stored in `public/data/`:
- `sources.json` - Available data sources
- `commodityGroups.json` - Commodity categories
- `commodities.json` - Commodity details
- `dataTypes.json` - Available data types
- `widgets.json` - Widget definitions

## Technology Stack

- React 18
- TypeScript
- TailwindCSS
- Radix UI (for accessible components)
- React Router v6
- Vite

## Navigation Flow

1. Start at `/step1` - Select Commodity
2. Navigate to `/step2` - Commodity Overview (automatic on selection)
3. Navigate to `/step3` - Select Data Types
4. Navigate to `/step4` - Select Widgets
5. Can navigate back using back buttons

## Notes

- State is managed globally via React Context
- Filtering happens in real-time based on selections
- All components use smooth transitions (`transition-all duration-200 ease-in-out`)
- Mock data structure matches the requirements from the plan

