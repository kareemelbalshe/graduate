import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import { AppDispatch, RootState } from "../../lib/redux/store";
import { logout } from "../auth/redux/authSlice";
import {
  get_chatbot,
  set_diseaseChatBot,
  set_num_daysChatBot,
  set_num_diseaseChatBot,
  set_Y_N_chatBot,
  welcomeChatBot,
} from "./redux/chatbotSlice";
import "./style/style.css";

export default function Chatbot() {
  const dispatch = useDispatch<AppDispatch>();
  const [message, setMessage] = useState("");
  const [numMessage, setNumMessage] = useState(1);
  const [inp, setInp] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  console.log(currentQuestionIndex);
  const [answers, setAnswers] = useState({});

  const { chat, welcome, diseases, selected_disease, questions, y_n } =
    useSelector((state: RootState) => state.chatbot);

  const logoutHandler = () => {
    dispatch(logout());
  };

  useEffect(() => {
    if (diseases?.message === "Enter valid symptom.")
      setNumMessage(numMessage - 1);
  }, [diseases?.message]);
  useEffect(() => {
    if (selected_disease?.message !== "Okay. From how many days?")
      setNumMessage(numMessage - 1);
  }, [selected_disease?.message]);
  useEffect(() => {
    if (!questions?.message2) setNumMessage(numMessage - 1);
  }, [questions?.message]);
  useEffect(() => {
    if (!y_n?.message2) setNumMessage(numMessage - 1);
  }, [y_n?.message]);

  useEffect(() => {
    dispatch(welcomeChatBot());
    dispatch(get_chatbot());
    setMessage("");
    setNumMessage(1);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setInp("");
  }, [dispatch]);

  const startChat = () => {
    dispatch(welcomeChatBot());
    dispatch(get_chatbot());
    setMessage("");
    setNumMessage(1);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setInp("");
  };

  const updateInp = (value: string) => {
    setInp((prev) => prev + value + " ");
    setMessage(inp);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    if (numMessage === 1) {
      await dispatch(set_diseaseChatBot({ disease_input: message }));
      await dispatch(get_chatbot());
      setMessage("");
      setNumMessage(2);
    } else if (numMessage === 2) {
      await dispatch(set_num_diseaseChatBot({ conf_inp: message }));
      await dispatch(get_chatbot());
      setMessage("");
      setNumMessage(3);
    } else if (numMessage === 3) {
      await dispatch(set_num_daysChatBot({ num_days: message }));
      await dispatch(get_chatbot());
      setMessage("");
      setNumMessage(4);
    } else if (numMessage === 4) {
      await dispatch(set_Y_N_chatBot({ inp: message }));
      dispatch(get_chatbot());
      setMessage("");
      setNumMessage(5);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, welcome, diseases, selected_disease, questions, y_n]);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-5">
      <Button text="Logout" onClick={logoutHandler} />
      <hr />
      <Button text="Start Chat" onClick={startChat} />
      <div className="h-full w-full bg-slate-200 my-5 overflow-y-scroll hide-scrollbar flex flex-col">
        {!chat ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {welcome && (
              <div className="text-lg p-3 bg-[#0E4E5D] w-fit text-white m-2 rounded-lg self-start">
                <p>{welcome?.message}</p>
                <p>{welcome?.message2}</p>
              </div>
            )}
            {chat?.disease_input && (
              <div className="text-lg p-3 bg-[#ccc] w-fit text-black m-2 rounded-lg self-end">
                <p>{chat?.disease_input}</p>
              </div>
            )}
            {diseases && (
              <div className="text-lg p-3 bg-[#0E4E5D] w-fit text-white m-2 rounded-lg self-start">
                <p>{diseases.message}</p>
                {diseases?.message2?.map((msg) => (
                  <p key={msg[0]}>{`${msg[0]}. ${msg[1]}`}</p>
                ))}
                <p>{diseases.message3}</p>
              </div>
            )}
            {chat?.conf_inp && (
              <div className="text-lg p-3 bg-[#ccc] w-fit text-black m-2 rounded-lg self-end">
                <p>{chat?.conf_inp}</p>
              </div>
            )}
            {selected_disease && (
              <div className="text-lg p-3 bg-[#0E4E5D] w-fit text-white m-2 rounded-lg self-start">
                <p>{selected_disease.message}</p>
              </div>
            )}
            {chat?.num_days && (
              <div className="text-lg p-3 bg-[#ccc] w-fit text-black m-2 rounded-lg self-end">
                <p>{chat?.num_days}</p>
              </div>
            )}
            {questions && typeof questions?.message !== "string" ? (
              <div className="text-lg p-3 bg-[#0E4E5D] w-fit text-white m-2 rounded-lg self-start">
                {questions?.message?.map((msg, index) => (
                  <div
                    className={`flex gap-3 items-center ${
                      index > Object.keys(answers).length
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                    key={msg.index}
                  >
                    <p className="min-w-48">{`${msg.index}. ${msg.symptom}`}</p>
                    <Button
                      className={`border mb-1 ${
                        answers[msg.index]
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                      text="Yes"
                      width="w-[50px]"
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [msg.index]: "yes" }));
                        setCurrentQuestionIndex((prev) => prev + 1);
                        updateInp("yes");
                      }}
                    />
                    <Button
                      className={`border mb-1 ${
                        answers[msg.index]
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }`}
                      text="No"
                      width="w-[50px]"
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [msg.index]: "no" }));
                        setCurrentQuestionIndex((prev) => prev + 1);
                        updateInp("no");
                      }}
                    />
                  </div>
                ))}
                <p>{questions.message2}</p>
              </div>
            ) : (
              <>
                {questions?.message && (
                  <div className="text-lg p-3 bg-[#0E4E5D] w-fit text-white m-2 rounded-lg self-start">
                    <p>{questions?.message}</p>
                  </div>
                )}
              </>
            )}
            {y_n && (
              <div className="text-lg p-3 bg-[#0E4E5D] w-fit text-white m-2 rounded-lg self-start">
                <p>{y_n.message}</p>
                <p>{y_n.message2}</p>
                <p>{y_n.message3}</p>
                <p>{y_n.message4}</p>
                {y_n?.message5?.map((msg) => (
                  <p key={msg[0]}>{`${msg[0]}. ${msg[1]}`}</p>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="flex items-center justify-center w-full gap-5">
        <Input
          value={message}
          setValue={setMessage}
          placeholder="Type your message..."
        />
        <Button
          text="Send"
          width="w-16"
          onClick={sendMessage}
        />
      </div>
    </div>
  );
}
