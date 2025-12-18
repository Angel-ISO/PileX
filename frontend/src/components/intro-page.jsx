import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SplitText from "../animations/SplitText.jsx";
import TextType from "../animations/TextType.jsx";
import CountUp from "../animations/CountUp.jsx";
import { useStore } from "../context/store.js";
import { useNavbarVisibility } from '../hooks/useNavbarVisibility.js';
import Header from './common/head/Header.jsx';
import PixelBackground from './common/backgr/PixelBackground.jsx';



const IntroPage = () => {
  const [visible, setVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const navigate = useNavigate();
  const { state } = useStore();
  const { userSession } = state;
  const { isNavbarVisible, toggleNavbarVisibility } = useNavbarVisibility(false);

  const isAuth = !!userSession?.authenticated;


  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setCardVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      title: "Pintura Colaborativa",
      description: "Crea arte junto con otros artistas en tiempo real. Cada píxel cuenta en la obra colectiva.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Colores Ilimitados",
      description: "Paleta completa de colores vibrantes para expresar tu creatividad sin restricciones.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Comunidad Creativa",
      description: "Únete a una comunidad de artistas digitales que crean juntos obras maestras pixel a pixel.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Actualización Instantánea",
      description: "Ve cómo tu obra cobra vida en tiempo real mientras otros artistas contribuyen.",
    },
  ];


  const stats = [
    { number: "250k", label: "Píxeles por Canvas" },
    { number: "12", label: "Colores Disponibles" },
    { number: "999", label: "Posibilidades Creativas" },
  ];

  const handlePlayClick = () => {
    if (isAuth) {
      navigate('/game');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
    <PixelBackground />
    <Header title="PileX"
    isVisible={isNavbarVisible}
        onToggleVisibility={toggleNavbarVisibility}
        isGameView={true}

    />

    <div className="min-h-screen bg-agardex-navy-darker text-white  pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-agardex-blue to-agardex-purple flex items-center justify-center animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* SplitText component for the title - SOLUCIÓN */}
          <div className="mb-4">
            <SplitText
              text="pileX"
              tag="h1"
              className="text-5xl md:text-6xl font-bold"
              delay={100}
              duration={0.7}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              onLetterAnimationComplete={() => {
                const chars = document.querySelectorAll('.split-char');
                chars.forEach(char => {
                  char.classList.add('bg-gradient-to-r', 'from-agardex-teal-light', 'to-agardex-cyan-light', 'bg-clip-text', 'text-transparent');
                });
              }}
            />
          </div>
            

            <div className="text-xl text-agardex-gray-light max-w-2xl mx-auto mb-8 min-h-[6rem]">
            <TextType
              text={["Un mapa de dibujo de pixeles que permite a los artistas crear sus obras sin limitaciones. inspirado en r/place."]}
              as="p"
              typingSpeed={30}
              initialDelay={800}
              pauseDuration={5000}
              deletingSpeed={20}
              loop={true}
              className="text-xl text-agardex-gray-light"
              showCursor={true}
              hideCursorWhileTyping={false}
              cursorCharacter="|"
              cursorClassName="text-agardex-teal"
              cursorBlinkDuration={0.5}
              textColors={["#94a3b8"]} 
              startOnVisible={true}
              reverseMode={false}
            />
          </div>  

          
          <button 
            onClick={handlePlayClick}
            className="px-8 py-3 bg-gradient-to-r from-agardex-blue to-agardex-purple hover:from-agardex-blue-dark hover:to-agardex-purple text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 animate-pulse-soft"
          >
            {isAuth ? 'Jugar Ahora' : 'Iniciar Sesión para Jugar'}
          </button>  
        </div>

        {/* Stats Section */}
       <div className={`bg-agardex-navy-dark/80 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-agardex-blue/20 max-w-4xl mx-auto transition-all duration-1000 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-agardex-teal mb-2">
                  {stat.prefix && <span>{stat.prefix}</span>}
                  <CountUp
                    from={0}
                    to={stat.number}
                    duration={2}
                    delay={index * 0.3}
                    className="count-up-text"
                  />
                  {stat.suffix && <span>{stat.suffix}</span>}
                </div>
                <div className="text-agardex-gray">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Concepts Section */}
        <h2 className="text-3xl font-bold text-center mb-12 text-agardex-teal-light">Características de pileX</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-agardex-navy-dark/80 backdrop-blur-sm rounded-xl p-6 border border-agardex-blue/10 hover:border-agardex-teal/30 transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="w-12 h-12 rounded-lg bg-agardex-blue/20 flex items-center justify-center mb-4 text-agardex-teal">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-agardex-teal-light">{feature.title}</h3>
              <p className="text-agardex-gray-light">{feature.description}</p>
            </div>
          ))}
        </div>

       
        {/* Final CTA */}
        <div className={`bg-gradient-to-r from-agardex-blue to-agardex-purple rounded-2xl p-8 text-center relative overflow-hidden transition-all duration-1000 ${cardVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">¿Listo para crear arte colaborativo?</h2>
          <p className="text-agardex-teal-lighter max-w-2xl mx-auto mb-6 relative z-10">
            Únete a pileX y forma parte de una comunidad creativa donde cada píxel cuenta en la obra maestra colectiva.
          </p>

          <button
            onClick={handlePlayClick}
            className="px-8 py-3 bg-agardex-teal-light text-agardex-navy-darker font-bold rounded-lg transition-all duration-200 hover:scale-105 relative z-10"
          >
            Comenzar a Pintar
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-agardex-gray text-sm">
        <p>pileX - Arte Colaborativo Digital © {new Date().getFullYear()} </p>
        <p>Desarrollado por <a href="https://github.com/Angel-ISO" target="_blank" rel="noreferrer">Angel BladeX</a></p>
        <p>con el apoyo de <a href="https://github.com/Inyeniogeek" target="_blank" rel="noreferrer">Inyeniogeek</a></p>
        <p>y <a href="https://github.com/santiagocard123" target="_blank" rel="noreferrer">Jotty el enigmático</a></p>
      </footer>
    </div>
    </>
  );
};

export default IntroPage;