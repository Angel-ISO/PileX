import { UserSessionReducer } from "./UserSessionReducer";
import { canvasReducer } from "./GameReducer";

export const MainReducer = (state, action) => ({
  userSession: UserSessionReducer(state.userSession, action),
  canvas: canvasReducer(state.canvas, action)
});

