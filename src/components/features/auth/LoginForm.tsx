import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useLanguage } from "../../../hooks/useContext";
import { authService } from "../../../firebase/auth";
import { firestoreService } from "../../../firebase/firestore";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
  className = "",
}) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError(t("auth.pleaseFillFields"));
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);

      // Track login activity
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        await firestoreService.trackUserActivity(
          currentUser.uid,
          "user_login",
          { method: "email" }
        );
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className={`${className}`}>
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 p-6">
        <div className="text-left mb-6">
          <h2 className="text-xl text-center font-bold text-green-700 dark:text-green-400">
            {t("auth.welcomeBack")}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-center">
            {t("auth.signInToContinue")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              {t("auth.emailAddress")}
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-stone-800 dark:text-stone-100"
              placeholder={t("auth.enterEmail")}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-stone-800 dark:text-stone-100 pr-10"
                placeholder={t("auth.enterPassword")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5 text-stone-400 dark:text-stone-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-stone-400 dark:text-stone-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 dark:border-stone-600 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-stone-700 dark:text-stone-300"
              >
                {t("auth.rememberMe")}
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                // TODO: Implement password reset
                if (import.meta.env.DEV) {
                  // eslint-disable-next-line no-console
                  console.log("Password reset requested");
                }
              }}
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              {t("auth.forgotPassword")}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t("auth.signingIn")}
              </div>
            ) : (
              t("auth.signIn")
            )}
          </button>
        </form>

        {onSwitchToSignup && (
          <div className="mt-6 text-left">
            <p className="text-sm text-stone-600 dark:text-stone-400 text-center">
              {t("auth.dontHaveAccount")}{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                {t("auth.signUp")}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
