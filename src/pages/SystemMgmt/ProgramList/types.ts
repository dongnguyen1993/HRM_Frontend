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
  path?: string;
  apiUrl?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  children?: ProgramMenuItem[];
}
