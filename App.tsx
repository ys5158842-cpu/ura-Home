// =============================================================================
// Aura Home — Smart Home Control Panel
// All application code (types, data, i18n, components, main App) in one file.
// =============================================================================

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Home, Plane, Globe, Moon, Sun, ChevronDown, Check,
  Search, X, Zap, Activity, Gauge, Wifi, WifiOff, Power,
  Lightbulb, Wind, Tv, Speaker, Camera, Lock, Fan, Bot, Blinds, Plug,
  Sofa, ChefHat, BedDouble, Trees, LayoutGrid,
  BarChart3, DollarSign, Clock, TrendingUp, TrendingDown,
} from "lucide-react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type LangCode = "en" | "ar" | "fr" | "es" | "de";

interface Translation {
  appName: string; tagline: string; search: string; searchPlaceholder: string;
  rooms: string; awayMode: string; awayModeActive: string; awayModeHint: string;
  allRooms: string; online: string; offline: string; on: string; off: string;
  energyUsage: string; totalConsumption: string; activeDevices: string;
  temperature: string; brightness: string; volume: string; speed: string;
  devices: string; device: string; welcomeHome: string; welcomeAway: string;
  settings: string; language: string; theme: string; light: string; dark: string;
  addDevice: string; noDevices: string; connected: string; disconnected: string;
  watts: string; onlineDevices: string; offlineDevices: string;
  systemStatus: string; good: string; normal: string; high: string;
  energyDashboard: string; controlPanel: string; perDevice: string;
  estimatedCost: string; hourlyCost: string; dailyCost: string; monthlyCost: string;
  electricityRate: string; ratePerKwh: string; rateHint: string;
  kWh: string; perHour: string; perDay: string; perMonth: string;
  consumption: string; cost: string; share: string; topConsumers: string;
  roomBreakdown: string; noConsumption: string; standby: string;
  highest: string; lowest: string; average: string;
}

type DeviceType =
  | "light" | "ac" | "tv" | "speaker" | "camera"
  | "lock" | "fan" | "robot" | "curtain" | "outlet";

interface DeviceControl {
  kind: "temperature" | "brightness" | "volume" | "speed";
  min: number; max: number; step: number; value: number; unit: string;
}

interface Device {
  id: string;
  name: Record<string, string>;
  type: DeviceType;
  on: boolean;
  online: boolean;
  watts: number;
  control?: DeviceControl;
}

interface Room {
  id: string;
  name: Record<string, string>;
  icon: string;
  devices: Device[];
}

// -----------------------------------------------------------------------------
// i18n
// -----------------------------------------------------------------------------

const LANGUAGES: { code: LangCode; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
];

const translations: Record<LangCode, Translation> = {
  en: {
    appName: "Aura Home", tagline: "Smart Home Control",
    search: "Search", searchPlaceholder: "Search devices...",
    rooms: "Rooms", awayMode: "Away Mode", awayModeActive: "Away Mode Active",
    awayModeHint: "All devices turned off", allRooms: "All Rooms",
    online: "Online", offline: "Offline", on: "On", off: "Off",
    energyUsage: "Energy", totalConsumption: "Total Consumption",
    activeDevices: "Active Devices", temperature: "Temperature",
    brightness: "Brightness", volume: "Volume", speed: "Speed",
    devices: "devices", device: "device",
    welcomeHome: "Welcome Home", welcomeAway: "You're Away",
    settings: "Settings", language: "Language", theme: "Theme",
    light: "Light", dark: "Dark", addDevice: "Add Device",
    noDevices: "No devices found", connected: "Connected",
    disconnected: "Disconnected", watts: "W",
    onlineDevices: "Online", offlineDevices: "Offline",
    systemStatus: "System Status", good: "Efficient",
    normal: "Normal", high: "High Load",
    energyDashboard: "Energy Dashboard", controlPanel: "Control Panel",
    perDevice: "Per-Device Breakdown", estimatedCost: "Estimated Cost",
    hourlyCost: "Hourly", dailyCost: "Daily", monthlyCost: "Monthly",
    electricityRate: "Electricity Rate", ratePerKwh: "$ / kWh", rateHint: "Used to estimate running costs",
    kWh: "kWh", perHour: "hr", perDay: "day", perMonth: "mo",
    consumption: "Consumption", cost: "Cost", share: "Share",
    topConsumers: "Top Consumers", roomBreakdown: "Room Breakdown",
    noConsumption: "No active consumption", standby: "Standby",
    highest: "Highest", lowest: "Lowest", average: "Average",
  },
  ar: {
    appName: "أورا هوم", tagline: "لوحة التحكم الذكية",
    search: "بحث", searchPlaceholder: "ابحث عن الأجهزة...",
    rooms: "الغرف", awayMode: "وضع المغادرة", awayModeActive: "وضع المغادرة مفعّل",
    awayModeHint: "تم إطفاء جميع الأجهزة", allRooms: "كل الغرف",
    online: "متصل", offline: "غير متصل", on: "تشغيل", off: "إيقاف",
    energyUsage: "الطاقة", totalConsumption: "إجمالي الاستهلاك",
    activeDevices: "الأجهزة النشطة", temperature: "درجة الحرارة",
    brightness: "السطوع", volume: "مستوى الصوت", speed: "السرعة",
    devices: "أجهزة", device: "جهاز",
    welcomeHome: "أهلاً بك في المنزل", welcomeAway: "أنت خارج المنزل",
    settings: "الإعدادات", language: "اللغة", theme: "المظهر",
    light: "فاتح", dark: "داكن", addDevice: "إضافة جهاز",
    noDevices: "لا توجد أجهزة", connected: "متصل",
    disconnected: "غير متصل", watts: "واط",
    onlineDevices: "متصل", offlineDevices: "غير متصل",
    systemStatus: "حالة النظام", good: "موفّر",
    normal: "عادي", high: "حمل مرتفع",
    energyDashboard: "لوحة الطاقة", controlPanel: "لوحة التحكم",
    perDevice: "تفصيل استهلاك الأجهزة", estimatedCost: "التكلفة التقديرية",
    hourlyCost: "بالساعة", dailyCost: "يومياً", monthlyCost: "شهرياً",
    electricityRate: "سعر الكهرباء", ratePerKwh: "ريال / كيلوواط ساعة", rateHint: "يُستخدم لتقدير تكاليف التشغيل",
    kWh: "كيلوواط ساعة", perHour: "ساعة", perDay: "يوم", perMonth: "شهر",
    consumption: "الاستهلاك", cost: "التكلفة", share: "الحصة",
    topConsumers: "الأكثر استهلاكاً", roomBreakdown: "تفصيل الغرف",
    noConsumption: "لا يوجد استهلاك نشط", standby: "استعداد",
    highest: "الأعلى", lowest: "الأقل", average: "المتوسط",
  },
  fr: {
    appName: "Aura Home", tagline: "Contrôle Maison Connectée",
    search: "Rechercher", searchPlaceholder: "Rechercher des appareils...",
    rooms: "Pièces", awayMode: "Mode Absent", awayModeActive: "Mode Absent Activé",
    awayModeHint: "Tous les appareils éteints", allRooms: "Toutes les pièces",
    online: "En ligne", offline: "Hors ligne", on: "Allumé", off: "Éteint",
    energyUsage: "Énergie", totalConsumption: "Consommation totale",
    activeDevices: "Appareils actifs", temperature: "Température",
    brightness: "Luminosité", volume: "Volume", speed: "Vitesse",
    devices: "appareils", device: "appareil",
    welcomeHome: "Bienvenue à la maison", welcomeAway: "Vous êtes absent",
    settings: "Paramètres", language: "Langue", theme: "Thème",
    light: "Clair", dark: "Sombre", addDevice: "Ajouter un appareil",
    noDevices: "Aucun appareil trouvé", connected: "Connecté",
    disconnected: "Déconnecté", watts: "W",
    onlineDevices: "En ligne", offlineDevices: "Hors ligne",
    systemStatus: "État du système", good: "Économe",
    normal: "Normal", high: "Charge élevée",
    energyDashboard: "Tableau de bord énergie", controlPanel: "Panneau de contrôle",
    perDevice: "Consommation par appareil", estimatedCost: "Coût estimé",
    hourlyCost: "Horaire", dailyCost: "Journalier", monthlyCost: "Mensuel",
    electricityRate: "Tarif électrique", ratePerKwh: "€ / kWh", rateHint: "Utilisé pour estimer les coûts de fonctionnement",
    kWh: "kWh", perHour: "h", perDay: "jour", perMonth: "mois",
    consumption: "Consommation", cost: "Coût", share: "Part",
    topConsumers: "Plus gros consommateurs", roomBreakdown: "Répartition par pièce",
    noConsumption: "Aucune consommation active", standby: "Veille",
    highest: "Max", lowest: "Min", average: "Moyenne",
  },
  es: {
    appName: "Aura Home", tagline: "Control del Hogar Inteligente",
    search: "Buscar", searchPlaceholder: "Buscar dispositivos...",
    rooms: "Habitaciones", awayMode: "Modo Ausente", awayModeActive: "Modo Ausente Activado",
    awayModeHint: "Todos los dispositivos apagados", allRooms: "Todas las habitaciones",
    online: "En línea", offline: "Desconectado", on: "Encendido", off: "Apagado",
    energyUsage: "Energía", totalConsumption: "Consumo total",
    activeDevices: "Dispositivos activos", temperature: "Temperatura",
    brightness: "Brillo", volume: "Volumen", speed: "Velocidad",
    devices: "dispositivos", device: "dispositivo",
    welcomeHome: "Bienvenido a casa", welcomeAway: "Estás fuera",
    settings: "Ajustes", language: "Idioma", theme: "Tema",
    light: "Claro", dark: "Oscuro", addDevice: "Añadir dispositivo",
    noDevices: "No se encontraron dispositivos", connected: "Conectado",
    disconnected: "Desconectado", watts: "W",
    onlineDevices: "En línea", offlineDevices: "Desconectados",
    systemStatus: "Estado del sistema", good: "Eficiente",
    normal: "Normal", high: "Carga alta",
    energyDashboard: "Panel de energía", controlPanel: "Panel de control",
    perDevice: "Consumo por dispositivo", estimatedCost: "Costo estimado",
    hourlyCost: "Por hora", dailyCost: "Diario", monthlyCost: "Mensual",
    electricityRate: "Tarifa eléctrica", ratePerKwh: "€ / kWh", rateHint: "Se usa para estimar los costos de funcionamiento",
    kWh: "kWh", perHour: "h", perDay: "día", perMonth: "mes",
    consumption: "Consumo", cost: "Costo", share: "Participación",
    topConsumers: "Mayores consumidores", roomBreakdown: "Desglose por habitación",
    noConsumption: "Sin consumo activo", standby: "En espera",
    highest: "Máx", lowest: "Mín", average: "Promedio",
  },
  de: {
    appName: "Aura Home", tagline: "Smart Home Steuerung",
    search: "Suche", searchPlaceholder: "Geräte suchen...",
    rooms: "Räume", awayMode: "Abwesend-Modus", awayModeActive: "Abwesend-Modus aktiv",
    awayModeHint: "Alle Geräte ausgeschaltet", allRooms: "Alle Räume",
    online: "Online", offline: "Offline", on: "An", off: "Aus",
    energyUsage: "Energie", totalConsumption: "Gesamtverbrauch",
    activeDevices: "Aktive Geräte", temperature: "Temperatur",
    brightness: "Helligkeit", volume: "Lautstärke", speed: "Geschwindigkeit",
    devices: "Geräte", device: "Gerät",
    welcomeHome: "Willkommen zu Hause", welcomeAway: "Du bist weg",
    settings: "Einstellungen", language: "Sprache", theme: "Design",
    light: "Hell", dark: "Dunkel", addDevice: "Gerät hinzufügen",
    noDevices: "Keine Geräte gefunden", connected: "Verbunden",
    disconnected: "Getrennt", watts: "W",
    onlineDevices: "Online", offlineDevices: "Offline",
    systemStatus: "Systemstatus", good: "Spar",
    normal: "Normal", high: "Hohe Last",
    energyDashboard: "Energie-Dashboard", controlPanel: "Steuerung",
    perDevice: "Verbrauch pro Gerät", estimatedCost: "Geschätzte Kosten",
    hourlyCost: "Stündlich", dailyCost: "Täglich", monthlyCost: "Monatlich",
    electricityRate: "Stromtarif", ratePerKwh: "€ / kWh", rateHint: "Zur Schätzung der Betriebskosten",
    kWh: "kWh", perHour: "Std", perDay: "Tag", perMonth: "Monat",
    consumption: "Verbrauch", cost: "Kosten", share: "Anteil",
    topConsumers: "Größte Verbraucher", roomBreakdown: "Aufschlüsselung nach Raum",
    noConsumption: "Kein aktiver Verbrauch", standby: "Standby",
    highest: "Höchst", lowest: "Niedrigst", average: "Durchschnitt",
  },
};

// -----------------------------------------------------------------------------
// Seed data
// -----------------------------------------------------------------------------

const initialRooms: Room[] = [
  {
    id: "living-room",
    name: { en: "Living Room", ar: "غرفة المعيشة", fr: "Salon", es: "Salón", de: "Wohnzimmer" },
    icon: "Sofa",
    devices: [
      { id: "lr-light", name: { en: "Ceiling Light", ar: "إضاءة السقف", fr: "Lumière plafond", es: "Luz de techo", de: "Deckenlicht" }, type: "light", on: true, online: true, watts: 12, control: { kind: "brightness", min: 0, max: 100, step: 1, value: 75, unit: "%" } },
      { id: "lr-ac", name: { en: "Air Conditioner", ar: "مكيف الهواء", fr: "Climatiseur", es: "Aire acondicionado", de: "Klimaanlage" }, type: "ac", on: true, online: true, watts: 1200, control: { kind: "temperature", min: 16, max: 30, step: 1, value: 22, unit: "°C" } },
      { id: "lr-tv", name: { en: "Smart TV", ar: "التلفزيون الذكي", fr: "TV connectée", es: "Smart TV", de: "Smart TV" }, type: "tv", on: false, online: true, watts: 90, control: { kind: "volume", min: 0, max: 100, step: 1, value: 30, unit: "%" } },
      { id: "lr-speaker", name: { en: "Soundbar", ar: "مكبر الصوت", fr: "Barre de son", es: "Barra de sonido", de: "Soundbar" }, type: "speaker", on: false, online: true, watts: 35, control: { kind: "volume", min: 0, max: 100, step: 1, value: 40, unit: "%" } },
    ],
  },
  {
    id: "kitchen",
    name: { en: "Kitchen", ar: "المطبخ", fr: "Cuisine", es: "Cocina", de: "Küche" },
    icon: "ChefHat",
    devices: [
      { id: "kit-light", name: { en: "Under-Cabinet Lights", ar: "إضاءة الخزائن", fr: "Éclairage sous meuble", es: "Luces bajo armario", de: "Unterschranklicht" }, type: "light", on: true, online: true, watts: 8, control: { kind: "brightness", min: 0, max: 100, step: 1, value: 60, unit: "%" } },
      { id: "kit-outlet", name: { en: "Coffee Maker", ar: "صانعة القهوة", fr: "Machine à café", es: "Cafetera", de: "Kaffeemaschine" }, type: "outlet", on: false, online: true, watts: 800 },
      { id: "kit-robot", name: { en: "Robot Vacuum", ar: "مكنسة روبوت", fr: "Aspirateur robot", es: "Robot aspirador", de: "Roboter-Staubsauger" }, type: "robot", on: false, online: true, watts: 40, control: { kind: "speed", min: 1, max: 3, step: 1, value: 2, unit: "%" } },
    ],
  },
  {
    id: "bedroom",
    name: { en: "Bedroom", ar: "غرفة النوم", fr: "Chambre", es: "Dormitorio", de: "Schlafzimmer" },
    icon: "BedDouble",
    devices: [
      { id: "bd-light", name: { en: "Bedside Lamp", ar: "مصباح السرير", fr: "Lampe de chevet", es: "Lámpara de noche", de: "Nachttischlampe" }, type: "light", on: false, online: true, watts: 6, control: { kind: "brightness", min: 0, max: 100, step: 1, value: 50, unit: "%" } },
      { id: "bd-fan", name: { en: "Ceiling Fan", ar: "مروحة السقف", fr: "Ventilateur plafond", es: "Ventilador de techo", de: "Deckenventilator" }, type: "fan", on: true, online: true, watts: 45, control: { kind: "speed", min: 0, max: 5, step: 1, value: 3, unit: "%" } },
      { id: "bd-curtain", name: { en: "Smart Curtains", ar: "ستائر ذكية", fr: "Rideaux connectés", es: "Cortinas inteligentes", de: "Smart Vorhänge" }, type: "curtain", on: false, online: true, watts: 15, control: { kind: "brightness", min: 0, max: 100, step: 1, value: 100, unit: "%" } },
    ],
  },
  {
    id: "garden",
    name: { en: "Garden", ar: "الحديقة", fr: "Jardin", es: "Jardín", de: "Garten" },
    icon: "Trees",
    devices: [
      { id: "gdn-light", name: { en: "Garden Lights", ar: "إضاءة الحديقة", fr: "Éclairage jardin", es: "Luces de jardín", de: "Gartenbeleuchtung" }, type: "light", on: false, online: true, watts: 20, control: { kind: "brightness", min: 0, max: 100, step: 1, value: 80, unit: "%" } },
      { id: "gdn-camera", name: { en: "Security Camera", ar: "كاميرا المراقبة", fr: "Caméra de sécurité", es: "Cámara de seguridad", de: "Sicherheitskamera" }, type: "camera", on: true, online: true, watts: 10 },
      { id: "gdn-lock", name: { en: "Gate Lock", ar: "قفل البوابة", fr: "Serrure portail", es: "Cerrojo de puerta", de: "Torverriegelung" }, type: "lock", on: true, online: true, watts: 3 },
    ],
  },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function pickName(lang: string, names: Record<string, string>): string {
  return names[lang] ?? names.en ?? Object.values(names)[0] ?? "";
}

function computeWatts(device: Device): number {
  if (!device.control) return device.watts;
  const c = device.control;
  const ratio = c.value / c.max;
  if (c.kind === "brightness" || c.kind === "volume") return Math.round(device.watts * (0.2 + 0.8 * ratio));
  if (c.kind === "speed") return Math.round(device.watts * (0.4 + 0.6 * ratio));
  if (c.kind === "temperature") {
    const coolRatio = (c.max - c.value) / (c.max - c.min);
    return Math.round(device.watts * (0.5 + 0.5 * coolRatio));
  }
  return device.watts;
}

// Icon lookup tables
const ROOM_ICONS: Record<string, typeof Sofa> = { Sofa, ChefHat, BedDouble, Trees, LayoutGrid };

const TYPE_CONFIG: Record<DeviceType, { icon: typeof Lightbulb; onColor: string; glow: string }> = {
  light: { icon: Lightbulb, onColor: "text-amber-400", glow: "shadow-amber-400/30" },
  ac: { icon: Wind, onColor: "text-sky-400", glow: "shadow-sky-400/30" },
  tv: { icon: Tv, onColor: "text-indigo-400", glow: "shadow-indigo-400/30" },
  speaker: { icon: Speaker, onColor: "text-fuchsia-400", glow: "shadow-fuchsia-400/30" },
  camera: { icon: Camera, onColor: "text-rose-400", glow: "shadow-rose-400/30" },
  lock: { icon: Lock, onColor: "text-emerald-400", glow: "shadow-emerald-400/30" },
  fan: { icon: Fan, onColor: "text-cyan-400", glow: "shadow-cyan-400/30" },
  robot: { icon: Bot, onColor: "text-violet-400", glow: "shadow-violet-400/30" },
  curtain: { icon: Blinds, onColor: "text-teal-400", glow: "shadow-teal-400/30" },
  outlet: { icon: Plug, onColor: "text-orange-400", glow: "shadow-orange-400/30" },
};

const CONTROL_LABELS: Record<string, keyof Translation> = {
  temperature: "temperature", brightness: "brightness", volume: "volume", speed: "speed",
};

const RATE_KEY = "aura-home-rate-v1";
const DEFAULT_RATE = 0.15;

function loadRate(): number {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (raw) return Number(raw) || DEFAULT_RATE;
  } catch { /* ignore */ }
  return DEFAULT_RATE;
}

function wattsToKwh(watts: number, hours: number): number {
  return (watts / 1000) * hours;
}

function formatCost(cost: number, lang: LangCode): string {
  const symbol = lang === "ar" ? "ر" : lang === "fr" || lang === "de" || lang === "es" ? "€" : "$";
  return `${cost < 0.01 && cost > 0 ? cost.toFixed(4) : cost.toFixed(2)} ${symbol}`;
}

interface DeviceEnergy {
  roomId: string;
  roomName: string;
  device: Device;
  liveWatts: number;
  kwhDay: number;
  costDay: number;
  costMonth: number;
  pct: number;
}

// -----------------------------------------------------------------------------
// Toggle component
// -----------------------------------------------------------------------------

function Toggle({ on, disabled, onClick, label }: { on: boolean; disabled?: boolean; onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-pressed={on} aria-label={label}
      className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-900 ${
        on ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_16px_-2px_rgba(16,185,129,0.5)]"
            : "bg-zinc-200 dark:bg-zinc-700"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-110"}`}>
      <span className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${on ? "translate-x-8" : "translate-x-1"}`}>
        <Power className={`h-4 w-4 ${on ? "text-emerald-600" : "text-zinc-400"}`} strokeWidth={2.5} />
      </span>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Slider component
// -----------------------------------------------------------------------------

function Slider({ label, min, max, step, value, unit, disabled, onChange }: {
  label: string; min: number; max: number; step: number;
  value: number; unit: string; disabled?: boolean; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`mt-3 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
          {value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        disabled={disabled} onChange={(e) => onChange(Number(e.target.value))}
        className="smart-slider w-full"
        style={{ background: `linear-gradient(to right, var(--accent) ${pct}%, var(--track) ${pct}%)` }}
        aria-label={label} />
      <div className="flex justify-between mt-1 text-[10px] text-zinc-400 dark:text-zinc-600">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// DeviceCard component
// -----------------------------------------------------------------------------

function DeviceCard({ device, lang, t, onToggle, onControl }: {
  device: Device; lang: string; t: Translation;
  onToggle: () => void; onControl: (v: number) => void;
}) {
  const cfg = TYPE_CONFIG[device.type];
  const Icon = cfg.icon;
  const isOn = device.on && device.online;
  const liveWatts = isOn ? computeWatts(device) : 0;

  return (
    <div className={`group relative rounded-2xl border p-4 transition-all duration-300 ${
      isOn
        ? "border-zinc-200/80 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/60 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        : "border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 shadow-sm hover:shadow-md"
    }`}>
      {isOn && <div className={`pointer-events-none absolute inset-0 rounded-2xl shadow-inner ${cfg.glow} opacity-20`} />}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
            isOn ? `bg-zinc-100 dark:bg-zinc-700/50 ${cfg.onColor}`
                 : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"
          } ${isOn && device.type === "fan" ? "animate-[spin_3s_linear_infinite]" : ""}`}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
              {pickName(lang, device.name)}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {device.online ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Wifi className="h-3 w-3" /> {t.online}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                  <WifiOff className="h-3 w-3" /> {t.offline}
                </span>
              )}
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                <Zap className="h-3 w-3" /> {liveWatts} {t.watts}
              </span>
            </div>
          </div>
        </div>
        <Toggle on={isOn} disabled={!device.online} onClick={onToggle} label={pickName(lang, device.name)} />
      </div>
      {device.control && (
        <Slider label={t[CONTROL_LABELS[device.control.kind]] as string}
          min={device.control.min} max={device.control.max} step={device.control.step}
          value={device.control.value} unit={device.control.unit}
          disabled={!isOn} onChange={onControl} />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// RoomNav component
// -----------------------------------------------------------------------------

function RoomCard({ name, Icon, active, total, activeCount, onSelect }: {
  name: string; Icon: typeof Sofa; active: boolean;
  total: number; activeCount: number; onSelect: () => void;
}) {
  return (
    <button onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl border p-3 text-start transition-all duration-300 ${
        active
          ? "border-emerald-400 dark:border-emerald-500/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 shadow-md"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 hover:shadow-md"
      }`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
          active ? "bg-emerald-500 text-white"
                 : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
        }`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <span className={`text-[10px] font-bold tabular-nums ${active ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
          {activeCount}/{total}
        </span>
      </div>
      <p className={`mt-2 text-xs font-semibold truncate ${active ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-200"}`}>
        {name}
      </p>
    </button>
  );
}

function RoomNav({ rooms, activeRoom, lang, t, onSelect }: {
  rooms: Room[]; activeRoom: string; lang: string; t: Translation; onSelect: (id: string) => void;
}) {
  const totalCount = rooms.reduce((n, r) => n + r.devices.length, 0);
  const totalActive = rooms.reduce((n, r) => n + r.devices.filter((d) => d.on && d.online).length, 0);

  return (
    <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <RoomCard name={t.allRooms} Icon={LayoutGrid} active={activeRoom === "all"}
        total={totalCount} activeCount={totalActive} onSelect={() => onSelect("all")} />
      {rooms.map((r) => (
        <RoomCard key={r.id} name={r.name[lang] ?? r.name.en}
          Icon={ROOM_ICONS[r.icon] ?? LayoutGrid} active={activeRoom === r.id}
          total={r.devices.length}
          activeCount={r.devices.filter((d) => d.on && d.online).length}
          onSelect={() => onSelect(r.id)} />
      ))}
    </nav>
  );
}

// -----------------------------------------------------------------------------
// StatsBar component
// -----------------------------------------------------------------------------

function StatCard({ icon, label, value, unit, accent, pill, pillClass }: {
  icon: React.ReactNode; label: string; value: string; unit?: string;
  accent: string; pill?: boolean; pillClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3.5">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white`}>
          {icon}
        </div>
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">{label}</span>
      </div>
      {pill ? (
        <span className={`mt-2.5 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${pillClass}`}>{value}</span>
      ) : (
        <p className="mt-2 text-xl font-bold tabular-nums text-zinc-900 dark:text-white">
          {value}{unit && <span className="text-xs font-medium text-zinc-400 ms-1">{unit}</span>}
        </p>
      )}
    </div>
  );
}

function StatsBar({ t, totalWatts, activeCount, totalCount, onlineCount }: {
  t: Translation; totalWatts: number; activeCount: number; totalCount: number; onlineCount: number;
}) {
  const statusKey = totalWatts > 1500 ? "high" : totalWatts > 500 ? "normal" : "good";
  const statusColor =
    statusKey === "high" ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20"
    : statusKey === "normal" ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
    : "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard icon={<Zap className="h-4 w-4" />} label={t.totalConsumption}
        value={`${totalWatts}`} unit={t.watts} accent="from-amber-400 to-orange-500" />
      <StatCard icon={<Activity className="h-4 w-4" />} label={t.activeDevices}
        value={`${activeCount}`} unit={`/${totalCount}`} accent="from-emerald-400 to-teal-500" />
      <StatCard icon={<Wifi className="h-4 w-4" />} label={t.onlineDevices}
        value={`${onlineCount}`} unit={`/${totalCount}`} accent="from-sky-400 to-blue-500" />
      <StatCard icon={<Gauge className="h-4 w-4" />} label={t.systemStatus}
        value={t[statusKey]} pill pillClass={statusColor} accent="from-violet-400 to-fuchsia-500" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// EnergyDashboard component
// -----------------------------------------------------------------------------

function EnergyBar({ pct, colorClass }: { pct: number; colorClass: string }) {
  return (
    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function EnergyDashboard({ rooms, lang, t, rate, onRateChange }: {
  rooms: Room[]; lang: LangCode; t: Translation;
  rate: number; onRateChange: (r: number) => void;
}) {
  const devices: DeviceEnergy[] = useMemo(() => {
    const all: DeviceEnergy[] = [];
    for (const r of rooms) {
      for (const d of r.devices) {
        const liveWatts = d.on && d.online ? computeWatts(d) : 0;
        const kwhDay = wattsToKwh(liveWatts, 24);
        all.push({
          roomId: r.id,
          roomName: pickName(lang, r.name),
          device: d,
          liveWatts,
          kwhDay,
          costDay: kwhDay * rate,
          costMonth: kwhDay * 30 * rate,
          pct: 0,
        });
      }
    }
    const maxWatts = Math.max(...all.map((a) => a.liveWatts), 1);
    all.forEach((a) => { a.pct = (a.liveWatts / maxWatts) * 100; });
    return all.sort((a, b) => b.liveWatts - a.liveWatts);
  }, [rooms, lang, rate]);

  const totals = useMemo(() => {
    const totalWatts = devices.reduce((n, d) => n + d.liveWatts, 0);
    const kwhDay = wattsToKwh(totalWatts, 24);
    return {
      totalWatts,
      kwhHour: wattsToKwh(totalWatts, 1),
      kwhDay,
      kwhMonth: kwhDay * 30,
      costHour: wattsToKwh(totalWatts, 1) * rate,
      costDay: kwhDay * rate,
      costMonth: kwhDay * 30 * rate,
    };
  }, [devices, rate]);

  const roomBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; watts: number; cost: number; count: number; active: number }>();
    for (const d of devices) {
      const existing = map.get(d.roomId) ?? { name: d.roomName, watts: 0, cost: 0, count: 0, active: 0 };
      existing.watts += d.liveWatts;
      existing.cost += d.costDay;
      existing.count++;
      if (d.liveWatts > 0) existing.active++;
      map.set(d.roomId, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.watts - a.watts);
  }, [devices]);

  const maxRoomWatts = Math.max(...roomBreakdown.map((r) => r.watts), 1);
  const topConsumers = devices.filter((d) => d.liveWatts > 0).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Cost summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 p-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">{t.hourlyCost}</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
            {formatCost(totals.costHour, lang)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{totals.kwhHour.toFixed(3)} {t.kWh} / {t.perHour}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 p-5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">{t.dailyCost}</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
            {formatCost(totals.costDay, lang)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{totals.kwhDay.toFixed(2)} {t.kWh} / {t.perDay}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/10 p-5">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">{t.monthlyCost}</span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
            {formatCost(totals.costMonth, lang)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{totals.kwhMonth.toFixed(1)} {t.kWh} / {t.perMonth}</p>
        </div>
      </div>

      {/* Electricity rate input */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <DollarSign className="h-5 w-5 text-zinc-400" />
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t.electricityRate}</p>
            <p className="text-xs text-zinc-400">{t.rateHint}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="number" min={0} step={0.01} value={rate}
            onChange={(e) => onRateChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-24 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{t.ratePerKwh}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-device breakdown */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            {t.perDevice}
          </h3>
          {devices.every((d) => d.liveWatts === 0) ? (
            <p className="text-sm text-zinc-400 py-8 text-center">{t.noConsumption}</p>
          ) : (
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pe-1">
              {devices.map((d) => {
                const cfg = TYPE_CONFIG[d.device.type];
                const Icon = cfg.icon;
                const isOn = d.device.on && d.device.online;
                return (
                  <div key={d.device.id} className={`flex items-center gap-3 ${!isOn ? "opacity-50" : ""}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isOn ? `bg-zinc-100 dark:bg-zinc-800 ${cfg.onColor}` : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate">{pickName(lang, d.device.name)}</span>
                        <span className="text-xs font-bold tabular-nums text-zinc-900 dark:text-white shrink-0">{d.liveWatts} {t.watts}</span>
                      </div>
                      <div className="mt-1.5">
                        <EnergyBar pct={d.pct} colorClass={isOn ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-zinc-300 dark:bg-zinc-700"} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-zinc-400">{d.roomName}</span>
                        <span className="text-[10px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                          {formatCost(d.costDay, lang)}/{t.perDay} · {formatCost(d.costMonth, lang)}/{t.perMonth}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Room breakdown + top consumers */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-sky-500" />
              {t.roomBreakdown}
            </h3>
            <div className="space-y-3">
              {roomBreakdown.map((r) => (
                <div key={r.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{r.name}</span>
                    <div className="flex items-center gap-3 text-[10px] tabular-nums">
                      <span className="font-bold text-zinc-900 dark:text-white">{r.watts} {t.watts}</span>
                      <span className="text-zinc-500 dark:text-zinc-400">{formatCost(r.cost, lang)}/{t.perDay}</span>
                    </div>
                  </div>
                  <EnergyBar pct={(r.watts / maxRoomWatts) * 100} colorClass="bg-gradient-to-r from-sky-400 to-blue-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              {t.topConsumers}
            </h3>
            {topConsumers.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">{t.noConsumption}</p>
            ) : (
              <div className="space-y-2">
                {topConsumers.map((d, i) => {
                  const cfg = TYPE_CONFIG[d.device.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={d.device.id} className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                        i === 0 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : i === 1 ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"
                      }`}>{i + 1}</span>
                      <Icon className={`h-4 w-4 shrink-0 ${cfg.onColor}`} />
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate flex-1">{pickName(lang, d.device.name)}</span>
                      <span className="text-xs font-bold tabular-nums text-zinc-900 dark:text-white">{d.liveWatts} {t.watts}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Header component
// -----------------------------------------------------------------------------

function Header({ t, lang, onLangChange, theme, onThemeToggle, awayMode, onToggleAway, totalWatts }: {
  t: Translation; lang: LangCode; onLangChange: (l: LangCode) => void;
  theme: "light" | "dark"; onThemeToggle: () => void;
  awayMode: boolean; onToggleAway: () => void; totalWatts: number;
}) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200/70 dark:border-zinc-800/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="text-base font-bold text-zinc-900 dark:text-white leading-tight truncate">{t.appName}</h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{t.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">{totalWatts} {t.watts}</span>
          </div>

          <div className="relative" ref={langRef}>
            <button onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{current.label}</span>
              <ChevronDown className={`h-3 w-3 transition ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute end-0 mt-2 w-40 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl py-1 animate-[fadeIn_0.15s_ease]">
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => { onLangChange(l.code); setLangOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs transition ${
                      l.code === lang ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                                      : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                    }`}>
                    {l.label}
                    {l.code === lang && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={onThemeToggle} aria-label={t.theme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button onClick={onToggleAway}
            className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2 text-xs font-bold transition-all duration-300 ${
              awayMode ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30"
                       : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:brightness-110"
            }`}>
            <Plane className={`h-4 w-4 transition-transform ${awayMode ? "rotate-45" : ""}`} />
            <span className="hidden sm:inline">{awayMode ? t.awayModeActive : t.awayMode}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// -----------------------------------------------------------------------------
// Main App
// -----------------------------------------------------------------------------

const STORAGE_KEY = "aura-home-state-v1";
const SETTINGS_KEY = "aura-home-settings-v1";

interface PersistedState { rooms: Room[]; awayMode: boolean; }
interface PersistedSettings { lang: LangCode; theme: "light" | "dark"; }

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch { /* ignore */ }
  return { rooms: initialRooms, awayMode: false };
}

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as PersistedSettings;
  } catch { /* ignore */ }
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { lang: "en", theme: prefersDark ? "dark" : "light" };
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [settings, setSettings] = useState<PersistedSettings>(loadSettings);
  const [activeRoom, setActiveRoom] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"control" | "energy">("control");
  const [rate, setRate] = useState<number>(loadRate);

  const t = translations[settings.lang];
  const lang = settings.lang;
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(RATE_KEY, String(rate)); }, [rate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [settings.theme, lang, dir]);

  const { rooms, awayMode } = state;

  const stats = useMemo(() => {
    let totalWatts = 0, activeCount = 0, onlineCount = 0, totalCount = 0;
    for (const r of rooms) {
      for (const d of r.devices) {
        totalCount++;
        if (d.online) onlineCount++;
        if (d.on && d.online) { activeCount++; totalWatts += computeWatts(d); }
      }
    }
    return { totalWatts, activeCount, onlineCount, totalCount };
  }, [rooms]);

  const visibleRooms = useMemo(() => {
    let list = rooms;
    if (activeRoom !== "all") list = list.filter((r) => r.id === activeRoom);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list
        .map((r) => ({ ...r, devices: r.devices.filter((d) =>
          pickName(lang, d.name).toLowerCase().includes(q) || d.type.toLowerCase().includes(q)
        )}))
        .filter((r) => r.devices.length > 0);
    }
    return list;
  }, [rooms, activeRoom, query, lang]);

  const updateDevice = useCallback((roomId: string, deviceId: string, fn: (d: Device) => Device) => {
    setState((s) => ({
      ...s,
      rooms: s.rooms.map((r) =>
        r.id !== roomId ? r : { ...r, devices: r.devices.map((d) => (d.id !== deviceId ? d : fn(d))) }
      ),
    }));
  }, []);

  const toggleDevice = useCallback((roomId: string, deviceId: string) => {
    updateDevice(roomId, deviceId, (d) => ({ ...d, on: !d.on }));
  }, [updateDevice]);

  const setControl = useCallback((roomId: string, deviceId: string, value: number) => {
    updateDevice(roomId, deviceId, (d) => (d.control ? { ...d, control: { ...d.control, value } } : d));
  }, [updateDevice]);

  const toggleAway = useCallback(() => {
    setState((s) => {
      const turningOn = !s.awayMode;
      return {
        awayMode: turningOn,
        rooms: turningOn
          ? s.rooms.map((r) => ({ ...r, devices: r.devices.map((d) => ({ ...d, on: false })) }))
          : s.rooms,
      };
    });
  }, []);

  const cycleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const changeLang = useCallback((l: LangCode) => {
    setSettings((s) => ({ ...s, lang: l }));
  }, []);

  const changeRate = useCallback((r: number) => { setRate(r); }, []);

  const welcomeMsg = awayMode ? t.welcomeAway : t.welcomeHome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Header t={t} lang={lang} onLangChange={changeLang} theme={settings.theme}
        onThemeToggle={cycleTheme} awayMode={awayMode} onToggleAway={toggleAway}
        totalWatts={stats.totalWatts} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{welcomeMsg}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {awayMode ? t.awayModeHint : `${stats.activeCount} ${stats.activeCount === 1 ? t.device : t.devices} · ${stats.totalWatts} ${t.watts}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-zinc-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 ps-9 pe-9 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition" />
              {query && (
                <button onClick={() => setQuery("")}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
              <button onClick={() => setView("control")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  view === "control" ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}>
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.controlPanel}</span>
              </button>
              <button onClick={() => setView("energy")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  view === "energy" ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}>
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.energyDashboard}</span>
              </button>
            </div>
          </div>
        </div>

        {view === "energy" ? (
          <EnergyDashboard rooms={rooms} lang={lang} t={t} rate={rate} onRateChange={changeRate} />
        ) : (
          <>
            <StatsBar t={t} totalWatts={stats.totalWatts} activeCount={stats.activeCount}
              totalCount={stats.totalCount} onlineCount={stats.onlineCount} />

            <section>
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">{t.rooms}</h3>
              <RoomNav rooms={rooms} activeRoom={activeRoom} lang={lang} t={t} onSelect={setActiveRoom} />
            </section>

            <section className="space-y-6 pb-12">
              {visibleRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 py-16 text-center">
                  <p className="text-sm text-zinc-400">{t.noDevices}</p>
                </div>
              ) : (
                visibleRooms.map((room) => (
                  <div key={room.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                        {pickName(lang, room.name)}
                      </h3>
                      <span className="text-xs text-zinc-400">
                        {room.devices.filter((d) => d.on && d.online).length}/{room.devices.length} {t.on}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {room.devices.map((device) => (
                        <DeviceCard key={device.id} device={device} lang={lang} t={t}
                          onToggle={() => toggleDevice(room.id, device.id)}
                          onControl={(v) => setControl(room.id, device.id, v)} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
