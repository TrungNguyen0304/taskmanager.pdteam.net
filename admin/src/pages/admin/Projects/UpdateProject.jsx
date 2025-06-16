import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const UpdateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    status: "pending",
    priority: 2,
    deadline: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8001/api/company/viewTeamProject/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const project = response.data.project;
        setInitialValues({
          name: project.name || "",
          description: project.description || "",
          status: project.status || "pending",
          priority: project.priority || 2,
          deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
        });
      } catch (error) {
        navigate(-1);
      }
    };

    fetchProject();
  }, [id, navigate, token]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Tên dự án là bắt buộc"),
    description: Yup.string().required("Mô tả là bắt buộc"),
    status: Yup.string()
      .required("Trạng thái là bắt buộc")
      .oneOf(
        ["in_progress", "cancelled", "paused", "completed", "pending", "revoke"],
        "Trạng thái không hợp lệ"
      ),
    priority: Yup.number()
      .required("Mức ưu tiên là bắt buộc")
      .oneOf([1, 2, 3], "Mức ưu tiên không hợp lệ"),
    deadline: Yup.date()
      .nullable()
      .transform((value, originalValue) => (originalValue === "" ? null : value))
      .min(new Date(new Date().setHours(0, 0, 0, 0)), "Deadline không được nằm trong quá khứ"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    try {
      await axios.put(
        `http://localhost:8001/api/company/updateAssignedProjects/${id}`,
        {
          name: values.name,
          description: values.description,
          status: values.status,
          priority: Number(values.priority),
          deadline: values.deadline || undefined, // Send undefined if deadline is empty to avoid sending empty string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate(-1);
    } catch (error) {
      const rawMessage = error.response?.data?.message || "Lỗi không xác định.";

      // Bắt lỗi chuyển trạng thái không hợp lệ hoặc lỗi deadline
      const statusMatch = rawMessage.match(/Không thể chuyển trạng thái từ (\w+) sang (\w+)/);
      if (statusMatch) {
        const statusMap = {
          pending: "Đang chờ",
          in_progress: "Đang thực hiện",
          paused: "Tạm ngưng",
          completed: "Đã hoàn thành",
          cancelled: "Đã hủy",
          revoke: "Thu hồi",
        };

        const from = statusMap[statusMatch[1]] || statusMatch[1];
        const to = statusMap[statusMatch[2]] || statusMatch[2];
        alert(`❌ Không thể chuyển trạng thái từ "${from}" sang "${to}".`);
      } else if (rawMessage.includes("Deadline không được nằm trong quá khứ")) {
        alert("❌ Deadline không được nằm trong quá khứ.");
      } else if (rawMessage.includes("Giá trị deadline không hợp lệ")) {
        alert("❌ Giá trị deadline không hợp lệ.");
      } else {
        alert(`❌ ${rawMessage}`);
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="relative w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Chỉnh Sửa Dự Án</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700">
                Tên Dự Án
              </label>
              <Field
                type="text"
                id="name"
                name="name"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-700">
                Mô Tả
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-gray-700">
                Trạng Thái
              </label>
              <Field
                as="select"
                id="status"
                name="status"
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="pending">Đang chờ</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="paused">Tạm ngưng</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
                <option value="revoke">Thu hồi</option>
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label htmlFor="priority" className="block text-gray-700">
                Mức Độ Ưu Tiên
              </label>
              <Field
                as="select"
                id="priority"
                name="priority"
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value={1}>Cao</option>
                <option value={2}>Trung bình</option>
                <option value={3}>Thấp</option>
              </Field>
              <ErrorMessage
                name="priority"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label htmlFor="deadline" className="block text-gray-700">
                Hạn Chót
              </label>
              <Field
                type="date"
                id="deadline"
                name="deadline"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="deadline"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-blue-400"
              >
                Cập Nhật
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UpdateProject;