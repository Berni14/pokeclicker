import styles from './NavTabs.module.css';

const TABS = [
  { id: 'game', label: 'Juego', icon: '◉' },
  { id: 'gacha', label: 'Gacha', icon: '✦' },
  { id: 'box', label: 'Caja', icon: '▦' },
  { id: 'shop', label: 'Tienda', icon: '⬆' },
  { id: 'gyms', label: 'Gimnasios', icon: '⚑' },
  { id: 'settings', label: 'Ajustes', icon: '⚙' },
];

export function NavTabs({ current, onChange }) {
  return (
    <nav className={styles.nav} aria-label="Secciones">
      <ul className={styles.list}>
        {TABS.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              className={styles.tab}
              aria-current={current === tab.id ? 'page' : undefined}
              onClick={() => onChange(tab.id)}
            >
              <span className={styles.icon} aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
