export interface ProgramMenuItem {
  programId: number;
  programKey: string;
  parentProgramKey?: string;
  programName: string;
  programGroup?: string;
  level: number;
  useFlag: boolean;
  menuFlag: boolean;
  nameSpace?: string;
  className?: string;
  assemblyName?: string;
  sortOrder: number;
  comment?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  children?: ProgramMenuItem[];
}

export interface ProgramMenuSavePayload {
  programId?: number;
  programKey: string;
  parentProgramKey?: string;
  programName: string;
  programGroup?: string;
  useFlag: boolean;
  menuFlag: boolean;
  nameSpace?: string;
  className?: string;
  assemblyName?: string;
  sortOrder: number;
  comment?: string;
}
