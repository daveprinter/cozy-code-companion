import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, LogOut, BarChart3, Users, ClipboardCheck, Save, DollarSign, TrendingUp, TrendingDown, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_TENANTS = [
  { name: "John Kamau", id: "12345678", phone: "0712345678", house: "A5", floor: "Ground Floor", movedIn: "2024-01-15", rentPaid: true, rentAmount: 15000, issues: 0 },
  { name: "Mary Wanjiku", id: "87654321", phone: "0723456789", house: "B3", floor: "1st Floor", movedIn: "2024-03-01", rentPaid: false, rentAmount: 15000, issues: 2 },
  { name: "Peter Ochieng", id: "11223344", phone: "0734567890", house: "C1", floor: "2nd Floor", movedIn: "2023-11-20", rentPaid: true, rentAmount: 18000, issues: 1 },
  { name: "Grace Akinyi", id: "55667788", phone: "0745678901", house: "A2", floor: "Ground Floor", movedIn: "2024-02-10", rentPaid: true, rentAmount: 12000, issues: 0 },
];

const CARETAKER_ACTIVITIES = [
  { date: "2024-04-10", action: "Completed cleaning checklist", status: "done" },
  { date: "2024-04-10", action: "Checked water tanks", status: "done" },
  { date: "2024-04-09", action: "Added vacancy D2 on 3rd Floor", status: "done" },
  { date: "2024-04-09", action: "Security check", status: "done" },
  { date: "2024-04-08", action: "Resolved plumbing issue in B3", status: "done" },
];

type Tab = "overview" | "tenants" | "caretaker" | "settings";

const LandlordDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const { apartmentName, setApartmentName, addLandlordCode } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [newCode, setNewCode] = useState("");
  const [newAptName, setNewAptName] = useState(apartmentName);
  const [expenses, setExpenses] = useState(25000);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalPaid = MOCK_TENANTS.filter(t => t.rentPaid).reduce((sum, t) => sum + t.rentAmount, 0);
  const totalExpected = MOCK_TENANTS.reduce((sum, t) => sum + t.rentAmount, 0);
  const paidCount = MOCK_TENANTS.filter(t => t.rentPaid).length;
  const profit = totalPaid - expenses;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const handleAddCode = () => {
    if (newCode.trim()) {
      addLandlordCode(newCode.trim());
      toast({ title: "Code added", description: "New landlord code saved." });
      setNewCode("");
    }
  };

  const handleSaveAptName = () => {
    setApartmentName(newAptName);
    toast({ title: "Updated", description: "Apartment name changed." });
  };

  const navItems = [
    { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { id: "tenants" as Tab, label: "Tenants", icon: Users },
    { id: "caretaker" as Tab, label: "Caretaker", icon: ClipboardCheck },
    { id: "settings" as Tab, label: "Settings", icon: Save },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero p-4 pb-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="font-heading text-lg font-bold">NyumbaLink</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <h1 className="font-heading text-xl font-bold">Landlord Dashboard</h1>
        <p className="text-primary-foreground/80 text-sm">{apartmentName}</p>
      </header>

      <nav className="flex gap-1 p-2 border-b border-border overflow-x-auto">
        {navItems.map(item => (
          <Button
            key={item.id}
            variant={tab === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(item.id)}
            className={`gap-2 flex-shrink-0 ${tab === item.id ? "gradient-primary text-primary-foreground" : ""}`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <main className="p-4 space-y-4 animate-fade-in">
        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">Monthly Income</span>
                  </div>
                  <p className="text-xl font-bold text-foreground font-heading">KES {totalPaid.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-secondary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-secondary" />
                    <span className="text-xs text-muted-foreground">Expenses</span>
                  </div>
                  <p className="text-xl font-bold text-foreground font-heading">KES {expenses.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <span className="text-xs text-muted-foreground">Net Profit</span>
                  </div>
                  <p className={`text-xl font-bold font-heading ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                    KES {profit.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-5 w-5 text-info" />
                    <span className="text-xs text-muted-foreground">Rent Paid</span>
                  </div>
                  <p className="text-xl font-bold text-foreground font-heading">{paidCount}/{MOCK_TENANTS.length}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="font-heading text-base">Expected vs Collected</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected</span>
                    <span className="font-medium text-foreground">KES {totalExpected.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="gradient-primary h-3 rounded-full transition-all" style={{ width: `${(totalPaid / totalExpected) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collected</span>
                    <span className="font-medium text-success">KES {totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {tab === "tenants" && (
          <Card>
            <CardHeader><CardTitle className="font-heading">All Tenants</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_TENANTS.map(t => (
                  <div key={t.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.rentPaid ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {t.rentPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                      <p>ID: {t.id}</p>
                      <p>Phone: {t.phone}</p>
                      <p>House: {t.house}</p>
                      <p>Floor: {t.floor}</p>
                      <p>Moved in: {t.movedIn}</p>
                      <p>Rent: KES {t.rentAmount.toLocaleString()}</p>
                      <p>Issues: {t.issues}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "caretaker" && (
          <Card>
            <CardHeader><CardTitle className="font-heading">Caretaker Activity Log</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CARETAKER_ACTIVITIES.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{a.action}</p>
                      <p className="text-xs text-muted-foreground">{a.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="font-heading">Apartment Name</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Input value={newAptName} onChange={e => setNewAptName(e.target.value)} />
                <Button onClick={handleSaveAptName} className="gradient-primary text-primary-foreground">Save</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="font-heading">Add Landlord Code</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Input type="password" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="New code" />
                <Button onClick={handleAddCode} className="gradient-primary text-primary-foreground">Add</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordDashboard;
