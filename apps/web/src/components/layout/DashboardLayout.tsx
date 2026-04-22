import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar placeholder */}
      <div className="w-60 bg-card border-r border-border shrink-0">
        <div className="p-4">
          <p className="text-foreground font-bold text-lg">CatchAPI</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
