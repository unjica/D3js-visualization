import { HierarchyManager, HierarchyNode } from './models/HierarchyNode';
import { HierarchyView } from './visualization/HierarchyView';
import { ContextMenu } from './components/ContextMenu';

// Sample data
const sampleData: HierarchyNode = {
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
        },
        {
            name: 'Q4',
            children: [
                { name: 'Oct', value: 115.5, state: 'normal' },
                { name: 'Nov', value: 24.8, state: 'normal' },
                { name: 'Dec', value: 97.2, state: 'normal' }
            ],
            state: 'normal'
        }
    ],
    state: 'normal'
};

// Initialize the hierarchy manager
const manager = new HierarchyManager(sampleData);

// Initialize context menu
let activeNode: HierarchyNode | null = null;
const contextMenu = new ContextMenu((newState) => {
    if (activeNode?.id) {
        manager.updateNodeState(activeNode.id, newState);
        view.render(manager.getRoot());
    }
});

// Initialize the visualization
const view = new HierarchyView(
    'visualization-container',
    800,
    600,
    (node) => {
        if (node.id) {
            manager.toggleNodeCollapse(node.id);
            view.render(manager.getRoot());
        }
    },
    (node, event) => {
        activeNode = node;
        contextMenu.show(event.clientX, event.clientY);
    }
);

// Initial render
view.render(manager.getRoot());

// Setup expand/collapse all buttons
document.getElementById('expandAll')?.addEventListener('click', () => {
    manager.expandAll();
    view.render(manager.getRoot());
});

document.getElementById('collapseAll')?.addEventListener('click', () => {
    manager.collapseAll();
    view.render(manager.getRoot());
}); 