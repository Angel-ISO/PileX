import { USER_ACTIONS } from '../store.js';

export const UserSessionReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.LOGIN:
      return {
        ...state,
        ...action.payload,
        authenticated: true
      };
    case USER_ACTIONS.LOGOUT:
      return {
        id: '',
        username: '',
        color: '',
        pixelsPainted: 0,
        authenticated: false
      };
    case USER_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        ...action.payload
      };
    case USER_ACTIONS.UPDATE_PIXELS_PAINTED:
      return {
        ...state,
        pixelsPainted: action.payload
      };
    default:
      return state;
  }
};
