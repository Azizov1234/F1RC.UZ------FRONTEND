import { Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('night');
    else if (theme === 'night') setTheme('light');
    else setTheme('dark');
  };

  const getThemeDetails = () => {
    switch (theme) {
      case 'light':
        return { icon: Sun, label: "Yorug' rejim", color: 'text-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' };
      case 'night':
        return { icon: Zap, label: 'OLED Tungi rejim', color: 'text-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]' };
      case 'dark':
      default:
        return { icon: Moon, label: "Qorong'u rejim", color: 'text-primary shadow-[0_0_8px_rgba(255,0,0,0.5)]' };
    }
  };

  const { icon: Icon, label, color } = getThemeDetails();

  return (
    <button
      onClick={cycleTheme}
      title={label}
      aria-label={label}
      className="w-10 h-10 rounded-xl bg-card/60 border border-border/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-white hover:border-primary/50 shadow-md transition-all duration-300 active:scale-90 group overflow-hidden"
    >
      <div className="transition-transform duration-500 group-hover:rotate-45 flex items-center justify-center">
        <Icon className={`w-4.5 h-4.5 ${color} transition-colors duration-300`} />
      </div>
    </button>
  );
}

