import { Icon } from '../../components/Icon';

const SEEN_KEY = 'biomarkers-app/biomarker-intro-seen';

/** True the very first time the Biomarkers tab is opened on this device; marks it as seen. */
export function isFirstBiomarkersVisit(): boolean {
  try {
    if (localStorage.getItem(SEEN_KEY) === '1') return false;
    localStorage.setItem(SEEN_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

/** Explains what a biomarker is and why it is worth tracking. */
export function BiomarkerIntro({ onClose }: { onClose: () => void }) {
  return (
    <aside className="intro card" aria-labelledby="biomarker-intro-title">
      <header className="intro-header">
        <h2 id="biomarker-intro-title">What is a biomarker?</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close explanation">
          <Icon name="close" />
        </button>
      </header>
      <p>
        A biomarker is a <strong>measurable characteristic of your body</strong> that shows how it is working, for
        example blood pressure, resting heart rate, blood glucose or vitamin D. It is measured objectively, by a
        device, a lab test or a tape measure, not rated by how you feel.
      </p>
      <h3>Why store them?</h3>
      <ul>
        <li>
          <strong>Spot trends early.</strong> Slow changes that a single reading hides become visible over weeks and
          months.
        </li>
        <li>
          <strong>Know your baseline.</strong> Learn what is normal for you, not just for the average person.
        </li>
        <li>
          <strong>See what works.</strong> Check whether changes in sleep, training or diet actually move your values.
        </li>
        <li>
          <strong>Better doctor visits.</strong> Show your history instead of trying to remember numbers.
        </li>
      </ul>
      <p className="muted small">This app does not give medical advice. Talk to a doctor about your values.</p>
    </aside>
  );
}
