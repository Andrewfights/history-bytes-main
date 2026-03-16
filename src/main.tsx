import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWW2HostsSubscription } from "./data/ww2Hosts";

// Initialize Firestore subscriptions for real-time data
initWW2HostsSubscription();

createRoot(document.getElementById("root")!).render(<App />);
