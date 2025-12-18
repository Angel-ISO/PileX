# AgardeX - Agar.io Clone Interface MVP

## Core Features to Implement:
1. **Game Canvas Component** - Main game area where cells are rendered
2. **WebSocket Manager** - Handle connection to backend, send/receive game data
3. **Player Controls** - Mouse movement, split, eject mass controls
4. **Game UI Components**:
   - Connection status indicator
   - Player stats (mass, score)
   - Leaderboard
   - Game controls/settings
5. **Main Game Container** - Orchestrate all components

## File Structure:
- `src/App.jsx` - Main app container and game state management
- `src/components/GameCanvas.jsx` - Canvas rendering and game visuals
- `src/components/GameUI.jsx` - UI overlay (stats, leaderboard, controls)
- `src/components/WebSocketManager.jsx` - WebSocket connection logic
- `src/hooks/useWebSocket.js` - Custom hook for WebSocket management
- `src/hooks/useGameState.js` - Custom hook for game state management
- `src/utils/gameUtils.js` - Game utility functions
- `index.html` - Update title to "AgardeX"

## Implementation Priority:
1. WebSocket connection and basic communication
2. Game canvas with basic rendering
3. Player movement controls
4. UI components (stats, leaderboard)
5. Visual enhancements and animations

## Technical Notes:
- Use HTML5 Canvas for game rendering
- WebSocket for real-time communication
- Tailwind CSS for styling
- React hooks for state management
- Responsive design for different screen sizes