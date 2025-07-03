import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Select, Space, Button, Typography, Empty, Input, Modal, Form, message, Tag, List } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SoundOutlined, FilterOutlined } from "@ant-design/icons";
import InfiniteScroll from 'react-infinite-scroll-component';
import debounce from 'lodash/debounce';
import "./WordList.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const PAGE_SIZE = 20;

function WordList({ words, onEdit, onDelete, wordSets = [], addWordSet, removeWordSet }) {
  const [selectedSet, setSelectedSet] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [displayedWords, setDisplayedWords] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Move filteredWords to useMemo to prevent recalculation on every render
  const filteredWords = useMemo(() => {
    return words
      .filter(w => selectedSet ? w.wordSet === selectedSet : true)
      .filter(w => searchText ? 
        w.english.toLowerCase().includes(searchText.toLowerCase()) ||
        w.vietnamese.toLowerCase().includes(searchText.toLowerCase())
      : true);
  }, [words, selectedSet, searchText]);

  // Initialize displayed words only when filteredWords changes
  useEffect(() => {
    setDisplayedWords(filteredWords.slice(0, PAGE_SIZE));
    setCurrentPage(1);
    setHasMore(filteredWords.length > PAGE_SIZE);
  }, [filteredWords]);

  // Memoize loadMoreData function
  const loadMoreData = useCallback(() => {
    if (loading) return;
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const start = (nextPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const newWords = filteredWords.slice(start, end);
      
      setDisplayedWords(prev => [...prev, ...newWords]);
      setCurrentPage(nextPage);
      setHasMore(end < filteredWords.length);
      setLoading(false);
    }, 500);
  }, [loading, currentPage, filteredWords]);

  // Memoize search handler
  const debouncedSearch = useMemo(() => 
    debounce((value) => {
      setSearchText(value);
    }, 300),
    []
  );

  const handleAdd = async (values) => {
    await addWordSet(values);
    setIsModalVisible(false);
    form.resetFields();
    message.success('Thêm từ mới thành công!');
  };

  const playAudio = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const getTypeColor = (type) => {
    const colors = {
      n: '#f50',
      v: '#108ee9',
      adj: '#87d068',
      adv: '#722ed1',
      prep: '#faad14',
      default: '#d9d9d9'
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  if (words.length === 0) {
    return (
      <Empty
        description="Chưa có từ nào"
        className="my-8"
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold m-0">Danh sách từ vựng</h1>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setIsFilterModalVisible(true)}
          />
        </div>
        <Search
          placeholder="Tìm kiếm từ vựng..."
          allowClear
          onChange={e => debouncedSearch(e.target.value)}
        />
      </div>

      {/* Word List with Infinite Scroll */}
      <div 
        id="scrollableDiv"
        className="flex-1 overflow-y-auto mt-24 pb-24"
      >
        <InfiniteScroll
          dataLength={displayedWords.length}
          next={loadMoreData}
          hasMore={hasMore}
          loader={
            <div className="text-center py-4">
              <Text className="text-gray-500">Đang tải thêm...</Text>
            </div>
          }
          endMessage={
            <div className="text-center py-4">
              <Text className="text-gray-500">Đã hiển thị tất cả từ vựng</Text>
            </div>
          }
          scrollableTarget="scrollableDiv"
        >
          {displayedWords.map((word, index) => (
            <div
              key={word._id || index}
              className="bg-white mb-2 mx-2 p-3 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-lg font-medium">{word.english}</div>
                  <div className="text-gray-500 text-sm">{word.phonetic}</div>
                </div>
                <Button
                  type="text"
                  icon={<SoundOutlined />}
                  onClick={() => playAudio(word.english)}
                />
              </div>
              <div className="mb-2">
                <Tag color={getTypeColor(word.type)}>{word.type}</Tag>
                {word.wordSet && (
                  <Tag color="blue">{wordSets.find(ws => ws._id === word.wordSet)?.name}</Tag>
                )}
              </div>
              <div className="text-gray-700">{word.vietnamese}</div>
              <div className="flex justify-end mt-2 space-x-2">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    form.setFieldsValue(word);
                    setIsModalVisible(true);
                  }}
                >
                  Sửa
                </Button>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(index)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>

      {/* Add Button */}
      <div className="fixed right-4 bottom-20">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}
          className="w-14 h-14 flex items-center justify-center shadow-lg"
        />
      </div>

      {/* Filter Modal */}
      <Modal
        title="Bộ lọc"
        open={isFilterModalVisible}
        onCancel={() => setIsFilterModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Bộ từ vựng">
            <Select
              value={selectedSet}
              onChange={(value) => {
                setSelectedSet(value);
                setIsFilterModalVisible(false);
              }}
              style={{ width: '100%' }}
              placeholder="Chọn bộ từ"
            >
              <Option value="">Tất cả</Option>
              {wordSets.map((set) => (
                <Option key={set._id} value={set._id}>{set.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        title={form.getFieldValue('_id') ? "Sửa từ" : "Thêm từ mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="english"
            label="Tiếng Anh"
            rules={[{ required: true, message: 'Vui lòng nhập từ tiếng Anh' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phonetic"
            label="Phiên âm"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại từ"
            rules={[{ required: true, message: 'Vui lòng chọn loại từ' }]}
          >
            <Select>
              <Option value="n">Danh từ (n)</Option>
              <Option value="v">Động từ (v)</Option>
              <Option value="adj">Tính từ (adj)</Option>
              <Option value="adv">Trạng từ (adv)</Option>
              <Option value="prep">Giới từ (prep)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="vietnamese"
            label="Tiếng Việt"
            rules={[{ required: true, message: 'Vui lòng nhập nghĩa tiếng Việt' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="wordSet"
            label="Bộ từ"
          >
            <Select>
              <Option value="">Không có</Option>
              {wordSets.map((set) => (
                <Option key={set._id} value={set._id}>{set.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {form.getFieldValue('_id') ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default WordList; 