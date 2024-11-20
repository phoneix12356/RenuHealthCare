import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useUser } from "../context/userContext";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    state: "",
    college: "",
    departmentName: "",
    startDate: "",
    endDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post("/user/register", formData);
      console.log("Registration response:", response.data); // Debug log

      if (response.data.status === "success") {
        // First set the user
        if (setUser) {
          try {
            await setUser(response.data.user);
            // console.log("user inside signup", user);
            console.log("User context updated successfully"); // Debug log
          } catch (contextError) {
            console.error("Error setting user context:", contextError);
          }
        } else {
          console.warn("setUser function is not available from context");
        }

        // Then navigate
        console.log("Attempting to navigate to dashboard"); // Debug log
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err); // Debug log
      setErrors({
        form:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { name: "name", type: "text", label: "Full Name" },
    { name: "email", type: "email", label: "Email Address" },
    { name: "password", type: "password", label: "Password" },
    { name: "phoneNumber", type: "tel", label: "Phone Number" },
    { name: "city", type: "text", label: "City" },
    { name: "state", type: "text", label: "State" },
    { name: "college", type: "text", label: "College Name" },
    { name: "departmentName", type: "text", label: "Department Name" },
    { name: "startDate", type: "date", label: "Start Date" },
    { name: "endDate", type: "date", label: "End Date" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 shadow-lg rounded-lg"
        >
          <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>

          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg">
              {errors.form}
            </div>
          )}

          <div className="space-y-4">
            {formFields.map(({ name, type, label }) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  required
                  value={formData[name]}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-1 ${
                    errors[name]
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {errors[name] && (
                  <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
