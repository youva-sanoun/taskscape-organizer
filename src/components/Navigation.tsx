import { useLocation, Link } from "react-router-dom";
import { Home, Layout, Check, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Navigation() {
  const location = useLocation();

  const links = [
    {
      href: "/",
      icon: Home,
      label: "Tasks",
    },
    {
      href: "/spaces",
      icon: Layout,
      label: "Spaces",
    },
    {
      href: "/calendar",
      icon: Calendar,
      label: "Calendar",
    },
  ];

  return (
    <>
      {/* Mobile Navigation (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-md",
                location.pathname === link.href
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
          <div className="flex flex-col items-center justify-center">
            <ThemeToggle mobile />
            <span className="text-xs mt-1">Theme</span>
          </div>
        </div>
      </div>

      {/* Desktop Navigation (Left Sidebar) */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col z-30">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Taskscape
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Organize your tasks
          </p>
        </div>

        <Separator className="my-2" />

        <div className="flex-1 flex flex-col gap-1 p-3">
          {links.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant={
                  location.pathname === link.href ? "secondary" : "ghost"
                }
                className={cn(
                  "w-full justify-start",
                  location.pathname === link.href
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content Padding for Desktop */}
      <div className="hidden md:block md:pl-60" />
    </>
  );
}
