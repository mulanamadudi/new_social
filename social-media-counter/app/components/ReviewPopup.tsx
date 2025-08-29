import { useEffect, useState } from "react";

const SHOW_DAYS = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]);
const KEY = "rp_review_popup_dismissed_v2";

export default function ReviewPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const day = new Date().getDate();
    if (!SHOW_DAYS.has(day)) return;
    if (localStorage.getItem(KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  function hide() {
    setVisible(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div
      id="review-popup-overlay"
      aria-hidden={visible ? "false" : "true"}
      className={visible ? "rp-show" : ""}
      onClick={(e) => {
        if (e.target === e.currentTarget) hide();
      }}
    >
      <div className="rp-card" role="dialog" aria-labelledby="rp-title" aria-describedby="rp-text">
        <button className="rp-close" aria-label="Close pop-up" onClick={hide}>
          &times;
        </button>

        <img className="rp-avatar" src="/vincent.png" alt="Vincent – App Developer" />

        <h3 id="rp-title">Hi, I’m Vincent, the developer of this app.</h3>
        <p id="rp-text">
          I built it on my own while studying, and positive reviews on the Shopify App Store
          help me continue improving and maintaining it. Your support means a lot and helps me
          keep adding new features. Thank you!
          <br/>
          <b>💙</b>
        </p>

        <div className="rp-actions">
          <a
            className="rp-primary"
            href="https://apps.shopify.com/social-media-live-counter?#modal-show=WriteReviewModal"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leave a review 💚
          </a>
          <button className="rp-secondary" id="rp-later" onClick={hide}>
            Maybe later
          </button>
        </div>
      </div>
      <style>{`
  :root {
    --green: #45C081;
    --green-dark: #3f8d51;
  }

  /* Overlay */
  #review-popup-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.35);
    display: none; align-items: center; justify-content: center; z-index: 9999;
    transition: opacity .25s ease;
  }
  #review-popup-overlay.rp-show { display: flex; }

  /* Card */
  .rp-card {
    width: min(92vw, 520px); background: #fff; border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,.15); padding: 24px 22px 18px;
    text-align: center; position: relative; animation: rp-pop .25s ease;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
    color: #000;
  }
  @keyframes rp-pop { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }

  /* Close */
  .rp-close {
    position: absolute; top: 10px; right: 12px; border: 0; background: transparent;
    font-size: 26px; line-height: 1; cursor: pointer; color: #000;
  }

  /* Avatar */
  .rp-avatar {
    width: 84px; height: 84px; border-radius: 50%; object-fit: cover;
    display: block; margin: 4px auto 12px; border: 2px solid #000;
    background: #fff;
  }

  .rp-card h3 { margin: 4px 0 8px; font-size: 20px; font-weight: 700; }
  .rp-card p  { margin: 0 auto 16px; font-size: 14.5px; line-height: 1.5; max-width: 44ch; }

  /* Buttons */
  .rp-actions { display: flex; gap: 10px; justify-content: center; }
  .rp-primary, .rp-secondary {
    padding: 10px 14px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer;
    text-decoration: none; border: 1px solid transparent;
  }
  .rp-primary  { background: var(--green); color: #fff; }
  .rp-primary:hover { background: var(--green-dark); }
  .rp-secondary { background: #fff; color: #000; border: 1px solid #000; }
  .rp-secondary:hover { background: #f9fafb; }
      `}</style>
    </div>
  );
}

