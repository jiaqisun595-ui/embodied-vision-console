import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initConfig } from "./config";

// 先拉取配置，再挂载页面
initConfig().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});