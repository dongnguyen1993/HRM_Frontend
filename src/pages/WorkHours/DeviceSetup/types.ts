export interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface DeviceSetupItem {
  deviceId: number;
  bioStarDeviceId: string;
  deviceName: string;
  deviceGroup: string;
  deviceType: string;
  gateDirection: 'GATE_IN' | 'GATE_OUT' | 'WORKSHOP' | 'OFFICE';
  ipAddress: string;
  port: number;
  deviceStatus: string;
  description?: string;
  status: number; // 1: Active, 0: Deleted
  lastPingTime?: string;
  createdAt?: string;
}
