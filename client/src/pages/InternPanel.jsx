import { useEffect, useState } from "react";
import api from "../api/api";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_FILES = 4; // 1 PDF and 3 images

const InternDashboard = () => {
  const [tasks, setTasks] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [weekNumber, setWeekNumber] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submission, setSubmission] = useState({
    links: "",
    notes: "",
    files: [],
  });

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(()=>{
   console.log(submission);
  },[submission])

  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 3MB or less");
      return false;
    }
    return true;
  };

  const validateFiles = (files) => {
    if (files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return false;
    }

    let pdfCount = 0;
    let imageCount = 0;

    for (let file of files) {
      // Validate file size
      if (!validateFileSize(file)) return false;

      // Validate file type
      const allowedTypes = {
        pdf: "application/pdf",
        images: ["image/jpeg", "image/png"],
      };

      if (file.type === allowedTypes.pdf) {
        pdfCount++;
      } else if (allowedTypes.images.includes(file.type)) {
        imageCount++;
      } else {
        setError("Only PDF, JPEG, and PNG files are allowed");
        return false;
      }

      // Ensure max 1 PDF and max 3 images
      if (pdfCount > 1 || imageCount > 3) {
        setError("Maximum 1 PDF and 3 images allowed");
        return false;
      }
    }

    return true;
  };

  const handleSubmissionChange = (e) => {
    const { name, value, files } = e.target;
    setError(""); // Clear previous errors

    if (name === "files" && files) {
      const newFiles = Array.from(files);
      const existingFiles = submission.files;

      // Merge new files with existing ones
      const allFiles = [...existingFiles, ...newFiles];

      // Validate file size, type, and total count
      if (!validateFiles(allFiles)) {
        e.target.value = ""; // Reset file input
        return;
      }

      setSubmission((prev) => ({
        ...prev,
        files: allFiles.slice(0, MAX_FILES), // Ensure we don't exceed the limit
      }));
    } else {
      setSubmission((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOfferLetterDownload = async () => {
    try {
      const { data, headers } = await api.get("/certificate/offerLetter", {
        params: { email: user.email },
        responseType: "blob",
      });

      const fileName =
        headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `${user.name}_offerletter.pdf`;

      const blob = new Blob([data], {
        type: headers["content-type"] || "application/pdf",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError("Error downloading offer letter");
      console.error("Error in downloading offer letter:", err);
    }
  };

  const handleCompletionCertDownload = async () => {
    try {
      await api.post("/certificate/generateICC", user);

      const { data, headers } = await api.get("/certificate/icc", {
        params: { email: user.email },
        responseType: "blob",
      });

      const fileName =
        headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") ||
        `${user.name}_IntershipCompletionCertificate.pdf`;

      const blob = new Blob([data], {
        type: headers["content-type"] || "application/pdf",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError("Error downloading completion certificate");
      console.error("Error in downloading file:", err);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    navigate("/login");
  };

  const fetchTasks = (week) => {
    setLoading(true);
    api
      .get("/task/particularweek", {
        params: {
          title: user.department,
          weekNumber: week,
        },
      })
      .then((response) => {
        setTasks(response.data.weektask[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!submission.links.trim()) {
      setError("Please provide at least one project link");
      return;
    }

    if (!submission.notes.trim()) {
      setError("Please provide some notes about your submission");
      return;
    }

    const formData = new FormData();
    formData.append("weekNumber", weekNumber);
    formData.append("links", submission.links);
    formData.append("notes", submission.notes);
    formData.append("departmentName", user.department);
    formData.append("username", user.name);

    submission.files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    setIsSubmitting(true);
    setError("");
    setUploadProgress(0);

    try {
      await api.post("/submission", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      alert("Submission Successful!");
      setSubmission({ links: "", notes: "", files: [] });
      setUploadProgress(0);
    } catch (error) {
      setError("Error submitting task");
      console.error("Error submitting task:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTasks(weekNumber);
  }, [weekNumber, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.h1
          className="text-2xl font-medium text-gray-600"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Loading...
        </motion.h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        className="bg-white shadow-md"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">Intern Dashboard</h1>
          <div className="space-y-2 sm:space-x-4 sm:space-y-0 flex flex-col sm:flex-row">
            <button
              onClick={handleOfferLetterDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Download Offer Letter
            </button>
            <button
              onClick={handleCompletionCertDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Download Completion Certificate
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <motion.h2
          className="text-4xl font-bold mb-6 text-blue-800 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {tasks.weekTitle}
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((week) => (
            <motion.button
              key={week}
              className={`py-2 px-6 rounded-full shadow-md transform transition hover:scale-105 ${
                weekNumber === week
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-blue-200"
              }`}
              onClick={() => setWeekNumber(week)}
              whileHover={{ scale: 1.1 }}
            >
              Week {week}
            </motion.button>
          ))}
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        <AnimatePresence>
          <motion.div
            key={weekNumber}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="border rounded-lg p-4 sm:p-6 shadow-lg bg-gradient-to-br from-white via-blue-50 to-purple-50"
          >
            {tasks.taskList.map((taskItem, index) => (
              <div key={index} className="mb-6">
                <motion.h3
                  className="text-2xl font-semibold text-purple-700 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {taskItem.taskTitle}
                </motion.h3>
                <p className="text-lg text-gray-700 mb-4">
                  {taskItem.taskDescription}
                </p>
              </div>
            ))}

            <motion.div
              className="mt-8 p-4 sm:p-6 bg-gray-100 rounded-lg shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Submit Your Work
              </h3>

              {isSubmitting && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-1">
                    {uploadProgress}% Uploaded
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-lg text-gray-700 mb-2">
                    Links (e.g., GitHub, project URLs):
                  </label>
                  <input
                    type="text"
                    name="links"
                    value={submission.links}
                    onChange={handleSubmissionChange}
                    className="w-full p-2 border rounded"
                    placeholder="https://github.com/your-project"
                  />
                </div>
                <div>
                  <label className="block text-lg text-gray-700 mb-2">
                    Notes:
                  </label>
                  <textarea
                    name="notes"
                    value={submission.notes}
                    onChange={handleSubmissionChange}
                    className="w-full p-2 border rounded"
                    placeholder="Add any relevant notes"
                  />
                </div>
                <div>
                  <label className="block text-lg text-gray-700 mb-2">
                    Upload Files (1 PDF, 3 Images, max 3MB each):
                  </label>
                  <input
                    type="file"
                    name="files"
                    multiple
                    accept=".pdf,image/jpeg,image/png"
                    onChange={handleSubmissionChange}
                    className="w-full p-2"
                  />
                  {submission.files.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Files selected:{" "}
                      {submission.files.map((f) => f.name).join(", ")}
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={handleSubmit}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InternDashboard;
