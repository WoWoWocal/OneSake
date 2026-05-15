import { useState } from 'react';

import { DeckbuilderPage } from '../../features/deckbuilder/DeckbuilderPage';
import { MatchPage } from '../../features/match/MatchPage';
import { ToolsPage } from '../../features/tools/ToolsPage';
import { BottomNav, type AppSection } from './BottomNav';

export type Page = AppSection;

type AppShellProps = {
  initialPage?: Page;
  onBackToMenu?: () => void;
};

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="panel placeholder-page">
      <h1>{title}</h1>
      <p>This area is ready for the next frontend step.</p>
    </section>
  );
}

export function AppShell({ initialPage = 'match', onBackToMenu }: AppShellProps) {
  const [activeSection, setActiveSection] = useState<Page>(initialPage);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);

  return (
    <div className={isImmersiveMode ? 'app-shell app-shell--immersive' : 'app-shell'}>
      {onBackToMenu && !isImmersiveMode && (
        <div className="app-shell-menu">
          <button className="app-shell-menu-button" type="button" onClick={onBackToMenu}>
            Main Menu
          </button>
        </div>
      )}
      <main className="app-main">
        {activeSection === 'match' && <MatchPage onImmersiveModeChange={setIsImmersiveMode} />}
        {activeSection === 'deckbuilder' && <DeckbuilderPage />}
        {activeSection === 'tools' && <ToolsPage />}
        {activeSection === 'profile' && <PlaceholderPage title="Profile" />}
      </main>
      {!isImmersiveMode && <BottomNav activeSection={activeSection} onChange={setActiveSection} />}
    </div>
  );
}
