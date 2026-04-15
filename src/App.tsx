// Single-screen exhibition display. No routing, no providers — just Index.
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import Index from "./pages/Index.tsx";

const App = () => (
  <ErrorBoundary>
    <Index />
  </ErrorBoundary>
);

export default App;
