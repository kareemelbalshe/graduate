import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../../pages/auth/redux/authSlice";
import chatbotSlice from "../../pages/chatbot/redux/chatbotSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    chatbot: chatbotSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
