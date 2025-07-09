import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Button, Space, Popconfirm, message, Typography, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { request } from '@/request';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function QueryNotesModal({ open, onClose, query }) {
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query && open) {
      fetchQueryWithNotes();
    }
  }, [query, open]);

  const fetchQueryWithNotes = async () => {
    setLoading(true);
    try {
      const result = await request.read({
        entity: 'query',
        id: query._id,
      });

      if (result.success) {
        setNotes(result.result.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch query notes:', error);
      // Fallback to query data if API fails
      setNotes(query.notes || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      message.error('Please enter note content');
      return;
    }

    setAddingNote(true);
    try {
      const result = await request.post({
        entity: `query/${query._id}/notes`,
        jsonData: {
          content: noteContent.trim(),
        },
      });

      if (result.success) {
        message.success('Note added successfully');
        setNoteContent('');
        setNotes(result.result.notes || []);
      }
    } catch (error) {
      message.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      // Use axios directly for DELETE request to custom route
      const response = await axios.delete(`${API_BASE_URL}query/${query._id}/notes/${noteId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        message.success('Note deleted successfully');
        setNotes(response.data.result.notes || []);
      }
    } catch (error) {
      message.error('Failed to delete note');
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note._id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId) => {
    if (!editContent.trim()) {
      message.error('Please enter note content');
      return;
    }

    try {
      // For now, we'll implement this as a simple state update
      // In a real app, you'd want an edit endpoint
      const updatedNotes = notes.map(note => 
        note._id === noteId ? { ...note, content: editContent.trim() } : note
      );
      setNotes(updatedNotes);
      setEditingNote(null);
      setEditContent('');
      message.success('Note updated successfully');
    } catch (error) {
      message.error('Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  const handleModalClose = () => {
    setNoteContent('');
    setEditingNote(null);
    setEditContent('');
    onClose();
  };

  if (!query) return null;

  return (
    <Modal
      title={`Notes for Query - ${query.customer?.name}`}
      open={open}
      onCancel={handleModalClose}
      footer={null}
      width={600}
      bodyStyle={{ maxHeight: '500px', overflowY: 'auto' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Query Description:</Title>
        <Text style={{ display: 'block', marginBottom: 16, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          {query.description}
        </Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Add New Note:</Title>
        <TextArea
          placeholder="Add a note..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          rows={3}
          style={{ marginBottom: 8 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNote}
          loading={addingNote}
          disabled={!noteContent.trim()}
        >
          Add Note
        </Button>
      </div>

      <div>
        <Title level={5}>Notes ({notes.length}):</Title>
        <Spin spinning={loading}>
          <List
            dataSource={notes}
            renderItem={(note) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditNote(note)}
                  size="small"
                  disabled={editingNote === note._id}
                />,
                <Popconfirm
                  title="Are you sure you want to delete this note?"
                  onConfirm={() => handleDeleteNote(note._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    size="small"
                  />
                </Popconfirm>
              ]}
              style={{ alignItems: 'flex-start' }}
            >
              <List.Item.Meta
                title={
                  <Text style={{ color: '#666', fontSize: '12px' }}>
                    {dayjs(note.created).format('MMMM D, YYYY h:mm A')}
                  </Text>
                }
                description={
                  editingNote === note._id ? (
                    <div>
                      <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        style={{ marginBottom: 8 }}
                      />
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleSaveEdit(note._id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                      {note.content}
                    </div>
                  )
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No notes yet. Add the first note above.' }}
        />
        </Spin>
      </div>
    </Modal>
  );
}