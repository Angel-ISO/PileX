import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../context/store.js';
import { GetCurrentUserAct, UpdateCurrentUserAct, DeleteCurrentUserAct } from '../../../actions/PlayerActions.js';
import toast from 'react-hot-toast';
import Header from '../../common/head/Header.jsx';
import Loader from '../../common/load/Loader.jsx';
import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { showInputAlert } from "../../../utils/Alerts.js";




const UserProfile = () => {
  const { state, dispatch } = useStore();
  const { userSession } = state;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); 

  const [editData, setEditData] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    if (userSession.authenticated && userSession.username && !dataLoaded) {
      setEditData({
        username: userSession.username || '',
        password: ''
      });
      setDataLoaded(true);
    }
  }, [userSession.authenticated, userSession.username, dataLoaded]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (userSession.authenticated &&
            (!userSession.username || !userSession.hasOwnProperty('highScore'))) {
          
          const res = await GetCurrentUserAct();
          if (res.success) {
            dispatch({
              type: 'UPDATE_PROFILE',
              payload: {
                ...userSession,
                username: res.data.username,
                highScore: res.data.highScore
              }
            });
          }
        }
      } catch (error) {
        toast.error('Error al cargar datos del usuario');
      } finally {
        setLocalLoading(false);
      }
    };

    if (userSession.authenticated && !dataLoaded) {
      loadUserData();
    } else if (userSession.authenticated && dataLoaded) {
      setLocalLoading(false);
    } else if (!userSession.authenticated) {
      setLocalLoading(false);
    }
  }, [userSession.authenticated]); 

  const handleEdit = () => setIsEditing(true);
  
  const handleSave = async () => {
    try {
      setActionLoading(true);
      const payload = {
        ...(editData.username !== userSession.username && { username: editData.username }),
        ...(editData.password && { password: editData.password })
      };

      if (Object.keys(payload).length === 0) {
        toast.success('No hay cambios para guardar');
        setIsEditing(false);
        return;
      }

      const res = await UpdateCurrentUserAct(payload);
      if (res.success) {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            ...userSession,
            username: editData.username
          }
        });
        toast.success('Perfil actualizado correctamente');
        setIsEditing(false);
        setEditData(prev => ({ ...prev, password: '' })); 
      }
    } catch (error) {
      toast.error('Error al guardar cambios');
    } finally {
      setActionLoading(false);
    }
  };

   const handleDeleteAccount = async () => {
    const { inputValue, isConfirmed } = await showInputAlert({
      title: '¿Estás seguro de eliminar tu cuenta?',
      inputLabel: `Escribe "${userSession.username}" para confirmar:`,
      inputPlaceholder: userSession.username
    });

    if (!isConfirmed || inputValue !== userSession.username) {
      toast.error("Nos alegramos, no se pudo confirmar la eliminación :)");
      return;
    }

    try {
      setActionLoading(true);
      const res = await DeleteCurrentUserAct();
      if (res.success) {
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem("token");
        navigate("/");
        toast.success("Cuenta eliminada correctamente");
      }
    } catch (error) {
      toast.error("Error al eliminar la cuenta", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: userSession.username || '',
      password: ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };


  const isLoading = !userSession.authenticated || localLoading;
  const isPerformingAction = actionLoading;


  if (isLoading) {
    return (
      <div className="min-h-screen bg-agardex-navy-darker flex items-center justify-center">
        <Loader size="xl" />
        <p className="mt-4 text-agardex-gray-light">Cargando perfil de artista...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-agardex-navy-darker">
      <Header
        title="pileX - Perfil"
        backButtonConfig={{
          onClick: () => navigate('/game'),
          text: "Ir a pintar",
          ariaLabel: "Ir al canvas de pileX"
        }}
      />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Tarjeta principal */}
          <div className="bg-agardex-navy-dark/80 backdrop-blur-lg rounded-xl border border-agardex-blue/30 p-6 shadow-xl">
            {/* Header del perfil */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full border-2 border-agardex-teal bg-gradient-to-r from-agardex-blue to-agardex-purple flex items-center justify-center text-white text-2xl font-bold"
                >
                  {userSession.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-agardex-teal-light to-agardex-cyan-light bg-clip-text text-transparent">
                    {isEditing ? editData.username : userSession.username}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-agardex-blue/20 text-agardex-teal text-xs rounded-full border border-agardex-blue/30">
                      Artista
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={handleEdit}
                      disabled={isPerformingAction}
                      className="flex items-center gap-2 px-4 py-2 border border-agardex-teal text-agardex-teal rounded-lg hover:bg-agardex-blue/10 transition-all duration-200"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isPerformingAction}
                      className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Eliminar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={isPerformingAction}
                      className="flex items-center gap-2 px-4 py-2 border border-agardex-gray text-agardex-gray rounded-lg hover:bg-agardex-gray/10 transition-all duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isPerformingAction}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-agardex-blue to-agardex-purple text-white rounded-lg hover:from-agardex-blue-dark hover:to-agardex-purple transition-all duration-200"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Guardar
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-agardex-blue/20 my-6"></div>

            {/* Información del usuario */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheckIcon className="w-5 h-5 text-agardex-teal" />
                <h2 className="text-lg font-semibold text-agardex-gray-light">
                  Perfil de Artista
                </h2>
              </div>

              {/* Campos del formulario */}
              <div className="space-y-4">
                {/* Campo Usuario */}
                <div className="bg-agardex-navy-dark/50 rounded-lg border border-agardex-blue/20 p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label htmlFor="username" className="block text-sm text-agardex-gray-light">
                        Nombre de usuario
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={editData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-agardex-navy-dark border border-agardex-blue/30 rounded text-agardex-gray-light focus:border-agardex-teal focus:ring-0"
                        placeholder="Nombre de usuario"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-agardex-gray" />
                      <div>
                        <p className="text-sm text-agardex-gray-light">Nombre de usuario</p>
                        <p className="text-agardex-gray-light font-medium">{userSession.username}</p>
                      </div>
                    </div>
                  )}
                </div>


                {/* Campo Contraseña */}
                <div className="bg-agardex-navy-dark/50 rounded-lg border border-agardex-blue/20 p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm text-agardex-gray-light">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={editData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-agardex-navy-dark border border-agardex-blue/30 rounded text-agardex-gray-light focus:border-agardex-teal focus:ring-0 pr-10"
                          placeholder="Nueva contraseña (opcional)"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-agardex-gray hover:text-agardex-teal transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-agardex-gray rounded"></div>
                      <div>
                        <p className="text-sm text-agardex-gray-light">Contraseña</p>
                        <p className="text-agardex-gray-light font-medium">••••••••</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estadísticas de Arte */}
                <div className="bg-agardex-navy-dark/50 rounded-lg border border-agardex-blue/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-agardex-blue to-agardex-purple rounded flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-agardex-gray-light">Píxeles Pintados</p>
                      <p className="text-agardex-teal font-bold text-lg">{userSession.highScore || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;