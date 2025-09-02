// Central icon mapping to avoid invalid icon imports
// Use this file to import and re-export all valid Polaris icons

import {
  // Valid icons from @shopify/polaris-icons
  SaveIcon,
  FolderIcon,
  CheckCircleIcon,
  DeleteIcon,
  PlusIcon,
  SettingsIcon,
  InfoIcon,
  AlertTriangleIcon,
  PlayIcon,
  QuestionCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  DuplicateIcon,
  EmailIcon,
  XCircleIcon,
  ProductIcon,
  ClockIcon,
} from '@shopify/polaris-icons';

// Export all icons with descriptive names
export const Icons = {
  // Actions
  Save: SaveIcon,
  Load: FolderIcon,
  Add: PlusIcon,
  Delete: DeleteIcon,
  Edit: EditIcon,
  Copy: DuplicateIcon,
  Close: XCircleIcon,
  
  // Status & Validation
  Check: CheckCircleIcon,
  Info: InfoIcon,
  Warning: AlertTriangleIcon,
  Question: QuestionCircleIcon,
  
  // Navigation
  ArrowRight: ArrowRightIcon,
  ArrowLeft: ArrowLeftIcon,
  ChevronDown: ChevronDownIcon,
  ChevronUp: ChevronUpIcon,
  
  // Node types (using semantically appropriate icons)
  Trigger: PlayIcon,        // Purple trigger nodes
  Condition: QuestionCircleIcon, // Green condition nodes
  Action: SettingsIcon,         // Teal action nodes
  Step: ArrowRightIcon,     // Indigo step nodes
  
  // Specific actions
  Settings: SettingsIcon,
  Email: EmailIcon,
  Tag: ProductIcon,
  Timer: ClockIcon,
  
  // Fallback for any missing icons
  Default: InfoIcon
};

// Type for icon keys
export type IconKey = keyof typeof Icons;

// Helper function to get icon safely
export const getIcon = (key: IconKey): typeof InfoIcon => {
  return Icons[key] || Icons.Default;
};