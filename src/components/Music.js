import React from 'react';
import './Music.css';

export const releases = [
  {
    id: 'aruq',
    title: 'Aruq',
    label: 'Aedi Records',
    released: 'November 2025',
    sattvagenicTrack: 'Mahafractal',
    embedSrc:
      'https://bandcamp.com/EmbeddedPlayer/album=356629896/size=large/bgcol=181a1b/linkcol=4fd4c6/tracklist=true/track=2324257914/transparent=true/',
    bandcampUrl: 'https://aedirecords.bandcamp.com/album/aruq',
  },
  {
    id: 'qualia',
    title: 'Qualia',
    label: 'Aedi Records',
    released: 'May 2026',
    sattvagenicTrack: 'Vidya',
    embedSrc:
      'https://bandcamp.com/EmbeddedPlayer/album=1671807108/size=large/bgcol=181a1b/linkcol=4fd4c6/tracklist=true/track=2607316297/transparent=true/',
    bandcampUrl: 'https://aedirecords.bandcamp.com/album/qualia',
  },
  {
    id: 'adhara',
    title: 'Ādhāra',
    label: 'Aedi Records',
    released: 'March 2026',
    sattvagenicTrack: 'Aranya',
    embedSrc:
      'https://bandcamp.com/EmbeddedPlayer/album=1274626953/size=large/bgcol=181a1b/linkcol=4fd4c6/tracklist=true/track=1348187081/transparent=true/',
    bandcampUrl: 'https://aedirecords.bandcamp.com/album/dh-ra',
  },
];

const Music = () => {
  return (
    <div className="music-page-wrapper">
      <div className="music-container">
        <section className="music-intro">
          <h2>Music</h2>
          <p>
            Sattvagenic's musical work explores hypnotic and deep techno. Recent releases are via{' '}
            <a
              href="https://aedirecords.bandcamp.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Aedi Records
            </a>
            , a democratic record label within the Hypnus ecosystem.
          </p>
        </section>

        <section className="music-releases">
          {releases.map((release) => (
            <div key={release.id} className="release-card">
              <div className="release-info">
                <h3>{release.title}</h3>
                <p className="release-label">
                  {release.label} · {release.released}
                </p>
                <p className="release-note">
                  Featuring "{release.sattvagenicTrack}" by Sattvagenic.
                </p>
              </div>
              <div className="release-embed">
                <iframe
                  title={`${release.title} – Bandcamp player`}
                  style={{ border: 0, width: '100%', height: '540px' }}
                  src={release.embedSrc}
                  seamless
                >
                  <a href={release.bandcampUrl}>
                    {release.title} by Aedi Records
                  </a>
                </iframe>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Music;
