import { HierarchyManager, HierarchyNode } from './models/HierarchyNode';
import { HierarchyView } from './visualization/HierarchyView';
import { ContextMenu } from './components/ContextMenu';

// Sample data
const sampleData: HierarchyNode = {
    name: 'Root',
    children: [
        {
            name: '2023',
            children: [
                {
                    name: 'Q1',
                    children: [
                        { name: 'Jan', value: 98.5, state: 'normal' },
                        { name: 'Feb', value: 112.3, state: 'normal' },
                        { name: 'Mar', value: 87.6, state: 'normal' }
                    ],
                    state: 'normal'
                },
                {
                    name: 'Q2',
                    children: [
                        { name: 'Apr', value: 105.2, state: 'normal' },
                        { name: 'May', value: 94.8, state: 'normal' },
                        { name: 'Jun', value: 118.7, state: 'normal' }
                    ],
                    state: 'normal'
                },
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
        },
        {
            name: '2024',
            children: [
                {
                    name: 'Q1',
                    children: [
                        { name: 'Jan', value: 102.1, state: 'normal' },
                        { name: 'Feb', value: 108.9, state: 'normal' },
                        { name: 'Mar', value: 95.3, state: 'normal' }
                    ],
                    state: 'normal'
                },
                {
                    name: 'Q2',
                    children: [
                        { name: 'Apr', value: 88.7, state: 'normal' },
                        { name: 'May', value: 116.4, state: 'normal' },
                        { name: 'Jun', value: 104.2, state: 'normal' }
                    ],
                    state: 'normal'
                }
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