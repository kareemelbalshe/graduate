import { Suspense, useEffect } from "react";
import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import Loader from "./components/loader/loader";
import { useSelector } from "react-redux";
import { RootState } from "./lib/redux/store";

function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </>
  );
}

export default App;
