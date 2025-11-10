import { useCallback } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from 'antd';

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
  return (
    <div style={nodeStyle}>
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        id={`${id}-top`}
        style={{ top: -5 }}
      />
      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-right`}
        style={{ right: -5 }}
      />
      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${id}-bottom`}
        style={{ bottom: -5 }}
      />
      {/* Left handle */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-left`}
        style={{ left: -5 }}
      />
      <div>{(data as { label: string })?.label || ''}</div>
    </div>
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
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes = {
    custom: CustomNode,
  };

  return (
    <Card title="Flow Diagram Component (Remote)" style={{ margin: '20px' }}>
      <div style={{ width: '100%', height: '800px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
      </div>
      <p style={{ marginTop: '16px', color: '#666' }}>
        This interactive flow diagram is loaded from the Remote microfrontend
      </p>
    </Card>
  );
};

export default FlowDiagram;
