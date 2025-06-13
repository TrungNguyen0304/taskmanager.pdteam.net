import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const CreateProject = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    name: "",
    description: "",
    priority: 2,
    status: "pending",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Tên dự án là bắt buộc"),
    description: Yup.string().required("Mô tả là bắt buộc"),
    priority: Yup.number()
      .required("Mức ưu tiên là bắt buộc")
      .oneOf([1, 2, 3], "Mức ưu tiên không hợp lệ"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8001/api/company/createProject",
        {
          name: values.name,
          description: values.description,
          status: values.status,
          priority: Number(values.priority),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/project-unassigned");
    } catch (error) {
      alert(
        `Tạo dự án thất bại: ${error.response?.data?.message || error.message}`
      );
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
      <h2 className="text-2xl font-bold mb-4">Thêm Dự Án Mới</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="name" className="flex text-gray-700">
                Tên Dự Án
                <p className="text-red-500 ml-1">*</p>
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
              <label htmlFor="description" className="flex text-gray-700">
                Mô Tả
                <p className="text-red-500 ml-1">*</p>
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
              <label htmlFor="priority" className="block text-gray-700">
                Mức Ưu Tiên
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
                Tạo Dự Án
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateProject;
