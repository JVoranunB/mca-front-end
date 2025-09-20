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
import type { WorkflowNode, WorkflowPeer, NodeData, StartConfig } from '../types/workflow.types';

interface WorkflowCanvasProps {
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setReactFlowInstance: (instance: any) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ onDrop, onDragOver, setReactFlowInstance }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const startActionAttempted = useRef(false);
  
  const {
    actions,
    peers,
    onActionsChange,
    onPeersChange,
    onConnect,
    selectAction,
    selectPeer,
    selectedAction,
    selectedPeer,
    deletePeer,
    deleteAction,
    addAction,
    setRightSidebarVisible,
    showToast
  } = useWorkflowStore();
  
  // Auto-create start action when canvas is empty
  useEffect(() => {
    const hasStartAction = actions.some(action => action.type === 'start');

    // Only add start action if there are no start-type actions and we haven't attempted it yet
    if (!hasStartAction && !startActionAttempted.current) {
      startActionAttempted.current = true;
      const startAction: WorkflowNode = {
        id: 'start-action',
        type: 'start',
        position: { x: 250, y: 200 },
        data: {
          label: 'Start',
          type: 'start',
          description: 'Workflow starting point',
          config: {
            label: 'Workflow Start',
            description: 'Beginning of workflow execution',
            merchant_id: '',
            data_source: 'CRM'
          } as StartConfig
        } as NodeData
      };

      addAction(startAction);
    }
  }, [actions, addAction]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = (instance: any) => {
    setReactFlowInstance(instance);
  };
  
  const onActionClick = useCallback((_event: React.MouseEvent, action: WorkflowNode) => {
    selectAction(action);
    // Auto-open right sidebar when an action is selected
    setRightSidebarVisible(true);
  }, [selectAction, setRightSidebarVisible]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPeerClick = useCallback((_event: React.MouseEvent, peer: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectPeer(peer as any);
  }, [selectPeer]);

  // Handle peer context menu (right-click)
  const onPeerContextMenu = useCallback((event: React.MouseEvent, peer: WorkflowPeer) => {
    event.preventDefault();
    const confirmDelete = window.confirm('Delete this connection?');
    if (confirmDelete) {
      deletePeer(peer.id);
      selectPeer(null);
    }
  }, [deletePeer, selectPeer]);

  // Handle node and edge deletion with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle delete/backspace if user is typing in input fields
      const target = event.target as HTMLElement;
      const isTyping = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable ||
        target.closest('[contenteditable]') ||
        target.closest('input') ||
        target.closest('textarea')
      );
      
      if (isTyping) {
        return; // Let the input handle the keypress normally
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedAction) {
          // Prevent deletion of start actions
          if (selectedAction.type === 'start') {
            console.log('Cannot delete start action');
            return;
          }
          event.preventDefault();
          deleteAction(selectedAction.id);
          selectAction(null);
        } else if (selectedPeer) {
          event.preventDefault();
          deletePeer(selectedPeer.id);
          selectPeer(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedAction, selectedPeer, deleteAction, deletePeer, selectAction, selectPeer]);
  
  const onPaneClick = useCallback(() => {
    selectAction(null);
    selectPeer(null);
  }, [selectAction, selectPeer]);

  // Custom connection validation to ensure proper handle connections and sequential order
  const isValidConnection = useCallback((connection: WorkflowPeer | Connection) => {
    // Ensure we're connecting from output (source) to input (target)
    // Source handles should be 'output', 'yes', or 'no'
    // Target handles should be 'input'
    const validSourceHandles = ['output', 'yes', 'no'];
    const validTargetHandles = ['input'];
    
    const sourceHandle = 'sourceHandle' in connection ? connection.sourceHandle : connection.source_handle;
    const targetHandle = 'targetHandle' in connection ? connection.targetHandle : connection.target_handle;

    const isValidSource = !sourceHandle || validSourceHandles.includes(sourceHandle);
    const isValidTarget = !targetHandle || validTargetHandles.includes(targetHandle);
    
    if (!isValidSource || !isValidTarget) {
      return false;
    }

    // Get source and target actions
    const sourceAction = actions.find(action => action.id === connection.source);
    const targetAction = actions.find(action => action.id === connection.target);
    
    if (!sourceAction || !targetAction) {
      return false;
    }

    // Restrict start actions to only connect to one condition action
    if (sourceAction.type === 'start') {
      // Check if start action already has outgoing connections to other targets
      const existingConnections = peers.filter(peer => 
        peer.source === connection.source && peer.target !== connection.target
      );
      if (existingConnections.length > 0) {
        showToast('Start action can only connect to one condition action');
        return false;
      }
      
      // Only allow connections to condition actions
      if (targetAction.type !== 'condition') {
        showToast('Start action can only connect to condition actions');
        return false;
      }
    }

    // Sequential connection validation based on action positions
    // Actions can only connect to actions that are positioned to their right and within reasonable vertical range
    const sourceX = sourceAction.position.x;
    const sourceY = sourceAction.position.y;
    const targetX = targetAction.position.x;

    // Target must be to the right of source (left-to-right flow)
    if (targetX <= sourceX + 50) { // Adding 50px buffer for same-column positioning
      return false;
    }

    // Prevent connecting to actions that are too far to the right (skip prevention)
    // Find all actions between source and target horizontally
    const actionsBetween = actions.filter(action => {
      const actionX = action.position.x;
      const actionY = action.position.y;
      
      // Action is between source and target horizontally
      const isBetweenHorizontally = actionX > sourceX + 50 && actionX < targetX - 50;
      
      // Action is within reasonable vertical range (same workflow level)
      const verticalDistance = Math.abs(actionY - sourceY);
      const isInVerticalRange = verticalDistance < 200; // Allow some vertical spacing
      
      // Exclude the source and target actions themselves
      return isBetweenHorizontally && isInVerticalRange && 
             action.id !== connection.source && action.id !== connection.target;
    });

    // If there are actions in between, prevent the connection (no crossing over)
    if (actionsBetween.length > 0) {
      showToast('Cannot skip over intermediate actions');
      return false;
    }

    return true;
  }, [actions, peers, showToast]);

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
  
  const peerOptions = {
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
        nodes={actions}
        edges={peers}
        onNodesChange={onActionsChange}
        onEdgesChange={onPeersChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onActionClick}
        onEdgeClick={onPeerClick}
        onEdgeContextMenu={onPeerContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={peerOptions}
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