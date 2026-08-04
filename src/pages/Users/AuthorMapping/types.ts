export interface AuthorGroupItem {
  groupId: number;
  secureId: string;
  groupName: string;
  useFlag: boolean;
  comment?: string;
}

export interface ProgramPermissionItem {
  programId: number;
  programKey: string;
  programName: string;
  level: number;
  isSearch: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isSave: boolean;
  isPrint: boolean;
  comment?: string;
  all?: boolean; // Cờ bật/tắt toàn bộ Checkbox trên 1 hàng ở Client
}

export interface PermissionSavePayload {
  programId: number;
  isSearch: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isSave: boolean;
  isPrint: boolean;
}

// --- BỔ SUNG 2 INTERFACE MỚI ---
export interface GroupUserItem {
  userId: number;
  secureId: string;
  userCode: string;
  fullName: string;
  email: string;
  plant: string;
}

export interface CopyPermissionPayload {
  sourceGroupId: number;
  targetGroupId: number;
}
