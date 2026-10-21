import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import "./index.css";
import store from './redux/store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <>
      <HelmetProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </HelmetProvider>
    </>
);

