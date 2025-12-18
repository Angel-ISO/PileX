import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  HomeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Header = ({ 
  title = "AgardeX",
  backButtonConfig = null,
  userConfig = null,
  additionalActions = null,
  isVisible = true, 
  onToggleVisibility, 
  isGameView = false 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // Prevenir conflictos con la navbar cuando se cierra el menú
  const handleMenuAction = (action) => {
    handleMenuClose();
    if (action) {
      setTimeout(action, 0);
    }
  };

  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility();
    }
  };

  if (!isVisible && isGameView) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleToggleVisibility}
          className="p-3 bg-agardex-navy-dark/95 backdrop-blur-md border border-agardex-blue/40 rounded-lg text-agardex-teal hover:bg-agardex-blue/20 hover:border-agardex-teal/50 transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Mostrar menú"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-agardex-navy-dark/95 backdrop-blur-md border-b border-agardex-blue/30 transition-all duration-300 shadow-lg ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {backButtonConfig && (
            <div className="flex items-center">
              <button
                onClick={backButtonConfig.onClick}
                disabled={backButtonConfig.disabled}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  backButtonConfig.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-agardex-blue/10'
                }`}
                aria-label={backButtonConfig.ariaLabel || "Volver"}
              >
                {backButtonConfig.icon || (
                  <ArrowLeftIcon className="w-5 h-5 text-agardex-teal" />
                )}
              </button>
              
              {backButtonConfig.text && (
                <span 
                  onClick={!backButtonConfig.disabled ? backButtonConfig.onClick : undefined}
                  className={`ml-2 text-agardex-teal transition-colors duration-200 ${
                    backButtonConfig.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer hover:text-agardex-teal-light hover:underline'
                  }`}
                >
                  {backButtonConfig.text}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-agardex-blue to-agardex-purple rounded-lg flex items-center justify-center mr-3">
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-agardex-teal-light to-agardex-cyan-light bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {additionalActions}

          {userConfig && (
            <div className="relative">
              <button
                onClick={handleMenuToggle}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-agardex-teal hover:bg-agardex-blue/10 transition-all duration-200"
                aria-label="Menú de usuario"
              >
                <div className="w-8 h-8 bg-agardex-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {userConfig.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-agardex-gray-light">
                  {userConfig.name}
                </span>
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={handleMenuClose}
                    style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
                  />
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-agardex-navy-dark/95 backdrop-blur-lg rounded-lg border border-agardex-blue/30 shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => handleMenuAction(userConfig.onProfile)}
                        className="flex items-center w-full px-4 py-2 text-sm text-agardex-gray-light hover:bg-agardex-blue/10 transition-colors duration-200"
                      >
                        <UserIcon className="w-4 h-4 mr-3 text-agardex-teal" />
                        Mi Perfil
                      </button>
                      
                      <button
                        onClick={() => handleMenuAction(userConfig.onLogout)}
                        className="flex items-center w-full px-4 py-2 text-sm text-agardex-gray-light hover:bg-agardex-blue/10 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-agardex-teal" />
                        Cerrar sesión
                      </button>

                      {isGameView && (
                        <button
                          onClick={() => {
                            handleMenuAction(handleToggleVisibility);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-agardex-gray-light hover:bg-agardex-blue/10 transition-colors duration-200 border-t border-agardex-blue/20 mt-1"
                        >
                          {isVisible ? (
                            <>
                              <ChevronUpIcon className="w-4 h-4 mr-3 text-agardex-teal" />
                              Ocultar Barra
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className="w-4 h-4 mr-3 text-agardex-teal" />
                              Mostrar Barra
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {isGameView && (
            <button
              onClick={handleToggleVisibility}
              className="p-2 rounded-lg text-agardex-teal hover:bg-agardex-blue/10 hover:text-agardex-teal-light transition-all duration-200 border border-transparent hover:border-agardex-teal/30"
              aria-label={isVisible ? "Ocultar menú" : "Mostrar menú"}
            >
              <ChevronUpIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;