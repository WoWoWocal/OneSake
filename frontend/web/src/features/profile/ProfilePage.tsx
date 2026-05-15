import { useState } from 'react';

import { Button } from '../../components/ui/Button';

const GUEST_NAME_STORAGE_KEY = 'onesake.profile.guestName';
const DEFAULT_GUEST_NAME = 'Guest Captain';

function loadGuestName(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_GUEST_NAME;
  }

  return window.localStorage.getItem(GUEST_NAME_STORAGE_KEY) || DEFAULT_GUEST_NAME;
}

const PROFILE_STATS = [
  { label: 'Decks', value: '0' },
  { label: 'Matches', value: '0' },
  { label: 'Wins', value: '0' },
  { label: 'Berries', value: '0' },
];

export function ProfilePage() {
  const [guestName, setGuestName] = useState(loadGuestName);
  const [draftName, setDraftName] = useState(loadGuestName);
  const [isGuestActive, setIsGuestActive] = useState(() => loadGuestName() !== DEFAULT_GUEST_NAME);
  const [isEditingName, setIsEditingName] = useState(false);

  const displayName = guestName.trim() || DEFAULT_GUEST_NAME;

  const continueAsGuest = (): void => {
    const normalizedName = draftName.trim() || DEFAULT_GUEST_NAME;
    setGuestName(normalizedName);
    setDraftName(normalizedName);
    setIsGuestActive(true);
    setIsEditingName(false);
    window.localStorage.setItem(GUEST_NAME_STORAGE_KEY, normalizedName);
  };

  const logoutGuest = (): void => {
    setGuestName(DEFAULT_GUEST_NAME);
    setDraftName(DEFAULT_GUEST_NAME);
    setIsGuestActive(false);
    setIsEditingName(false);
    window.localStorage.removeItem(GUEST_NAME_STORAGE_KEY);
  };

  return (
    <section className="profile-page">
      <header className="panel profile-hero">
        <div>
          <span className="profile-kicker">OneSake Account</span>
          <h1>Captain Profile</h1>
          <p>Login and profile features are coming soon.</p>
        </div>
        <div className="profile-hero__badge" aria-label="Profile status">
          {isGuestActive ? 'Guest Active' : 'Guest Ready'}
        </div>
      </header>

      <div className="profile-layout">
        <section className="panel profile-card profile-login-card" aria-labelledby="profile-login-title">
          <div className="profile-card__header">
            <span>Login</span>
            <strong>Local demo only</strong>
          </div>
          <h2 id="profile-login-title">Enter as a Captain</h2>
          <p>
            Use a local guest profile for demos. Accounts, progression and cosmetics will be added later.
          </p>

          {(!isGuestActive || isEditingName) && (
            <div className="field">
              <label htmlFor="guestName">Captain Name</label>
              <input
                id="guestName"
                maxLength={24}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder={DEFAULT_GUEST_NAME}
                value={draftName}
              />
            </div>
          )}

          {isGuestActive && !isEditingName ? (
            <div className="profile-session-card" role="status">
              <span>Logged in as</span>
              <strong>{displayName}</strong>
            </div>
          ) : null}

          <div className="profile-actions">
            {isGuestActive && !isEditingName ? (
              <Button onClick={() => setIsEditingName(true)} variant="secondary">
                Edit Name
              </Button>
            ) : (
              <Button onClick={continueAsGuest}>Continue as Guest</Button>
            )}
            <Button disabled variant="ghost">
              Login coming soon
            </Button>
            {isGuestActive && (
              <Button onClick={logoutGuest} variant="danger">
                Logout Guest
              </Button>
            )}
          </div>
        </section>

        <section className="panel profile-card profile-preview-card" aria-labelledby="profile-preview-title">
          <div className="profile-avatar" aria-hidden="true">
            <span>{displayName.slice(0, 1).toUpperCase()}</span>
          </div>
          <div className="profile-preview-card__identity">
            <span>Profile Preview</span>
            <h2 id="profile-preview-title">{displayName}</h2>
            <p>Rookie Pirate</p>
          </div>
          <div className="profile-badge-row" aria-label="Profile badges">
            <span>Starter Deckhand</span>
            <span>East Blue Trial</span>
          </div>
        </section>

        <section className="panel profile-card profile-stats-card" aria-labelledby="profile-stats-title">
          <div className="profile-card__header">
            <span>Stats</span>
            <strong>Preview</strong>
          </div>
          <h2 id="profile-stats-title">Captain Log</h2>
          <div className="profile-stat-grid">
            {PROFILE_STATS.map((stat) => (
              <div key={stat.label} className="profile-stat-card">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel profile-card profile-coming-soon-card">
          <span className="profile-kicker">Roadmap</span>
          <p>Accounts, progression and cosmetics will be added later.</p>
        </section>
      </div>
    </section>
  );
}
