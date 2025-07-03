import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Alert,
  List,
  Tag,
  Space,
} from "antd";
import {
  UploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

function parseBulkInput(input, wordSetId) {
  // Tách theo dòng hoặc dấu chấm phẩy
  const lines = input
    .split(/\n|;/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  const words = lines.map(line => {
    // Định dạng: tu_vung /phien_am/ (loai_tu): nghia
    // Ví dụ: community /ke'mju:neti/ (n): Ảnh hưởng.
    // Hoặc: community /ke'mju:neti/ (n): Ảnh hưởng.
    // Hoặc: community /ke'mju:neti/ (n) : Ảnh hưởng.
    // Hoặc: community /ke'mju:neti/ (n):Ảnh hưởng.
    // Nên dùng regex linh hoạt hơn:
    const match = line.match(/^([^\s]+)\s+([^\s]+)\s+\(([^)]+)\)\s*:\s*(.+)$/);
    if (match) {
      return {
        english: match[1],
        phonetic: match[2],
        type: match[3],
        vietnamese: match[4],
      };
    } else {
      // Nếu không đúng định dạng, bỏ qua
      return null;
    }
  });
  return words.filter(Boolean).map(w => ({ ...w, wordSet: wordSetId }));
}

function BulkAddWords({ onBulkAdd, wordSets = [], addWordSet, fetchWords, fetchWordSets }) {
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [useNewSet, setUseNewSet] = useState(false);
  const [duplicated, setDuplicated] = useState([]);
  const [loading, setLoading] = useState(false);

  const noWordSet = wordSets.length === 0;

  const handleSubmit = async (values) => {
    let finalSetId = values.wordSet;
    if (useNewSet || noWordSet) {
      if (!values.newSet?.trim()) return;
      const newSetObj = await addWordSet(values.newSet.trim());
      if (!newSetObj) return;
      finalSetId = newSetObj._id;
      if (fetchWordSets) await fetchWordSets();
    }

    const words = parseBulkInput(values.input, finalSetId);
    if (words.length === 0) {
      setError("Không có từ nào hợp lệ. Định dạng: tu_vung /phien_am/ (loai_tu): nghia");
      setSuccess("");
      setDuplicated([]);
      return;
    }

    setError("");
    setSuccess("");
    setDuplicated([]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch((process.env.REACT_APP_API_URL || "http://localhost:5000/api") + "/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(words),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Đã thêm ${data.added.length} từ thành công!`);
        setDuplicated(data.duplicated || []);
        form.resetFields();
        form.setFieldsValue({
          wordSet: wordSets[0]?._id || "",
        });
        setUseNewSet(false);
        if (fetchWords) await fetchWords();
        if (fetchWordSets) await fetchWordSets();
      } else {
        setError(data.message || "Lỗi khi thêm từ");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const setOptions = [
    ...wordSets,
    { _id: "__new__", name: "+ Bộ từ mới..." }
  ];

  return (
    <Card>
      <Title level={4}>Thêm nhiều từ</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          wordSet: wordSets[0]?._id || "",
        }}
      >
        <Form.Item
          label="Bộ từ"
          name="wordSet"
        >
          <Select
            disabled={noWordSet}
            value={useNewSet ? "__new__" : form.getFieldValue("wordSet")}
            onChange={(value) => {
              if (value === "__new__") {
                setUseNewSet(true);
                form.setFieldsValue({ wordSet: "" });
              } else {
                setUseNewSet(false);
                form.setFieldsValue({ wordSet: value });
              }
            }}
          >
            {setOptions.map((s) => (
              <Option key={s._id} value={s._id}>{s.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {(useNewSet || noWordSet) && (
          <Form.Item
            label="Tên bộ từ mới"
            name="newSet"
            rules={[
              { required: true, message: "Vui lòng nhập tên bộ từ mới" },
              {
                validator: (_, value) => {
                  if (!value || !wordSets.some(ws => ws.name === value.trim())) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Tên bộ từ đã tồn tại"));
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item
          label="Danh sách từ"
          name="input"
          rules={[{ required: true, message: "Vui lòng nhập danh sách từ" }]}
          tooltip={{
            title: "Nhập mỗi từ trên một dòng hoặc cách nhau bằng dấu chấm phẩy.\nĐịnh dạng: tu_vung /phien_am/ (loai_tu): nghia\nVí dụ: community /ke'mju:neti/ (n): Ảnh hưởng.",
            icon: <InfoCircleOutlined />,
          }}
        >
          <TextArea
            rows={8}
            placeholder={
              "Nhập mỗi từ trên một dòng hoặc cách nhau bằng dấu chấm phẩy.\n" +
              "Định dạng: tu_vung /phien_am/ (loai_tu): nghia\n" +
              "Ví dụ: community /ke'mju:neti/ (n): Ảnh hưởng."
            }
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<UploadOutlined />}
            loading={loading}
            disabled={((useNewSet || noWordSet) && !form.getFieldValue("newSet")?.trim())}
          >
            Thêm từ
          </Button>
        </Form.Item>
      </Form>

      <Space direction="vertical" className="w-full">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        {duplicated.length > 0 && (
          <Alert
            type="warning"
            message={
              <div>
                <Text strong>Các từ bị trùng (không thêm):</Text>
                <List
                  size="small"
                  dataSource={duplicated}
                  renderItem={(word) => (
                    <List.Item>
                      <Space>
                        <Text>{word.english}</Text>
                        <Tag color="orange">{wordSets.find(ws => ws._id === word.wordSet)?.name}</Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            }
          />
        )}
      </Space>
    </Card>
  );
}

export default BulkAddWords; 