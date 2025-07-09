import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Tag, Button } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import CrudModule from '@/modules/CrudModule/CrudModule';
import QueryForm from '@/forms/QueryForm';
import QueryNotesModal from '@/modules/QueryModule/QueryNotesModal';

export default function Query() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'queries';
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const handleNotesClick = (record) => {
    setSelectedQuery(record);
    setNotesModalOpen(true);
  };

  const handleNotesModalClose = () => {
    setNotesModalOpen(false);
    setSelectedQuery(null);
  };

  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  
  const deleteModalLabels = ['customer.name', 'description'];
  
  const dataTableColumns = [
    {
      title: translate('Customer'),
      dataIndex: ['customer', 'name'],
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      render: (text) => text && text.length > 50 ? text.substring(0, 50) + '...' : text,
    },
    {
      title: translate('Date'),
      dataIndex: 'created',
      render: (date) => dayjs(date).format(dateFormat),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      render: (status) => {
        const color = status === 'Open' ? 'red' : status === 'InProgress' ? 'blue' : 'green';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: translate('Resolution'),
      dataIndex: 'resolution',
      render: (text) => text && text.length > 30 ? text.substring(0, 30) + '...' : text || 'No resolution',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={() => handleNotesClick(record)}
          size="small"
        >
          Notes
        </Button>
      ),
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('queries'),
    DATATABLE_TITLE: translate('queries') + ' List',
    ADD_NEW_ENTITY: 'Add New Query',
    ENTITY_NAME: translate('queries'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  
  const readColumns = [
    {
      title: translate('Customer'),
      dataIndex: 'customer.name',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
    },
    {
      title: translate('Date'),
      dataIndex: 'created',
      isDate: true,
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
    {
      title: translate('Resolution'),
      dataIndex: 'resolution',
    },
  ];

  const config = {
    ...configPage,
    dataTableColumns,
    readColumns,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <>
      <CrudModule
        createForm={<QueryForm />}
        updateForm={<QueryForm isUpdateForm={true} />}
        config={config}
      />
      <QueryNotesModal
        open={notesModalOpen}
        onClose={handleNotesModalClose}
        query={selectedQuery}
      />
    </>
  );
}