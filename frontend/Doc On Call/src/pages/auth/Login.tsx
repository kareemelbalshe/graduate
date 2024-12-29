import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useLogin } from "./func/login_logic";

export default function Login() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    onSubmit,
    ref,
  } = useLogin();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form
        className="w-[85%] sm:w-[70%] md:w-[55%] lg:w-[40%] flex flex-col items-center justify-center gap-5"
        onSubmit={onSubmit}
        ref={ref}
      >
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
        <Link to="/register" className="text-sm text-center">
          Don't have an account? Register
        </Link>
      </form>
    </div>
  );
}
