import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "register";
  onAuthSuccess: (user: any) => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const LANGUAGES = [
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "en", name: "English" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
];

export default function AuthModal({ isOpen, onClose, initialMode, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = React.useState<"login" | "register">(initialMode);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  // Form Fields
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [state, setState] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [farmSize, setFarmSize] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  // Sync mode with props
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "register") {
      const missing = [];
      if (!name) missing.push("Full Name");
      if (!phone) missing.push("Phone Number");
      if (!email) missing.push("Email");
      if (!password) missing.push("Password");
      if (!state) missing.push("State");
      if (!language) missing.push("Language");
      if (!farmSize) missing.push("Farm Size");

      if (missing.length > 0) {
        toast({
          title: "Missing Fields",
          description: `Please fill in: ${missing.join(", ")}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Passwords Match Error",
          description: "Confirm password does not match.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (!agree) {
        toast({
          title: "Consent Required",
          description: "You must agree to the Terms & Conditions.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Simulate network request
      setTimeout(() => {
        const newUser = { name, email, phone, state, language, farmSize };
        localStorage.setItem("user", JSON.stringify(newUser));
        toast({
          title: "Account Created!",
          description: `Welcome to Smart Crop Advisory, ${name}!`,
        });
        onAuthSuccess(newUser);
        setLoading(false);
        onClose();
      }, 1200);
    } else {
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please enter your email and password.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setTimeout(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.email === email) {
            toast({
              title: "Login Successful",
              description: `Welcome back, ${parsed.name}!`,
            });
            onAuthSuccess(parsed);
            setLoading(false);
            onClose();
            return;
          }
        }

        // Fallback or demo user login
        const demoUser = {
          name: "Chhavi Tiwari",
          email: email,
          phone: "9876543210",
          state: "Uttar Pradesh",
          language: "en",
          farmSize: "5.5",
        };
        localStorage.setItem("user", JSON.stringify(demoUser));
        toast({
          title: "Login Successful",
          description: "Logged in as Demo User.",
        });
        onAuthSuccess(demoUser);
        setLoading(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border-green-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800 text-center">
            {mode === "register" ? "Create Farmer Account" : "Farmer Login"}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            {mode === "register"
              ? "Join Smart Crop Advisory to optimize your harvest."
              : "Access your localized farming records & forecasts."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "register" && (
            <>
              <div>
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border-green-200 focus:ring-green-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reg-phone">Phone Number</Label>
                  <Input
                    id="reg-phone"
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-lg border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-farm">Farm Size (Acres)</Label>
                  <Input
                    id="reg-farm"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.5"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="rounded-lg border-green-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <Label>State</Label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Choose State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Language</Label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Choose Language</option>
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="auth-email">Email Address</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border-green-200"
            />
          </div>

          <div className={mode === "register" ? "grid grid-cols-2 gap-3" : "space-y-1"}>
            <div>
              <Label htmlFor="auth-pass">Password</Label>
              <Input
                id="auth-pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border-green-200"
              />
            </div>
            {mode === "register" && (
              <div>
                <Label htmlFor="auth-confirm">Confirm Password</Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-lg border-green-200"
                />
              </div>
            )}
          </div>

          {mode === "register" && (
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="terms"
                checked={agree}
                onCheckedChange={(val) => setAgree(!!val)}
                className="border-green-300 text-green-600 focus:ring-green-400"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-none cursor-pointer">
                I agree to the Terms of Service & Privacy Policy.
              </label>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg mt-4 h-11 flex items-center justify-center space-x-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{mode === "register" ? "Create Account" : "Farmer Login"}</span>
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
              className="text-sm text-green-700 hover:text-green-800 hover:underline font-semibold"
            >
              {mode === "register" ? "Already registered? Login" : "New farmer? Register"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
