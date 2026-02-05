import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User as FirebaseUser,
  type AuthError,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";
import { firestoreService } from "./firestore";
import type { User } from "../types/Types";

// Authentication service class
export class AuthService {
  private static instance: AuthService;
  private currentUser: FirebaseUser | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if auth is available
  private isAvailable(): boolean {
    return isFirebaseConfigured() && auth !== null;
  }

  // Get current Firebase user
  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  // Initialize auth state listener
  initializeAuthListener(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    if (!this.isAvailable()) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Auth not available - using local mode");
      }
      return () => {};
    }

    if (!auth) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Auth not available");
      }
      return () => {};
    }

    return onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      callback(user);
    });
  }

  // Sign up with email and password
  async signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<FirebaseUser> {
    if (!this.isAvailable()) {
      throw new Error("Authentication not available");
    }

    try {
      if (!auth) {
        throw new Error("Authentication not available");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      await firestoreService.createUserProfile(user.uid, {
        email: user.email || "",
        displayName: displayName || user.displayName || undefined,
        createdAt: new Date(),
        lastActive: new Date(),
        preferences: {
          darkMode: false,
          language: "en",
          fontSize: "medium",
          highContrast: false,
          reducedMotion: false,
        },
      });

      // Send email verification
      await sendEmailVerification(user);

      return user;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getAuthErrorMessage(authError.code));
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    if (!this.isAvailable()) {
      throw new Error("Authentication not available");
    }

    try {
      if (!auth) {
        throw new Error("Authentication not available");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update last active time
      await firestoreService.updateUserProfile(user.uid, {
        lastActive: new Date(),
      });

      return user;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getAuthErrorMessage(authError.code));
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      if (!auth) {
        throw new Error("Authentication not available");
      }

      await signOut(auth);
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Sign out error:", error);
      }
      throw new Error("Failed to sign out");
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error("Authentication not available");
    }

    try {
      if (!auth) {
        throw new Error("Authentication not available");
      }

      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getAuthErrorMessage(authError.code));
    }
  }

  // Update user profile
  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    if (!this.isAvailable() || !this.currentUser) {
      throw new Error("Authentication not available or user not signed in");
    }

    try {
      await updateProfile(this.currentUser, updates);

      // Update Firestore profile
      await firestoreService.updateUserProfile(this.currentUser.uid, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Profile update error:", error);
      }
      throw new Error("Failed to update profile");
    }
  }

  // Get user profile from Firestore
  async getUserProfile(): Promise<User | null> {
    if (!this.currentUser) {
      return null;
    }

    return await firestoreService.getUserProfile(this.currentUser.uid);
  }

  // Update user preferences
  async updateUserPreferences(preferences: User["preferences"]): Promise<void> {
    if (!this.currentUser) {
      throw new Error("User not signed in");
    }

    await firestoreService.updateUserPreferences(
      this.currentUser.uid,
      preferences
    );
  }

  // Check if user is verified
  isEmailVerified(): boolean {
    return this.currentUser?.emailVerified || false;
  }

  // Resend email verification
  async resendEmailVerification(): Promise<void> {
    if (!this.isAvailable() || !this.currentUser) {
      throw new Error("Authentication not available or user not signed in");
    }

    try {
      await sendEmailVerification(this.currentUser);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getAuthErrorMessage(authError.code));
    }
  }

  // Get auth error message
  private getAuthErrorMessage(code: string): string {
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email address";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "An account with this email already exists";
      case "auth/weak-password":
        return "Password should be at least 6 characters long";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      case "auth/user-disabled":
        return "This account has been disabled";
      case "auth/operation-not-allowed":
        return "This operation is not allowed";
      case "auth/invalid-credential":
        return "Invalid credentials";
      default:
        return "Authentication failed. Please try again";
    }
  }

  // Track user activity
  async trackActivity(
    activity: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    await firestoreService.trackUserActivity(
      this.currentUser.uid,
      activity,
      metadata
    );
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
