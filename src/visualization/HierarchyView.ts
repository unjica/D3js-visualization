import * as d3 from 'd3';
import { HierarchyNode, NodeState } from '../models/HierarchyNode';

export class HierarchyView {
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private container: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private width: number;
    private height: number;
    private onNodeClick: (node: HierarchyNode) => void;
    private onNodeContextMenu: (node: HierarchyNode, event: MouseEvent) => void;

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

        const root = treeLayout(hierarchy);

        // Draw links
        const linkGenerator = d3.linkHorizontal<d3.HierarchyPointLink<HierarchyNode>, d3.HierarchyPointNode<HierarchyNode>>()
            .x(d => d.y)
            .y(d => d.x);

        this.container.selectAll('path.link')
            .data(root.links())
            .join('path')
            .attr('class', 'link')
            .attr('d', linkGenerator);

        // Draw nodes
        const nodes = this.container.selectAll('g.node')
            .data(root.descendants())
            .join('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y},${d.x})`)
            .on('click', (event, d) => {
                event.stopPropagation();
                this.onNodeClick(d.data);
            })
            .on('contextmenu', (event, d) => {
                event.preventDefault();
                event.stopPropagation();
                this.onNodeContextMenu(d.data, event);
            });

        // Add circles for nodes
        nodes.selectAll('circle')
            .data(d => [d])
            .join('circle')
            .attr('r', 4)
            .attr('fill', d => this.getNodeColor(d.data.state));

        // Add text labels
        nodes.selectAll('text')
            .data(d => [d])
            .join('text')
            .attr('x', 8)
            .attr('dy', '0.32em')
            .text(d => `${d.data.name}: ${d.data.calculatedValue?.toFixed(1)}`)
            .style('text-decoration', d => this.getTextDecoration(d.data.state));

        // Add collapse/expand indicators
        nodes.filter((d: d3.HierarchyPointNode<HierarchyNode>) => 
            d.data.children !== undefined && d.data.children.length > 0
        )
            .selectAll('text.toggle')
            .data(d => [d])
            .join('text')
            .attr('class', 'toggle')
            .attr('x', -15)
            .attr('dy', '0.32em')
            .text(d => d.data.collapsed ? '►' : '▼')
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                this.onNodeClick(d.data);
            });
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