import { useState } from 'react';
import type { ReactNode } from 'react';

interface Tab {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ResponsiveTabsProps {
  tabs: Tab[];
  defaultValue: string;
  children: (activeTab: string) => ReactNode;
}

export function ResponsiveTabs({
  tabs,
  defaultValue,
  children,
}: ResponsiveTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className="w-full">
      {/* Tab List - Wraps automatically */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-md
              text-sm font-medium whitespace-nowrap
              transition-all duration-200
              border border-transparent cursor-pointer
              ${
                activeTab === tab.value
                  ? 'bg-background text-foreground shadow-md border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50 hover:border-border/50'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{children(activeTab)}</div>
    </div>
  );
}
