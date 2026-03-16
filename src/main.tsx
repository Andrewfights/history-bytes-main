import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initWW2HostsSubscription } from "./data/ww2Hosts";
import { initWW2HostsCache } from "./lib/adminStorage";

// Initialize IndexedDB cache for WW2 hosts (guaranteed persistence)
initWW2HostsCache().then(() => {
  console.log('[Main] WW2 hosts IndexedDB cache ready');
}).catch(console.error);

// Initialize Firestore subscriptions for real-time data
initWW2HostsSubscription();

createRoot(document.getElementById("root")!).render(<App />);
