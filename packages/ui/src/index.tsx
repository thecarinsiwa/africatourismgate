export { cn } from './lib/cn';

export { AppShell } from './app-shell';
export { DashboardShell, type DashboardShellProps } from './components/dashboard-shell';
export {
  Sidebar,
  type SidebarNavEntry,
  type SidebarNavGroup,
  type SidebarNavItem,
  type SidebarNavLink,
  type SidebarProps,
} from './components/sidebar';
export {
  SidebarActivityIcon,
  SidebarBookingsIcon,
  SidebarCarIcon,
  SidebarChatIcon,
  SidebarCreditCardIcon,
  SidebarDashboardIcon,
  SidebarDocumentIcon,
  SidebarGiftIcon,
  SidebarGlobeIcon,
  SidebarHeadsetIcon,
  SidebarListIcon,
  SidebarMapPinIcon,
  SidebarOrganisationsIcon,
  SidebarPackageIcon,
  SidebarPaymentsIcon,
  SidebarPlaneIcon,
  SidebarPropertiesIcon,
  SidebarRolesIcon,
  SidebarSettingsIcon,
  SidebarShipIcon,
  SidebarShieldIcon,
  SidebarStarIcon,
  SidebarTicketIcon,
  SidebarUserCircleIcon,
  SidebarUsersIcon,
} from './components/sidebar-nav-icons';
export { AppHeader, type AppHeaderProps } from './components/app-header';
export { UserMenu, type UserMenuLink, type UserMenuProps } from './components/user-menu';
export { ThemeProvider } from './theme-provider';
export { ThemeToggle, type ThemeToggleProps } from './components/theme-toggle';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './components/button';
export { Input, type InputProps } from './components/input';
export { PasswordInput, type PasswordInputProps } from './components/password-input';
export { Checkbox, type CheckboxProps } from './components/checkbox';
export { Card, type CardProps } from './components/card';
export { Skeleton, type SkeletonProps } from './components/skeleton';
export { StarRatingInput, type StarRatingInputProps } from './components/star-rating-input';
export { StatCard, type StatCardProps, type StatCardStatus } from './components/stat-card';
export { Avatar, type AvatarProps, type AvatarSize } from './components/avatar';
export {
  getUserDisplayName,
  getUserInitials,
  hashEmailToColor,
  hashEmailToHue,
} from './lib/avatar-utils';
export { FilterBar, type FilterBarProps } from './components/filter-bar';
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
} from './components/tabs';
export { PageHeader, type PageHeaderProps } from './components/page-header';
export { Breadcrumb, type BreadcrumbProps, type BreadcrumbItem } from './components/breadcrumb';
export { Select, type SelectProps, type SelectOption } from './components/select';
export { Modal, type ModalProps } from './components/modal';
export {
  AlertDialog,
  type AlertDialogProps,
  type AlertDialogVariant,
} from './components/alert-dialog';
export {
  ToastProvider,
  useToast,
  type ToastOptions,
  type ToastVariant,
} from './components/toast';
export { DataTable, type DataTableProps, type DataTableAlign } from './components/data-table';
export type { ColumnDef } from './components/data-table';
export { DataTableBadge, type DataTableBadgeProps, type DataTableBadgeVariant } from './components/data-table-badge';
export {
  DataTablePagination,
  type DataTablePaginationProps,
} from './components/data-table-pagination';
export {
  DataTableActionButton,
  DataTableActions,
  DataTableAdjustButton,
  type DataTableActionButtonProps,
  type DataTableActionKind,
  type DataTableActionsProps,
  type DataTableAdjustButtonProps,
} from './components/data-table-actions';
export {
  DataTableAdjustIcon,
  DataTableCalendarIcon,
  DataTableDeleteIcon,
  DataTableEditIcon,
  DataTableViewIcon,
} from './components/data-table-icons';
export { EmptyState, type EmptyStateProps } from './components/empty-state';
export { Divider, type DividerProps } from './components/divider';
export { TextLink, type TextLinkProps } from './components/text-link';
export { Logo, type LogoProps } from './components/logo';
export {
  LoginForm,
  defaultLoginFormConfig,
  type LoginFormConfig,
  type LoginFormProps,
} from './components/login-form';
export {
  RegisterForm,
  defaultRegisterFormConfig,
  type RegisterFormConfig,
  type RegisterFormData,
  type RegisterFormProps,
} from './components/register-form';
