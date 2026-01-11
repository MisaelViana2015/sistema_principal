import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

/**
 * MAIN - PONTO DE ENTRADA DO FRONTEND
 *
 * REGRA: Apenas renderiza o App
 * Configurações globais devem estar aqui
 */

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
