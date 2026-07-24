import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onDatesChange: (start: string, end: string) => void;
  currentStart: string;
  currentEnd: string;
}

export default function TimeframeToggle({ onDatesChange, currentStart, currentEnd }: Props) {
  const { t } = useLanguage();
  const [active, setActive] = useState<string>('');

  const formatDate = (date: Date) => {
    // Add timezone offset to prevent picking the wrong day
    const offset = date.getTimezoneOffset();
    const adjusted = new Date(date.getTime() - (offset*60*1000));
    return adjusted.toISOString().split('T')[0];
  };

  const handleSelect = (tf: string) => {
    setActive(tf);
    const end = new Date();
    const start = new Date();
    
    if (tf === 'today') {
      // Keep start and end as today
    } else if (tf === 'weekly') {
      start.setDate(end.getDate() - 7);
    } else if (tf === 'monthly') {
      start.setMonth(end.getMonth() - 1);
    }
    
    onDatesChange(formatDate(start), formatDate(end));
  };

  // Optional: clear active toggle if manual dates change
  useEffect(() => {
    // If the active dates don't match the active toggle calculation perfectly, we could clear it,
    // but for simplicity, any external change to currentStart/currentEnd could just clear it,
    // but since we call onDatesChange which changes currentStart/End, this would trigger on every click.
    // Instead, we only clear if we didn't just click it, or we just rely on it setting the dates.
  }, [currentStart, currentEnd]);

  return (
    <div className="timeframe-toggle">
      <button className={`timeframe-btn ${active === 'today' ? 'active' : ''}`} onClick={() => handleSelect('today')}>
        {t('dashboard.today')}
      </button>
      <button className={`timeframe-btn ${active === 'weekly' ? 'active' : ''}`} onClick={() => handleSelect('weekly')}>
        {t('dashboard.weekly')}
      </button>
      <button className={`timeframe-btn ${active === 'monthly' ? 'active' : ''}`} onClick={() => handleSelect('monthly')}>
        {t('dashboard.monthly')}
      </button>
    </div>
  );
}
