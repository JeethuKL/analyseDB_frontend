import api from "@/lib/api";

interface SignupData {
  username: string;
  email: string;
  password: string;
  database_data?: Record<string, any>;
}

interface LoginData {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_disabled: boolean;
  database_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const AuthService = {
  async signup(data: SignupData): Promise<User> {
    const response = await api.post("/users/", data);
    return response.data;
  },

  async login(
    data: LoginData
  ): Promise<{ access_token: string; token_type: string }> {
    // For login, we need to send form data
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await api.post("/token", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Login response:", response.data);

    // Store the token in localStorage
    if (response.data && response.data.access_token) {
      localStorage.setItem("accessToken", response.data.access_token);

      // Also store in a cookie for middleware
      document.cookie = `accessToken=${response.data.access_token}; path=/; max-age=1800; SameSite=Strict`;

      console.log("Token stored successfully in localStorage and cookie");
    } else {
      throw new Error("No token received from server");
    }

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get("/users/me");
    return response.data;
  },

  async updateUser(userId: number, data: Partial<SignupData>): Promise<User> {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  logout(): void {
    // Remove from localStorage
    localStorage.removeItem("accessToken");

    // Clear any cookies if you're using them
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    console.log("Successfully logged out, all tokens cleared");
  },

  isAuthenticated(): boolean {
    return localStorage.getItem("accessToken") !== null;
  },
};
