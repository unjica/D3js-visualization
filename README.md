# Hierarchical Data Visualization

A TypeScript and D3.js implementation of a hierarchical data visualization with support for arbitrary depth, node state management (normal/inverted/skipped), and interactive features.

## Features

- Hierarchical data structure with arbitrary depth support
- Interactive node state management (normal/inverted/skipped)
- Context menu for node operations
- Collapsible/expandable nodes
- Support for large datasets (10,000+ leaf nodes)
- D3.js visualization
- TypeScript implementation

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:9000`.

## Usage

- **Click** on a node with children to collapse/expand it
- **Right-click** on any node to open the context menu
- Use the context menu to:
  - Set node state to normal
  - Invert node value
  - Skip node value
- Use the top buttons to expand or collapse all nodes

## Data Structure

The visualization expects data in the following format:

```typescript
interface HierarchyNode {
    name: string;
    value?: number;
    children?: HierarchyNode[];
    state: 'normal' | 'inverted' | 'skipped';
}
```

Example:
```typescript
const data = {
    name: 'Root',
    children: [
        {
            name: 'Q3',
            children: [
                { name: 'Jul', value: 113.4, state: 'normal' },
                { name: 'Aug', value: 46.4, state: 'normal' },
                { name: 'Sep', value: 42.7, state: 'normal' }
            ],
            state: 'normal'
        }
    ],
    state: 'normal'
};
```

## Development

The project is structured as follows:

```
src/
├── models/
│   └── HierarchyNode.ts     # Core data structure
├── visualization/
│   └── HierarchyView.ts     # D3.js visualization
├── components/
│   └── ContextMenu.ts       # Context menu implementation
└── index.ts                 # Application entry point
```

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be available in the `dist` directory. 