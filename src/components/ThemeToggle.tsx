import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
    const { theme, setTheme, actualTheme } = useTheme();

    return (
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg transition-all ${theme === 'light'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-500'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                title="Light mode"
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg transition-all ${theme === 'dark'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-500'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                title="Dark mode"
            >
                <Moon size={18} />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-lg transition-all ${theme === 'system'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-500'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                title="System preference"
            >
                <Monitor size={18} />
            </button>
        </div>
    );
}

// Simple toggle button for mobile/compact view
export function ThemeToggleButton() {
    const { toggleTheme, actualTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
        >
            {actualTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
