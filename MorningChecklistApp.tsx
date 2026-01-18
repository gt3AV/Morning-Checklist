import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MorningChecklistApp() {
  const defaultItems = [
    { id: 1, text: "Get washed", done: false },
    { id: 2, text: "Brush teeth", done: false },
    { id: 3, text: "Today's clothes", done: false },
    { id: 4, text: "Bag", done: false },
  ];

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("checklist-items");
    return saved ? JSON.parse(saved) : defaultItems;
  });

  const [newItem, setNewItem] = useState("");
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("streak")) || 0);
  const [lastCompleted, setLastCompleted] = useState(() => localStorage.getItem("lastCompleted"));

  useEffect(() => {
    localStorage.setItem("checklist-items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("lastCompleted", lastCompleted || "");
  }, [lastCompleted]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const toggleItem = (id) => {
    setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: Date.now(), text: newItem, done: false }]);
    setNewItem("");
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const allDone = items.every(i => i.done);

  const completeDay = () => {
    const today = new Date().toDateString();
    if (lastCompleted !== today) {
      setStreak(streak + 1);
      setLastCompleted(today);
    }
    setItems(items.map(i => ({ ...i, done: false })));
  };

  const sendReminder = () => {
    if (Notification.permission === "granted") {
      new Notification("Morning Checklist", {
        body: "Have you finished your morning routine?",
      });
    }
  };

  useEffect(() => {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(7, 30, 0, 0);

    const delay = reminderTime.getTime() - now.getTime();
    if (delay > 0) {
      const timer = setTimeout(sendReminder, delay);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Morning Checklist</h1>

          <p className="text-sm text-gray-600">🔥 Current streak: {streak} mornings</p>

          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span className={item.done ? "line-through text-gray-400" : ""}>
                    {item.text}
                  </span>
                </label>
                <Button variant="ghost" onClick={() => removeItem(item.id)}>✕</Button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Input
              placeholder="Add new task"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
            />
            <Button onClick={addItem}>Add</Button>
          </div>

          {allDone && (
            <Button className="w-full" onClick={completeDay}>All done – start my streak 🚀</Button>
          )}

          <Button variant="outline" className="w-full" onClick={sendReminder}>Send Reminder Now</Button>
        </CardContent>
      </Card>
    </div>
  );
}
