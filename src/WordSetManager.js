import React from "react";
import { Form, Input, Button, List, Typography, Empty, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;

function WordSetManager({ wordSets = [], addWordSet, removeWordSet }) {
  const [form] = Form.useForm();

  const handleAdd = async (values) => {
    const name = values.newSet.trim();
    if (name && !wordSets.some(ws => ws.name === name)) {
      await addWordSet(name);
      form.resetFields();
    }
  };

  return (
    <div>
      <Title level={4}>Quản lý bộ từ</Title>
      
      <Form
        form={form}
        layout="inline"
        onFinish={handleAdd}
        className="mb-4"
      >
        <Form.Item
          name="newSet"
          rules={[
            { required: true, message: "Vui lòng nhập tên bộ từ" },
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
          <Input
            placeholder="Tên bộ từ mới"
            allowClear
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
          >
            Thêm bộ từ
          </Button>
        </Form.Item>
      </Form>

      {wordSets.length === 0 ? (
        <Empty description="Chưa có bộ từ nào" />
      ) : (
        <List
          size="small"
          dataSource={wordSets}
          renderItem={(set) => (
            <List.Item
              key={set._id}
              extra={
                <Popconfirm
                  title="Xóa bộ từ"
                  description="Bạn có chắc muốn xóa bộ từ này?"
                  onConfirm={() => removeWordSet(set._id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              }
            >
              <Typography.Text>{set.name}</Typography.Text>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

export default WordSetManager; 