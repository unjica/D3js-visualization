export interface HierarchyNode {
  id: string;
  name: string;
  children: HierarchyNode[];
  collapsed?: boolean;
} 