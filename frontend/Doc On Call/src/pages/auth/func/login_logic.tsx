import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../lib/redux/store";
import { loginValidation } from "../../../lib/validation/validation";
import { handleLogin } from "../redux/authSlice";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const ref = useRef<HTMLFormElement>(null);

  console.log({ email, password });
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log(email, password);
       await dispatch(handleLogin({ email, password }));
        navigate("/chatbot");
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setErrors({ email: "Invalid email or password", password: "" });
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setErrors({ email: "", password: "" });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const validateForm = async () => {
      try {
        await loginValidation.validate(
          { email, password },
          { abortEarly: false }
        );
        setErrors({ email: "", password: "" });
      } catch (validationError: any) {
        const validationErrors: { [key: string]: string } = {};
        validationError.inner.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      }
    };

    validateForm();
  }, [email, password]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    onSubmit,
    ref,
  };
}
