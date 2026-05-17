export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface IPermission {
  id: string;
  resource: string;
  action: PermissionAction;
  description: string;
}

export interface IRole {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  isSystem: boolean;
}

export interface IUserTenantAssignment {
  tenantId: string;
  tenantName: string;
  roleIds: string[];
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string | null;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  assignments: IUserTenantAssignment[];
}
