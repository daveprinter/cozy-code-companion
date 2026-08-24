import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Bell, Wrench, Home, FileWarning, CreditCard, LogOut, Building2, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MaintenanceRequest from "@/components/tenant/MaintenanceRequest";
import VacancyView from "@/components/tenant/VacancyView";
import RentTracking from "@/components/tenant/RentTracking";
import ReportIssues from "@/components/tenant/ReportIssues";
import RentArrearsView from "@/components/tenant/RentArrearsView";

type Tab = "home" | "maintenance" | "vacancy" | "report" | "rent" | "arrears";

const TenantDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { apartmentName, notifications, markNotificationRead } = useApp();
  const [tab, setTab] = useState<Tab>("home");
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const tabs = [
    { id: "rent" as Tab, label: "Rent Payment & Tracking", icon: CreditCard },
    { id: "maintenance" as Tab, label: "Maintenance Request", icon: Wrench },
    { id: "vacancy" as Tab, label: "Vacancy & Availability", icon: Home },
    { id: "report" as Tab, label: "Report Issues", icon: FileWarning },
    { id: "arrears" as Tab, label: "Rent Payments & Arrears", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero p-4 pb-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="font-heading text-lg font-bold">NyumbaLink</span>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={showNotifs} onOpenChange={setShowNotifs}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary-foreground/10">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-xs flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card">
                <SheetHeader><SheetTitle>Notifications</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No notifications yet</p>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${n.read ? "bg-muted/50" : "bg-accent border-primary/20"}`}
                    >
                      <p className="font-medium text-sm text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <h1 className="font-heading text-2xl font-bold">Welcome to {apartmentName}</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">
          {user?.user_metadata?.full_name || "Tenant"} • {user?.user_metadata?.door_number || ""}
        </p>
      </header>

      <main className="p-4 -mt-2">
        {tab === "home" ? (
          <div className="space-y-3 animate-fade-in">
            <p className="text-muted-foreground text-sm mb-4">What would you like to do today?</p>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="w-full glass-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <t.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <span className="flex-1 font-medium text-foreground">{t.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            <Button variant="ghost" onClick={() => setTab("home")} className="mb-4 gap-2 text-muted-foreground">
              ← Back
            </Button>
            {tab === "maintenance" && <MaintenanceRequest />}
            {tab === "vacancy" && <VacancyView />}
            {tab === "rent" && <RentTracking />}
            {tab === "report" && <ReportIssues />}
            {tab === "arrears" && <RentArrearsView />}
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantDashboard;
