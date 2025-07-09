import React from 'react';
import { Form, Input, Select } from 'antd';
import SelectAsync from '@/components/SelectAsync';

const { Option } = Select;
const { TextArea } = Input;

export default function QueryForm({ isUpdateForm = false }) {
  return (
    <>
      <Form.Item
        label="Customer"
        name="customer"
        rules={[
          {
            required: true,
            message: 'Please select a customer!',
          },
        ]}
      >
        <SelectAsync
          entity="client"
          displayLabels={['name', 'email']}
          searchFields={['name', 'email']}
          outputValue="_id"
          placeholder="Select a customer"
          withRedirect
          urlToRedirect="/customer"
        />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[
          {
            required: true,
            message: 'Please input the query description!',
          },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Enter query description..."
        />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        rules={[
          {
            required: true,
            message: 'Please select a status!',
          },
        ]}
      >
        <Select placeholder="Select status">
          <Option value="Open">Open</Option>
          <Option value="InProgress">In Progress</Option>
          <Option value="Closed">Closed</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Resolution"
        name="resolution"
      >
        <TextArea
          rows={3}
          placeholder="Enter resolution details..."
        />
      </Form.Item>
    </>
  );
}