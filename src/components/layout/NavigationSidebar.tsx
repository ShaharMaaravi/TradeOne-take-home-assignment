import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleHelp,
  FileText,
  Heart,
  Info,
  Landmark,
  LogOut,
  Search,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import styles from './AppShell.module.css'

const navigation: {
  label: string
  icon: LucideIcon
  selected?: boolean
  badge?: string
}[] = [
  { label: 'תיק ההשקעות שלי', icon: BriefcaseBusiness },
  { label: 'חיפוש', icon: Search },
  { label: 'רשימות מעקב', icon: Heart, selected: true },
  { label: 'מסחר בבורסות', icon: ChartNoAxesCombined },
  { label: 'הוראות קבע', icon: CalendarDays, badge: 'חדש' },
  { label: 'הוראות ופעולות', icon: FileText },
  { label: 'היסטוריה', icon: BookOpen },
  { label: 'מרכז מידע', icon: CircleHelp },
  { label: 'הפקדת ניירות ערך', icon: ArrowLeftRight },
]

export function NavigationSidebar() {
  return (
    <aside className={styles.sidebar} aria-label="סרגל צד">
      <a
        className={styles.brand}
        href="#watchlist"
        aria-label="פסגות טרייד — רשימות מעקב"
      >
        <span className={styles.brandMark} aria-hidden="true" />
        <span>פסגות טרייד</span>
      </a>
      <nav aria-label="ניווט ראשי" className={styles.navigation}>
        {navigation.map(({ label, icon: Icon, selected, badge }) =>
          selected ? (
            <a
              key={label}
              className={`${styles.navItem} ${styles.selected}`}
              href="#watchlist"
              aria-current="page"
            >
              <Icon aria-hidden="true" fill="currentColor" />
              <span>{label}</span>
            </a>
          ) : (
            <button key={label} className={styles.navItem} disabled>
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {badge && <span className={styles.newBadge}>{badge}</span>}
            </button>
          ),
        )}
        <p className={styles.navHeading}>פעולות</p>
        <button className={styles.navItem} disabled>
          <Wallet aria-hidden="true" />
          <span>הפקדת כספים</span>
        </button>
        <button className={styles.navItem} disabled>
          <Landmark aria-hidden="true" />
          <span>משיכת כספים מהחשבון</span>
          <LogOut className={styles.exitIcon} aria-hidden="true" />
        </button>
        <p className={styles.navHeading}>מידע</p>
        <button className={`${styles.navItem} ${styles.accountLink}`} disabled>
          <Info aria-hidden="true" />
          <span>פרטי מסגרת החשבון</span>
        </button>
      </nav>
      <section className={styles.referral} aria-labelledby="referral-title">
        <h2 id="referral-title">חבר מביא חבר</h2>
        <p>
          נהנים לסחור איתנו? גם לחברים שלכם מגיע! הזמינו חברים והתחילו ליהנות
          מההטבות.
        </p>
        <button disabled>
          לפרטים נוספים <ArrowLeft aria-hidden="true" />
        </button>
      </section>
    </aside>
  )
}
