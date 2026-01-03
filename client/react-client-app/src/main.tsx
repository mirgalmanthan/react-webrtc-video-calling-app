import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { SocketProvider } from "./services/Socket.tsx";
import { PeerProvider } from "./services/Peers.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SocketProvider>
          <PeerProvider>
            <App />
          </PeerProvider>
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
