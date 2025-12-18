import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import IntroPage from "../components/intro-page.jsx";
import LoginPage from "../components/security/UserLogin/UserLogin.jsx";
import RegisterPage from "../components/security/UserRegister/UserRegister.jsx";
import NotFoundPage from "../components/errors/404.jsx";
import UserProfile from "../components/security/UserProfile/UserProfile.jsx";
import PixelCanvas from "../components/game/PixelCanvas.jsx";
import { useStore } from "../context/store.js";
import { GetCurrentUserAct } from "../actions/PlayerActions.js";
import Loader from "../components/common/load/Loader.jsx";   
import { ProtectedRoute, GuestRoute } from "../guard/Guard.jsx";
import { useAuthWatchdog } from "../hooks/useAuthWatchdog.js";
import { useLoader } from "../hooks/useLoader.js";


function AuthWatcher() {
  useAuthWatchdog(); 
  return null;
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));



export default function App() {
  const { loading: loaderVisible, setLoading, loaderText } = useLoader({ minDuration: 2000, text: "Cargando pileX..." });
  const { dispatch } = useStore();
  const [startApp, setStartApp] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        await sleep(2000);
        setLoading(false); 
        setStartApp(true);
        return;
      }

      try {
        const response = await GetCurrentUserAct();
        await sleep(1000);
        if (response.success) {
          dispatch({ type: "LOGIN", payload: response.data });
        } else {
          toast.error("Inicia sesión para acceder a las funcionalidades");
          localStorage.removeItem("token");
        }
      } catch (error) {
        toast.error("Error al obtener tu sesión. Por favor vuelve a iniciar sesión.");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
        setStartApp(true);
      }
    };

    if (!startApp) fetchUser();
  }, [startApp, dispatch]);

   if (loaderVisible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-agardex-navy-darker">
        <Loader size="lg" />
        <p className="mt-4 text-agardex-gray-light text-lg">{loaderText}</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthWatcher />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "8px", background: "#333", color: "#fff" },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/intro" />} />
        <Route path="/intro" element={<IntroPage />} />

        <Route path="/login" element={<GuestRoute component={LoginPage} />} />
        <Route path="/register" element={<GuestRoute component={RegisterPage} />} />

        {/* Protegidas */}
        <Route path="/profile" element={<ProtectedRoute component={UserProfile} />} />
        <Route path="/game" element={<ProtectedRoute component={PixelCanvas} />} />
      

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}