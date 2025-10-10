"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/authService";
import { LoginDTO } from "@/lib/api/types";

const LoginPage = () => {
  const router = useRouter();
  const [inputKey, setInputKey] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const credentials: LoginDTO = { inputKey, password };

    try {
      const response = await login(credentials);
      if (response.flag) {
        const loginResponseDTO = response.response.data?.loginResponseDTO;
        const accessToken = loginResponseDTO?.accessToken;
        const role = loginResponseDTO?.role;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        alert("Login successful!");
        if (role === "ADMIN") {
          router.push("/admin-dashboard");
        } else {
          router.push("/employee-dashboard");
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Background animation elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <form
        className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl relative z-10 border border-white/20"
        onSubmit={handleSubmit}
      >
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 rounded-full shadow-xl -z-10">
          <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 relative">
            DigiQuad
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-600 blur opacity-75 animate-pulse"></span>
          </h2>
        </div>

        {error && (
          <div className="bg-red-100/80 text-red-700 p-3 rounded-lg mb-4 text-center border border-red-200 animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Email or Username"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-white/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 transition-colors duration-200"
              />
              <span className="text-gray-600 text-sm">Remember Me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                  5.291A7.962 7.962 0 014 12H0c0 
                  3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
