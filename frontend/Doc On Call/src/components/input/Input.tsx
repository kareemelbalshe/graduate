import { useState, useEffect } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface InputProps {
  id?: string;
  label?: string;
  placeholder: string;
  icon?: React.ReactNode;
  value?: string;
  setValue?: (e: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password";
  labelColor?: string;
  border?: string;
  rounded?: string;
  error?: string;
}

export default function Input({
  id,
  label,
  placeholder,
  icon,
  value,
  setValue,
  required,
  disabled = false,
  type = "text",
  labelColor = "text-[#0E4E5D]",
  border = "border-[#5C5C5C]",
  rounded = "rounded-lg",
  error,
}: InputProps) {
  const [valueInvalid, setValueInvalid] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [typeP, setType] = useState("");

  useEffect(() => {
    if (hasInteracted) {
      if (error) {
        setValueInvalid(true);
      } else {
        setValueInvalid(false);
      }
    }
  }, [hasInteracted, error]);

  useEffect(() => {
    if (type === "password") {
      setType("password");
    } else {
      setType("text");
    }
  }, [type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setValue) {
      setValue(e.target.value);
    }
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={`${
            valueInvalid ? "text-[#F55157]" : labelColor
          } block text-sm font-medium mb-2`}
        >
          {label}{" "}
          {required && <span className="text-[#DF4A4F]">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${labelColor}`}
          >
            {icon}
          </div>
        )}
        <input
          id={id}
          type={typeP}
          className={`w-full h-11 p-3 pl-8 border ${
            valueInvalid ? "border-[#F55157]" : border
          } focus:outline-none ${disabled ? "bg-gray-100" : ""} ${rounded}`}
          placeholder={
            valueInvalid ? `This field is required but ${label}` : placeholder
          }
          value={value}
          onChange={handleInputChange}
          required={required}
          disabled={disabled}
        />
        {type === "password" && (
          <div
            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${labelColor}`}
          >
            {typeP !== "password" ? (
              <FaRegEyeSlash onClick={() => setType("password")} />
            ) : (
              <FaRegEye onClick={() => setType("text")} />
            )}
          </div>
        )}
      </div>
      {valueInvalid && <span className="text-[#F55157] text-sm">{error}</span>}
    </div>
  );
}
