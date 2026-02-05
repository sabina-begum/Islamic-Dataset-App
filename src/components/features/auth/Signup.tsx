import React, { useState } from "react";
import { useAuth } from "../../../hooks/useContext";

interface SignupProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const title = type === "terms" ? "Terms of Use" : "Privacy Policy";
  const content =
    type === "terms" ? (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Terms of Use
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          By using the Islamic Dataset Interface, you accept and agree to be
          bound by the terms and provision of this agreement.
        </p>
        <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
          <p>
            <strong>Key Points:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Personal, non-commercial use only</li>
            <li>No modification or redistribution without permission</li>
            <li>No reverse engineering of software</li>
            <li>Accuracy of materials not guaranteed</li>
            <li>Service provided "as is" without warranties</li>
          </ul>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-500">
          For the complete terms, please visit our full Terms of Use page.
        </p>
      </div>
    ) : (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
          Privacy Policy
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          We collect and use your information to provide and improve our
          services.
        </p>
        <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
          <p>
            <strong>What We Collect:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Email address and name (if provided)</li>
            <li>Usage preferences and settings</li>
            <li>Technical information (browser, OS, IP)</li>
            <li>Search queries and interaction data</li>
          </ul>
          <p>
            <strong>Your Rights:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Access, correct, or delete your data</li>
            <li>Object to data processing</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-500">
          For the complete policy, please visit our full Privacy Policy page.
        </p>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {content}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Signup: React.FC<SignupProps> = ({ onClose, onSwitchToLogin }) => {
  const { signup, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [termsModal, setTermsModal] = useState<{
    isOpen: boolean;
    type: "terms" | "privacy";
  }>({
    isOpen: false,
    type: "terms",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      setValidationError(
        "You must agree to the Terms of Use and Privacy Policy"
      );
      return;
    }

    try {
      await signup(formData.email, formData.password);
      onClose();
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Signup failed:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openTermsModal = (type: "terms" | "privacy") => {
    setTermsModal({ isOpen: true, type });
  };

  const closeTermsModal = () => {
    setTermsModal({ isOpen: false, type: "terms" });
  };

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
            Create your account
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              {validationError || error}
            </p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Terms and Conditions Agreement */}
          <div className="flex items-start space-x-3 p-4 bg-stone-50 dark:bg-stone-700/50 rounded-lg border border-stone-200 dark:border-stone-600">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 rounded"
              required
            />
            <label
              htmlFor="agreeToTerms"
              className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed"
            >
              I agree to the{" "}
              <button
                type="button"
                onClick={() => openTermsModal("terms")}
                className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline"
              >
                Terms of Use
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => openTermsModal("privacy")}
                className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline"
              >
                Privacy Policy
              </button>
              . By creating an account, you acknowledge that you have read and
              agree to our terms and conditions.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>

      <TermsModal
        isOpen={termsModal.isOpen}
        onClose={closeTermsModal}
        type={termsModal.type}
      />
    </>
  );
};

export default Signup;
