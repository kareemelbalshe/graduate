export interface ButtonProps {
  text: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  width?: string;
}

export default function Button({
  text,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  width = "w-full",
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${className} ${width} h-11 rounded-lg bg-[#0E4E5D] text-white text-sm font-medium disabled:bg-gray-100 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}