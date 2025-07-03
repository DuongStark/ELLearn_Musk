import React, { useState, useEffect, useCallback } from "react";
import { Layout, Menu, Avatar, Typography, Button, Badge, Tooltip, message } from "antd";
import {
  BookOutlined,
  ReadOutlined,
  UnorderedListOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import AddWord from "./AddWord";
import Quiz from "./Quiz";
import WordList from "./WordList";
import BulkAddWords from "./BulkAddWords";
import FlashcardStudy from "./FlashcardStudy";
import Login from "./Login";
import Register from "./Register";
import MobileLayout from "./components/MobileLayout";
import Profile from "./components/Profile";
import "./App.css";
import "./MainBackground.css";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "https://ellearnmuskbackend-production.up.railway.app/api";

function App() {
  const [words, setWords] = useState([]);
  const [currentTab, setCurrentTab] = useState('flashcard');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [wordSets, setWordSets] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const token = localStorage.getItem("token");
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const userEmail = localStorage.getItem("userEmail") || "Học viên";
  // Gamification demo
  const [points] = useState(1200);
  const [streak] = useState(5);

  // Fetch words from backend
  const fetchWords = useCallback(async () => {
    try {
      if (token) {
        const res = await fetch(`${API_URL}/words`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWords(data);
        }
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  }, [token]);

  // Fetch word sets from backend
  const fetchWordSets = useCallback(async () => {
    try {
      if (token) {
        const res = await fetch(`${API_URL}/wordsets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWordSets(data);
        }
      }
    } catch (error) {
      console.error('Error fetching word sets:', error);
    }
  }, [token]);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      Promise.all([fetchWords(), fetchWordSets()]);
    }
  }, [token, fetchWords, fetchWordSets]);

  // Add word set
  const addWordSet = useCallback(async (setName) => {
    try {
      if (token && setName && !wordSets.some(ws => ws.name === setName)) {
        const res = await fetch(`${API_URL}/wordsets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: setName }),
        });
        if (res.ok) {
          const newSet = await res.json();
          await fetchWordSets();
          await fetchWords();
          return newSet;
        } else {
          const error = await res.json().catch(() => ({}));
          alert(error.message || "Có lỗi xảy ra khi tạo bộ từ!");
        }
      }
      return null;
    } catch (error) {
      console.error('Error adding word set:', error);
      return null;
    }
  }, [token, wordSets, fetchWords, fetchWordSets]);

  // Remove word set
  const removeWordSet = useCallback(async (setId) => {
    try {
      if (token) {
        const res = await fetch(`${API_URL}/wordsets/${setId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await fetchWordSets();
          await fetchWords();
        }
      }
    } catch (error) {
      console.error('Error removing word set:', error);
    }
  }, [token, fetchWords, fetchWordSets]);

  // Add word
  const handleAdd = useCallback(async (word) => {
    try {
      if (token) {
        const res = await fetch(`${API_URL}/words`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(word),
        });
        if (res.ok) {
          await fetchWords();
          message.success('Thêm từ mới thành công!');
        }
      }
    } catch (error) {
      console.error('Error adding word:', error);
      message.error('Có lỗi xảy ra khi thêm từ mới');
    }
  }, [token, fetchWords]);

  // Edit word
  const handleEditSave = useCallback(async (word) => {
    try {
      if (token) {
        const id = words[editingIndex]?._id;
        if (id) {
          const res = await fetch(`${API_URL}/words/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(word),
          });
          if (res.ok) {
            await fetchWords();
            if (word.wordSet) await fetchWordSets();
          }
          setEditingIndex(null);
          setEditingWord(null);
        }
      }
    } catch (error) {
      console.error('Error editing word:', error);
    }
  }, [token, words, editingIndex, fetchWords, fetchWordSets]);

  // Delete word
  const handleDelete = useCallback(async (idx) => {
    try {
      if (token) {
        const id = words[idx]?._id;
        if (id && window.confirm("Bạn có chắc muốn xóa từ này?")) {
          const res = await fetch(`${API_URL}/words/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            await fetchWords();
            message.success('Xóa từ thành công!');
          }
        }
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      message.error('Có lỗi xảy ra khi xóa từ');
    }
  }, [token, words, fetchWords]);

  const handleEditInit = (idx) => {
    setEditingIndex(idx);
    setEditingWord(words[idx]);
    setCurrentTab("flashcards");
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditingWord(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setLoggedIn(false);
    message.success('Đăng xuất thành công!');
  };

  // Sidebar menu items
  const menuItems = [
    {
      key: "dashboard",
      icon: <BookOutlined />,
      label: "Tổng quan",
    },
    {
      key: "flashcard",
      icon: <ReadOutlined />,
      label: "Flashcard",
    },
    {
      key: "quiz",
      icon: <ThunderboltOutlined />,
      label: "Quiz",
    },
    {
      key: "list",
      icon: <UnorderedListOutlined />,
      label: "Từ vựng",
    },
    {
      key: "bulk",
      icon: <BookOutlined />,
      label: "Thêm nhiều từ",
    },
    {
      key: "trophy",
      icon: <TrophyOutlined />,
      label: "Thành tích",
      disabled: true,
    },
    {
      key: "setting",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      disabled: true,
    },
  ];

  // Render content based on current tab
  const renderContent = () => {
    switch (currentTab) {
      case "add":
        return (
          <AddWord
            onAdd={handleAdd}
            editingWord={editingWord}
            onEdit={handleEditSave}
            onCancelEdit={handleEditCancel}
            wordSets={wordSets}
            addWordSet={addWordSet}
          />
        );
      case "bulk":
        return (
          <BulkAddWords
            onBulkAdd={fetchWords}
            wordSets={wordSets}
            addWordSet={addWordSet}
            fetchWords={fetchWords}
            fetchWordSets={fetchWordSets}
          />
        );
      case "quiz":
        return <Quiz words={words} wordSets={wordSets} />;
      case "flashcard":
        return <FlashcardStudy words={words} wordSets={wordSets} />;
      case "list":
        return (
          <WordList
            words={words}
            onEdit={handleEditInit}
            onDelete={handleDelete}
            wordSets={wordSets}
            addWordSet={addWordSet}
            removeWordSet={removeWordSet}
          />
        );
      case "profile":
        return (
          <Profile
            userEmail={userEmail}
            onLogout={handleLogout}
            wordsCount={words.length}
            wordSets={wordSets}
          />
        );
      case "dashboard":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <Title level={2} className="text-white drop-shadow mb-4">Chào mừng bạn trở lại!</Title>
            <div className="flex gap-8 mb-8">
              <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <Text strong className="text-lg mb-2">Tổng số từ</Text>
                <Title level={3} className="m-0 text-blue-600">{words.length}</Title>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <Text strong className="text-lg mb-2">Bộ từ</Text>
                <Title level={3} className="m-0 text-green-600">{wordSets.length}</Title>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <Text strong className="text-lg mb-2">Điểm số</Text>
                <Title level={3} className="m-0 text-pink-600">{points}</Title>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
                <Text strong className="text-lg mb-2">Streak</Text>
                <Title level={3} className="m-0 text-orange-500">{streak} 🔥</Title>
              </div>
            </div>
            <div className="flex gap-6">
              <Button type="primary" size="large" className="rounded-full px-8" onClick={() => setCurrentTab("flashcard")}>Bắt đầu học Flashcard</Button>
              <Button type="default" size="large" className="rounded-full px-8" onClick={() => setCurrentTab("quiz")}>Làm Quiz</Button>
              <Button type="dashed" size="large" className="rounded-full px-8" onClick={() => setCurrentTab("list")}>Xem từ vựng</Button>
            </div>
          </div>
        );
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center main-bg">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          {showRegister ? (
            <Register
              onRegister={async (email, password) => {
                const res = await fetch(`${API_URL}/auth/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (res.ok && data.token) {
                  localStorage.setItem("token", data.token);
                  localStorage.setItem("userEmail", email);
                  setLoggedIn(true);
                  window.location.reload();
                }
              }}
              onSwitchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <Login
              onLogin={(email) => {
                setLoggedIn(true);
                localStorage.setItem("userEmail", email);
                window.location.reload();
              }}
              onSwitchToRegister={() => setShowRegister(true)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <MobileLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </MobileLayout>
  );
}

export default App;
