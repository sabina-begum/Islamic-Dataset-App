import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/features/auth/LoginForm";
import { SignupForm } from "../components/features/auth/SignupForm";
import Breadcrumb from "../components/common/Breadcrumb";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSuccess = () => {
    navigate("/profile");
  };

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb />

        <div className="max-w-md mx-auto">
          {isLogin ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={handleSwitchToSignup}
            />
          ) : (
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
