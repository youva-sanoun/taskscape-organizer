
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 rounded-full bg-white/80 backdrop-blur-lg border shadow-lg">
      <Link
        to="/"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
          location.pathname === "/" ? "bg-blue-500 text-white" : "hover:bg-gray-100"
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Spaces</span>
      </Link>
      <Link
        to="/today"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
          location.pathname === "/today" ? "bg-blue-500 text-white" : "hover:bg-gray-100"
        )}
      >
        <Calendar className="w-4 h-4" />
        <span>Today</span>
      </Link>
    </div>
  );
};
