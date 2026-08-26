import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import {
  batchApproveTimesheets,
  calculateTimesheet,
  getRawUserGroups,
  importAttendanceCsv,
  syncBiostar,
  updateTimesheetRow,
} from '../service';
import type { TimesheetItem, UpdateTimesheetPayload } from '../types';

export function useTimesheet() {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('timesheet');
  const tableRef = useRef<any>();

  const [filterUserGroup, setFilterUserGroup] = useState<string | undefined>(
    undefined,
  );
  const [filterDateRange, setFilterDateRange] = useState<any>(null);
  const [filterIsWarning, setFilterIsWarning] = useState<string | undefined>(
    undefined,
  );
  const [userGroupOptions, setUserGroupOptions] = useState<string[]>([]);

  // BỔ SUNG: STATE LƯU MÃ DÒNG ĐÃ CHỌN CHECKBOX HÀNG LOẠT
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [batchApproving, setBatchApproving] = useState<boolean>(false);

  // State Modals
  const [calcModalVisible, setCalcModalVisible] = useState<boolean>(false);
  const [calcDateRange, setCalcDateRange] = useState<any>(null);
  const [calculating, setCalculating] = useState<boolean>(false);

  const [csvModalVisible, setCsvModalVisible] = useState<boolean>(false);
  const [csvFileList, setCsvFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<TimesheetItem | null>(
    null,
  );
  const [reviewing, setReviewing] = useState<boolean>(false);

  useEffect(() => {
    getRawUserGroups().then((res) => {
      if (res && res.isSuccess) setUserGroupOptions(res.data || []);
    });
  }, []);

  const handleSearch = () => {
    tableRef.current?.setPageInfo?.({ current: 1 });
    tableRef.current?.reload();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setFilterUserGroup(undefined);
    setFilterDateRange(null);
    setFilterIsWarning(undefined);
    setSelectedRowKeys([]);
    tableRef.current?.setPageInfo?.({ current: 1 });
    setTimeout(() => tableRef.current?.reload(), 100);
  };

  // BỔ SUNG: XỬ LÝ PHÊ DUYỆT NHANH HÀNG LOẠT CÁC DÒNG ĐÃ CHỌN CHECKBOX
  const handleBatchApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 dòng để phê duyệt!');
      return;
    }

    setBatchApproving(true);
    try {
      const res = await batchApproveTimesheets(selectedRowKeys);
      if (res && res.isSuccess) {
        message.success(
          `Đã phê duyệt nhanh & Gỡ cờ đỏ cho ${selectedRowKeys.length} dòng thành công!`,
        );
        setSelectedRowKeys([]);
        tableRef.current?.reload();
      } else {
        message.error(res?.message || 'Phê duyệt hàng loạt thất bại');
      }
    } catch {
      message.error('Lỗi khi phê duyệt hàng loạt');
    } finally {
      setBatchApproving(false);
    }
  };

  const handleSyncBiostar = async () => {
    try {
      message.loading('Đang kết nối Máy chủ Suprema BioStar 2...', 2);
      const res = await syncBiostar('2026-06-01', '2026-06-30');
      if (res && res.isSuccess) {
        message.success('Đồng bộ dữ liệu BioStar 2 thành công!');
        tableRef.current?.reload();
      }
    } catch {
      message.error('Lỗi khi kết nối tới Suprema BioStar 2');
    }
  };

  const handleRunTimesheetEngine = async () => {
    if (!calcDateRange || calcDateRange.length !== 2) {
      message.warning('Vui lòng chọn Khoảng thời gian!');
      return;
    }

    setCalculating(true);
    try {
      const res = await calculateTimesheet(
        calcDateRange[0].format('YYYY-MM-DD'),
        calcDateRange[1].format('YYYY-MM-DD'),
      );
      if (res && res.isSuccess) {
        message.success('Chạy tính công tự động thành công!');
        setFilterDateRange(calcDateRange);
        setCalcModalVisible(false);
        tableRef.current?.setPageInfo?.({ current: 1 });
        setTimeout(() => tableRef.current?.reload(), 100);
      } else {
        message.error(res?.message || 'Tính công thất bại');
      }
    } catch {
      message.error('Lỗi khi chạy tính công tự động');
    } finally {
      setCalculating(false);
    }
  };

  const handleImportCsv = async () => {
    if (csvFileList.length === 0) {
      message.warning('Vui lòng chọn tệp CSV!');
      return;
    }

    setUploading(true);
    try {
      const res = await importAttendanceCsv(csvFileList[0].originFileObj);
      if (res && res.isSuccess) {
        message.success('Nhập dữ liệu máy chấm công thành công!');
        setCsvModalVisible(false);
        setCsvFileList([]);
        tableRef.current?.reload();
      } else {
        message.error(res?.message || 'Nhập thất bại');
      }
    } catch {
      message.error('Lỗi khi nạp tệp CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenReview = (record: TimesheetItem) => {
    setSelectedRecord(record);
    setReviewModalVisible(true);
  };

  const handleSaveReview = async (values: any) => {
    if (!selectedRecord) return;
    setReviewing(true);
    try {
      const payload: UpdateTimesheetPayload = {
        logId: selectedRecord.logId,
        checkInTime: values.checkInTime
          ? values.checkInTime.format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        checkOutTime: values.checkOutTime
          ? values.checkOutTime.format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        shiftName: values.shiftName,
        workUnits: values.workUnits,
        otHours: values.otHours,
        note: values.note,
      };

      const res = await updateTimesheetRow(payload);
      if (res && res.isSuccess) {
        message.success('Đã duyệt thủ công & Gỡ bỏ Cờ Đỏ!');
        setReviewModalVisible(false);
        tableRef.current?.reload();
      } else {
        message.error(res?.message || 'Cập nhật thất bại');
      }
    } catch {
      message.error('Lỗi hệ thống khi cập nhật');
    } finally {
      setReviewing(false);
    }
  };

  return {
    tableRef,
    activeTab,
    setActiveTab,
    searchKeyword,
    setSearchKeyword,
    filterUserGroup,
    setFilterUserGroup,
    filterDateRange,
    setFilterDateRange,
    filterIsWarning,
    setFilterIsWarning,
    userGroupOptions,
    selectedRowKeys,
    setSelectedRowKeys,
    batchApproving,
    handleBatchApprove,
    calcModalVisible,
    setCalcModalVisible,
    calcDateRange,
    setCalcDateRange,
    calculating,
    csvModalVisible,
    setCsvModalVisible,
    csvFileList,
    setCsvFileList,
    uploading,
    reviewModalVisible,
    setReviewModalVisible,
    selectedRecord,
    reviewing,
    handleSearch,
    handleReset,
    handleSyncBiostar,
    handleRunTimesheetEngine,
    handleImportCsv,
    handleOpenReview,
    handleSaveReview,
  };
}
