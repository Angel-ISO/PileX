import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../../context/store.js';
import { registerUserAct } from '../../../actions/AuthActions.js';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Header from '../../common/head/Header.jsx';
import { useNavbarVisibility } from '../../../hooks/useNavbarVisibility.js';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    bornDate: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const { isNavbarVisible, toggleNavbarVisibility } = useNavbarVisibility(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const result = await registerUserAct(formData);

    if (result.success && result.data?.jwt) {
      localStorage.setItem("token", result.data.jwt);

      dispatch({
        type: 'LOGIN',
        payload: {
          id: result.data.id,
          username: result.data.username || formData.username,
          authenticated: true
        }
      });

      toast.success(`¡Bienvenido a pileX, ${formData.username}!`);
      
      navigate('/profile');
    } else {
      toast.error(result.message || 'Error al registrar usuario');
    }
  } catch (error) {
    console.error('Registration error:', error);
    toast.error('Error al conectar con el servidor');
  } finally {
    setIsLoading(false);
  }
};


  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 13);

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <Header
        title="pileX - Registro"
        backButtonConfig={{
          onClick: () => navigate('/'),
          text: "Volver al inicio",
          ariaLabel: "Volver al menú principal"
        }}
        isVisible={isNavbarVisible}
        onToggleVisibility={toggleNavbarVisibility}
        isGameView={true}
      />
    
      <div className="min-h-screen bg-agardex-navy-darker flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-md w-full space-y-8">
          
          {/* Logo y Título */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-agardex-blue to-agardex-purple flex items-center justify-center animate-float">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-agardex-teal-light to-agardex-cyan-light bg-clip-text text-transparent">
              Crear Cuenta
            </h2>
            <p className="mt-2 text-agardex-gray-light">
              Únete a la comunidad de pileX
            </p>
          </div>

          {/* Formulario */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* Campo Usuario */}
              <div>
                <label htmlFor="username" className="sr-only">
                  Nombre de usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="relative block w-full rounded-t-md border-0 py-3 px-4 text-agardex-gray-light bg-agardex-navy-dark/80 focus:z-10 focus:border-agardex-teal focus:ring-0 focus:bg-agardex-navy-dark"
                  placeholder="Nombre de usuario"
                  value={formData.username}
                  onChange={handleInputChange}
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  title="Solo letras, números y guiones bajos"
                />
              </div>

              {/* Campo Fecha de Nacimiento */}
              <div>
                <label htmlFor="bornDate" className="sr-only">
                  Fecha de nacimiento
                </label>
                <input
                  id="bornDate"
                  name="bornDate"
                  type="date"
                  required
                  className="relative block w-full border-0 py-3 px-4 text-agardex-gray-light bg-agardex-navy-dark/80 focus:z-10 focus:border-agardex-teal focus:ring-0 focus:bg-agardex-navy-dark"
                  value={formData.bornDate}
                  onChange={handleInputChange}
                  max={formatDateForInput(maxDate)}
                  title="Debes tener al menos 13 años"
                />
              </div>

              {/* Campo Contraseña */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="relative block w-full rounded-b-md border-0 py-3 px-4 text-agardex-gray-light bg-agardex-navy-dark/80 border-b border-agardex-blue/20 focus:z-10 focus:border-agardex-teal focus:ring-0 focus:bg-agardex-navy-dark pr-12"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                  title="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-agardex-gray" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-agardex-gray" />
                  )}
                </button>
              </div>
            </div>

            {/* Información de validación */}
            <div className="bg-agardex-navy-dark/50 p-3 rounded-lg border border-agardex-blue/20">
              <p className="text-xs text-agardex-gray-light">
                <strong>Requisitos:</strong><br/>
                • Usuario: 3-20 caracteres (letras, números, _)<br/>
                • Edad: Mínimo 13 años<br/>
                • Contraseña: Mínimo 6 caracteres
              </p>
            </div>

            {/* Botón de Envío */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-agardex-blue to-agardex-purple hover:from-agardex-blue-dark hover:to-agardex-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agardex-teal transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Unirme a pileX'
                )}
              </button>
            </div>

            {/* Enlace a Login */}
            <div className="text-center">
              <p className="text-agardex-gray">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-agardex-teal hover:text-agardex-teal-light transition-colors duration-200"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-agardex-navy-dark/50 rounded-lg border border-agardex-blue/20">
            <p className="text-sm text-agardex-gray-light text-center">
              Al registrarte en pileX, aceptas nuestros{' '}
              <a href="#" className="text-agardex-teal hover:underline">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-agardex-teal hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;