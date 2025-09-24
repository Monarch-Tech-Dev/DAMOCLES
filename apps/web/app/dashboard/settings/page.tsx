import styles from '@/app/dashboard.module.css'
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <div className={cn(styles.mainContent, "settings-content")}>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Innstillinger</h1>
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Settings Coming Soon</h2>
        <p className="text-slate-600">
          This section will show your account settings and preferences.
        </p>
      </div>
    </div>
  )
}