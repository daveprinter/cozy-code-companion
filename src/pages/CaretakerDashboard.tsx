import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, LogOut, ClipboardCheck, Users, Home, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CHECKLIST_ITEMS = [
  { id: "cleaning", label: "Cleaning" },
  { id: "water_tank", label: "Water Tank Checking" },
  { id: "security", label: "Security Checking" },
];

// Mock tenant data
const MOCK_TENANTS = [
  { name: "John Kamau", id: "12345678", phone: "0712345678", house: "A5", floor: "Ground Floor", movedIn: "2024-01-15", rentPaid: true, issues: 0 },
  { name: "Mary Wanjiku", id: "87654321", phone: "0723456789", house: "B3", floor: "1st Floor", movedIn: "2024-03-01", rentPaid: false, issues: 2 },
  { name: "Peter Ochieng", id: "11223344", phone: "0734567890", house: "C1", floor: "2nd Floor", movedIn: "2023-11-20", rentPaid: true, issues: 1 },
];

type Tab = "checklist" | "tenants" | "vacancy" | "codes";

const CaretakerDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const { apartmentName, setApartmentName, addCaretakerCode, addNotification } = useApp();
  const [tab, setTab] = useState<Tab>("checklist");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [newCode, setNewCode] = useState("");
  const [newAptName, setNewAptName] = useState(apartmentName);
  const [newVacancy, setNewVacancy] = useState({ floor: "", doorNumber: "" });
  const [vacancies, setVacancies] = useState<Array<{ floor: string; doorNumber: string }>>([
    { floor: "3rd Floor", doorNumber: "D2" },
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const handleAddCode = () => {
    if (newCode.trim()) {
      addCaretakerCode(newCode.trim());
      toast({ title: "Code added", description: "New caretaker code saved." });
      setNewCode("");
    }
  };

  const handleSaveAptName = () => {
    setApartmentName(newAptName);
    toast({ title: "Updated", description: "Apartment name changed." });
  };

  const handleAddVacancy = () => {
    if (newVacancy.floor && newVacancy.doorNumber) {
      setVacancies(prev => [...prev, newVacancy]);
      addNotification({ title: "New Vacancy", message: `Unit ${newVacancy.doorNumber} on ${newVacancy.floor} is now available.` });
      setNewVacancy({ floor: "", doorNumber: "" });
      toast({ title: "Vacancy added" });
    }
  };

  const navItems = [
    { id: "checklist" as Tab, label: "Daily Checklist", icon: ClipboardCheck },
    { id: "tenants" as Tab, label: "Tenants", icon: Users },
    { id: "vacancy" as Tab, label: "Vacancies", icon: Home },
    { id: "codes" as Tab, label: "Settings", icon: Save },
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
        <h1 className="font-heading text-xl font-bold">Caretaker Dashboard</h1>
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
        {tab === "checklist" && (
          <Card>
            <CardHeader><CardTitle className="font-heading">Daily Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {CHECKLIST_ITEMS.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Checkbox
                    id={item.id}
                    checked={!!checklist[item.id]}
                    onCheckedChange={v => setChecklist(prev => ({ ...prev, [item.id]: !!v }))}
                  />
                  <label htmlFor={item.id} className="flex-1 font-medium text-foreground cursor-pointer">{item.label}</label>
                  {checklist[item.id] && <span className="text-xs text-success font-medium">✓ Done</span>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {tab === "tenants" && (
          <Card>
            <CardHeader><CardTitle className="font-heading">Tenant Management</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_TENANTS.map(t => (
                  <div key={t.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.rentPaid ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {t.rentPaid ? "Rent Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                      <p>ID: {t.id}</p>
                      <p>Phone: {t.phone}</p>
                      <p>House: {t.house}</p>
                      <p>Floor: {t.floor}</p>
                      <p>Moved in: {t.movedIn}</p>
                      <p>Issues: {t.issues}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "vacancy" && (
          <Card>
            <CardHeader><CardTitle className="font-heading">Vacancy Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Floor" value={newVacancy.floor} onChange={e => setNewVacancy(prev => ({ ...prev, floor: e.target.value }))} />
                <Input placeholder="Door #" value={newVacancy.doorNumber} onChange={e => setNewVacancy(prev => ({ ...prev, doorNumber: e.target.value }))} />
                <Button onClick={handleAddVacancy} size="icon" className="gradient-primary text-primary-foreground flex-shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {vacancies.map((v, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{v.doorNumber}</p>
                      <p className="text-sm text-muted-foreground">{v.floor}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">Vacant</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "codes" && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="font-heading">Apartment Name</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Input value={newAptName} onChange={e => setNewAptName(e.target.value)} />
                <Button onClick={handleSaveAptName} className="gradient-primary text-primary-foreground">Save</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="font-heading">Add Caretaker Code</CardTitle></CardHeader>
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

export default CaretakerDashboard;
