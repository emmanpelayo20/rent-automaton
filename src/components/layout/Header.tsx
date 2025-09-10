import { Building2, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <header className="w-full border-b bg-card shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-md">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Lease Agent</h1>
              <p className="text-sm text-muted-foreground">Property Management System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Requests
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Properties
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Reports
            </Button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Sarah Wilson</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};