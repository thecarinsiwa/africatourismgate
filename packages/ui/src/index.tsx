import type { ReactNode } from 'react';

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
export { DataTable, type DataTableProps, type DataTableAlign } from './components/data-table';
export type { ColumnDef } from './components/data-table';
export { DataTableBadge, type DataTableBadgeProps, type DataTableBadgeVariant } from './components/data-table-badge';
export {
  DataTablePagination,
  type DataTablePaginationProps,
} from './components/data-table-pagination';
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
