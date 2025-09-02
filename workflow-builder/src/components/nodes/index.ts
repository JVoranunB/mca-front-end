import StartNode from './StartNode';
import TriggerNode from './TriggerNode';
import ConditionNode from './ConditionNode';
import ActionNode from './ActionNode';
import StepNode from './StepNode';

export const nodeTypes = {
  start: StartNode,
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  step: StepNode,
};

export { StartNode, TriggerNode, ConditionNode, ActionNode, StepNode };