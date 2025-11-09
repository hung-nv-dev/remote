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
  type OnConnect,
  type Node,
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
};

// Node width + gap = 80 + 50 = 130
const nodeWidth = 80;
const gap = 50;
const spacing = nodeWidth + gap;

const initialNodes: Node[] = [
  // First row - 7 nodes horizontally with 50px gap
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 0, y: 50 },
    style: nodeStyle,
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: spacing, y: 50 },
    style: nodeStyle,
  },
  {
    id: '3',
    data: { label: 'Node 3' },
    position: { x: spacing * 2, y: 50 },
    style: nodeStyle,
  },
  {
    id: '4',
    data: { label: 'Node 4' },
    position: { x: spacing * 3, y: 50 },
    style: nodeStyle,
  },
  {
    id: '5',
    data: { label: 'Node 5' },
    position: { x: spacing * 4, y: 50 },
    style: nodeStyle,
  },
  {
    id: '6',
    data: { label: 'Node 6' },
    position: { x: spacing * 5, y: 50 },
    style: nodeStyle,
  },
  {
    id: '7',
    type: 'output',
    data: { label: 'Node 7' },
    position: { x: spacing * 6, y: 50 },
    style: nodeStyle,
  },
  // Second row - 3 nodes below node 4 (100px down)
  {
    id: '8',
    data: { label: 'Node 8' },
    position: { x: spacing * 2, y: 150 },
    style: nodeStyle,
  },
  {
    id: '9',
    data: { label: 'Node 9' },
    position: { x: spacing * 3, y: 150 },
    style: nodeStyle,
  },
  {
    id: '10',
    data: { label: 'Node 10' },
    position: { x: spacing * 4, y: 150 },
    style: nodeStyle,
  },
];

const initialEdges = [
  // Connect first row nodes sequentially (right to left)
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    animated: true
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  },
  {
    id: 'e6-7',
    source: '6',
    target: '7',
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  },
  // Link from 3rd node (first row) to 1st node (second row)
  {
    id: 'e3-8',
    source: '3',
    target: '8',
    label: 'branch',
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    animated: true
  },
  // Connect second row nodes (right to left)
  {
    id: 'e8-9',
    source: '8',
    target: '9',
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  },
  {
    id: 'e9-10',
    source: '9',
    target: '10',
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  },
];

const FlowDiagram = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <Card title="Flow Diagram Component (Remote)" style={{ margin: '20px' }}>
      <div style={{ width: '100%', height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
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
