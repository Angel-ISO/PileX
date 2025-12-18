import { CANVAS_ACTIONS } from '../store.js';

export const canvasReducer = (state, action) => {
  switch (action.type) {
    case CANVAS_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        connected: action.payload
      };

    case CANVAS_ACTIONS.UPDATE_CANVAS_STATE:
      return {
        ...state,
        canvasData: action.payload.canvasData || state.canvasData,
        users: action.payload.users || state.users,
        stats: action.payload.stats || state.stats
      };

    case CANVAS_ACTIONS.UPDATE_CANVAS_DATA:
      return {
        ...state,
        canvasData: action.payload
      };

    case CANVAS_ACTIONS.UPDATE_CANVAS_STATS:
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload
        }
      };

    case CANVAS_ACTIONS.SET_SELECTED_COLOR:
      return {
        ...state,
        selectedColor: action.payload
      };

    case CANVAS_ACTIONS.SET_PAINTING:
      return {
        ...state,
        isPainting: action.payload
      };

    case CANVAS_ACTIONS.ADD_USER:
      return {
        ...state,
        users: [...state.users, action.payload]
      };

    case CANVAS_ACTIONS.REMOVE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };

    case CANVAS_ACTIONS.SET_JOINED:
      return {
        ...state,
        joined: action.payload
      };

    case CANVAS_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case CANVAS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case CANVAS_ACTIONS.RESET_CANVAS:
      return {
        ...state,
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
        joined: false
      };

    case CANVAS_ACTIONS.LEAVE_CANVAS:
      return {
        ...state,
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
        joined: false
      };

    default:
      return state;
  }
};