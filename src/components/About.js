import React, { useState } from 'react';
import './About.css';

const About = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div className="about-page-wrapper">
      <div className="about-container">
        <div className="about-content">
          <section className="about-section">
            <h2>What is Sattvagenic?</h2>
            <p>
              Sattvagenic is an umbrella term for anything that helps produce clarity, ease, presence, and expansive energy. That might be visual art, music, writing, software, ritual, design, or whatever other available medium seems useful.
            </p>
            <p>
              The word points toward the sattvic qualities of lucidity, balance, and harmony — not as an escape from messier energies, but as a way of working with them. Restlessness and heaviness have their place, but sattvagenic tools aim to create conditions where insight, creativity, and spiritual practice have a greater chance to thrive.
            </p>
          </section>

          <section className="about-section">
            <h2>What is Shaivo-futurism?</h2>
            <p>
              Shaivo-futurism imagines how spiritual practice might evolve in a technological age, where Shiva is understood as the revelation of pure awareness, presence, and reality itself.
            </p>
            <p>
              It is not about replacing older wisdom traditions, but rather exploring new tools, interfaces, sounds, images, systems, and practices that might support them in bringing about realisation.
            </p>
            <p>
              If the Vijñāna Bhairava Tantra offered 112 methods for recognising one's nature as Shiva in ordinary life, Shaivo-futurism wonders what the next appendix might look like: meditation software, trance technologies, sacred design systems, AI-assisted contemplative tools, and other ways of ecstacising samsara.
            </p>
          </section>

          <section className="about-section">
            <h2>Origins</h2>
            <p>
              Sattvagenic began as a Shaivo-futurist AI art account on Twitter, exploring the visual
              vocabulary of a contemplative tradition reimagined through technology. As the work
              developed, the name's wider implication – producing states of clarity and harmony –
              opened the project up to music, software, and other tools for inner practice. What
              started as images is now a small ecosystem of releases, generative instruments, and
              meditation aids, with more to come.
            </p>
            <p>
              Selected Sattvagenic works have been exhibited at the AI x Crypto conference in Berlin
              (2024), and featured throughout the opening presentation of{' '}
              <a
                href="https://youtu.be/sKYs3BXFP1s"
                target="_blank"
                rel="noopener noreferrer"
              >
                AI x Neuro – Mindful Alignment
              </a>{' '}
              in Chiang Mai, hosted by Triplicate, with speakers including Ruben Laukkonen and
              Michael Edward Johnson.
            </p>
            <div className="about-video">
              {videoPlaying ? (
                <iframe
                  title="AI x Neuro – Mindful Alignment (Chiang Mai)"
                  src="https://www.youtube.com/embed/sKYs3BXFP1s?start=257&autoplay=1"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <button
                  type="button"
                  className="video-poster"
                  onClick={() => setVideoPlaying(true)}
                  aria-label="Play AI x Neuro – Mindful Alignment opening presentation"
                >
                  <img
                    src="/images/video-poster.jpg"
                    alt="Slide from AI x Neuro Mindful Alignment featuring Sattvagenic artwork"
                  />
                  <span className="video-play-button" aria-hidden="true">
                    <svg viewBox="0 0 68 48" width="68" height="48">
                      <path
                        d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                        fill="#f00"
                      />
                      <path d="M45 24L27 14v20" fill="#fff" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <p className="video-caption">
              Opening presentation by Warren Winter of Triplicate, featuring Sattvagenic artwork throughout.
            </p>
          </section>

          <section className="about-section">
            <p>
              This website represents early proto-typical visions of the movement, speculative cyber-sketchings left by sadhus wandering digital space. The hope is that as technology grows and democratises, these early visions will get fleshed out and refined to have maximal benefit to those who seek acquaintance with their nature of sat-chit-ananda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
