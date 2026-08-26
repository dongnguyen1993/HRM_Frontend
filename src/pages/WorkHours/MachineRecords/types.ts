export interface MachineRecordItem {
  recordId: number;
  logTimestamp: string;
  logDate?: string;
  logTime?: string;
  deviceId?: string;
  deviceName: string;
  userGroup?: string;
  userCode: string;
  userName?: string;
  rawUserString?: string;
  eventDescription?: string;
  fileNameImport?: string;
  status: number;
  createdAt?: string;
}

export interface MachineRecordsPageRequest {
  pageNumber: number;
  pageSize: number;
  searchKeyword?: string;
  userGroup?: string;
  deviceName?: string;
  status?: number;
  fromDate?: string;
  toDate?: string;
}
