import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Select,
  Radio,
  Button,
  Typography,
  Space,
  Progress,
  Empty,
  Tag,
  Segmented,
  Modal,
  Form,
  message,
} from "antd";
import {
  SoundOutlined,
  SwapOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  OrderedListOutlined,
  SwapRightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "./FlashcardStudy.css";

const { Title, Text } = Typography;
const { Option } = Select;

// Màu sắc cho các loại từ
const TYPE_COLORS = {
  n: "#f50", // Danh từ - Đỏ
  v: "#108ee9", // Động từ - Xanh dương
  adj: "#87d068", // Tính từ - Xanh lá
  adv: "#722ed1", // Trạng từ - Tím
  prep: "#faad14", // Giới từ - Vàng
  conj: "#eb2f96", // Liên từ - Hồng
  pron: "#fa8c16", // Đại từ - Cam
  det: "#a0d911", // Mạo từ - Xanh nhạt
  modal: "#13c2c2", // Động từ khuyết thiếu - Xanh ngọc
  default: "#d9d9d9", // Màu mặc định cho các loại khác - Xám
};

function getTypeColor(type) {
  // Lấy chỉ phần đầu của loại từ (trước dấu phẩy hoặc dấu chấm phẩy nếu có)
  const baseType = type.split(/[,;]/)[0].trim().toLowerCase();
  return TYPE_COLORS[baseType] || TYPE_COLORS.default;
}

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function speak(text) {
  if (!window.speechSynthesis) {
    alert("Trình duyệt của bạn không hỗ trợ phát âm.");
    return;
  }
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
}

function FlashcardStudy({ words, wordSets = [], onUpdateWord }) {
  const [mode, setMode] = useState("random");
  const [filter, setFilter] = useState("review");
  const [selectedSet, setSelectedSet] = useState("");
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studyList, setStudyList] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [form] = Form.useForm();

  const minSwipeDistance = 50;

  // Memoize filtered words
  const filteredWords = useMemo(() => {
    let filtered = selectedSet 
      ? words.filter(w => (w.wordSet._id || w.wordSet) === selectedSet)
      : words;

    if (filter === "remembered") {
      filtered = filtered.filter(w => w.remembered === true);
    } else if (filter === "review") {
      filtered = filtered.filter(w => !w.remembered);
    }

    return filtered;
  }, [words, selectedSet, filter]);

  // Initialize or update study list
  const initializeStudyList = useCallback((newMode = mode, newFilteredWords = filteredWords) => {
    setStudyList(newMode === "random" ? shuffle(newFilteredWords) : newFilteredWords);
    setIndex(0);
    setShowBack(false);
  }, []);

  // Initialize study list when filtered words change
  useEffect(() => {
    initializeStudyList(mode, filteredWords);
  }, [filteredWords, initializeStudyList]);

  // Handle mode change
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setMode(newMode);
    initializeStudyList(newMode, filteredWords);
  };

  const handleNext = () => {
    setShowBack(false);
    setIndex(i => (i + 1 < studyList.length ? i + 1 : 0));
  };

  const handlePrev = () => {
    setShowBack(false);
    setIndex(i => (i - 1 >= 0 ? i - 1 : studyList.length - 1));
  };

  const handleFlip = () => {
    setShowBack(b => !b);
  };

  const handleToggleRemembered = () => {
    if (!studyList[index]) return;
    
    const newRemembered = !studyList[index].remembered;
    if (onUpdateWord) {
      onUpdateWord(studyList[index], newRemembered);
    }

    if (filter !== "all") {
      const newList = studyList.filter((_, idx) => idx !== index);
      setStudyList(newList);
      if (index >= newList.length) {
        setIndex(0);
      }
      setShowBack(false);
    }
  };

  const handleSoundClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.speechSynthesis) {
      alert("Trình duyệt của bạn không hỗ trợ phát âm.");
      return;
    }
    const utter = new window.SpeechSynthesisUtterance(studyList[index].english);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  const currentWord = studyList[index];
  const noCard = studyList.length === 0 || !currentWord;
  const progress = studyList.length > 0 ? ((index + 1) / studyList.length) * 100 : 0;

  const handleSettingsSave = (values) => {
    setSelectedSet(values.wordSet);
    setMode(values.mode);
    setFilter(values.filter);
    setIsSettingsVisible(false);
    message.success('Đã lưu cài đặt');
  };

  if (noCard) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Empty
          description={
            <div className="text-center">
              <p className="mb-4">Không có từ nào để học</p>
              <Button
                type="primary"
                onClick={() => setIsSettingsVisible(true)}
              >
                Chọn bộ từ
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <Title level={4} className="m-0">Học từ bằng Flashcard</Title>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setIsSettingsVisible(true)}
          />
        </div>
        <Progress percent={progress} showInfo={false} className="mt-2" />
      </div>

      {/* Main container with proper padding for fixed header and bottom controls */}
      <div className="flex-1 flex items-stretch mt-[60px] mb-[100px]">
        {/* Flashcard container */}
        <div 
          className="w-full flex items-center justify-center px-4"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flashcard-container mx-auto">
            <div
              className={`flashcard ${showBack ? 'flipped' : ''}`}
              onClick={handleFlip}
            >
              {/* Front of card */}
              <div className="flashcard-front p-6">
                <div className="flex justify-between items-start">
                  <Tag color={getTypeColor(currentWord.type)}>{currentWord.type}</Tag>
                  <Button
                    type="text"
                    icon={<SoundOutlined />}
                    onClick={handleSoundClick}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                  <Text className="text-4xl font-medium text-center mb-4">{currentWord.english}</Text>
                  {currentWord.phonetic && (
                    <Text className="text-xl text-gray-500 text-center">/{currentWord.phonetic}/</Text>
                  )}
                </div>

                <div className="text-center">
                  <Text className="text-gray-400 text-sm">
                    Chạm để lật thẻ
                  </Text>
                </div>
              </div>

              {/* Back of card */}
              <div className="flashcard-back p-6">
                <div className="flex justify-between items-start">
                  <Tag color={getTypeColor(currentWord.type)}>{currentWord.type}</Tag>
                  <Button
                    type="text"
                    icon={<SoundOutlined />}
                    onClick={handleSoundClick}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                  <Text className="text-3xl font-medium text-center mb-4">{currentWord.vietnamese}</Text>
                  <Text className="text-xl text-gray-500 text-center">{currentWord.english}</Text>
                </div>

                <div className="text-center">
                  <Text className="text-gray-400 text-sm">
                    Chạm để lật thẻ
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls - now using fixed positioning with proper spacing */}
      <div className="fixed bottom-0 left-0 right-0 flex flex-col">
        <div className="flex justify-center items-center space-x-6 p-4 bg-gray-50">
          <Button
            type="default"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={handlePrev}
            size="large"
          />
          <Button
            type={currentWord.remembered ? "primary" : "default"}
            shape="circle"
            icon={<CheckCircleOutlined />}
            onClick={handleToggleRemembered}
            size="large"
          />
          <Button
            type="default"
            shape="circle"
            icon={<RightOutlined />}
            onClick={handleNext}
            size="large"
          />
        </div>
        {/* Add safe area padding for mobile devices */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>

      {/* Settings Modal */}
      <Modal
        title="Cài đặt học tập"
        open={isSettingsVisible}
        onCancel={() => setIsSettingsVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            wordSet: selectedSet,
            mode: mode,
            filter: filter,
          }}
          onValuesChange={(changedValues) => {
            if (changedValues.wordSet !== undefined) {
              setSelectedSet(changedValues.wordSet);
            }
            if (changedValues.mode !== undefined) {
              setMode(changedValues.mode);
            }
            if (changedValues.filter !== undefined) {
              setFilter(changedValues.filter);
            }
          }}
          onFinish={handleSettingsSave}
        >
          <Form.Item name="wordSet" label={<Text strong>Bộ từ:</Text>}>
            <Select placeholder="Chọn bộ từ">
              <Option value="">Tất cả</Option>
              {wordSets.map((set) => (
                <Option key={set._id} value={set._id}>{set.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="mode" label={<Text strong>Chế độ học:</Text>}>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              className="w-full flex mt-2"
            >
              <Radio.Button value="order" className="flex-1 text-center">
                <Space>
                  <OrderedListOutlined />
                  Theo thứ tự
                </Space>
              </Radio.Button>
              <Radio.Button value="random" className="flex-1 text-center">
                <Space>
                  <SwapRightOutlined />
                  Ngẫu nhiên
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="filter" label={<Text strong>Lọc từ:</Text>}>
            <Segmented
              options={[
                { label: "Tất cả", value: "all" },
                { label: "Chưa thuộc", value: "review" },
                { label: "Đã thuộc", value: "remembered" },
              ]}
              block
              className="mt-2"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default FlashcardStudy; 