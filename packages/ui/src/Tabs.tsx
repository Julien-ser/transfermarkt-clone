import React, { useState } from 'react';

export interface Tab {
  /**
   * Unique identifier for the tab
   */
  id: string;
  /**
   * Display label for the tab
   */
  label: string;
  /**
   * Content to display when tab is active
   */
  content: React.ReactNode;
  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Icon to display next to the label (optional)
   */
  icon?: React.ReactNode;
}

export interface TabsProps {
  /**
   * Array of tab definitions
   */
  tabs: Tab[];
  /**
   * The currently active tab ID
   */
  activeTab?: string;
  /**
   * Callback when a tab is selected
   */
  onTabChange?: (tabId: string) => void;
  /**
   * The visual style of the tab list
   * @default 'line'
   */
  variant?: 'line' | 'enclosed' | 'pills';
  /**
   * Whether tabs should be full width
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Additional CSS classes for the tabs container
   */
  className?: string;
  /**
   * Additional CSS classes for the tab panels
   */
  panelsClassName?: string;
}

/**
 * A tabbed interface component with multiple visual variants.
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'tab1', label: 'First Tab', content: <div>Content 1</div> },
 *     { id: 'tab2', label: 'Second Tab', content: <div>Content 2</div> },
 *   ]}
 *   variant="line"
 *   onTabChange={(id) => setActiveTab(id)}
 * />
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'line',
  fullWidth = false,
  className = '',
  panelsClassName = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');

  const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const baseTabStyles = 'inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    line: {
      tab: 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
      activeTab: 'border-blue-500 text-blue-600 dark:text-blue-400',
      inactiveTab: 'hover:border-gray-300 dark:hover:border-gray-600',
    },
    enclosed: {
      tab: 'border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
      activeTab: 'bg-white dark:bg-gray-800 border-blue-500 text-blue-600 dark:text-blue-400',
      inactiveTab: '',
    },
    pills: {
      tab: 'rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
      activeTab: 'bg-blue-600 text-white hover:bg-blue-700',
      inactiveTab: '',
    },
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  const renderTabList = () => (
    <div
      className={`flex ${widthStyles} border-b border-gray-200 dark:border-gray-700 ${variant === 'enclosed' ? 'border-t-0' : ''} ${variant === 'enclosed' ? 'border-b-0' : ''}`}
      role="tablist"
      aria-label="Tab navigation"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={currentActiveTab === tab.id}
          aria-controls={`tab-panel-${tab.id}`}
          id={`tab-${tab.id}`}
          disabled={tab.disabled}
          onClick={() => handleTabClick(tab.id)}
          className={`${baseTabStyles} ${variantStyles[variant].tab} ${currentActiveTab === tab.id ? variantStyles[variant].activeTab : variantStyles[variant].inactiveTab} ${fullWidth ? 'flex-1' : ''}`}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderPanels = () => (
    <div className={`mt-4 ${panelsClassName}`} role="tabpanel" aria-labelledby={`tab-${currentActiveTab}`}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tab-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={currentActiveTab !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {renderTabList()}
      {renderPanels()}
    </div>
  );
};
