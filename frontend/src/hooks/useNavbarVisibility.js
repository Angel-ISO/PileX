import { useState, useEffect } from 'react';

export const useNavbarVisibility = (defaultVisible = false) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(defaultVisible);

  useEffect(() => {
    const savedVisibility = localStorage.getItem('navbarVisible');
    if (savedVisibility !== null) {
      setIsNavbarVisible(JSON.parse(savedVisibility));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('navbarVisible', JSON.stringify(isNavbarVisible));
  }, [isNavbarVisible]);

  const toggleNavbarVisibility = () => {
    setIsNavbarVisible(prev => !prev);
  };

  const showNavbar = () => {
    setIsNavbarVisible(true);
  };

  const hideNavbar = () => {
    setIsNavbarVisible(false);
  };

  return {
    isNavbarVisible,
    toggleNavbarVisibility,
    setIsNavbarVisible,
    showNavbar,
    hideNavbar
  };
};