import { ArrowUpRight, Clock3, Gamepad2, Volume2, VolumeX } from 'lucide-react';
import { SiDiscord, SiRoblox, SiSpotify, SiSteam } from 'react-icons/si';
import { useEffect, useMemo, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';

const DISCORD_ID = '578744735116689418';
const SONG_ID = 'R4VvNn1NS7Y';

type LanyardActivity = {
  name: string;
  type: number;
  state?: string;
  details?: string;
};

type LanyardData = {
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  discord_user: {
    avatar: string | null;
    discriminator: string;
    display_name: string | null;
    username: string;
  };
  activities: LanyardActivity[];
  spotify: {
    artist: string;
    song: string;
  } | null;
};

const statusLabels = {
  online: 'online',
  idle: 'away',
  dnd: 'do not disturb',
  offline: 'offline',
};

function getAvatarUrl(data: LanyardData | null) {
  if (!data) return null;

  const { avatar, discriminator } = data.discord_user;
  if (avatar) {
    const extension = avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${avatar}.${extension}?size=256`;
  }

  const fallback = discriminator === '0' ? 0 : Number(discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${fallback}.png`;
}

export default function App() {
  const [lanyard, setLanyard] = useState<LanyardData | null>(null);
  const [entered, setEntered] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      setUtcTime(
        new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Etc/GMT+6',
        }).format(new Date()),
      );
    };

    updateClock();
    const interval = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    const loadPresence = async () => {
      try {
        const response = await fetch(
          `https://api.lanyard.rest/v1/users/${DISCORD_ID}`,
        );
        const result = (await response.json()) as {
          success: boolean;
          data: LanyardData;
        };

        if (active && result.success) setLanyard(result.data);
      } catch {
        if (active) setLanyard(null);
      }
    };

    loadPresence();
    const interval = window.setInterval(loadPresence, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const avatarUrl = useMemo(() => getAvatarUrl(lanyard), [lanyard]);
  const customStatus = lanyard?.activities.find(
    (activity) => activity.type === 4,
  )?.state;
  const currentActivity = lanyard?.activities.find(
    (activity) => activity.type !== 4 && activity.type !== 2,
  );

  useEffect(() => {
    if (!avatarUrl) return;

    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = avatarUrl;
  }, [avatarUrl]);

  const enterSite = () => {
    setEntered(true);
    setMusicOn(true);
  };

  return (
    <main className="site-shell">
      <Analytics />
      {musicOn && (
        <iframe
          className="song-frame"
          src={`https://www.youtube-nocookie.com/embed/${SONG_ID}?autoplay=1&loop=1&playlist=${SONG_ID}&controls=0`}
          title="First Rate Town by Good Kid"
          allow="autoplay; encrypted-media"
        />
      )}

      <div className="page-wrap">
        <header className="topbar">
          <a href="#main" className="wordmark" aria-label="Fruit home">
            fruit<span>.</span>
          </a>
          <p className="clock">
            <Clock3 aria-hidden="true" />
            {utcTime || '00:00'} GMT-6
          </p>
        </header>

        <section className="profile" id="main">
          <div className="discord-user">
            <div className="avatar-wrap">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Fruit's Discord profile" />
              ) : (
                <span>F</span>
              )}
              <i className={`status-dot ${lanyard?.discord_status || 'offline'}`} />
            </div>
            <div>
              <strong>
                @{lanyard?.discord_user.username || 'notafruit4883'}
              </strong>
              <p>
                {statusLabels[lanyard?.discord_status || 'offline']}
                {customStatus ? ` · ${customStatus}` : ''}
              </p>
            </div>
          </div>

          <h1>Fruit</h1>
          <p className="bio">
            I&apos;m Fruit, I&apos;m 20 and I play Roblox, Identity V and
            Satisfactory. I live in the USA.
          </p>

          <nav className="game-links" aria-label="Games Fruit plays">
            <a
              href="https://www.roblox.com/users/62857654/profile"
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <SiRoblox aria-hidden="true" /> Roblox
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              href="https://www.identityvgame.com/"
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <Gamepad2 aria-hidden="true" /> Identity V
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              href="https://store.steampowered.com/app/526870/Satisfactory/"
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <SiSteam aria-hidden="true" /> Satisfactory
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </nav>

          <div className="activity-line" aria-live="polite">
            <span className="activity-light" />
            {lanyard?.spotify ? (
              <p>
                listening to <strong>{lanyard.spotify.song}</strong> by{' '}
                {lanyard.spotify.artist}
              </p>
            ) : currentActivity ? (
              <p>
                playing <strong>{currentActivity.name}</strong>
                {currentActivity.details ? ` · ${currentActivity.details}` : ''}
              </p>
            ) : (
              <p>no activity right now</p>
            )}
          </div>
        </section>

        <footer className="bottom-row">
          <div className="icon-links" aria-label="Fruit's links">
            <a
              href={`https://discord.com/users/${DISCORD_ID}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
              title="Discord"
            >
              <SiDiscord className="brand-icon" aria-hidden="true" />
            </a>
            <a
              href="https://www.roblox.com/users/62857654/profile"
              target="_blank"
              rel="noreferrer"
              aria-label="Roblox"
              title="Roblox"
            >
              <SiRoblox className="brand-icon" aria-hidden="true" />
            </a>
            <a
              href="https://open.spotify.com/user/r7vm906ap1bhrxk4grjszf2l4"
              target="_blank"
              rel="noreferrer"
              aria-label="Spotify"
              title="Spotify"
            >
              <SiSpotify className="brand-icon" aria-hidden="true" />
            </a>
            <span className="footer-rule" />
            <button
              type="button"
              onClick={() => setMusicOn((playing) => !playing)}
              aria-label={musicOn ? 'Pause music' : 'Play music'}
              title={musicOn ? 'Pause music' : 'Play music'}
            >
              {musicOn ? (
                <Volume2 aria-hidden="true" />
              ) : (
                <VolumeX aria-hidden="true" />
              )}
            </button>
          </div>
          <span className="location">USA</span>
        </footer>
      </div>

      {!entered && (
        <button
          type="button"
          className="entry-screen"
          onClick={enterSite}
          aria-label="Click to enter"
        >
          <span>click to enter</span>
        </button>
      )}
    </main>
  );
}
