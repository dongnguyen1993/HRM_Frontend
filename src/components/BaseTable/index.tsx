import {
  CodeOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ProColumns, ProTableProps } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Button, message, Modal, Popconfirm, Space, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';

// ============================================================================
// 1. COMPONENT HEADER RESIZE & AUTO-FIT
// ============================================================================
const ResizableHeaderCell = (props: any) => {
  const { onResize, onAutoFit, width, children, ...restProps } = props;

  if (!width) return <th {...restProps}>{children}</th>;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      if (onResize) onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAutoFit) onAutoFit();
  };

  return (
    <th
      {...restProps}
      style={{ ...restProps.style, width, position: 'relative' }}
    >
      {children}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => e.stopPropagation()}
        title="Kéo để đổi độ rộng | Nhấp đúp để tự động vừa khít"
        style={{
          position: 'absolute',
          right: -5,
          top: 0,
          bottom: 0,
          width: '10px',
          cursor: 'col-resize',
          zIndex: 10,
          userSelect: 'none',
        }}
      />
    </th>
  );
};

// ============================================================================
// 2. PROPS DÙNG CHUNG
// ============================================================================
export interface CustomBaseTableProps<T, U = Record<string, any>>
  extends Omit<ProTableProps<T, U>, 'request'> {
  queryFile?: string;
  queryKey?: string;
  request?: ProTableProps<T, U>['request'];
  enableAutoSort?: boolean;
  onSttClick?: (record: T, index: number) => void;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  onBatchDelete?: (selectedRowKeys: React.Key[]) => void;
  onCreate?: () => void;
  createButtonText?: string;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onExportExcel?: () => void;
}

// ============================================================================
// 3. COMPONENT BASE TABLE CHÍNH
// ============================================================================
export function BaseTable<
  T extends Record<string, any>,
  U extends Record<string, any> = Record<string, any>,
>(props: CustomBaseTableProps<T, U>) {
  const {
    columns = [],
    scroll,
    toolBarRender,
    queryFile,
    queryKey,
    enableAutoSort = true,
    onSttClick,
    selectedRowKeys,
    onSelectionChange,
    onBatchDelete,
    onCreate,
    createButtonText = 'Thêm mới',
    onEdit,
    onDelete,
    onExportExcel,
    rowKey,
    rowSelection,
    ...restProps
  } = props;

  const [dynamicColumns, setDynamicColumns] = useState<ProColumns<T, any>[]>(
    [],
  );
  const [sqlModalVisible, setSqlModalVisible] = useState(false);
  const [sqlContent, setSqlContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // TỰ ĐỘNG XÁC ĐỊNH ROWKEY AN TOÀN TRÁNH BỊ UNDEFINED
  const resolvedRowKey = (record: T): string => {
    if (typeof rowKey === 'function') return String(rowKey(record));
    if (typeof rowKey === 'string' && record[rowKey] !== undefined)
      return String(record[rowKey]);
    return String(
      record.recordId ??
        record.RecordId ??
        record.secureId ??
        record.SecureId ??
        record.userId ??
        record.id ??
        record.key,
    );
  };

  // CẤU HÌNH ROW SELECTION ĐỒNG BỘ: ƯU TIÊN ROWSELECTION TRUYỀN VÀO TỪ NGOÀI
  const finalRowSelection = rowSelection
    ? {
        ...rowSelection,
        preserveSelectedRowKeys: true,
      }
    : selectedRowKeys || onSelectionChange
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[], rows: T[]) => {
          if (onSelectionChange) onSelectionChange(keys, rows);
        },
        preserveSelectedRowKeys: true,
      }
    : undefined;

  // PHÂN TÍCH VÀ BỔ SUNG TÍNH NĂNG CHO CỘT
  useEffect(() => {
    let updatedColumns: ProColumns<T, any>[] = [...columns];

    if (enableAutoSort) {
      updatedColumns = updatedColumns.map((col) => {
        if (
          col.sorter !== undefined ||
          col.key === 'action' ||
          col.valueType === 'option'
        ) {
          return col;
        }
        const dataIndex = col.dataIndex as string;
        if (!dataIndex) return col;

        return {
          ...col,
          sorter: (a: any, b: any) => {
            const valA = a[dataIndex];
            const valB = b[dataIndex];
            if (valA === undefined || valA === null) return -1;
            if (valB === undefined || valB === null) return 1;
            if (typeof valA === 'number' && typeof valB === 'number')
              return valA - valB;
            if (!isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))) {
              return new Date(valA).getTime() - new Date(valB).getTime();
            }
            return String(valA).localeCompare(String(valB));
          },
        };
      });
    }

    updatedColumns = updatedColumns.map((col) => {
      if (
        col.valueType === 'index' ||
        col.dataIndex === 'index' ||
        col.title === 'STT'
      ) {
        return {
          ...col,
          render: (text: any, record: T, index: number, action: any) => {
            const current = action?.pageInfo?.current || 1;
            const pageSize = action?.pageInfo?.pageSize || 15;
            const sttIndex = (current - 1) * pageSize + index + 1;

            if (onSttClick) {
              return (
                <Button
                  type="link"
                  size="small"
                  style={{
                    padding: 0,
                    fontWeight: 'bold',
                    fontSize: 13,
                    color: '#1890ff',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSttClick(record, index);
                  }}
                >
                  {sttIndex}
                </Button>
              );
            }
            return sttIndex;
          },
        };
      }
      return col;
    });

    const hasOptionCol = updatedColumns.some(
      (c) => c.key === 'action' || c.valueType === 'option',
    );

    if ((onEdit || onDelete) && !hasOptionCol) {
      updatedColumns.push({
        title: 'Thao Tác',
        key: 'action',
        valueType: 'option',
        width: 130,
        fixed: 'right',
        render: (_, record) => (
          <Space size={6}>
            {onEdit && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(record);
                  }}
                  style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                >
                  Sửa
                </Button>
              </Tooltip>
            )}

            {onDelete && (
              <Popconfirm
                title="Xác nhận xóa bản ghi này?"
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  onDelete(record);
                }}
              >
                <Tooltip title="Xóa">
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Xóa
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        ),
      });
    }

    setDynamicColumns(updatedColumns);

    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr);
        if (
          user.userCode === 'ADMIN' ||
          user.userCode === 'SYSTEM' ||
          user.authorGroupId?.toLowerCase() === 'administrator' ||
          user.fullName?.toLowerCase().includes('admin')
        ) {
          setIsAdmin(true);
        }
      } catch {}
    }
  }, [columns, enableAutoSort, onSttClick, onEdit, onDelete]);

  const handleResize = (index: number) => (newWidth: number) => {
    setDynamicColumns((prevCols) => {
      const nextCols = [...prevCols];
      nextCols[index] = { ...nextCols[index], width: newWidth };
      return nextCols;
    });
  };

  const handleAutoFit = (index: number, col: ProColumns<T, any>) => () => {
    const titleText = String(col.title || '');
    const estimatedWidth = Math.max(90, titleText.length * 13 + 55);
    setDynamicColumns((prevCols) => {
      const nextCols = [...prevCols];
      nextCols[index] = { ...nextCols[index], width: estimatedWidth };
      return nextCols;
    });
  };

  const resizableColumns = dynamicColumns.map((col, index) => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width || 120,
      onResize: handleResize(index),
      onAutoFit: handleAutoFit(index, col),
    }),
  }));

  const handleShowSql = async () => {
    if (!queryFile || !queryKey) {
      message.warning('Màn hình này chưa được cấu hình QueryFile và QueryKey!');
      return;
    }
    try {
      const res = await request<any>('/api/system-settings/sql-debugger', {
        method: 'GET',
        params: { queryFile, queryKey },
      });
      if (res && res.isSuccess) {
        setSqlContent(res.data);
        setSqlModalVisible(true);
      } else {
        message.error(res?.message || 'Không có quyền xem SQL');
      }
    } catch {
      message.error('Lỗi khi lấy câu lệnh SQL từ máy chủ');
    }
  };

  const handleCopySql = () => {
    if (!sqlContent) return;
    navigator.clipboard
      .writeText(sqlContent)
      .then(() => message.success('Đã sao chép câu lệnh SQL!'))
      .catch(() => message.error('Sao chép thất bại!'));
  };

  const customToolBarRender = (action: any, rows: any) => {
    const defaultTools = toolBarRender ? toolBarRender(action, rows) : [];

    if (onCreate) {
      defaultTools.unshift(
        <Button
          key="btn-create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          style={{
            backgroundColor: '#00A651',
            borderColor: '#00A651',
            fontWeight: 'bold',
          }}
        >
          {createButtonText}
        </Button>,
      );
    }

    if (onExportExcel) {
      defaultTools.push(
        <Button
          key="btn-export"
          icon={<ExportOutlined />}
          onClick={onExportExcel}
          style={{ fontWeight: 500 }}
        >
          Xuất Excel
        </Button>,
      );
    }

    if (isAdmin && queryFile && queryKey) {
      defaultTools.push(
        <Tooltip title="Xem câu lệnh SQL thực thi (Chỉ dành cho ADMIN)">
          <Button
            key="show-sql"
            type="dashed"
            icon={<CodeOutlined />}
            onClick={handleShowSql}
            style={{ color: '#1890ff', borderColor: '#1890ff' }}
          />
        </Tooltip>,
      );
    }
    return defaultTools;
  };

  return (
    <>
      <style>{`
        .ant-table-bordered .ant-table-container { border: 1px solid #d9d9d9 !important; }
        .ant-table-bordered th, .ant-table-bordered td { border-right: 1px solid #d9d9d9 !important; border-bottom: 1px solid #d9d9d9 !important; }
        .ant-table-bordered .ant-table-thead > tr > th { border-bottom: 2px solid #b0b0b0 !important; background-color: #fafafa !important; user-select: none; }
        .ant-table-row-selected { background-color: #e6f7ff !important; }
      `}</style>

      <ProTable<T, U>
        bordered
        rowKey={resolvedRowKey}
        columns={resizableColumns}
        scroll={{ y: 'calc(100vh - 430px)', x: 'max-content', ...scroll }}
        components={{ header: { cell: ResizableHeaderCell } }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        toolBarRender={customToolBarRender}
        {...restProps}
        rowSelection={finalRowSelection}
      />

      <Modal
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingRight: 24,
            }}
          >
            <span>🔍 SQL Debugger - [{queryKey}]</span>
            <Tooltip title="Sao chép toàn bộ SQL">
              <Button
                type="primary"
                icon={<CopyOutlined />}
                size="small"
                onClick={handleCopySql}
                style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
              >
                Copy SQL
              </Button>
            </Tooltip>
          </div>
        }
        open={sqlModalVisible}
        onCancel={() => setSqlModalVisible(false)}
        footer={null}
        width={800}
      >
        <pre
          style={{
            backgroundColor: '#1e1e1e',
            color: '#56b6c2',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '13px',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: "Consolas, 'Courier New', monospace",
            marginTop: '8px',
          }}
        >
          {sqlContent}
        </pre>
      </Modal>
    </>
  );
}
