import { useState } from 'react';

import { DeckbuilderPage } from '../../features/deckbuilder/DeckbuilderPage';
import { MatchPage } from '../../features/match/MatchPage';
import { ProfilePage } from '../../features/profile/ProfilePage';
import { ToolsPage } from '../../features/tools/ToolsPage';
import { BottomNav, type AppSection } from './BottomNav';

export type Page = AppSection;

type AppShellProps = {
  initialPage?: Page;
  onBackToMenu?: () => void;
};

export function AppShell({ initialPage = 'match', onBackToMenu }: AppShellProps) {
  const [activeSection, setActiveSection] = useState<Page>(initialPage);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const appMainClassName =
    activeSection === 'deckbuilder' ? 'app-main app-main--deckbuilder' : 'app-main';

  return (
    <div className={isImmersiveMode ? 'app-shell app-shell--immersive' : 'app-shell'}>
      {onBackToMenu && !isImmersiveMode && (
        <div className="app-shell-menu">
          <button className="app-shell-menu-button" type="button" onClick={onBackToMenu}>
            Main Menu
          </button>
        </div>
      )}
      <main className={appMainClassName}>
        {activeSection === 'match' && (
          <MatchPage
            onImmersiveModeChange={setIsImmersiveMode}
            onOpenDeckbuilder={() => setActiveSection('deckbuilder')}
          />
        )}
        {activeSection === 'deckbuilder' && <DeckbuilderPage />}
        {activeSection === 'tools' && (
          <ToolsPage onOpenDeckbuilder={() => setActiveSection('deckbuilder')} />
        )}
        {activeSection === 'profile' && <ProfilePage />}
      </main>
      {!isImmersiveMode && <BottomNav activeSection={activeSection} onChange={setActiveSection} />}
    </div>
  );
}
