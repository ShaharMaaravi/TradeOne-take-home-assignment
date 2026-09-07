import styles from './App.module.css'

export default function App() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="page-title">
        <p className={styles.label} lang="en" dir="ltr">Watchlist</p>
        <h1 id="page-title">רשימות מעקב</h1>
        <p>כאן יופיעו רשימות המעקב שלך.</p>
      </section>
    </main>
  )
}
