"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "new" | "workouts" | "trends";
type SetRow = { id: number; weight: string; reps: string; previousWeight?: string; previousReps?: string };
type ExerciseEntry = { id: number; name: string; sets: SetRow[] };
type Workout = { id: number; date: string; duration: string; exercises: ExerciseEntry[] };
type WorkoutSession = { started: number; pausedAt?: number; pausedDuration: number; exercises: ExerciseEntry[] };
type BodyPart = "All" | "Chest" | "Shoulders" | "Back" | "Legs" | "Arms";

const EXERCISES = [
  "Barbell Bench Press", "Back Squat", "Deadlift", "Overhead Press",
  "Pull Up", "Barbell Row", "Dumbbell Curl", "Tricep Pushdown",
  "Leg Press", "Romanian Deadlift", "Lat Pulldown", "Seated Cable Row",
  "Incline Dumbbell Press", "Lateral Raise", "Hip Thrust", "Calf Raise",
];

const BODY_PARTS: BodyPart[] = ["All", "Chest", "Shoulders", "Back", "Legs", "Arms"];
const EXERCISE_GROUPS: Record<string, Exclude<BodyPart, "All">> = {
  "Barbell Bench Press": "Chest", "Incline Dumbbell Press": "Chest",
  "Overhead Press": "Shoulders", "Lateral Raise": "Shoulders",
  "Pull Up": "Back", "Barbell Row": "Back", "Lat Pulldown": "Back", "Seated Cable Row": "Back",
  "Back Squat": "Legs", "Deadlift": "Legs", "Leg Press": "Legs", "Romanian Deadlift": "Legs", "Hip Thrust": "Legs", "Calf Raise": "Legs",
  "Dumbbell Curl": "Arms", "Tricep Pushdown": "Arms",
};

const starterWorkouts: Workout[] = [
  { id: 1, date: "2026-08-31T17:40:00", duration: "48 min", exercises: [
    { id: 11, name: "Barbell Bench Press", sets: [{ id: 1, weight: "135", reps: "10" }, { id: 2, weight: "145", reps: "8" }, { id: 3, weight: "145", reps: "8" }] },
    { id: 12, name: "Overhead Press", sets: [{ id: 1, weight: "75", reps: "10" }, { id: 2, weight: "80", reps: "8" }, { id: 3, weight: "80", reps: "8" }] },
    { id: 13, name: "Tricep Pushdown", sets: [{ id: 1, weight: "45", reps: "12" }, { id: 2, weight: "50", reps: "10" }, { id: 3, weight: "50", reps: "10" }] },
  ] },
  { id: 2, date: "2026-08-28T07:15:00", duration: "55 min", exercises: [
    { id: 21, name: "Back Squat", sets: [{ id: 1, weight: "185", reps: "8" }, { id: 2, weight: "195", reps: "6" }, { id: 3, weight: "195", reps: "6" }] },
    { id: 22, name: "Romanian Deadlift", sets: [{ id: 1, weight: "135", reps: "10" }, { id: 2, weight: "145", reps: "8" }, { id: 3, weight: "145", reps: "8" }] },
  ] },
  { id: 3, date: "2026-08-25T18:05:00", duration: "44 min", exercises: [
    { id: 31, name: "Barbell Bench Press", sets: [{ id: 1, weight: "125", reps: "10" }, { id: 2, weight: "135", reps: "9" }, { id: 3, weight: "135", reps: "8" }] },
    { id: 32, name: "Barbell Row", sets: [{ id: 1, weight: "115", reps: "10" }, { id: 2, weight: "125", reps: "8" }, { id: 3, weight: "125", reps: "8" }] },
  ] },
  { id: 4, date: "2026-08-18T17:25:00", duration: "42 min", exercises: [
    { id: 41, name: "Barbell Bench Press", sets: [{ id: 1, weight: "115", reps: "12" }, { id: 2, weight: "125", reps: "10" }, { id: 3, weight: "125", reps: "9" }] },
    { id: 42, name: "Lat Pulldown", sets: [{ id: 1, weight: "100", reps: "12" }, { id: 2, weight: "110", reps: "10" }, { id: 3, weight: "110", reps: "10" }] },
  ] },
];

const blankSets = (): SetRow[] => [1, 2, 3].map((id) => ({ id, weight: "", reps: "" }));
const fmtDate = (iso: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
const fmtTime = (iso: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));

function SearchExercise({ onSelect, used }: { onSelect: (name: string) => void; used: string[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bodyPart, setBodyPart] = useState<BodyPart>("All");
  const choices = EXERCISES.filter((name) => !used.includes(name) && name.toLowerCase().includes(query.toLowerCase()) && (bodyPart === "All" || EXERCISE_GROUPS[name] === bodyPart)).slice(0, 7);
  return <div className="exercise-search">
    <button className="add-exercise" onClick={() => setOpen(true)}><span>＋</span> Add exercise</button>
    {open && <div className="picker-backdrop" onMouseDown={() => setOpen(false)}>
      <div className="picker-sheet" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="picker-title"><h2>Choose Exercise</h2><button onClick={() => setOpen(false)}>Cancel</button></div>
        <label className="searchbox"><span>⌕</span><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" /></label>
        <div className="body-filters" aria-label="Filter exercises by body part">{BODY_PARTS.map((part) => <button key={part} className={bodyPart === part ? "active" : ""} onClick={() => setBodyPart(part)}>{part}</button>)}</div>
        <div className="choice-list">
          {choices.map((name) => <button key={name} onClick={() => { onSelect(name); setOpen(false); setQuery(""); setBodyPart("All"); }}><span className="exercise-dot">{name[0]}</span><span>{name}</span><b>›</b></button>)}
          {!choices.length && <p className="empty-search">No exercises found</p>}
        </div>
      </div>
    </div>}
  </div>;
}

function ExerciseCard({ exercise, onChange, onDelete }: { exercise: ExerciseEntry; onChange: (next: ExerciseEntry) => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const exerciseMenuRef = useRef<HTMLDivElement>(null);
  const [revealedSet, setRevealedSet] = useState<number | null>(null);
  const [undoSet, setUndoSet] = useState<{ set: SetRow; index: number } | null>(null);
  const touchStart = useRef<number | null>(null);
  useEffect(() => {
    if (!undoSet) return;
    const timer = setTimeout(() => setUndoSet(null), 5000);
    return () => clearTimeout(timer);
  }, [undoSet]);
  useEffect(() => {
    if (!menuOpen) return;
    const dismissOnPointer = (event: PointerEvent) => { if (!exerciseMenuRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    const dismissOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("pointerdown", dismissOnPointer);
    document.addEventListener("keydown", dismissOnEscape);
    return () => { document.removeEventListener("pointerdown", dismissOnPointer); document.removeEventListener("keydown", dismissOnEscape); };
  }, [menuOpen]);
  const update = (setId: number, field: "weight" | "reps", value: string) => onChange({ ...exercise, sets: exercise.sets.map((set) => set.id === setId ? { ...set, [field]: value.replace(/[^0-9.]/g, "") } : set) });
  const removeSet = (set: SetRow, index: number) => {
    if (exercise.sets.length === 1) return;
    setUndoSet({ set, index });
    setRevealedSet(null);
    onChange({ ...exercise, sets: exercise.sets.filter((item) => item.id !== set.id) });
  };
  const restoreSet = () => {
    if (!undoSet) return;
    const sets = [...exercise.sets];
    sets.splice(Math.min(undoSet.index, sets.length), 0, undoSet.set);
    onChange({ ...exercise, sets });
    setUndoSet(null);
  };
  return <section className="exercise-card">
    <div className="exercise-card-title"><div><span className="exercise-icon">{exercise.name[0]}</span><h2>{exercise.name}</h2></div><div className="exercise-menu-wrap" ref={exerciseMenuRef}><button aria-label={`Options for ${exercise.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>•••</button>{menuOpen && <div className="exercise-menu"><button onClick={() => { setMenuOpen(false); onDelete(); }}><span aria-hidden="true" /> Delete exercise</button></div>}</div></div>
    <div className="set-head"><span>SET</span><span>WEIGHT (LB)</span><span>REPS</span></div>
    {exercise.sets.map((set, index) => <div className={`swipe-row ${revealedSet === set.id ? "revealed" : ""}`} key={set.id} onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchStart.current === null) return; const distance = e.changedTouches[0].clientX - touchStart.current; if (distance < -34 && exercise.sets.length > 1) setRevealedSet(set.id); if (distance > 28) setRevealedSet(null); touchStart.current = null; }}>
      <button className="swipe-delete" aria-label={`Delete set ${index + 1}`} disabled={exercise.sets.length === 1} onFocus={() => setRevealedSet(set.id)} onClick={() => removeSet(set, index)}>Delete</button>
      <div className="set-row">
        <span className="set-number">{index + 1}</span>
        <input aria-label={`Set ${index + 1} weight`} inputMode="decimal" placeholder={set.previousWeight ? `Last: ${set.previousWeight}` : "0"} value={set.weight} onChange={(e) => update(set.id, "weight", e.target.value)} />
        <input aria-label={`Set ${index + 1} reps`} inputMode="numeric" placeholder={set.previousReps ? `Last: ${set.previousReps}` : "0"} value={set.reps} onChange={(e) => update(set.id, "reps", e.target.value)} />
      </div>
    </div>)}
    <button className="add-set" onClick={() => onChange({ ...exercise, sets: [...exercise.sets, { id: Date.now(), weight: "", reps: "" }] })}>＋ Add set</button>
    {undoSet && <div className="undo-toast" role="status"><span>Set deleted</span><button onClick={restoreSet}>Undo</button></div>}
  </section>;
}

function NewWorkout({ session, workouts, onStart, onChange, onSave, onDiscard }: { session: WorkoutSession | null; workouts: Workout[]; onStart: (template?: Workout) => void; onChange: (session: WorkoutSession) => void; onSave: (workout: Workout) => void; onDiscard: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [workoutMenuOpen, setWorkoutMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"finish" | "discard" | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const workoutMenuRef = useRef<HTMLDivElement>(null);
  const started = session?.started ?? 0;
  const pausedAt = session?.pausedAt;
  const pausedDuration = session?.pausedDuration ?? 0;
  useEffect(() => {
    if (!started) { setElapsed(0); return; }
    const updateElapsed = () => setElapsed(Math.floor(((pausedAt ?? Date.now()) - started - pausedDuration) / 1000));
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [started, pausedAt, pausedDuration]);
  useEffect(() => {
    if (!workoutMenuOpen) return;
    const dismissOnPointer = (event: PointerEvent) => { if (!workoutMenuRef.current?.contains(event.target as Node)) setWorkoutMenuOpen(false); };
    const dismissOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setWorkoutMenuOpen(false); };
    document.addEventListener("pointerdown", dismissOnPointer);
    document.addEventListener("keydown", dismissOnEscape);
    return () => { document.removeEventListener("pointerdown", dismissOnPointer); document.removeEventListener("keydown", dismissOnEscape); };
  }, [workoutMenuOpen]);
  if (!session) return <div className="screen new-screen idle-workout">
    <header className="page-header"><div><h1>New Workout</h1></div></header>
    <main><section className="start-card"><span className="start-symbol" aria-hidden="true"><i className="dumbbell-glyph" /></span><h2>Start your workout</h2><p>{workouts.length ? "Reuse a recent workout or build a new one." : "Build your first workout by adding exercises and sets."}</p>{workouts.length > 0 && <button className="previous-primary" onClick={() => setHistoryOpen(true)}>Use Previous Workout</button>}<button className={workouts.length ? "scratch-secondary" : "previous-primary"} onClick={() => onStart()}>Start from Scratch</button></section><p className="last-workout-note">Your workout timer starts after you choose.</p></main>
    {historyOpen && <div className="picker-backdrop" onMouseDown={() => setHistoryOpen(false)}><section className="picker-sheet history-picker" role="dialog" aria-modal="true" aria-labelledby="history-picker-title" onMouseDown={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="picker-title"><h2 id="history-picker-title">Choose Workout</h2><button onClick={() => setHistoryOpen(false)}>Cancel</button></div><p className="history-picker-note">Exercises and set counts will be copied. Weight and reps will start empty.</p><div className="history-choice-list">{workouts.slice(0, 6).map((workout) => <button key={workout.id} onClick={() => { setHistoryOpen(false); onStart(workout); }}><span className="history-date"><small>{new Date(workout.date).toLocaleString("en-US", { month: "short" }).toUpperCase()}</small><b>{new Date(workout.date).getDate()}</b></span><span className="history-choice-copy"><b>{workout.exercises.map((exercise) => exercise.name).slice(0, 2).join(", ")}{workout.exercises.length > 2 ? ` +${workout.exercises.length - 2}` : ""}</b><small>{workout.exercises.length} exercises · {workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)} sets</small></span><span className="chevron">›</span></button>)}</div></section></div>}
  </div>;
  const exercises = session.exercises;
  const setExercises = (next: ExerciseEntry[]) => onChange({ ...session, exercises: next });
  const togglePause = () => pausedAt
    ? onChange({ ...session, pausedAt: undefined, pausedDuration: pausedDuration + Date.now() - pausedAt })
    : onChange({ ...session, pausedAt: Date.now() });
  const clock = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const sessionDate = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(session.started));
  const hasLoggedSets = exercises.some((exercise) => exercise.sets.some((set) => set.weight || set.reps));
  const finish = () => {
    const completed = exercises.map((exercise) => ({ ...exercise, sets: exercise.sets.filter((set) => set.weight || set.reps).map(({ id, weight, reps }) => ({ id, weight, reps })) })).filter((exercise) => exercise.sets.length);
    if (!completed.length) return;
    onSave({ id: Date.now(), date: new Date().toISOString(), duration: `${Math.max(1, Math.ceil(elapsed / 60))} min`, exercises: completed });
  };
  return <div className="screen new-screen">
    <header className="topbar"><div><h1>New Workout</h1></div><div className="workout-actions"><div className="header-menu-wrap" ref={workoutMenuRef}><button className="header-more" aria-label="Workout options" aria-expanded={workoutMenuOpen} onClick={() => setWorkoutMenuOpen(!workoutMenuOpen)}>•••</button>{workoutMenuOpen && <div className="header-menu"><button onClick={() => { setWorkoutMenuOpen(false); setDialog("discard"); }}><span className="danger-icon" aria-hidden="true" /> Discard Workout</button></div>}</div><button className="finish" onClick={() => setDialog("finish")}>Finish Workout</button></div></header>
    <div className={`session-strip ${pausedAt ? "paused" : ""}`}><div className="session-copy"><b>{pausedAt ? "Workout paused" : "Workout in progress"}</b><span>{sessionDate}</span></div><div className="session-controls"><span className="timer">{clock}</span><button className={pausedAt ? "resume" : "pause"} aria-label={pausedAt ? "Resume workout" : "Pause workout"} title={pausedAt ? "Resume workout" : "Pause workout"} onClick={togglePause}><span className={pausedAt ? "play-glyph" : "pause-glyph"} aria-hidden="true" /></button></div></div>
    <main>
      {exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} onChange={(next) => setExercises(exercises.map((item) => item.id === exercise.id ? next : item))} onDelete={() => setExercises(exercises.filter((item) => item.id !== exercise.id))} />)}
      <SearchExercise used={exercises.map((e) => e.name)} onSelect={(name) => setExercises([...exercises, { id: Date.now(), name, sets: blankSets() }])} />
      <p className="finish-hint">Add weight and reps, then tap Finish Workout to save.</p>
    </main>
    {dialog && <div className="action-backdrop" onMouseDown={() => setDialog(null)}><section className="action-sheet" role="dialog" aria-modal="true" aria-labelledby="action-title" onMouseDown={(e) => e.stopPropagation()}><div className={`action-mark ${dialog}`} aria-hidden="true">{dialog === "finish" ? "✓" : "!"}</div><h2 id="action-title">{dialog === "finish" ? "Finish Workout?" : "Discard Workout?"}</h2><p>{dialog === "finish" ? (hasLoggedSets ? "This workout will be saved to your history." : "Log at least one set before finishing your workout.") : "Your exercises and set data from this session will be permanently removed."}</p><div className="action-sheet-buttons"><button className="cancel-action" onClick={() => setDialog(null)}>Cancel</button><button className={dialog === "discard" ? "destructive-action" : "confirm-action"} disabled={dialog === "finish" && !hasLoggedSets} onClick={() => { setDialog(null); dialog === "finish" ? finish() : onDiscard(); }}>{dialog === "finish" ? "Finish Workout" : "Discard"}</button></div></section></div>}
  </div>;
}

function Workouts({ workouts, onUpdate }: { workouts: Workout[]; onUpdate: (workout: Workout) => void }) {
  const [selected, setSelected] = useState<Workout | null>(null);
  const [draft, setDraft] = useState<Workout | null>(null);
  const editSet = (exerciseId: number, setId: number, field: "weight" | "reps", value: string) => setDraft((current) => current ? ({ ...current, exercises: current.exercises.map((exercise) => exercise.id === exerciseId ? ({ ...exercise, sets: exercise.sets.map((set) => set.id === setId ? { ...set, [field]: value } : set) }) : exercise) }) : current);
  if (selected) {
    const viewing = draft ?? selected;
    return <div className="screen detail-screen">
    <header className="detail-nav">{draft ? <button onClick={() => setDraft(null)}>Cancel</button> : <button onClick={() => setSelected(null)}>‹ Workouts</button>}<span>{draft ? "Edit Workout" : "Workout"}</span>{draft ? <button className="save-edit" onClick={() => { onUpdate(draft); setSelected(draft); setDraft(null); }}>Save</button> : <button onClick={() => setDraft(structuredClone(selected))}>Edit</button>}</header>
    <main>
      <div className="detail-hero"><h1>{fmtDate(viewing.date)}</h1><p>{fmtTime(viewing.date)} · {viewing.duration}</p></div>
      <div className="summary-grid"><div><b>{viewing.exercises.length}</b><span>Exercises</span></div><div><b>{viewing.exercises.reduce((n, e) => n + e.sets.length, 0)}</b><span>Total Sets</span></div><div><b>{Math.round(viewing.exercises.reduce((n, e) => n + e.sets.reduce((v, s) => v + Number(s.weight || 0) * Number(s.reps || 0), 0), 0) / 1000)}k</b><span>Volume (lb)</span></div></div>
      {viewing.exercises.map((exercise) => <section className={`history-exercise ${draft ? "editing" : ""}`} key={exercise.id}><h2>{exercise.name}</h2><div className="history-head"><span>SET</span><span>WEIGHT (LB)</span><span>REPS</span></div>{exercise.sets.map((set, i) => <div className="history-row" key={set.id}><span>{i + 1}</span>{draft ? <><input inputMode="decimal" aria-label={`${exercise.name}, set ${i + 1}, weight`} value={set.weight} onChange={(event) => editSet(exercise.id, set.id, "weight", event.target.value)} /><input inputMode="numeric" aria-label={`${exercise.name}, set ${i + 1}, reps`} value={set.reps} onChange={(event) => editSet(exercise.id, set.id, "reps", event.target.value)} /></> : <><b>{set.weight || "—"} lb</b><b>{set.reps || "—"}</b></>}</div>)}</section>)}
    </main>
  </div>;
  }
  return <div className="screen"><header className="page-header"><div><h1>Workouts</h1></div></header><main>
    <div className="month-row"><h2>Recent</h2><span>{workouts.length} workouts</span></div>
    <div className="workout-list">{workouts.map((workout) => <button key={workout.id} onClick={() => setSelected(workout)}><span className="calendar-icon"><small>{new Date(workout.date).toLocaleString("en-US", { month: "short" }).toUpperCase()}</small><b>{new Date(workout.date).getDate()}</b></span><span className="workout-copy"><b>{workout.exercises.map((e) => e.name).slice(0, 2).join(", ")}</b><small>{fmtTime(workout.date)} · {workout.duration} · {workout.exercises.reduce((n, e) => n + e.sets.length, 0)} sets</small></span><span className="chevron">›</span></button>)}</div>
  </main></div>;
}

function TrendChart({ points, tone, onSelect }: { points: { date: string; weight: number; reps: number }[]; tone: "positive" | "negative" | "neutral"; onSelect: (point: { date: string; weight: number; reps: number } | null) => void }) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const left = 72, right = 288, top = 24, bottom = 166;
  const rawMinW = Math.min(...points.map((p) => p.weight)), rawMaxW = Math.max(...points.map((p) => p.weight));
  const minW = Math.max(0, Math.floor((rawMinW - 5) / 5) * 5), maxW = Math.max(minW + 5, Math.ceil((rawMaxW + 5) / 5) * 5);
  const gridLines = [top, top + (bottom - top) / 3, top + ((bottom - top) * 2) / 3, bottom];
  const x = (i: number) => left + (points.length === 1 ? 0 : i * (right - left) / (points.length - 1));
  const y = (value: number, min: number, max: number) => bottom - ((value - min) / Math.max(1, max - min)) * (bottom - top);
  const tickValue = (line: number, min: number, max: number) => max - ((line - top) / (bottom - top)) * (max - min);
  const barWidth = Math.min(28, 144 / Math.max(1, points.length));
  const tooltipLeft = activePoint === null ? 50 : Math.min(78, Math.max(22, (x(activePoint) / 320) * 100));
  const selectPoint = (index: number) => { setActivePoint(index); onSelect(points[index]); };
  const clearPoint = () => { setActivePoint(null); onSelect(null); };
  return <div className="chart-wrap" onMouseLeave={clearPoint}>
    {activePoint !== null && <div className="chart-tooltip" style={{ left: `${tooltipLeft}%` }}><strong>{new Date(points[activePoint].date).toLocaleString("en-US", { month: "short", day: "numeric" })}</strong><span>Avg. weight <b>{points[activePoint].weight.toFixed(1)} lb</b></span><span>Avg. reps <b>{points[activePoint].reps.toFixed(1)}</b></span></div>}
    <svg viewBox="0 0 320 205" role="img" aria-label="Average weight by workout session">
    {gridLines.map((line) => <g key={line}><line x1={left} x2={right} y1={line} y2={line} className="gridline" /><text x={left - barWidth / 2 - 8} y={line + 3} textAnchor="end" className="weight-axis">{Math.round(tickValue(line, minW, maxW))}</text></g>)}
    {activePoint !== null && <line x1={x(activePoint)} x2={x(activePoint)} y1={top} y2={bottom} className="hover-guide" />}
    {points.map((p, i) => <g key={p.date}><rect x={x(i) - barWidth / 2} y={y(p.weight, minW, maxW)} width={barWidth} height={bottom - y(p.weight, minW, maxW)} rx="5" className={`weight-bar ${tone} ${activePoint === i ? "selected" : ""}`}/><text x={x(i)} y="194" textAnchor="middle">{new Date(p.date).toLocaleString("en-US", { month: "short", day: "numeric" })}</text></g>)}
    </svg>
    {points.map((point, i) => <button key={point.date} className="chart-point-target" style={{ left: `${(x(i) / 320) * 100}%` }} aria-label={`${new Date(point.date).toLocaleString("en-US", { month: "long", day: "numeric" })}: average weight ${point.weight.toFixed(1)} pounds, average reps ${point.reps.toFixed(1)}`} onMouseEnter={() => selectPoint(i)} onFocus={() => selectPoint(i)} onBlur={clearPoint} onClick={() => activePoint === i ? clearPoint() : selectPoint(i)} />)}
  </div>;
}

function TrendSparkBars({ values, tone }: { values: number[]; tone: "positive" | "negative" | "neutral" }) {
  const min = Math.min(...values), max = Math.max(...values);
  return <div className={`trend-sparkbars ${tone}`} aria-hidden="true">{values.map((value, index) => {
    const height = 28 + ((value - min) / Math.max(1, max - min)) * 72;
    return <i key={`${value}-${index}`} style={{ height: `${height}%` }} />;
  })}</div>;
}

function Trends({ workouts }: { workouts: Workout[] }) {
  const available = useMemo(() => Array.from(new Set(workouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.name)))), [workouts]);
  const [exercise, setExercise] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ date: string; weight: number; reps: number } | null>(null);
  const pointsFor = (name: string) => workouts.slice().reverse().flatMap((workout) => workout.exercises.filter((entry) => entry.name === name).map((entry) => ({ date: workout.date, weight: entry.sets.reduce((total, set) => total + Number(set.weight || 0), 0) / entry.sets.length, reps: entry.sets.reduce((total, set) => total + Number(set.reps || 0), 0) / entry.sets.length, setWeights: entry.sets.map((set) => Number(set.weight)).filter(Boolean) }))).slice(-5);
  const summaries = available.map((name) => {
    const points = pointsFor(name);
    const latest = points.at(-1), first = points[0];
    const change = latest && first && points.length > 1 ? ((latest.weight - first.weight) / Math.max(1, first.weight)) * 100 : null;
    return { name, points, latest, change };
  });
  if (!exercise) return <div className="screen"><header className="page-header"><div><h1>Trends</h1></div></header><main className="trends-overview"><p className="trends-intro">AVERAGE WEIGHT BY EXERCISE</p><div className="trend-summary-list">{summaries.map((summary) => {
    const tone = summary.change === null || summary.change === 0 ? "neutral" : summary.change > 0 ? "positive" : "negative";
    const icon = summary.change === null || summary.change === 0 ? "→" : summary.change > 0 ? "↗" : "↘";
    return <button key={summary.name} aria-label={`View ${summary.name} trend`} onClick={() => { setExercise(summary.name); setSelectedPoint(null); }}>
      <div className="trend-summary-head"><b>{summary.name}</b><span className={`summary-change ${tone}`}>{summary.change === null ? "Not enough data" : `${icon} ${Math.abs(Math.round(summary.change))}%`}</span></div>
      <div className="trend-summary-body"><div className="trend-summary-metric"><small>LATEST AVERAGE</small><strong>{summary.latest ? Math.round(summary.latest.weight) : "—"}<span>{summary.latest ? " lb" : ""}</span></strong><p>{summary.points.length} {summary.points.length === 1 ? "session" : "sessions"}</p></div><TrendSparkBars values={summary.points.map((point) => point.weight)} tone={tone} /></div>
    </button>;
  })}{summaries.length === 0 && <div className="trends-empty">Complete a workout to see exercise trends.</div>}</div></main></div>;

  const points = pointsFor(exercise);
  const latest = points.at(-1), first = points[0];
  const displayPoint = selectedPoint ?? latest;
  const change = latest && first ? ((latest.weight - first.weight) / Math.max(1, first.weight)) * 100 : 0;
  const trendTone = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
  const trendIcon = change > 0 ? "↗" : change < 0 ? "↘" : "→";
  const insight = (() => {
    if (!latest || points.length < 2) return null;
    const previous = points.at(-2)!;
    const earlier = points.at(-3);
    const previousBest = Math.max(...points.slice(0, -1).map((point) => point.weight));
    if (latest.weight > previousBest) return { tone: "achievement", icon: "★", title: "New personal best", copy: `Your latest ${Math.round(latest.weight)} lb average is the highest across ${points.length} logged sessions.` };
    if (latest.weight > previous.weight * 1.02 && latest.reps < previous.reps * .92) return { tone: "caution", icon: "⇄", title: "Weight up, reps down", copy: `You lifted more than last session, while average reps decreased from ${previous.reps.toFixed(1)} to ${latest.reps.toFixed(1)}.` };
    if (earlier && previous.weight < earlier.weight * .98 && latest.weight > previous.weight * 1.02) return { tone: "recovery", icon: "↗", title: "Performance rebounded", copy: "Your average weight recovered after dipping in the previous session." };
    if (points.length >= 4) {
      const weights = points.slice(-4).map((point) => point.weight);
      const average = weights.reduce((total, weight) => total + weight, 0) / weights.length;
      if ((Math.max(...weights) - Math.min(...weights)) / Math.max(1, average) <= .02) return { tone: "neutral", icon: "→", title: "Progress has plateaued", copy: "Average weight has stayed within 2% across your last four sessions." };
    }
    return null;
  })();
  return <div className="screen trend-detail-screen"><header className="detail-nav"><button onClick={() => { setExercise(null); setSelectedPoint(null); }}>‹ Trends</button><span>Exercise Trend</span><span /></header><main><h1 className="trend-detail-title">{exercise}</h1><section className="trend-card"><div className="trend-heading"><div><small>{selectedPoint ? `${new Date(selectedPoint.date).toLocaleString("en-US", { month: "short", day: "numeric" }).toUpperCase()} AVERAGE` : "LATEST AVERAGE WEIGHT"}</small><h2>{displayPoint ? Math.round(displayPoint.weight) : 0}<span> lb</span></h2><p className="trend-reps">{displayPoint ? `${displayPoint.reps.toFixed(1)} average reps` : "No reps recorded"}</p></div>{latest && first && <span className={`gain ${trendTone}`}>{trendIcon} {Math.abs(Math.round(change))}%<small>since {new Date(first.date).toLocaleString("en-US", { month: "short", day: "numeric" })}</small></span>}</div>{points.length ? <TrendChart points={points} tone={trendTone} onSelect={setSelectedPoint} /> : <div className="no-data">Complete this exercise to see a trend.</div>}</section>{insight && <section className={`insight ${insight.tone}`}><span>{insight.icon}</span><div><b>{insight.title}</b><p>{insight.copy}</p></div></section>}<div className="stat-pair"><div><span>LAST SESSION</span><b className="set-weights">{latest?.setWeights.length ? latest.setWeights.join(" · ") : "—"}</b><small>set weights (lb)</small></div><div><span>SESSIONS</span><b>{points.length}</b><small>logged</small></div></div></main></div>;
}

function TabBar({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  const items: { id: Tab; icon: string; label: string }[] = [{ id: "new", icon: "＋", label: "New Workout" }, { id: "workouts", icon: "▤", label: "Workouts" }, { id: "trends", icon: "↗", label: "Trends" }];
  return <nav className="tabbar" aria-label="Main navigation">{items.map((item) => <button className={tab === item.id ? "active" : ""} key={item.id} onClick={() => onTab(item.id)}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("new");
  const [workouts, setWorkouts] = useState<Workout[]>(starterWorkouts);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  useEffect(() => { const saved = localStorage.getItem("form-workouts"); if (saved) { try { setWorkouts(JSON.parse(saved)); } catch {} } }, []);
  const save = (workout: Workout) => { const next = [workout, ...workouts]; setWorkouts(next); localStorage.setItem("form-workouts", JSON.stringify(next)); setSession(null); setTab("workouts"); };
  const updateWorkout = (workout: Workout) => { const next = workouts.map((item) => item.id === workout.id ? workout : item); setWorkouts(next); localStorage.setItem("form-workouts", JSON.stringify(next)); };
  const startWorkout = (template?: Workout) => {
    const now = Date.now();
    const exercises = template ? template.exercises.map((exercise, exerciseIndex) => ({ id: now + exerciseIndex, name: exercise.name, sets: exercise.sets.map((set, setIndex) => ({ id: now + ((exerciseIndex + 1) * 100) + setIndex, weight: "", reps: "", previousWeight: set.weight, previousReps: set.reps })) })) : [];
    setSession({ started: now, pausedDuration: 0, exercises });
  };
  return <div className="app-canvas"><div className="phone"><div className="statusbar"><span>9:41</span><span className="island" /><span>◖ ᯤ ▰</span></div>
    {tab === "new" && <NewWorkout session={session} workouts={workouts} onStart={startWorkout} onChange={setSession} onSave={save} onDiscard={() => setSession(null)} />}{tab === "workouts" && <Workouts workouts={workouts} onUpdate={updateWorkout} />}{tab === "trends" && <Trends workouts={workouts} />}
    <TabBar tab={tab} onTab={setTab} />
  </div></div>;
}
