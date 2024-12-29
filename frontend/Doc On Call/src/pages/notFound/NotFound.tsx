import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className=" min-h-screen w-full">
      <div className="flex flex-col items-center h-[400px] justify-center w-full rounded-lg gap-7">
        <h2 className="text-4xl font-bold">Not Found</h2>
        <h1 className="text-7xl font-bold">404</h1>
        <button
          className="bg-[#22B9DD] text-white py-2 px-4 rounded-md"
          onClick={() => navigate("/chatbot")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
