import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  HomeIcon,
  SignalIcon 
} from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-agardex-navy-darker flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-md w-full text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="relative inline-block mb-8 animate-float">
          <div className="relative">
            <ExclamationTriangleIcon className="h-32 w-32 text-agardex-yellow/80 drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]" />
            <SignalIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-agardex-teal/90 animate-ping" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-agardex-teal-light to-agardex-cyan-light bg-clip-text text-transparent mb-4 transform transition-all duration-700 ease-out">
          Ruta no encontrada
        </h1>

        <p className="text-xl text-agardex-gray-light max-w-md mx-auto mb-8 transform transition-all duration-700 ease-out delay-100">
          Parece que te has desviado del camino. La página que buscas no existe o ha sido movida.
        </p>

        <div className="inline-flex gap-8 mb-10 p-6 bg-agardex-navy-dark/50 rounded-xl border border-agardex-blue/20 backdrop-blur-sm transform transition-all duration-700 ease-out delay-200">
          <div>
            <p className="text-sm text-agardex-gray mb-1">Código de error</p>
            <p className="text-2xl font-bold text-agardex-teal">404</p>
          </div>
          <div>
            <p className="text-sm text-agardex-gray mb-1">Estado</p>
            <p className="text-2xl font-bold text-agardex-yellow">Not Found</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-700 ease-out delay-300">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 py-3 border border-agardex-teal text-agardex-teal rounded-lg hover:border-agardex-teal-light hover:text-agardex-teal-light transition-all duration-200 hover:scale-105 backdrop-blur-sm"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Volver atrás
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-agardex-blue to-agardex-purple text-white rounded-lg hover:from-agardex-blue-dark hover:to-agardex-purple transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Ir al inicio
          </button>
        </div>

        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-agardex-blue/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-10 p-4 bg-agardex-navy-dark/30 rounded-lg border border-agardex-blue/10 transform transition-all duration-700 ease-out delay-500">
          <p className="text-sm text-agardex-gray">
            ¿Necesitas ayuda?{' '}
            <a 
              href="#" 
              className="text-agardex-teal hover:text-agardex-teal-light underline transition-colors"
            >
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;