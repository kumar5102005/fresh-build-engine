import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useSystemSettings, useUpdateSettings } from "@/hooks/useSystemSettings";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    updateSettings.mutate(form);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure library system parameters.</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Borrowing Rules</CardTitle>
            <CardDescription>Set default borrowing policies for the library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Books per Student</Label>
                <Input type="number" value={form.max_books_student || ""} onChange={(e) => set("max_books_student", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Books per Faculty</Label>
                <Input type="number" value={form.max_books_faculty || ""} onChange={(e) => set("max_books_faculty", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Borrow Duration (days)</Label>
                <Input type="number" value={form.borrow_duration_days || ""} onChange={(e) => set("borrow_duration_days", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Renewals</Label>
                <Input type="number" value={form.max_renewals || ""} onChange={(e) => set("max_renewals", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Penalty Settings</CardTitle>
            <CardDescription>Configure overdue penalty rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Penalty per Day (₹)</Label>
                <Input type="number" value={form.penalty_per_day || ""} onChange={(e) => set("penalty_per_day", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Penalty (₹)</Label>
                <Input type="number" value={form.max_penalty || ""} onChange={(e) => set("max_penalty", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-suspend on Penalty</p>
                <p className="text-xs text-muted-foreground">Suspend user when penalty exceeds max amount.</p>
              </div>
              <Switch checked={form.auto_suspend_on_penalty === "true"} onCheckedChange={(v) => set("auto_suspend_on_penalty", v ? "true" : "false")} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Notification Settings</CardTitle>
            <CardDescription>Configure system notification behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Due Date Reminders</p>
                <p className="text-xs text-muted-foreground">Send reminders before book due dates.</p>
              </div>
              <Switch checked={form.due_date_reminders === "true"} onCheckedChange={(v) => set("due_date_reminders", v ? "true" : "false")} />
            </div>
            <div className="space-y-2">
              <Label>Reminder Days Before Due</Label>
              <Select value={form.reminder_days_before || "3"} onValueChange={(v) => set("reminder_days_before", v)}>
                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Overdue Notifications</p>
                <p className="text-xs text-muted-foreground">Notify users when books are overdue.</p>
              </div>
              <Switch checked={form.overdue_notifications === "true"} onCheckedChange={(v) => set("overdue_notifications", v ? "true" : "false")} />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto" onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
