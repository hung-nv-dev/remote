import { useCallback, useState, useRef, useEffect, useMemo, memo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Position,
  Handle,
  type OnConnect,
  type Node,
  type NodeProps,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, Tooltip, Modal, Input, message, Menu } from 'antd';
import type { MenuProps } from 'antd';

// Square node style
const nodeStyle = {
  width: 80,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  backgroundColor: '#fff',
  border: '1px solid #1a192b',
  color: '#222',
  fontSize: '12px',
  fontWeight: 500,
};

// Node width + gap = 80 + 50 = 130
const nodeWidth = 80;
const gap = 50;
const spacing = nodeWidth + gap;

// Custom node component with 4-direction handles
const CustomNode = memo((props: NodeProps) => {
  const { data, id } = props;
  const nodeData = data as { label: string };
  const tooltipTitle = useMemo(() => `Node ID: ${id}\nLabel: ${nodeData?.label || ''}`, [id, nodeData?.label]);

  return (
    <Tooltip title={tooltipTitle} mouseEnterDelay={0.5}>
      <div style={nodeStyle}>
        {/* Top handle */}
        <Handle
          type="target"
          position={Position.Top}
          id={`${id}-top`}
          style={{ top: 0 }}
        />
        {/* Right handle */}
        <Handle
          type="source"
          position={Position.Right}
          id={`${id}-right`}
          style={{ right: 0 }}
        />
        {/* Bottom handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id={`${id}-bottom`}
          style={{ bottom: 0 }}
        />
        {/* Left handle */}
        <Handle
          type="target"
          position={Position.Left}
          id={`${id}-left`}
          style={{ left: 0 }}
        />
        <div>{(data as { label: string })?.label || ''}</div>
      </div>
    </Tooltip>
  );
});

CustomNode.displayName = 'CustomNode';

const initialNodes: Node[] = [
  // First row - 7 nodes horizontally with 50px gap
  {
    id: '1',
    type: 'custom',
    data: { label: 'Node 1' },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'custom',
    data: { label: 'Node 2' },
    position: { x: spacing, y: 50 },
  },
  {
    id: '3',
    type: 'custom',
    data: { label: 'Node 3' },
    position: { x: spacing * 2, y: 50 },
  },
  {
    id: '4',
    type: 'custom',
    data: { label: 'Node 4' },
    position: { x: spacing * 3, y: 50 },
  },
  {
    id: '5',
    type: 'custom',
    data: { label: 'Node 5' },
    position: { x: spacing * 4, y: 50 },
  },
  {
    id: '6',
    type: 'custom',
    data: { label: 'Node 6' },
    position: { x: spacing * 5, y: 50 },
  },
  {
    id: '7',
    type: 'custom',
    data: { label: 'Node 7' },
    position: { x: spacing * 6, y: 50 },
  },
  // Second row - 3 nodes below node 4 (100px down)
  {
    id: '8',
    type: 'custom',
    data: { label: 'Node 8' },
    position: { x: spacing * 2, y: 150 },
  },
  {
    id: '9',
    type: 'custom',
    data: { label: 'Node 9' },
    position: { x: spacing * 3, y: 150 },
  },
  {
    id: '10',
    type: 'custom',
    data: { label: 'Node 10' },
    position: { x: spacing * 4, y: 150 },
  },
];

const initialEdges = [
  // Connect first row nodes sequentially (right to left)
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: '1-right',
    targetHandle: '2-left',
    type: 'smoothstep',
    animated: false // Disable animation for better performance
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: '2-right',
    targetHandle: '3-left',
    type: 'smoothstep'
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    sourceHandle: '3-right',
    targetHandle: '4-left',
    type: 'smoothstep'
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    sourceHandle: '4-right',
    targetHandle: '5-left',
    type: 'smoothstep'
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    sourceHandle: '5-right',
    targetHandle: '6-left',
    type: 'smoothstep'
  },
  {
    id: 'e6-7',
    source: '6',
    target: '7',
    sourceHandle: '6-right',
    targetHandle: '7-left',
    type: 'smoothstep'
  },
  // Link from 3rd node (first row) to 1st node (second row)
  {
    id: 'e3-8',
    source: '3',
    target: '8',
    sourceHandle: '3-bottom',
    targetHandle: '8-top',
    type: 'smoothstep',
    label: 'branch',
    animated: false // Disable animation for better performance
  },
  // Connect second row nodes (right to left)
  {
    id: 'e8-9',
    source: '8',
    target: '9',
    sourceHandle: '8-right',
    targetHandle: '9-left',
    type: 'smoothstep'
  },
  {
    id: 'e9-10',
    source: '9',
    target: '10',
    sourceHandle: '9-right',
    targetHandle: '10-left',
    type: 'smoothstep'
  },
];

const FlowDiagram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: 'node' | 'edge';
    id: string;
  } | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeLabel, setEditingNodeLabel] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [nodeChildren, setNodeChildren] = useState<Map<string, string[]>>(new Map());
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Number of children to generate when expanding
  const CHILDREN_COUNT = 3;
  const CHILD_ROW_OFFSET = 150; // Vertical distance from parent to children

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && event.target && !menuRef.current.contains(event.target as HTMLElement)) {
        setContextMenu(null);
      }
    };

    if (contextMenu?.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [contextMenu]);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      type: 'node',
      id: node.id,
    });
  }, []);

  const handleEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      type: 'edge',
      id: edge.id,
    });
  }, []);

  // Expand children nodes
  const expandNodeChildren = useCallback((parentNodeId: string) => {
    const parentNode = nodes.find((n) => n.id === parentNodeId);
    if (!parentNode) return;

    // Check if already expanded
    if (expandedNodes.has(parentNodeId)) {
      return;
    }

    // Generate child node IDs
    const childIds: string[] = [];
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Calculate positions for children (horizontal row below parent)
    const parentX = parentNode.position.x;
    const parentY = parentNode.position.y;
    const childY = parentY + CHILD_ROW_OFFSET;
    
    // Center children around parent node
    const totalWidth = (CHILDREN_COUNT - 1) * spacing;
    const startX = parentX - totalWidth / 2;

    for (let i = 0; i < CHILDREN_COUNT; i++) {
      const childId = `${parentNodeId}-child-${i + 1}`;
      childIds.push(childId);
      
      const childX = startX + i * spacing;
      
      // Create child node
      newNodes.push({
        id: childId,
        type: 'custom',
        data: { label: `Child ${i + 1}` },
        position: { x: childX, y: childY },
      });

      // Create edge from parent to child
      newEdges.push({
        id: `${parentNodeId}-${childId}`,
        source: parentNodeId,
        target: childId,
        sourceHandle: `${parentNodeId}-bottom`,
        targetHandle: `${childId}-top`,
        type: 'smoothstep',
        animated: false, // Disable animation for better performance
      });
    }

    // Add new nodes and edges
    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges] as typeof edges);
    setExpandedNodes((prev) => new Set(prev).add(parentNodeId));
    setNodeChildren((prev) => {
      const newMap = new Map(prev);
      newMap.set(parentNodeId, childIds);
      return newMap;
    });

    message.success(`Expanded ${CHILDREN_COUNT} children nodes`);
  }, [nodes, expandedNodes, spacing, setNodes, setEdges]);

  // Collapse children nodes
  const collapseNodeChildren = useCallback((parentNodeId: string) => {
    const childIds = nodeChildren.get(parentNodeId);
    if (!childIds) return;

    // Remove child nodes and their edges (including grandchildren recursively)
    setNodes((nds) => {
      const allDescendants = new Set(childIds);
      childIds.forEach((childId) => {
        const grandchildren = nodeChildren.get(childId);
        if (grandchildren) {
          grandchildren.forEach((gcId) => allDescendants.add(gcId));
        }
      });
      return nds.filter((n) => !allDescendants.has(n.id));
    });

    setEdges((eds) => {
      const allDescendants = new Set(childIds);
      childIds.forEach((childId) => {
        const grandchildren = nodeChildren.get(childId);
        if (grandchildren) {
          grandchildren.forEach((gcId) => allDescendants.add(gcId));
        }
      });
      return eds.filter((e) => !allDescendants.has(e.source) && !allDescendants.has(e.target));
    });

    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(parentNodeId);
      // Also remove children from expanded set
      childIds.forEach((childId) => newSet.delete(childId));
      return newSet;
    });

    setNodeChildren((prev) => {
      const newMap = new Map(prev);
      newMap.delete(parentNodeId);
      // Also remove children's children
      childIds.forEach((childId) => newMap.delete(childId));
      return newMap;
    });

    message.success('Collapsed children nodes');
  }, [nodeChildren, setNodes, setEdges]);

  const handleMenuClick: MenuProps['onClick'] = useCallback(({ key }: { key: string }) => {
    if (!contextMenu) return;

    if (contextMenu.type === 'node') {
      const node = nodes.find((n) => n.id === contextMenu.id);
      if (!node) return;

      const nodeData = node.data as { label: string };

      switch (key) {
        case 'edit':
          setEditingNodeId(node.id);
          setEditingNodeLabel(nodeData?.label || '');
          setEditModalVisible(true);
          setContextMenu(null);
          break;
        case 'expand-children':
          expandNodeChildren(node.id);
          setContextMenu(null);
          break;
        case 'collapse-children':
          collapseNodeChildren(node.id);
          setContextMenu(null);
          break;
        case 'delete':
          // Remove node and its children if expanded
          if (expandedNodes.has(node.id)) {
            collapseNodeChildren(node.id);
          }
          setNodes((nds) => nds.filter((n) => n.id !== node.id));
          setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
          message.success('Node deleted successfully');
          setContextMenu(null);
          break;
        case 'change-type':
          // Toggle between custom types or add your logic here
          message.info('Change type feature - to be implemented');
          setContextMenu(null);
          break;
        case 'view-detail':
          Modal.info({
            title: 'Node Details',
            content: (
              <div>
                <p><strong>ID:</strong> {node.id}</p>
                <p><strong>Label:</strong> {nodeData?.label || 'N/A'}</p>
                <p><strong>Type:</strong> {node.type || 'custom'}</p>
                <p><strong>Position:</strong> X: {node.position.x}, Y: {node.position.y}</p>
                <p><strong>Children:</strong> {nodeChildren.get(node.id)?.length || 0}</p>
              </div>
            ),
          });
          setContextMenu(null);
          break;
      }
    } else if (contextMenu.type === 'edge') {
      const edge = edges.find((e) => e.id === contextMenu.id);
      if (!edge) return;

      switch (key) {
        case 'edit':
          setEditingNodeId(edge.id);
          setEditingNodeLabel((edge.label as string) || '');
          setEditModalVisible(true);
          setContextMenu(null);
          break;
        case 'delete':
          setEdges((eds) => eds.filter((e) => e.id !== edge.id));
          message.success('Edge deleted successfully');
          setContextMenu(null);
          break;
        case 'change-type':
          setEdges((eds) =>
            eds.map((e) => {
              if (e.id === edge.id) {
                const newType = e.type === 'smoothstep' ? 'straight' : 'smoothstep';
                return { ...e, type: newType };
              }
              return e;
            })
          );
          message.success('Edge type changed');
          setContextMenu(null);
          break;
        case 'view-detail':
          Modal.info({
            title: 'Edge Details',
            content: (
              <div>
                <p><strong>ID:</strong> {edge.id}</p>
                <p><strong>Source:</strong> {edge.source}</p>
                <p><strong>Target:</strong> {edge.target}</p>
                <p><strong>Type:</strong> {edge.type || 'default'}</p>
                <p><strong>Label:</strong> {(edge.label as string) || 'N/A'}</p>
              </div>
            ),
          });
          setContextMenu(null);
          break;
      }
    }
  }, [contextMenu, nodes, edges, expandedNodes, nodeChildren, expandNodeChildren, collapseNodeChildren, setNodes, setEdges]);

  const handleUpdateNodeLabel = useCallback(() => {
    if (editingNodeId) {
      if (contextMenu?.type === 'edge') {
        // Update edge label
        const updatedEdges = edges.map((edge) => {
          if (edge.id === editingNodeId) {
            return { ...edge, label: editingNodeLabel };
          }
          return edge;
        });
        setEdges(updatedEdges as typeof edges);
        message.success('Edge label updated successfully');
      } else {
        // Update node label
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === editingNodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: editingNodeLabel,
                },
              };
            }
            return node;
          })
        );
        message.success('Node name updated successfully');
      }
      setEditModalVisible(false);
      setEditingNodeId(null);
      setEditingNodeLabel('');
    }
  }, [editingNodeId, editingNodeLabel, contextMenu, nodes, edges, setNodes, setEdges]);

  // Dynamic node menu items based on expansion state - memoized
  const nodeMenuItemsBase = useMemo<MenuProps['items']>(() => [
    {
      key: 'edit',
      label: 'Edit',
    },
    {
      key: 'expand-children',
      label: 'Expand Children',
    },
    {
      key: 'change-type',
      label: 'Change Type',
    },
    {
      key: 'view-detail',
      label: 'View Detail',
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
    },
  ], []);

  const getNodeMenuItems = useCallback((nodeId: string): MenuProps['items'] => {
    const isExpanded = expandedNodes.has(nodeId);
    if (!nodeMenuItemsBase) return [];
    return nodeMenuItemsBase.map((item) => {
      if (!item || typeof item === 'string') return item;
      if (item.key === 'expand-children') {
        return {
          ...item,
          key: isExpanded ? 'collapse-children' : 'expand-children',
          label: isExpanded ? 'Collapse Children' : 'Expand Children',
        };
      }
      return item;
    }).filter(Boolean);
  }, [expandedNodes, nodeMenuItemsBase]);

  const edgeMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit Label',
    },
    {
      key: 'change-type',
      label: 'Change Type',
    },
    {
      key: 'view-detail',
      label: 'View Detail',
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
    },
  ];

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  return (
    <Card title="Flow Diagram Component (Remote)" style={{ margin: '20px' }}>
      <div style={{ width: '100%', height: '800px', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={handleNodeContextMenu}
          onEdgeContextMenu={handleEdgeContextMenu}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnDrag={[1, 2]}
          zoomOnScroll={true}
          zoomOnPinch={true}
          preventScrolling={false}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Controls />
          <MiniMap
            style={{
              height: 80,
              width: 120
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          {/* Disable fitViewOnInit để tránh re-render khi mount */}
        </ReactFlow>

        {/* Context Menu */}
        {contextMenu?.visible && (
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              borderRadius: '4px',
              backgroundColor: '#fff',
            }}
          >
            <Menu
              items={contextMenu.type === 'node' ? getNodeMenuItems(contextMenu.id) : edgeMenuItems}
              onClick={handleMenuClick}
            />
          </div>
        )}
      </div>
      <p style={{ marginTop: '16px', color: '#666' }}>
        This interactive flow diagram is loaded from the Remote microfrontend
      </p>
      
      <Modal
        title={contextMenu?.type === 'edge' ? 'Edit Edge Label' : 'Edit Node Name'}
        open={editModalVisible}
        onOk={handleUpdateNodeLabel}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingNodeId(null);
          setEditingNodeLabel('');
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          value={editingNodeLabel}
          onChange={(e) => setEditingNodeLabel(e.target.value)}
          placeholder={contextMenu?.type === 'edge' ? 'Enter edge label' : 'Enter node name'}
          onPressEnter={handleUpdateNodeLabel}
          autoFocus
        />
      </Modal>
    </Card>
  );
};

export default FlowDiagram;
