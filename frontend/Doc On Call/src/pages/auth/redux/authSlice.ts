import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../lib/axios/axios";

export const handleLogin = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string },{ rejectWithValue }) => {
    try {
        console.log(email, password)
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      console.log(email, password)
      console.log(response.data)
      localStorage.setItem("userInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await axiosInstance.post("/api/auth/register", {
        username: name,
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      return Promise.reject(error.response?.data || "Registration failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email }: { email: string },) => {
    try {
      const response = await axiosInstance.post("/auth/resetPassword", {
        email,
      });
      return response.data;
    } catch (error: any) {
        return Promise.reject(error.response?.data || "Reset password failed");
    }
  }
);

export const confirm = createAsyncThunk(
  "auth/confirm",
  async (
    { userId, code }: { userId: string; code: string },
  ) => {
    try {
      const response = await axiosInstance.post(`/api/auth/verify/${userId}`, {
        code,
      });
      return response.data;
    } catch (error: any) {
        return Promise.reject(error.response?.data || "Confirmation failed");
    }
  }
);

const initialState = {
  isAuthenticated: !!localStorage.getItem("userInfo"),
  user: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo") as string)
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("userInfo");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(handleLogin.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    });
  },
});

export default authSlice.reducer;
export const { logout } = authSlice.actions;
