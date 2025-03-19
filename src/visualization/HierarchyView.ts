import * as d3 from 'd3';
import { HierarchyNode, NodeState } from '../models/HierarchyNode';

interface ExtendedHierarchyPointNode extends d3.HierarchyPointNode<HierarchyNode> {
    x0?: number;
    y0?: number;
}

export class HierarchyView {
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private container: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private width: number;
    private height: number;
    private onNodeClick: (node: HierarchyNode) => void;
    private onNodeContextMenu: (node: HierarchyNode, event: MouseEvent) => void;
    private duration: number = 750; // Duration for transitions in milliseconds

    constructor(
        containerId: string,
        width: number,
        height: number,
        onNodeClick: (node: HierarchyNode) => void,
        onNodeContextMenu: (node: HierarchyNode, event: MouseEvent) => void
    ) {
        this.width = width;
        this.height = height;
        this.onNodeClick = onNodeClick;
        this.onNodeContextMenu = onNodeContextMenu;

        this.svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        this.container = this.svg
            .append('g')
            .attr('transform', 'translate(40,20)');
    }

    public render(data: HierarchyNode): void {
        const hierarchy = d3.hierarchy(data, d => d.collapsed ? null : d.children);
        
        const treeLayout = d3.tree<HierarchyNode>()
            .size([this.height - 40, this.width - 160]);

        const root = treeLayout(hierarchy) as ExtendedHierarchyPointNode;

        // Store the old positions for transitions
        const nodes = root.descendants().map(d => {
            const node = d as ExtendedHierarchyPointNode;
            node.x0 = node.x;
            node.y0 = node.y;
            return node;
        });

        const links = root.links();

        // Update links with transition
        const link = this.container.selectAll<SVGPathElement, d3.HierarchyPointLink<HierarchyNode>>('path.link')
            .data(links, (d: d3.HierarchyPointLink<HierarchyNode>) => (d.target.data as HierarchyNode).id || '');

        // Enter new links
        const linkEnter = link.enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', (d) => {
                const source = { x: d.source.x, y: d.source.y };
                const target = { x: source.x, y: source.y };
                return this.generateLinkPath(source, target);
            });

        // Update + Enter links
        link.merge(linkEnter)
            .transition()
            .duration(this.duration)
            .attr('d', (d: d3.HierarchyPointLink<HierarchyNode>) => this.generateLinkPath(d.source, d.target));

        // Exit links
        (link.exit() as d3.Selection<SVGPathElement, d3.HierarchyPointLink<HierarchyNode>, SVGGElement, unknown>)
            .transition()
            .duration(this.duration)
            .attr('d', (d: d3.HierarchyPointLink<HierarchyNode>) => {
                const source = { x: d.source.x, y: d.source.y };
                const target = { x: source.x, y: source.y };
                return this.generateLinkPath(source, target);
            })
            .remove();

        // Update nodes
        const node = this.container.selectAll<SVGGElement, ExtendedHierarchyPointNode>('g.node')
            .data(nodes, (d: ExtendedHierarchyPointNode) => d.data.id || '');

        // Enter new nodes
        const nodeEnter = node.enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => {
                const parent = d.parent as ExtendedHierarchyPointNode | null;
                const x0 = parent ? parent.x0 ?? parent.x : d.x;
                const y0 = parent ? parent.y0 ?? parent.y : d.y;
                return `translate(${y0},${x0})`;
            })
            .style('opacity', 0)
            .on('click', (event, d) => {
                event.stopPropagation();
                this.onNodeClick(d.data);
            })
            .on('contextmenu', (event, d) => {
                event.preventDefault();
                event.stopPropagation();
                this.onNodeContextMenu(d.data, event);
            });

        // Add circles to entering nodes
        nodeEnter.append('circle')
            .attr('r', 0)
            .attr('fill', d => this.getNodeColor(d.data.state));

        // Add labels to entering nodes
        nodeEnter.append('text')
            .attr('x', 8)
            .attr('dy', '0.32em')
            .text(d => `${d.data.name}: ${d.data.calculatedValue?.toFixed(1)}`)
            .style('text-decoration', d => this.getTextDecoration(d.data.state))
            .style('fill-opacity', 0);

        // Add collapse/expand indicators to entering nodes
        nodeEnter.filter((d: ExtendedHierarchyPointNode) => 
            Boolean(d.data.children && d.data.children.length > 0)
        )
            .append('text')
            .attr('class', 'toggle')
            .attr('x', -15)
            .attr('dy', '0.32em')
            .text(d => d.data.collapsed ? '►' : '▼')
            .style('cursor', 'pointer')
            .style('fill-opacity', 0);

        // Update existing nodes
        const nodeUpdate = node.merge(nodeEnter)
            .transition()
            .duration(this.duration)
            .attr('transform', d => `translate(${d.y},${d.x})`)
            .style('opacity', 1);

        nodeUpdate.select('circle')
            .attr('r', 4)
            .attr('fill', d => this.getNodeColor(d.data.state));

        nodeUpdate.select('text')
            .style('fill-opacity', 1)
            .text(d => `${d.data.name}: ${d.data.calculatedValue?.toFixed(1)}`)
            .style('text-decoration', d => this.getTextDecoration(d.data.state));

        nodeUpdate.select('text.toggle')
            .style('fill-opacity', 1)
            .text(d => d.data.collapsed ? '►' : '▼');

        // Exit nodes
        const nodeExit = node.exit<ExtendedHierarchyPointNode>()
            .transition()
            .duration(this.duration)
            .attr('transform', d => {
                const parent = d.parent || root;
                return `translate(${parent.y},${parent.x})`;
            })
            .style('opacity', 0)
            .remove();

        nodeExit.select('circle')
            .attr('r', 0);

        nodeExit.select('text')
            .style('fill-opacity', 0);

        // Store the old positions for the next transition
        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    private generateLinkPath(source: { x: number; y: number }, target: { x: number; y: number }): string {
        const dx = target.y - source.y;
        const dy = target.x - source.x;
        return `M${source.y},${source.x}
                C${source.y + dx / 2},${source.x}
                 ${source.y + dx / 2},${target.x}
                 ${target.y},${target.x}`;
    }

    private getNodeColor(state: NodeState): string {
        switch (state) {
            case 'inverted': return '#ff6b6b';
            case 'skipped': return '#868e96';
            default: return '#4c6ef5';
        }
    }

    private getTextDecoration(state: NodeState): string {
        return state === 'skipped' ? 'line-through' : 'none';
    }
} 