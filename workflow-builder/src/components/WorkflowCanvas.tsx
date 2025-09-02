import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ConnectionMode,
  MarkerType,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import useWorkflowStore from '../store/workflowStore';
import type { WorkflowNode, WorkflowEdge, NodeData, StartConfig } from '../types/workflow.types';

interface WorkflowCanvasProps {
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setReactFlowInstance: (instance: any) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ onDrop, onDragOver, setReactFlowInstance }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    selectEdge,
    selectedEdge,
    deleteEdge,
    addNode,
    setRightSidebarVisible
  } = useWorkflowStore();
  
  // Auto-create start node when canvas is empty
  useEffect(() => {
    const hasStartNode = nodes.some(node => node.type === 'start');
    
    // Only add start node if there are no start-type nodes
    // Store now handles duplicate prevention, so we can safely call addNode
    if (!hasStartNode) {
      const startNode: WorkflowNode = {
        id: 'start-node',
        type: 'start',
        position: { x: 250, y: 200 },
        data: {
          label: 'Start',
          type: 'start',
          description: 'Workflow starting point',
          config: {
            label: 'Workflow Start',
            description: 'Beginning of workflow execution',
            merchantId: '',
            dataSource: 'CRM'
          } as StartConfig
        } as NodeData
      };
      
      addNode(startNode); // Store will handle duplicate prevention
    }
  }, [nodes, addNode]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = (instance: any) => {
    setReactFlowInstance(instance);
  };
  
  const onNodeClick = useCallback((_event: React.MouseEvent, node: WorkflowNode) => {
    selectNode(node);
    // Auto-open right sidebar when a node is selected
    setRightSidebarVisible(true);
  }, [selectNode, setRightSidebarVisible]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectEdge(edge as any);
  }, [selectEdge]);

  // Handle edge context menu (right-click)
  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: WorkflowEdge) => {
    event.preventDefault();
    const confirmDelete = window.confirm('Delete this connection?');
    if (confirmDelete) {
      deleteEdge(edge.id);
      selectEdge(null);
    }
  }, [deleteEdge, selectEdge]);

  // Handle edge deletion with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdge) {
        event.preventDefault();
        deleteEdge(selectedEdge.id);
        selectEdge(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdge, deleteEdge, selectEdge]);
  
  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  // Custom connection validation to ensure proper handle connections and sequential order
  const isValidConnection = useCallback((connection: WorkflowEdge | Connection) => {
    // Ensure we're connecting from output (source) to input (target)
    // Source handles should be 'output', 'then', or 'otherwise'
    // Target handles should be 'input'
    const validSourceHandles = ['output', 'then', 'otherwise'];
    const validTargetHandles = ['input'];
    
    const isValidSource = !connection.sourceHandle || validSourceHandles.includes(connection.sourceHandle);
    const isValidTarget = !connection.targetHandle || validTargetHandles.includes(connection.targetHandle);
    
    if (!isValidSource || !isValidTarget) {
      return false;
    }

    // Get source and target nodes
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      return false;
    }

    // Sequential connection validation based on node positions
    // Nodes can only connect to nodes that are positioned to their right and within reasonable vertical range
    const sourceX = sourceNode.position.x;
    const sourceY = sourceNode.position.y;
    const targetX = targetNode.position.x;

    // Target must be to the right of source (left-to-right flow)
    if (targetX <= sourceX + 50) { // Adding 50px buffer for same-column positioning
      return false;
    }

    // Prevent connecting to nodes that are too far to the right (skip prevention)
    // Find all nodes between source and target horizontally
    const nodesBetween = nodes.filter(node => {
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      
      // Node is between source and target horizontally
      const isBetweenHorizontally = nodeX > sourceX + 50 && nodeX < targetX - 50;
      
      // Node is within reasonable vertical range (same workflow level)
      const verticalDistance = Math.abs(nodeY - sourceY);
      const isInVerticalRange = verticalDistance < 200; // Allow some vertical spacing
      
      // Exclude the source and target nodes themselves
      return isBetweenHorizontally && isInVerticalRange && 
             node.id !== connection.source && node.id !== connection.target;
    });

    // If there are nodes in between, prevent the connection (no crossing over)
    if (nodesBetween.length > 0) {
      console.log('Connection blocked: Cannot skip over intermediate nodes');
      return false;
    }

    return true;
  }, [nodes]);

  // Handle connection line style during drag
  const connectionLineStyle = {
    stroke: '#5C6AC4',
    strokeWidth: 3,
    strokeDasharray: '8,5',
  };

  // Custom connection line component for enhanced visual feedback
  const connectionLineComponent = useCallback((props: { fromX: number; fromY: number; toX: number; toY: number; connectionStatus?: 'valid' | 'invalid' | null }) => {
    const { fromX, fromY, toX, toY, connectionStatus } = props;
    
    // Calculate bezier curve path for smoother connection line
    const midX = fromX + (toX - fromX) / 2;
    const path = `M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`;
    
    // Determine line color based on connection validity
    const lineColor = connectionStatus === 'valid' ? '#00848E' : '#5C6AC4';
    const shadowColor = connectionStatus === 'valid' ? '#00A0B0' : '#7B83D3';
    
    return (
      <g>
        {/* Drop shadow for depth */}
        <path
          fill="none"
          stroke={shadowColor}
          strokeWidth={4}
          strokeDasharray="8,5"
          strokeOpacity={0.3}
          d={path}
          transform="translate(2,2)"
        />
        {/* Main connection line */}
        <path
          fill="none"
          stroke={lineColor}
          strokeWidth={3}
          strokeDasharray="8,5"
          strokeOpacity={0.8}
          d={path}
          markerEnd="url(#react-flow__arrowclosed)"
          style={{
            animation: 'dashMove 1s linear infinite'
          }}
        />
        {/* Connection point indicators */}
        <circle
          cx={fromX}
          cy={fromY}
          r={4}
          fill={lineColor}
          stroke="#fff"
          strokeWidth={2}
          opacity={0.9}
        />
        <circle
          cx={toX}
          cy={toY}
          r={6}
          fill="transparent"
          stroke={lineColor}
          strokeWidth={2}
          strokeDasharray="3,3"
          opacity={0.7}
          style={{
            animation: 'pulse 1s ease-in-out infinite'
          }}
        />
      </g>
    );
  }, []);
  
  const edgeOptions = {
    animated: true,
    style: { stroke: '#8c9196', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#8c9196'
    }
  };
  
  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={edgeOptions}
        isValidConnection={isValidConnection}
        connectionLineStyle={connectionLineStyle}
        connectionLineComponent={connectionLineComponent}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;