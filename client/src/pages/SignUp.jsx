import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AtSign,
  Lock,
  User,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Info,
} from "lucide-react";
import api from "../api/api";
import { useUser } from "../context/userContext";
import DropDown from "../components/DropDown";

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

  // Comprehensive validation function
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)
    ) {
      newErrors.password =
        "Password must include uppercase, lowercase, number, and special character";
    }

    // Phone number validation
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    // College validation
    if (!formData.college.trim()) {
      newErrors.college = "College name is required";
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    // Department validation
    if (!formData.departmentName.trim()) {
      newErrors.departmentName = "Department name is required";
    }

    // Date validations
    const today = new Date();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (startDate < today) {
      newErrors.startDate = "Start date must be in the future";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (endDate <= startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    return newErrors;
  }, [formData]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Automatically calculate endDate when startDate is changed
      if (name === "startDate") {
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1); // Add one month
        updatedData.endDate = endDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      }

      return updatedData;
    });

    // Clear specific field error on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post("/user/register", formData);

      if (response.data.status === "success") {
        if (setUser) {
          await setUser(response.data.user);
        }

        // Use replace to prevent going back to signup page
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(", ")
          : "Registration failed. Please try again.");

      setErrors({
        form: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized form fields for performance
  const formFields = useMemo(
    () => [
      {
        name: "name",
        type: "text",
        label: "Full Name",
        icon: User,
        placeholder: "John Doe",
      },
      {
        name: "email",
        type: "email",
        label: "Email Address",
        icon: AtSign,
        placeholder: "john@example.com",
      },
      {
        name: "password",
        type: "password",
        label: "Password",
        icon: Lock,
        placeholder: "Must include uppercase, lowercase, number, special char",
      },
      {
        name: "phoneNumber",
        type: "tel",
        label: "Phone Number",
        icon: Phone,
        placeholder: "+1234567890",
      },
      {
        name: "city",
        type: "text",
        label: "City",
        icon: MapPin,
        placeholder: "Your City",
      },
      {
        name: "state",
        type: "text",
        label: "State",
        icon: MapPin,
        placeholder: "Your State",
      },
      {
        name: "college",
        type: "text",
        label: "College Name",
        icon: Building2,
        placeholder: "University Name",
      },
      {
        name: "departmentName",
        type: "text",
        label: "Department Name",
        icon: Info,
        placeholder: "Computer Science",
      },
      {
        name: "startDate",
        type: "date",
        label: "Start Date",
        icon: Calendar,
      },
      {
        name: "endDate",
        type: "date",
        label: "End Date",
        icon: Calendar,
        placeholder: "Automatically calculated",
        readOnly: true, // Add this property to disable editing
      },
    ],
    []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 shadow-2xl rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start your internship journey with us
            </p>
          </div>

          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields.map(
              ({ name, type, label, icon: Icon, placeholder }) => (
                <div key={name} className="relative">
                  <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {label}
                  </label>
                  <div className="relative">
                    {Icon && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Icon size={20} />
                      </div>
                    )}
                    {name === "departmentName" ? (
                      <DropDown />
                    ) : (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        required
                        placeholder={placeholder}
                        value={formData[name]}
                        onChange={handleChange}
                        readOnly={name === "endDate"} // Make endDate field read-only
                        className={`w-full pl-10 pr-3 py-2 border rounded-md 
    focus:outline-none focus:ring-2 
    ${
      errors[name]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
    }
  `}
                      />
                    )}
                  </div>
                  {errors[name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
                  )}
                </div>
              )
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3 px-4 border border-transparent rounded-md 
                shadow-sm text-sm font-medium text-white 
                bg-gradient-to-r from-indigo-600 to-purple-600 
                hover:from-indigo-700 hover:to-purple-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-indigo-500 transition-all duration-300
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
