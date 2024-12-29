import { Link } from "react-router-dom";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import { useEffect, useRef, useState } from "react";
import { registerValidation } from "../../lib/validation/validation";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const onSubmit = () => {
    console.log("Submitted");
  };
  useEffect(() => {
    const validateForm = async () => {
      try {
        await registerValidation.validate(
          { name, email, password },
          { abortEarly: false }
        );
        console.log("Form Submitted", { name, email, password });
        setErrors({ name: "", email: "", password: "" });
      } catch (validationError: any) {
        const validationErrors: { [key: string]: string } = {};
        validationError.inner.forEach((err: any) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      }
    };

    validateForm();
  }, [name, email, password]);

  const ref = useRef(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref?.current?.contains(event.target as Node)) {
      setErrors({ name: "", email: "", password: "" });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form
        className="w-[85%] sm:w-[70%] md:w-[55%] lg:w-[40%] flex flex-col items-center justify-center gap-5"
        onSubmit={onSubmit}
        ref={ref}
      >
        <Input
          label="Name"
          placeholder="Name"
          type="text"
          value={name}
          setValue={setName}
          required
          error={errors.name}
        />
        <Input
          label="Email"
          placeholder="Email"
          type="email"
          value={email}
          setValue={setEmail}
          icon={<MdOutlineAlternateEmail />}
          required
          error={errors.email}
        />
        <Input
          label="Password"
          placeholder="Password"
          type="password"
          value={password}
          setValue={setPassword}
          icon={<RiLockPasswordFill />}
          required
          error={errors.password}
        />
        <Button text="Login" type="submit" />
        <Link to="/login" className="text-sm text-center">
          Do you already have an account? Login
        </Link>
      </form>
    </div>
  );
}
