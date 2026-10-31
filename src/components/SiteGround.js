import { useEffect } from 'react';
import './SiteGround.css';

/*
 * SiteGround — the ground every page of the React site stands on: a dark patina
 * like an aged wall painting, with worn print grain over it. It also loads the
 * site's fonts and darkens the page behind the site, so overscroll never flashes
 * the old light stone. Decorative only: aria-hidden, no pointer events.
 */
const FONTS = '/fonts/fonts.css';   // served from this site (public/fonts), not Google

function SiteGround() {
  // An @import inside App.css arrives too late in the file to count, so the fonts are linked here.
  useEffect(() => {
    if (document.getElementById('sg-fonts')) return;
    const link = document.createElement('link');
    link.id = 'sg-fonts'; link.rel = 'stylesheet'; link.href = FONTS;
    document.head.appendChild(link);
  }, []);
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111513';
    return () => { document.body.style.backgroundColor = previous; };
  }, []);

  return (
    <>
      <div className="site-ground" aria-hidden="true" />
      <div className="site-grain" aria-hidden="true" />
    </>
  );
}

export default SiteGround;
