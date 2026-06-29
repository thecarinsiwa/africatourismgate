"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBAC_AUDIT_EVENT_LABELS = exports.RBAC_AUDIT_EVENT_TYPES = void 0;
exports.RBAC_AUDIT_EVENT_TYPES = [
    'role_created',
    'role_updated',
    'role_deleted',
    'permission_created',
    'permission_updated',
    'permission_deleted',
    'role_permission_granted',
    'role_permission_revoked',
    'user_role_granted',
    'user_role_revoked',
    'user_role_extended',
    'impersonation_started',
    'impersonation_ended',
    'permission_denied',
];
exports.RBAC_AUDIT_EVENT_LABELS = {
    role_created: 'Rôle créé',
    role_updated: 'Rôle modifié',
    role_deleted: 'Rôle supprimé',
    permission_created: 'Permission créée',
    permission_updated: 'Permission modifiée',
    permission_deleted: 'Permission supprimée',
    role_permission_granted: 'Permission accordée au rôle',
    role_permission_revoked: 'Permission retirée du rôle',
    user_role_granted: 'Rôle assigné',
    user_role_revoked: 'Rôle révoqué',
    user_role_extended: 'Assignation prolongée',
    impersonation_started: 'Impersonation démarrée',
    impersonation_ended: 'Impersonation terminée',
    permission_denied: 'Accès refusé',
};
