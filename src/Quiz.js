import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Checkbox,
  Alert,
  Progress,
  Empty,
  Result,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function Quiz({ words, wordSets = [] }) {
  const [selectedSets, setSelectedSets] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const filteredWords = useMemo(() => (
    selectedSets.length === 0
      ? words
      : words.filter(w => selectedSets.includes(w.wordSet._id || w.wordSet))
  ), [words, selectedSets]);

  const handleStartQuiz = () => {
    const shuffledQuestions = shuffle(filteredWords);
    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setQuizStarted(true);
    setResult("");
    setCorrectCount(0);
    setTotalAnswered(0);
    
    // Generate options for the first question
    if (shuffledQuestions.length > 0) {
      const correct = shuffledQuestions[0];
      const wrongs = shuffle(filteredWords.filter(w => w !== correct)).slice(0, 3);
      setOptions(shuffle([correct, ...wrongs]));
    }
  };

  const handleAnswer = (selectedWord) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswer(selectedWord);
    const isCorrect = selectedWord === currentQuestion;
    setTotalAnswered(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setResult("correct");
    } else {
      setResult("wrong");
    }

    // Move to next question after delay
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        const correct = questions[nextIndex];
        const wrongs = shuffle(filteredWords.filter(w => w !== correct)).slice(0, 3);
        setOptions(shuffle([correct, ...wrongs]));
        setResult("");
        setSelectedAnswer(null);
      }
    }, 1500);
  };

  const handleRestart = () => {
    handleStartQuiz();
  };

  const handleBackToSetSelect = () => {
    setQuizStarted(false);
    setResult("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setOptions([]);
    setCorrectCount(0);
    setTotalAnswered(0);
  };

  if (!quizStarted) {
    return (
      <Card title={<Title level={4}>Chọn bộ từ để kiểm tra</Title>}>
        {wordSets.length === 0 ? (
          <Empty description="Chưa có bộ từ nào" />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {wordSets.map((set) => (
                <Checkbox
                  key={set._id}
                  checked={selectedSets.includes(set._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSets((prev) => [...prev, set._id]);
                    } else {
                      setSelectedSets((prev) => prev.filter((s) => s !== set._id));
                    }
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {set.name}
                </Checkbox>
              ))}
            </div>

            <div className="mt-4">
              <Button
                type="primary"
                onClick={handleStartQuiz}
                disabled={wordSets.length > 0 && filteredWords.length < 4}
                icon={<CheckOutlined />}
              >
                Bắt đầu kiểm tra
              </Button>

              {wordSets.length > 0 && filteredWords.length < 4 && (
                <Alert
                  type="warning"
                  message="Bạn cần ít nhất 4 từ trong các bộ từ đã chọn để bắt đầu học"
                  className="mt-4"
                />
              )}
            </div>
          </div>
        )}
      </Card>
    );
  }

  const isFinished = currentQuestionIndex >= questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Title level={4}>Chế độ trắc nghiệm</Title>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToSetSelect}
          >
            Quay lại chọn bộ từ
          </Button>
        </div>
      }
    >
      {isFinished ? (
        <Result
          status="success"
          title="Hoàn thành!"
          subTitle={`Kết quả: ${correctCount}/${totalAnswered} (${Math.round(correctCount/totalAnswered*100)}%)`}
          extra={[
            <Button key="restart" type="primary" onClick={handleRestart} icon={<ReloadOutlined />}>
              Làm lại
            </Button>,
            <Button key="back" onClick={handleBackToSetSelect} icon={<ArrowLeftOutlined />}>
              Chọn lại bộ từ
            </Button>,
          ]}
        />
      ) : currentQuestion ? (
        <div className="space-y-6">
          <Progress percent={Math.round(progress)} />
          
          <div className="text-center">
            <Title level={3}>{currentQuestion.english}</Title>
            {currentQuestion.phonetic && (
              <Text type="secondary">/{currentQuestion.phonetic}/</Text>
            )}
          </div>

          <div className="space-y-4">
            {options.map((option) => (
              <Button
                key={option.english}
                className={`
                  w-full p-4 text-left h-auto whitespace-normal
                  ${result && option === currentQuestion ? "border-green-500 bg-green-50" : ""}
                  ${result === "wrong" && option === selectedAnswer ? "border-red-500 bg-red-50" : ""}
                `}
                onClick={() => !result && handleAnswer(option)}
                disabled={!!result}
              >
                {option.vietnamese}
              </Button>
            ))}
          </div>

          {result && (
            <div className="text-center">
              {result === "correct" ? (
                <Alert
                  message="Chính xác!"
                  type="success"
                  showIcon
                  icon={<CheckOutlined />}
                />
              ) : (
                <Alert
                  message={`Sai rồi! Đáp án đúng là: ${currentQuestion.vietnamese}`}
                  type="error"
                  showIcon
                  icon={<CloseOutlined />}
                />
              )}
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export default Quiz; 