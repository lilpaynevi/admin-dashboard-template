/**
 * Point d'entrée unique du kit.
 *
 * `import { Button, Card } from '@/components/ui'` au lieu de cinq lignes
 * d'import. Les types sont réexportés avec `export type` : `isolatedModules`
 * l'exige, faute de quoi le compilateur laisse passer un import de type dans
 * le bundle final.
 */
export { Avatar, type AvatarProps, type AvatarSize } from './Avatar';
export { Badge, type BadgeProps, type BadgeTone } from './Badge';
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button';
export { Card, CardBody, CardFooter, CardHeader, type CardProps } from './Card';
export { Checkbox, type CheckboxProps } from './Checkbox';
export {
  DataTable,
  type Column,
  type DataTableProps,
  type SortState,
} from './DataTable';
export {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  type DropdownProps,
} from './Dropdown';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { Field, controlStyles, type FieldProps } from './Field';
export { Input, type InputProps } from './Input';
export { Modal, type ModalProps, type ModalSize } from './Modal';
export { Pagination, type PaginationProps } from './Pagination';
export { Select, type SelectOption, type SelectProps } from './Select';
export { Skeleton, SkeletonTable } from './Skeleton';
export { Spinner } from './Spinner';
export { Switch, type SwitchProps } from './Switch';
export { TabPanel, Tabs, type TabItem, type TabsProps } from './Tabs';
export { Textarea, type TextareaProps } from './Textarea';
export { Tooltip, type TooltipProps } from './Tooltip';
