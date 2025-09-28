'use client';
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";

const todayKey = () => new Date().toISOString().slice(0, 10);
const ls = {
  get: (k: string) => (typeof window === "undefined" ? null : localStorage.getItem(k)),
  set: (k: string, v: string) => { try { if (typeof window !== "undefined") localStorage.setItem(k, v); } catch {} },
  clearAllMVP: () => {
    try {
      if (typeof window === "undefined") return;
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("mvp_")) keys.push(key);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
  },
};

export default function Page() {
  const [step, setStep] = useState<"onboarding"|"plan"|"logging"|"progress">("onboarding");
  const [sleep, setSleep] = useState("");
  const [workoutGoal, setWorkoutGoal] = useState("");
  const [nutritionGoal, setNutritionGoal] = useState("");

  const [loggedSleep, setLoggedSleep] = useState(false);
  const [loggedWorkout, setLoggedWorkout] = useState(false);
  const [loggedMeal, setLoggedMeal] = useState(false);

  const [streak, setStreak] = useState(0);
  const [demoMode, setDemoMode] = useState(false);

  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const showToast = (message: string) => {
    const id = Date.now();
    setToast({ message, id });
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 1800);
  };

  useEffect(() => {
    const s = ls.get("mvp_sleep") || "";
    const wg = ls.get("mvp_workoutGoal") || "";
    const ng = ls.get("mvp_nutritionGoal") || "";
    setSleep(s); setWorkoutGoal(wg); setNutritionGoal(ng);

    const st = Number(ls.get("mvp_streak") || 0);
    setStreak(Number.isFinite(st) ? st : 0);

    const k = todayKey();
    setLoggedSleep(ls.get(`mvp_${k}_sleep`) === "1");
    setLoggedWorkout(ls.get(`mvp_${k}_workout`) === "1");
    setLoggedMeal(ls.get(`mvp_${k}_meal`) === "1");
  }, []);

  const dayProgress = useMemo(() => {
    const done = [loggedSleep, loggedWorkout, loggedMeal].filter(Boolean).length;
    return (done/3)*100;
  }, [loggedSleep, loggedWorkout, loggedMeal]);

  const plan = useMemo(() => {
    const hours = Number(sleep);
    if (!Number.isFinite(hours)) return { title: "Starter day", bullets: ["10–20 min brisk walk","Balanced plate: protein + veggies + smart carbs","Lights out by 10:30 pm"] };
    if (hours < 6) return { title: "Recovery-focused day", bullets: ["Lighter workout: 20–30 min easy walk or mobility","+40–60 g carbs earlier in the day for recovery","Prioritize an early bedtime"] };
    if (hours < 8) return { title: "Build day", bullets: ["Strength: 3× full-body compounds (30–40 min)","Protein target spread across meals","Wind-down routine 30 min before bed"] };
    return { title: "Push day", bullets: ["Strength + finisher: 35–45 min","+10% training volume vs last session","Hydration: 2–3 L across day"] };
  }, [sleep]);

  const handleContinue = () => {
    localStorage.setItem("mvp_sleep", sleep);
    localStorage.setItem("mvp_workoutGoal", workoutGoal);
    localStorage.setItem("mvp_nutritionGoal", nutritionGoal);
    showToast("Saved ✨"); setStep("plan");
  };

  const toggleLog = (what: "sleep"|"workout"|"meal") => {
    const k = `mvp_${todayKey()}_${what}`;
    if (what === "sleep") { const v = !loggedSleep; setLoggedSleep(v); localStorage.setItem(k, v?"1":"0"); showToast(v?"Sleep logged":"Sleep unlogged"); }
    else if (what === "workout") { const v = !loggedWorkout; setLoggedWorkout(v); localStorage.setItem(k, v?"1":"0"); showToast(v?"Workout logged":"Workout unlogged"); }
    else { const v = !loggedMeal; setLoggedMeal(v); localStorage.setItem(k, v?"1":"0"); showToast(v?"Meal logged":"Meal unlogged"); }
  };

  const completeDay = () => {
    const k = `mvp_${todayKey()}_completed`;
    const already = localStorage.getItem(k) === "1";
    if (loggedSleep && loggedWorkout && loggedMeal && !already) {
      const newStreak = streak + 1; setStreak(newStreak);
      localStorage.setItem("mvp_streak", String(newStreak)); localStorage.setItem(k, "1");
      showToast("Day complete ✅ Streak +1");
    } else if (!loggedSleep || !loggedWorkout || !loggedMeal) {
      showToast("Log all 3 to complete the day");
    }
    setStep("progress");
  };

  const seedDemo = (on: boolean) => {
    setDemoMode(on);
    if (on) {
      const k = todayKey();
      setSleep("5.5"); setWorkoutGoal("Upper body strength"); setNutritionGoal("160g protein, 2L water");
      setLoggedSleep(true); setLoggedWorkout(true); setLoggedMeal(false);
      localStorage.setItem("mvp_sleep", "5.5");
      localStorage.setItem("mvp_workoutGoal", "Upper body strength");
      localStorage.setItem("mvp_nutritionGoal", "160g protein, 2L water");
      localStorage.setItem(`mvp_${k}_sleep`, "1");
      localStorage.setItem(`mvp_${k}_workout`, "1");
      localStorage.setItem(`mvp_${k}_meal`, "0");
      showToast("Demo data loaded");
    } else {
      showToast("Demo mode off");
    }
  };

  const resetAll = () => {
    ls.clearAllMVP();
    setSleep(""); setWorkoutGoal(""); setNutritionGoal("");
    setLoggedSleep(false); setLoggedWorkout(false); setLoggedMeal(false);
    setStreak(0); setDemoMode(false); setStep("onboarding");
    showToast("Reset complete");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={demoMode} onCheckedChange={seedDemo} />
            <span className="text-sm">Demo Mode</span>
          </div>
          <Button variant="outline" onClick={resetAll}>Reset Data</Button>
          <div className="ml-auto text-sm text-gray-500">{todayKey()}</div>
        </CardContent>
      </Card>

      {step === "onboarding" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-xl font-bold">Onboarding</h2>
            <p className="text-sm text-gray-600">Tell us your basics (saved on your device):</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hours of sleep last night</label>
              <Input inputMode="numeric" placeholder="e.g., 7" value={sleep} onChange={(e) => setSleep(e.target.value)} />
              <label className="text-sm font-medium">Today's workout goal</label>
              <Input placeholder="e.g., Upper body strength" value={workoutGoal} onChange={(e) => setWorkoutGoal(e.target.value)} />
              <label className="text-sm font-medium">Nutrition goal</label>
              <Input placeholder="e.g., 160g protein, 2L water" value={nutritionGoal} onChange={(e) => setNutritionGoal(e.target.value)} />
            </div>
            <Button className="w-full mt-3" onClick={handleContinue}>Continue</Button>
          </CardContent>
        </Card>
      )}

      {step === "plan" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-xl font-bold">Your Daily Plan</h2>
            <p className="text-sm text-gray-600">
              Based on your sleep ({sleep || "?"}h){workoutGoal && ", workout goal: " + workoutGoal}{nutritionGoal && ", nutrition: " + nutritionGoal}
            </p>
            <div className="rounded-2xl border bg-white p-3">
              <p className="font-semibold">{plan.title}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {plan.bullets.map((b, i) => (<li key={i}>{b}</li>))}
              </ul>
            </div>
            <Button className="w-full" onClick={() => { setStep("logging"); showToast("Start logging"); }}>Start Logging</Button>
          </CardContent>
        </Card>
      )}

      {step === "logging" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-xl font-bold">Log Today</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant={loggedSleep ? "default" : "outline"} onClick={() => toggleLog("sleep")}>{loggedSleep ? "✅ Sleep Logged" : "Log Sleep"}</Button>
              <Button variant={loggedWorkout ? "default" : "outline"} onClick={() => toggleLog("workout")}>{loggedWorkout ? "✅ Workout Logged" : "Log Workout"}</Button>
              <Button variant={loggedMeal ? "default" : "outline"} onClick={() => toggleLog("meal")}>{loggedMeal ? "✅ Meal Logged" : "Log Meal"}</Button>
            </div>
            <div className="mt-2">
              <Progress value={dayProgress} />
              <p className="text-xs text-gray-600 mt-1">Today's completion: {Math.round(dayProgress)}%</p>
            </div>
            <Button className="w-full" onClick={completeDay}>Complete Day →</Button>
          </CardContent>
        </Card>
      )}

      {step === "progress" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-xl font-bold">Your Progress</h2>
            <p>Streak: <span className="font-semibold">{streak}</span> day{streak === 1 ? "" : "s"} in a row 🔥</p>
            <Progress value={Math.min(streak * 20, 100)} />
            <p className="text-sm text-gray-500">Goal: 5-day streak</p>
            <p className="text-green-600 text-sm">Keep going — almost there!</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("logging")}>Back to Today</Button>
              <Button className="ml-auto" onClick={() => setStep("onboarding")}>Restart</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-black/80 text-white px-4 py-2 shadow-lg"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
