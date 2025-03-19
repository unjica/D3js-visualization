export interface HierarchyNode {
    id?: string;
    name: string;
    value?: number;
    children?: HierarchyNode[];
    state: NodeState;
    parent?: HierarchyNode;
    calculatedValue?: number;
    collapsed?: boolean;
}

export type NodeState = 'normal' | 'inverted' | 'skipped';

export class HierarchyManager {
    private root: HierarchyNode;

    constructor(data: HierarchyNode) {
        this.root = this.processNode(data);
    }

    private processNode(node: HierarchyNode, parent?: HierarchyNode): HierarchyNode {
        const processedNode = {
            ...node,
            state: node.state || 'normal',
            parent,
            id: this.generateId(),
            collapsed: false
        };

        if (node.children) {
            processedNode.children = node.children.map(child => 
                this.processNode(child, processedNode)
            );
        }

        processedNode.calculatedValue = this.calculateNodeValue(processedNode);
        return processedNode;
    }

    private calculateNodeValue(node: HierarchyNode): number {
        if (!node.children) {
            return node.state === 'skipped' ? 0 :
                   node.state === 'inverted' ? -(node.value || 0) :
                   node.value || 0;
        }

        return node.children.reduce((sum, child) => {
            const childValue = this.calculateNodeValue(child);
            return sum + childValue;
        }, 0);
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    public updateNodeState(nodeId: string, newState: NodeState): void {
        const updateNode = (node: HierarchyNode): boolean => {
            if (node.id === nodeId) {
                node.state = newState;
                this.recalculateAncestors(node);
                return true;
            }
            if (node.children) {
                return node.children.some(child => updateNode(child));
            }
            return false;
        };

        updateNode(this.root);
    }

    public toggleNodeCollapse(nodeId: string): void {
        const toggleNode = (node: HierarchyNode): boolean => {
            if (node.id === nodeId && node.children) {
                node.collapsed = !node.collapsed;
                return true;
            }
            if (node.children) {
                return node.children.some(child => toggleNode(child));
            }
            return false;
        };

        toggleNode(this.root);
    }

    public expandAll(): void {
        const expand = (node: HierarchyNode) => {
            if (node.children) {
                node.collapsed = false;
                node.children.forEach(expand);
            }
        };
        expand(this.root);
    }

    public collapseAll(): void {
        const collapse = (node: HierarchyNode) => {
            if (node.children) {
                node.collapsed = true;
                node.children.forEach(collapse);
            }
        };
        collapse(this.root);
    }

    private recalculateAncestors(node: HierarchyNode): void {
        let current = node;
        while (current.parent) {
            current.parent.calculatedValue = this.calculateNodeValue(current.parent);
            current = current.parent;
        }
    }

    public getRoot(): HierarchyNode {
        return this.root;
    }
} 