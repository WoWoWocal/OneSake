import { useState } from 'react';

import { AppShell } from './components/layout/AppShell';
import { StartScreen } from './features/start/StartScreen';

function App() {
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return <StartScreen onPlay={() => setHasStarted(true)} />;
  }

  return <AppShell />;
}

export default App;
