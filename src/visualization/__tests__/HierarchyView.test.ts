import { HierarchyNode } from '../../models/HierarchyNode';
import { HierarchyView } from '../HierarchyView';
import * as d3 from 'd3';

jest.mock('d3');

describe('HierarchyView', () => {
  let hierarchyView: HierarchyView;
  let mockContainer: any;
  let mockData: HierarchyNode;
  let mockSelection: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock selection
    mockSelection = {
      enter: jest.fn().mockReturnThis(),
      exit: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      data: jest.fn().mockReturnThis(),
      merge: jest.fn().mockReturnThis(),
      transition: jest.fn().mockReturnThis(),
      duration: jest.fn().mockReturnThis(),
      remove: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      selectAll: jest.fn().mockReturnThis(),
    };

    // Create mock container
    mockContainer = {
      select: jest.fn().mockReturnValue(mockSelection),
      selectAll: jest.fn().mockReturnValue(mockSelection),
      append: jest.fn().mockReturnValue(mockSelection),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      node: jest.fn(),
      getBoundingClientRect: jest.fn().mockReturnValue({ width: 800, height: 600 }),
    };

    // Mock d3.select
    (d3.select as jest.Mock).mockReturnValue(mockContainer);

    // Create mock data
    mockData = {
      id: 'root',
      name: 'Root',
      state: 'normal',
      children: [
        {
          id: 'child1',
          name: 'Child 1',
          state: 'normal',
          children: [
            {
              id: 'grandchild1',
              name: 'Grandchild 1',
              state: 'normal',
              children: [],
            },
          ],
        },
      ],
    };

    // Create instance
    hierarchyView = new HierarchyView(
      'test-container',
      800,
      600,
      jest.fn(),
      jest.fn()
    );
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(hierarchyView['width']).toBe(800);
      expect(hierarchyView['height']).toBe(600);
      expect(hierarchyView['duration']).toBe(750);
    });
  });

  describe('render', () => {
    it('should create hierarchy and tree layout', () => {
      const mockHierarchy = {
        descendants: jest.fn().mockReturnValue([]),
        links: jest.fn().mockReturnValue([]),
      };

      const mockTreeLayoutFn = jest.fn().mockReturnValue(mockHierarchy);
      const mockTreeLayout = Object.assign(mockTreeLayoutFn, {
        size: jest.fn().mockReturnValue(mockTreeLayoutFn),
      });

      (d3.hierarchy as jest.Mock).mockReturnValue(mockHierarchy);
      (d3.tree as jest.Mock).mockReturnValue(mockTreeLayout);

      hierarchyView.render(mockData);

      expect(d3.hierarchy).toHaveBeenCalledWith(mockData, expect.any(Function));
      expect(d3.tree).toHaveBeenCalled();
      expect(mockTreeLayout.size).toHaveBeenCalledWith([560, 640]);
    });

    it('should handle collapsed nodes', () => {
      const collapsedData: HierarchyNode = {
        ...mockData,
        collapsed: true,
      };

      const mockHierarchy = {
        descendants: jest.fn().mockReturnValue([]),
        links: jest.fn().mockReturnValue([]),
      };

      const mockTreeLayoutFn = jest.fn().mockReturnValue(mockHierarchy);
      const mockTreeLayout = Object.assign(mockTreeLayoutFn, {
        size: jest.fn().mockReturnValue(mockTreeLayoutFn),
      });

      (d3.hierarchy as jest.Mock).mockReturnValue(mockHierarchy);
      (d3.tree as jest.Mock).mockReturnValue(mockTreeLayout);

      hierarchyView.render(collapsedData);

      expect(d3.hierarchy).toHaveBeenCalledWith(
        collapsedData,
        expect.any(Function)
      );
    });
  });

  describe('generateLinkPath', () => {
    it('should generate correct SVG path', () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };

      const path = hierarchyView['generateLinkPath'](source, target);
      // Remove whitespace and newlines for comparison
      expect(path.replace(/\s+/g, ' ').trim()).toBe('M0,0 C50,0 50,100 100,100');
    });
  });

  describe('node interactions', () => {
    it('should handle node clicks', () => {
      const onNodeClick = jest.fn();
      const view = new HierarchyView('test', 800, 600, onNodeClick, jest.fn());
      
      // Render first to register event handlers
      view.render(mockData);
      
      // Simulate node click
      const mockEvent = {
        stopPropagation: jest.fn()
      };
      const mockNode = { data: mockData };
      
      // Find and trigger click handler
      const clickHandler = mockSelection.on.mock.calls
        .find((call: [string, Function]) => call[0] === 'click')[1];
      clickHandler(mockEvent, mockNode);
      
      expect(onNodeClick).toHaveBeenCalledWith(mockData);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should handle context menu', () => {
      const onContextMenu = jest.fn();
      const view = new HierarchyView('test', 800, 600, jest.fn(), onContextMenu);
      
      // Render first to register event handlers
      view.render(mockData);
      
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      const mockNode = { data: mockData };
      
      const contextHandler = mockSelection.on.mock.calls
        .find((call: [string, Function]) => call[0] === 'contextmenu')[1];
      contextHandler(mockEvent, mockNode);
      
      expect(onContextMenu).toHaveBeenCalledWith(mockData, mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('visual states', () => {
    it('should apply correct colors based on node state', () => {
      const view = new HierarchyView('test', 800, 600, jest.fn(), jest.fn());
      
      expect(view['getNodeColor']('normal')).toBe('#4c6ef5');
      expect(view['getNodeColor']('inverted')).toBe('#ff6b6b');
      expect(view['getNodeColor']('skipped')).toBe('#868e96');
    });

    it('should apply correct text decoration based on node state', () => {
      const view = new HierarchyView('test', 800, 600, jest.fn(), jest.fn());
      
      expect(view['getTextDecoration']('normal')).toBe('none');
      expect(view['getTextDecoration']('skipped')).toBe('line-through');
    });
  });

  describe('edge cases', () => {
    it('should handle empty data', () => {
      const view = new HierarchyView('test', 800, 600, jest.fn(), jest.fn());
      const emptyData = { id: 'root', name: 'Root', state: 'normal' as const, children: [] };
      
      expect(() => view.render(emptyData)).not.toThrow();
    });

    it('should handle missing node properties', () => {
      const view = new HierarchyView('test', 800, 600, jest.fn(), jest.fn());
      const incompleteData = { name: 'Root', state: 'normal' } as HierarchyNode;
      
      expect(() => view.render(incompleteData)).not.toThrow();
    });
  });

  // Helper function to generate large dataset
  function generateLargeDataset(numLeafNodes: number): HierarchyNode {
    const root: HierarchyNode = {
      id: 'root',
      name: 'Root',
      state: 'normal',
      children: []
    };

    // Create a balanced tree with approximately numLeafNodes leaf nodes
    // Each non-leaf node will have 4 children
    const numLevels = Math.ceil(Math.log(numLeafNodes) / Math.log(4));
    
    function addNodes(parent: HierarchyNode, level: number): void {
      if (level >= numLevels) return;
      
      for (let i = 0; i < 4; i++) {
        const child: HierarchyNode = {
          id: `node-${level}-${i}`,
          name: `Node ${level}-${i}`,
          state: 'normal',
          children: []
        };
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(child);
        addNodes(child, level + 1);
      }
    }

    addNodes(root, 0);
    return root;
  }

  describe('performance', () => {
    it('should handle large datasets (10,000+ nodes) efficiently', () => {
      const view = new HierarchyView('test', 800, 600, jest.fn(), jest.fn());
      const largeData = generateLargeDataset(10000);
      
      // Measure rendering time
      const startTime = performance.now();
      view.render(largeData);
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Verify that D3 methods were called with the large dataset
      expect(d3.hierarchy).toHaveBeenCalled();
      expect(d3.tree).toHaveBeenCalled();
      
      // Log performance metrics
      console.log(`Rendered ${10000}+ nodes in ${renderTime.toFixed(2)}ms`);
      
      // Performance threshold - adjust based on requirements
      expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
    });

    it('should maintain smooth transitions with large datasets', () => {
      const view = new HierarchyView('test', 800, 600, jest.fn(), jest.fn());
      const largeData = generateLargeDataset(10000);
      
      // Initial render
      view.render(largeData);
      
      // Verify transition duration is set appropriately
      expect(mockSelection.transition).toHaveBeenCalled();
      expect(mockSelection.duration).toHaveBeenCalledWith(750); // Default duration
      
      // Verify that transitions are applied to nodes and links
      expect(mockSelection.attr).toHaveBeenCalled();
      expect(mockSelection.style).toHaveBeenCalled();
    });
  });
}); 