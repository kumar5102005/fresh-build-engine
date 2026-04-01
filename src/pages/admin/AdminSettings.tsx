import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure library system parameters.</p>
        </div>

        {/* Borrowing Rules */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Borrowing Rules</CardTitle>
            <CardDescription>Set default borrowing policies for the library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Books per Student</Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label>Max Books per Faculty</Label>
                <Input type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label>Borrow Duration (days)</Label>
                <Input type="number" defaultValue="14" />
              </div>
              <div className="space-y-2">
                <Label>Max Renewals</Label>
                <Input type="number" defaultValue="2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Penalty Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Penalty Settings</CardTitle>
            <CardDescription>Configure overdue penalty rates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Penalty per Day (₹)</Label>
                <Input type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label>Max Penalty (₹)</Label>
                <Input type="number" defaultValue="500" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-suspend on Penalty</p>
                <p className="text-xs text-muted-foreground">Suspend user when penalty exceeds max amount.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
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
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Reminder Days Before Due</Label>
              <Select defaultValue="3">
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
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto">Save Settings</Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
