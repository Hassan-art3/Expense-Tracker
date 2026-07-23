import React from 'react';
import { useApp } from '../../context/AppContext';
import * as LucideIcons from 'lucide-react';

interface CategoryBadgeProps {
  categoryId: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  categoryId,
  showName = true,
  size = 'md',
  className = '',
}) => {
  const { categories } = useApp();
  const cat = categories.find((c) => c.id === categoryId) || {
    id: categoryId,
    name: categoryId,
    iconName: 'MoreHorizontal',
    color: '#64748b',
  };

  // Dynamically extract Lucide Icon
  const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Tag;

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-xs sm:text-sm font-medium',
    lg: 'text-sm font-semibold',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-100 dark:text-slate-200 transition-all ${className}`}
      style={{
        backgroundColor: `${cat.color}20`, // 20% opacity background
        border: `1px solid ${cat.color}40`,
      }}
    >
      <span style={{ color: cat.color }} className="flex items-center justify-center">
        <IconComponent className={iconSizes[size]} />
      </span>
      {showName && (
        <span className={textSizes[size]} style={{ color: cat.color }}>
          {cat.name}
        </span>
      )}
    </div>
  );
};
