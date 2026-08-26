export interface LaborContractItem {
  contractId: number;
  contractNo: string;
  userId: number;
  userCode: string;
  fullName: string;
  contractType: string;
  insuranceSalary: number;
  startDate: string;
  endDate?: string;
  signDate: string;
  status: number; // 1: Hiệu lực, 0: Hết hạn / Khóa
  comment?: string;
  createdAt?: string;
  createdBy?: string;
}
