import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, Card, Space } from "antd";
import { SaveOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;

function AddWord({ onAdd, editingWord, onEdit, onCancelEdit, wordSets = [], addWordSet }) {
  const [form] = Form.useForm();
  const [useNewSet, setUseNewSet] = useState(false);
  const noWordSet = wordSets.length === 0;

  useEffect(() => {
    if (editingWord) {
      form.setFieldsValue({
        english: editingWord.english || "",
        phonetic: editingWord.phonetic || "",
        type: editingWord.type || "",
        vietnamese: editingWord.vietnamese || "",
        wordSet: editingWord.wordSet || (wordSets[0]?._id || ""),
        newSetName: "",
      });
      setUseNewSet(false);
    } else {
      form.resetFields();
      form.setFieldsValue({
        wordSet: wordSets[0]?._id || "",
      });
      setUseNewSet(false);
    }
  }, [editingWord, wordSets, form]);

  const handleSubmit = async (values) => {
    let finalWordSetId = values.wordSet;
    if (useNewSet || noWordSet) {
      if (!values.newSetName?.trim()) return;
      const newSet = await addWordSet(values.newSetName.trim());
      if (!newSet) return;
      finalWordSetId = newSet._id;
    }

    const word = {
      english: values.english,
      phonetic: values.phonetic,
      type: values.type,
      vietnamese: values.vietnamese,
      wordSet: finalWordSetId,
    };

    if (editingWord) {
      await onEdit(word);
    } else {
      await onAdd(word);
    }

    form.resetFields();
    form.setFieldsValue({
      wordSet: wordSets[0]?._id || "",
    });
    setUseNewSet(false);
  };

  const setOptions = [
    ...wordSets,
    { _id: "__new__", name: "+ Bộ từ mới..." }
  ];

  return (
    <Card
      title={editingWord ? "Sửa từ" : "Thêm từ mới"}
      className="max-w-2xl mx-auto"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          wordSet: wordSets[0]?._id || "",
        }}
      >
        <Form.Item
          name="english"
          label="Từ vựng (tiếng Anh)"
          rules={[{ required: true, message: "Vui lòng nhập từ tiếng Anh" }]}
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
        >
          <Input placeholder="danh từ, động từ, ..." />
        </Form.Item>

        <Form.Item
          name="vietnamese"
          label="Nghĩa tiếng Việt"
          rules={[{ required: true, message: "Vui lòng nhập nghĩa tiếng Việt" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="wordSet"
          label="Bộ từ"
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
            name="newSetName"
            label="Tên bộ từ mới"
            rules={[{ required: true, message: "Vui lòng nhập tên bộ từ mới" }]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingWord ? <SaveOutlined /> : <PlusOutlined />}
              disabled={((useNewSet || noWordSet) && !form.getFieldValue("newSetName")?.trim())}
            >
              {editingWord ? "Lưu" : "Thêm"}
            </Button>
            {editingWord && (
              <Button
                onClick={onCancelEdit}
                icon={<CloseOutlined />}
              >
                Huỷ
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default AddWord;