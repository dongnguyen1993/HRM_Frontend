import React, { useEffect, useState, useRef } from 'react';
import { Badge, Popover, List, Typography, Space, Button, notification, Empty } from 'antd';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import * as signalR from '@microsoft/signalr';
import { history } from '@umijs/max';
import type { RealtimeNotification } from '@/types/api';

const { Text } = Typography;

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(() => {
    try {
      const saved = localStorage.getItem('hrm_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hrm_notifications');
      if (!saved) return 0;
      const list: RealtimeNotification[] = JSON.parse(saved);
      return list.filter((n) => !n.isRead).length;
    } catch {
      return 0;
    }
  });

  const [open, setOpen] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Khởi tạo kết nối SignalR Hub
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/api/hubs/notifications', {
        accessTokenFactory: () => localStorage.getItem('accessToken') || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Lắng nghe sự kiện ReceiveNotification từ Backend
    connection.on('ReceiveNotification', (notify: any) => {
      const newNotify: RealtimeNotification = {
        id: notify.id || Date.now().toString(),
        title: notify.title || 'Thông báo hệ thống',
        message: notify.message || '',
        type: notify.type || 'info',
        createdAt: notify.createdAt || new Date().toISOString(),
        link: notify.link,
        isRead: false,
      };

      setNotifications((prev) => {
        const updated = [newNotify, ...prev.slice(0, 49)];
        localStorage.setItem('hrm_notifications', JSON.stringify(updated));
        return updated;
      });

      setUnreadCount((c) => c + 1);

      // Bật popup thông báo góc màn hình
      const notifType = newNotify.type === 'error' ? 'error' : newNotify.type === 'warning' ? 'warning' : newNotify.type === 'success' ? 'success' : 'info';
      notification[notifType]({
        message: newNotify.title,
        description: newNotify.message,
        placement: 'topRight',
        duration: 4.5,
      });
    });

    connection
      .start()
      .catch(() => {
        // Tự động retry ngầm
      });

    return () => {
      connection.stop();
    };
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('hrm_notifications', JSON.stringify(updated));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1677ff' }} />;
    }
  };

  const content = (
    <div style={{ width: 340, maxHeight: 420, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 8,
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 8,
        }}
      >
        <Text strong>Thông báo ({notifications.length})</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            Đánh dấu đã đọc
          </Button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1, maxHeight: 320 }}>
        {notifications.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo mới" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '8px 12px',
                  backgroundColor: item.isRead ? 'transparent' : '#f0f5ff',
                  cursor: item.link ? 'pointer' : 'default',
                  borderRadius: 6,
                  marginBottom: 4,
                  transition: 'background-color 0.2s',
                }}
                onClick={() => {
                  if (!item.isRead) {
                    const updated = notifications.map((n) => (n.id === item.id ? { ...n, isRead: true } : n));
                    setNotifications(updated);
                    setUnreadCount((c) => Math.max(0, c - 1));
                    localStorage.setItem('hrm_notifications', JSON.stringify(updated));
                  }
                  if (item.link) {
                    setOpen(false);
                    history.push(item.link);
                  }
                }}
              >
                <List.Item.Meta
                  avatar={getIcon(item.type)}
                  title={<Text strong={!item.isRead} style={{ fontSize: 13 }}>{item.title}</Text>}
                  description={
                    <div>
                      <div style={{ fontSize: 12, color: '#595959', marginBottom: 2 }}>{item.message}</div>
                      <div style={{ fontSize: 11, color: '#bfbfbf' }}>
                        {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          cursor: 'pointer',
          borderRadius: '50%',
          transition: 'background-color 0.3s',
        }}
      >
        <Badge count={unreadCount} overflowCount={99} size="small" offset={[-2, 4]}>
          <BellOutlined style={{ fontSize: 18, color: '#ffffff' }} />
        </Badge>
      </div>
    </Popover>
  );
};
