import {
  DownloadOutlined,
  PrinterOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import type { MonthlyMatrixRow } from '../types';

interface MonthlyMatrixTabProps {
  loading: boolean;
  dataSource: MonthlyMatrixRow[];
  dateRange: [string, string];
  onExportExcel: () => void;
}

export const MonthlyMatrixTab: React.FC<MonthlyMatrixTabProps> = ({
  loading,
  dataSource,
  dateRange,
  onExportExcel,
}) => {
  // 1. TÍNH TOÁN DANH SÁCH 31 NGÀY CÔNG DỰA TRÊN CHU KỲ (11 -> 10)
  const daysInCycle = useMemo(() => {
    const days: { dateStr: string; dayLabel: string; isWeekend: boolean }[] =
      [];
    let curr = dayjs(dateRange[0]);
    const end = dayjs(dateRange[1]);

    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      const dayOfWeek = curr.day();
      days.push({
        dateStr: curr.format('YYYY-MM-DD'),
        dayLabel: curr.format('DD-MMM'),
        isWeekend: dayOfWeek === 0,
      });
      curr = curr.add(1, 'day');
    }
    return days;
  }, [dateRange]);

  // 2. CẤU HÌNH CỘT MA TRẬN CHUẨN 55 CỘT HANSOL
  const columns: any[] = [
    {
      title: 'STT',
      width: 50,
      fixed: 'left',
      align: 'center',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Mã NV',
      dataIndex: 'userCode',
      width: 95,
      fixed: 'left',
      render: (text: string) => <b style={{ color: '#1890ff' }}>{text}</b>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      width: 160,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: 'Bộ phận',
      dataIndex: 'userGroup',
      width: 110,
      fixed: 'left',
      render: (t: string) => <Tag color="blue">{t}</Tag>,
    },

    // NHÓM 31 CỘT NGÀY TRONG THÁNG
    {
      title: `BẢNG CHẤM CÔNG THÁNG (${dateRange[0]} ~ ${dateRange[1]})`,
      children: daysInCycle.map((d) => ({
        title: (
          <div
            style={{
              textAlign: 'center',
              color: d.isWeekend ? '#ff4d4f' : 'inherit',
            }}
          >
            <div style={{ fontSize: 11 }}>{d.dayLabel}</div>
            <div style={{ fontSize: 10, fontWeight: 'normal' }}>
              {dayjs(d.dateStr).format('ddd')}
            </div>
          </div>
        ),
        dataIndex: ['dailyCells', d.dateStr],
        width: 48,
        align: 'center',
        render: (cell: any) => {
          if (!cell || !cell.text) {
            return d.isWeekend ? (
              <span style={{ color: '#d9d9d9' }}>-</span>
            ) : (
              <span style={{ color: '#bfbfbf' }}>.</span>
            );
          }

          // Phân màu chính xác như tài liệu Hansol:
          if (cell.type === 'NIGHT') {
            return (
              <div
                style={{
                  backgroundColor: '#bae7ff',
                  color: '#0050b3',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  padding: '1px 0',
                }}
              >
                {cell.text}
              </div>
            );
          }
          if (cell.type === 'HALF') {
            return (
              <div
                style={{
                  backgroundColor: '#fffb8f',
                  color: '#d48806',
                  fontWeight: 'bold',
                  borderRadius: 3,
                }}
              >
                {cell.text}
              </div>
            );
          }
          if (cell.text.startsWith('P')) {
            return (
              <Tag
                color="magenta"
                style={{ margin: 0, padding: '0 2px', fontSize: 10 }}
              >
                {cell.text}
              </Tag>
            );
          }
          return <span style={{ fontWeight: 600 }}>{cell.text}</span>;
        },
      })),
    },

    // NHÓM TỔNG HỢP GIỜ CÔNG & OT
    {
      title: 'TỔNG HỢP CÔNG',
      children: [
        {
          title: 'Ca Ngày (h)',
          dataIndex: 'dayWorkHours',
          width: 75,
          align: 'right',
          render: (v: number) => v?.toFixed(1) || '0.0',
        },
        {
          title: 'Ca Đêm (h)',
          dataIndex: 'nightWorkHours',
          width: 75,
          align: 'right',
          render: (v: number) => (
            <span style={{ color: '#1890ff', fontWeight: 600 }}>
              {v?.toFixed(1) || '0.0'}
            </span>
          ),
        },
        {
          title: 'Tổng Giờ Làm',
          dataIndex: 'totalActualHours',
          width: 85,
          align: 'right',
          render: (v: number) => (
            <b style={{ color: '#00A651' }}>{v?.toFixed(1) || '0.0'}</b>
          ),
        },
        {
          title: 'Tăng Ca (OT)',
          dataIndex: 'totalOtHours',
          width: 80,
          align: 'right',
          render: (v: number) =>
            v > 0 ? (
              <Tag color="orange" style={{ fontWeight: 'bold' }}>
                +{v.toFixed(1)}h
              </Tag>
            ) : (
              '-'
            ),
        },
      ],
    },
  ];

  return (
    <Card
      size="small"
      title={
        <Space>
          <TableOutlined style={{ color: '#00A651' }} />
          <span>
            Bảng Chấm Công Ma Trận 31 Ngày Toàn Nhà Máy (Hansol Official Matrix)
          </span>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In Bảng Công
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={onExportExcel}
            style={{ backgroundColor: '#00A651', borderColor: '#00A651' }}
          >
            Xuất Excel Chuẩn Hansol
          </Button>
        </Space>
      }
    >
      {/* CHÚ THÍCH MÀU SẮC */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 12,
          fontSize: 12,
          flexWrap: 'wrap',
        }}
      >
        <Space>
          <div
            style={{
              width: 14,
              height: 14,
              backgroundColor: '#ffffff',
              border: '1px solid #d9d9d9',
            }}
          />
          <span>Ca Ngày (9.6h)</span>
        </Space>
        <Space>
          <div
            style={{
              width: 14,
              height: 14,
              backgroundColor: '#bae7ff',
              border: '1px solid #91d5ff',
            }}
          />
          <span style={{ color: '#0050b3', fontWeight: 600 }}>
            Ca Đêm (9.6h)
          </span>
        </Space>
        <Space>
          <div
            style={{
              width: 14,
              height: 14,
              backgroundColor: '#fffb8f',
              border: '1px solid #ffe58f',
            }}
          />
          <span style={{ color: '#d48806', fontWeight: 600 }}>
            Nửa công (4.8h / Về sớm)
          </span>
        </Space>
        <Space>
          <Tag color="magenta">P01</Tag> Phép năm
        </Space>
        <Space>
          <Tag color="red">P12</Tag> Không phép
        </Space>
        <Space>
          <Tag color="purple">P13</Tag> Thai sản
        </Space>
      </div>

      <Table
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowKey="userCode"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 2500, y: 'calc(100vh - 430px)' }}
        size="small"
      />
    </Card>
  );
};
