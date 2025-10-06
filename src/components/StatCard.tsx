import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change?: {
    value: number;
    label: string;
  };
  trend?: 'up' | 'down' | 'flat';
  trendPositive?: boolean;
}

const StatCard = ({ title, value, icon, change, trend, trendPositive = true }: StatCardProps) => {
  // Determina si el trend es positivo o negativo para el color
  const isTrendGood = (trend === 'up' && trendPositive) || 
                      (trend === 'down' && !trendPositive) ||
                      trend === 'flat';
  
  const trendIcon = trend === 'up' ? (
    <TrendingUp className={`h-4 w-4 ${isTrendGood ? 'text-success-500' : 'text-danger-500'}`} />
  ) : trend === 'down' ? (
    <TrendingDown className={`h-4 w-4 ${isTrendGood ? 'text-success-500' : 'text-danger-500'}`} />
  ) : (
    <Minus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
  );
  
  return (
    <div className="card p-5 slide-in">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h2>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          {icon}
        </div>
      </div>
      
      {change && (
        <div className="flex items-center text-sm">
          {trendIcon}
          <span className={`ml-1 ${isTrendGood ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
            {change.value > 0 ? '+' : ''}{change.value}%
          </span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">
            {change.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;