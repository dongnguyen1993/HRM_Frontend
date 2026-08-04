import type { ProColumns, ProTableProps } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

// 1. Component tiêu đề cột hỗ trợ Kéo chuột (Resize) & Nhấp đúp chuột (Auto-Fit)
const ResizableHeaderCell = (props: any) => {
  const { onResize, onAutoFit, width, children, ...restProps } = props;

  if (!width) return <th {...restProps}>{children}</th>;

  // Xử lý kéo rê chuột đổi độ rộng
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      if (onResize) {
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 2. YÊU CẦU 1: Xử lý sự kiện DOUBLE CLICK để tự động vừa khít với dữ liệu
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAutoFit) {
      onAutoFit();
    }
  };

  return (
    <th
      {...restProps}
      style={{
        ...restProps.style,
        width,
        position: 'relative',
      }}
    >
      {children}
      {/* Vùng cảm ứng: Kéo chuột để đổi độ rộng / Nhấp đúp chuột để Auto-Fit */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => e.stopPropagation()}
        title="Kéo để đổi độ rộng | Nhấp đúp để tự động vừa khít văn bản"
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

// 3. YÊU CẦU 2: Component BaseTable dùng chung cho toàn bộ dự án
export function BaseTable<
  T extends Record<string, any>,
  U extends Record<string, any> = Record<string, any>,
>(props: ProTableProps<T, U>) {
  const { columns = [], scroll, ...restProps } = props;

  const [dynamicColumns, setDynamicColumns] =
    useState<ProColumns<T, any>[]>(columns);

  useEffect(() => {
    setDynamicColumns(columns);
  }, [columns]);

  // Hàm cập nhật độ rộng cột khi kéo rê
  const handleResize = (index: number) => (newWidth: number) => {
    setDynamicColumns((prevCols) => {
      const nextCols = [...prevCols];
      nextCols[index] = {
        ...nextCols[index],
        width: newWidth,
      };
      return nextCols;
    });
  };

  // Hàm tự động tính toán độ rộng vừa khít dữ liệu khi NHẤP ĐÚP CHUỘT
  const handleAutoFit = (index: number, col: ProColumns<T, any>) => () => {
    const titleText = String(col.title || '');
    // Tự động tính độ rộng tối ưu dựa trên độ dài tiêu đề + lề dự phòng
    const estimatedWidth = Math.max(90, titleText.length * 13 + 55);

    setDynamicColumns((prevCols) => {
      const nextCols = [...prevCols];
      nextCols[index] = {
        ...nextCols[index],
        width: estimatedWidth,
      };
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

  return (
    <>
      {/* Khối CSS viền xám đóng gói dùng chung */}
      <style>{`
        .ant-table-bordered .ant-table-container {
          border: 1px solid #d9d9d9 !important;
        }
        .ant-table-bordered th, 
        .ant-table-bordered td {
          border-right: 1px solid #d9d9d9 !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }
        .ant-table-bordered .ant-table-thead > tr > th {
          border-bottom: 2px solid #b0b0b0 !important;
          background-color: #fafafa !important;
          user-select: none;
        }
      `}</style>

      <ProTable<T, U>
        bordered
        columns={resizableColumns}
        scroll={{ y: 'calc(100vh - 430px)', x: 'max-content', ...scroll }}
        components={{
          header: {
            cell: ResizableHeaderCell,
          },
        }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        {...restProps}
      />
    </>
  );
}
