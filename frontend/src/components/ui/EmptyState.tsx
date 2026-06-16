import type { LucideIcon } from 'lucide-react';
import { PackageOpen } from 'lucide-react';
import PremiumIconBox from '@/components/ui/PremiumIconBox';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Ma\'lumot topilmadi',
  description = 'Hozircha bu yerda hech narsa yo\'q.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-card/20 border border-border/60 rounded-3xl backdrop-blur-md max-w-lg mx-auto shadow-xl">
      <div className="mb-5">
        <PremiumIconBox icon={Icon} color="zinc" size="lg" glow={true} />
      </div>
      <h3 className="text-base font-heading font-bold text-white tracking-wider uppercase mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground font-heading max-w-xs leading-relaxed">{description}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-6 border-primary/30 hover:border-primary/60 text-primary hover:text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

