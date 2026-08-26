export interface DepartmentItem {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId?: number;
  level: number;
  sortOrder: number;
  useFlag: boolean;
  comment?: string;
  children?: DepartmentItem[];
}
