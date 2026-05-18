import { useState } from 'react';

import { AppShell, type Page } from './components/layout/AppShell';
import { StartScreen } from './features/start/StartScreen';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [initialPage, setInitialPage] = useState<Page>('match');

  function startApp(page: Page) {
    setInitialPage(page);
    setHasStarted(true);
  }

  if (!hasStarted) {
    return (
      <StartScreen
        onPlay={() => startApp('match')}
        onLogin={() => startApp('profile')}
      />
    );
  }

  return <AppShell initialPage={initialPage} />;
}

export default App;
