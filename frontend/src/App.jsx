import MainLayout from './layouts/MainLayout';
import {StoreProvider} from './context/Store.jsx'
import { MainReducer } from './context/reducers';
import { InitialState } from './context/InitialState';

function App() {
  return (
    <StoreProvider reducer={MainReducer} initialState={InitialState}>
      <MainLayout />
    </StoreProvider>
  );
}

export default App;