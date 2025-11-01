import React, { useState } from 'react';
import axios from 'axios';
import { notification, Form, Input, Button, Select, Card, Row, Col } from 'antd';
import apiClient from '../../../apis/apiClient/apiClient';

const { TextArea } = Input;
const { Option } = Select;

const AdminNotificationSender = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const notificationTypes = [
    { value: 'promotions', label: 'Promotions' },
    { value: 'newFeatures', label: 'New Features' },
    { value: 'serviceAlerts', label: 'Service Alerts' },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
        const payload = {
      ...values,
      sendToAll: true // ← Add this line to send to all users
    };
      const response = await apiClient.post('/admin/notifications', payload);
      console.log(response)
      notification.success({
        message: 'Success',
        description: 'Notification sent successfully!',
      });
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to send notification',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <Row justify="center">
        <Col xs={24} md={18} lg={12}>
          <Card title="Send Notification" className="admin-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="type"
                label="Notification Type"
                rules={[{ required: true, message: 'Please select a type' }]}
              >
                <Select placeholder="Select notification type">
                  {notificationTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input placeholder="Enter notification title" maxLength={100} />
              </Form.Item>

              <Form.Item
                name="body"
                label="Message"
                rules={[{ required: true, message: 'Please enter a message' }]}
              >
                <TextArea rows={4} placeholder="Enter notification message" maxLength={500} />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                >
                  Send Notification
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminNotificationSender;