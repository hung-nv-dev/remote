import { useCallback, useState, useRef, useEffect } from 'react';
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
  border: '2px solid #1a192b',
  color: '#222',
  fontSize: '12px',
  fontWeight: 500,
};

// Node width + gap = 80 + 50 = 130
const nodeWidth = 80;
const gap = 50;
const spacing = nodeWidth + gap;

// Custom node component with 4-direction handles
const CustomNode = (props: NodeProps) => {
  const { data, id } = props;
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as { label: string };

  return (
    <Tooltip title={`Node ID: ${id}\nLabel: ${nodeData?.label || ''}`} open={isHovered}>
      <div
        style={nodeStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
};

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
    animated: true
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
    animated: true
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
  const menuRef = useRef<HTMLDivElement>(null);

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
        case 'delete':
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
  }, [contextMenu, nodes, edges, setNodes, setEdges]);

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

  const nodeMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
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

  const nodeTypes = {
    custom: CustomNode,
  };

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
          fitView
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
              items={contextMenu.type === 'node' ? nodeMenuItems : edgeMenuItems}
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
