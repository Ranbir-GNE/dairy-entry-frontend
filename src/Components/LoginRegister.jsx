import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LoadingButton from "./LoadingButton";
import authContext from "../Context/authContext";
import image from "../assets/diary.png";

const LoginRegister = () => {
  const [isLoading, setIsLoading] = useState();
  const authData = useContext(authContext);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register forms
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("key");
    if (token) {
      navigate("/home");
    }
  }, []);

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === "login") {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://diary-entry-backend.vercel.app/api/auth/login",
        {
          email: loginData.email,
          password: loginData.password,
        }
      );
      if (!response) {
        toast.error("Login failed. Please try again.");
        return;
      }
      const token = response.data.token;
      localStorage.setItem("key", token);
      authData.setAuth(true);
      toast.success("Login Success");

      navigate("/home");
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(
        "https://diary-entry-backend.vercel.app/api/auth/register",
        {
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }
      );
      if (!response) {
        toast.error("Registration failed. Please try again.");
        return;
      }
      toast.success("Registration Success");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-lg flex flex-col lg:flex-row mx-2 items-center">
        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 p-4">
          <div className="flex justify-around mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrorMessage("");
              }}
              className={`${
                isLogin
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              } font-bold text-lg pb-2`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrorMessage("");
              }}
              className={`${
                !isLogin
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              } font-bold text-lg pb-2`}
            >
              Register
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={(e) => handleInputChange(e, "login")}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange(e, "login")}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <LoadingButton
                isLoading={isLoading}
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold disabled:brightness-50 hover:bg-blue-600 transition duration-300"
              >
                Login
              </LoadingButton>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Username</label>
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={(e) => handleInputChange(e, "register")}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={(e) => handleInputChange(e, "register")}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={(e) => handleInputChange(e, "register")}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={(e) => handleInputChange(e, "register")}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <LoadingButton
                isLoading={isLoading}
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
              >
                Register
              </LoadingButton>
            </form>
          )}
        </div>

        {/* Right Side - Image Section */}
        <div className="hidden lg:flex w-1/2 p-6 bg-indigo-50 items-center justify-center">
          <img
            src={image}
            alt="diary"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
