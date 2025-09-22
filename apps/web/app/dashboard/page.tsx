'use client'

import { TremorMainDashboard } from '@/components/dashboard/tremor-main-dashboard';
import styles from '../dashboard.module.css';

export default function DashboardPage() {
  return (
    <div className={styles.dashboardWrapper}>
      <TremorMainDashboard />
    </div>
  );
}