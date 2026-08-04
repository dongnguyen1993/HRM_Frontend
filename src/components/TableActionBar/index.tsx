import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';

interface TableActionBarProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  addText?: string;
  selectedCount?: number;
  extraButtons?: React.ReactNode;
}

export const TableActionBar: React.FC<TableActionBarProps> = ({
  onAdd,
  onEdit,
  onDelete,
  addText = '+ Thêm mới',
  selectedCount = 0,
  extraButtons,
}) => {
  return (
    <Space wrap>
      {onAdd && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          style={{ backgroundColor: '#00AEEF', borderColor: '#00AEEF' }}
        >
          {addText}
        </Button>
      )}
      {onEdit && (
        <Button
          icon={<EditOutlined />}
          disabled={selectedCount !== 1}
          onClick={onEdit}
        >
          Sửa
        </Button>
      )}
      {onDelete && (
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          XÓA ({selectedCount})
        </Button>
      )}
      {extraButtons}
    </Space>
  );
};
