import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useLanguage } from "../../../hooks/useContext";
import { authService } from "../../../firebase/auth";
import { firestoreService } from "../../../firebase/firestore";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  className = "",
}) => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push(t("password.atLeast8Chars"));
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t("password.oneUppercase"));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t("password.oneLowercase"));
    }
    if (!/\d/.test(password)) {
      errors.push(t("password.oneNumber"));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t("password.oneSpecial"));
    }

    return errors;
  };

  const passwordErrors = validatePassword(formData.password);
  const isPasswordValid = passwordErrors.length === 0;
  const doPasswordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError(t("auth.pleaseFillFields"));
      return;
    }

    if (!isPasswordValid) {
      setError(t("auth.pleaseFixPassword"));
      return;
    }

    if (!doPasswordsMatch) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    try {
      setIsLoading(true);
      await signup(formData.email, formData.password);

      // Update profile with display name if provided
      const currentUser = authService.getCurrentUser();
      if (currentUser && formData.displayName) {
        await authService.updateUserProfile({
          displayName: formData.displayName,
        });
      }

      // Track signup activity
      if (currentUser) {
        await firestoreService.trackUserActivity(
          currentUser.uid,
          "user_signup",
          { method: "email", hasDisplayName: !!formData.displayName }
        );
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signupFailed"));
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
            {t("auth.createAccount")}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-2 text-center">
            {t("auth.joinUs")}
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
              htmlFor="displayName"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              {t("auth.displayName")}
            </label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-stone-800 dark:text-stone-100"
              placeholder={t("auth.enterDisplayName")}
            />
          </div>

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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-stone-800 dark:text-stone-100 pr-10 ${
                  formData.password && !isPasswordValid
                    ? "border-red-300 dark:border-red-600"
                    : "border-stone-200 dark:border-stone-700"
                }`}
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

            {/* Password requirements */}
            {formData.password && (
              <div className="mt-2 text-sm">
                <p className="text-stone-600 dark:text-stone-400 mb-1">
                  {t("password.requirements")}
                </p>
                <ul className="space-y-1">
                  {[
                    {
                      condition: formData.password.length >= 8,
                      text: t("password.atLeast8Chars"),
                    },
                    {
                      condition: /[A-Z]/.test(formData.password),
                      text: t("password.oneUppercase"),
                    },
                    {
                      condition: /[a-z]/.test(formData.password),
                      text: t("password.oneLowercase"),
                    },
                    {
                      condition: /\d/.test(formData.password),
                      text: t("password.oneNumber"),
                    },
                    {
                      condition: /[!@#$%^&*(),.?":{}|<>]/.test(
                        formData.password
                      ),
                      text: t("password.oneSpecial"),
                    },
                  ].map((req, index) => (
                    <li
                      key={index}
                      className={`flex items-center ${
                        req.condition
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {req.condition ? (
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {req.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              {t("auth.confirmPassword")}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-stone-800 dark:text-stone-100 pr-10 ${
                  formData.confirmPassword && !doPasswordsMatch
                    ? "border-red-300 dark:border-red-600"
                    : "border-stone-200 dark:border-stone-700"
                }`}
                placeholder={t("auth.confirmYourPassword")}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
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

            {formData.confirmPassword && !doPasswordsMatch && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {t("auth.passwordsDoNotMatch")}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 dark:border-stone-600 rounded"
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-stone-700 dark:text-stone-300"
            >
              {t("auth.agreeToTerms")}{" "}
              <a
                href="/terms"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                {t("auth.termsOfService")}
              </a>{" "}
              {t("auth.and")}{" "}
              <a
                href="/privacy"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                {t("auth.privacyPolicy")}
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t("auth.creatingAccount")}
              </div>
            ) : (
              t("auth.createAccount")
            )}
          </button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-6 text-left">
            <p className="text-sm text-stone-600 dark:text-stone-400 text-center">
              {t("auth.alreadyHaveAccount")}{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                {t("auth.signIn")}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
