import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../lib/axios/axios.ts";

export const welcomeChatBot = createAsyncThunk("chatbot/welcome", async () => {
  const response = await axiosInstance.post("/api/message/welcome");
  return response.data;
});

export const set_diseaseChatBot = createAsyncThunk(
  "chatbot/set_disease",
  async ({ disease_input }: { disease_input: string }) => {
    const response = await axiosInstance.post("/api/message/set_disease", {
      disease_input,
    });
    return response.data;
  }
);

export const set_num_diseaseChatBot = createAsyncThunk(
  "chatbot/set_num_disease",
  async ({ conf_inp }: { conf_inp: string }) => {
    const response = await axiosInstance.post("/api/message/set_num_disease", {
      conf_inp,
    });
    return response.data;
  }
);

export const set_num_daysChatBot = createAsyncThunk(
  "chatbot/set_num_days",
  async ({ num_days }: { num_days: string }) => {
    const response = await axiosInstance.post("/api/message/set_num_days", {
      num_days,
    });
    return response.data;
  }
);

export const set_Y_N_chatBot = createAsyncThunk(
  "chatbot/set_y_n",
  async ({ inp }: { inp: string }) => {
    const response = await axiosInstance.post("/api/message/set_y_n", {
      inp,
    });
    return response.data;
  }
);

export const get_chatbot = createAsyncThunk("chatbot/get_chatbot", async () => {
  const response = await axiosInstance.post("/api/message/chatbot");
  return response.data;
});

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState: {
    chat: null,
    welcome: null,
    diseases: null,
    selected_disease: null,
    questions: null,
    y_n: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(get_chatbot.fulfilled, (state, action) => {
      state.chat = action.payload;
    });
    builder.addCase(welcomeChatBot.fulfilled, (state, action) => {
      state.welcome = action.payload;
      state.chat=action.payload;
      state.diseases=null;
      state.selected_disease=null;
      state.questions=null;
      state.y_n=null;
    });
    builder.addCase(set_diseaseChatBot.fulfilled, (state, action) => {
      state.diseases = action.payload;
    });
    builder.addCase(set_num_diseaseChatBot.fulfilled, (state, action) => {
      state.selected_disease = action.payload;
    });
    builder.addCase(set_num_daysChatBot.fulfilled, (state, action) => {
      state.questions = action.payload;
    });
    builder.addCase(set_Y_N_chatBot.fulfilled, (state, action) => {
      state.y_n = action.payload;
    });
  },
});

export default chatbotSlice.reducer;
