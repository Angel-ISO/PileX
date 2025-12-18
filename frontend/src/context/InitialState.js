export const InitialState = {
  userSession: {
    id: '',
    username: '',
    color: '',
    pixelsPainted: 0,        
    authenticated: false,
  },
  canvas: {
    connected: false,         
    canvasData: null,         
    users: [],                
    stats: {                  
      connectedUsers: 0,
      paintedPixels: 0,
      paintedPercentage: 0,
      totalPixels: 250000,    
    },
    selectedColor: '#FF6B6B', 
    isPainting: false,       
    loading: false,
    error: null,
    joined: false,            
  }
};
