"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createApplication } from "@/actions/applications";
import { uploadPhoto } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  Upload,
  Trash2,
  Plus,
  Pencil,
  X,
  User,
  MapPin,
  Stethoscope,
  School,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Clock,
  Loader2,
  Info,
  ImagePlus,
} from "lucide-react";
import { NIGERIAN_STATES, LGAS_BY_STATE } from "@/lib/nigeria-data";

const NATIONALITIES = [
  "Nigerian",
  "Ghanaian",
  "Cameroonian",
  "Beninese",
  "Togolese",
  "Nigerien",
  "Chadian",
  "American",
  "British",
  "Canadian",
  "Indian",
  "Chinese",
  "Pakistani",
  "Bangladeshi",
  "Egyptian",
  "South African",
  "Kenyan",
  "Other",
];

const RELIGIONS = ["Islam", "Christianity", "Traditional / Indigenous", "Other"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

function formatSchoolPeriod(fromMonth: string, fromYear: string, toMonth: string, toYear: string, toPresent: boolean): string {
  if (!fromMonth || !fromYear) return "";
  if (toPresent) return `${fromMonth} ${fromYear} – Present`;
  if (toMonth && toYear) return `${fromMonth} ${fromYear} – ${toMonth} ${toYear}`;
  return `${fromMonth} ${fromYear}`;
}

function parseSchoolPeriod(date: string): { fromMonth: string; fromYear: string; toMonth: string; toYear: string; toPresent: boolean } {
  const presentMatch = date.match(/^(.+?)\s+(\d{4})\s*–\s*Present$/i);
  if (presentMatch) {
    return { fromMonth: presentMatch[1].trim(), fromYear: presentMatch[2], toMonth: "", toYear: "", toPresent: true };
  }
  const rangeMatch = date.match(/^(.+?)\s+(\d{4})\s*–\s*(.+?)\s+(\d{4})$/);
  if (rangeMatch) {
    return { fromMonth: rangeMatch[1].trim(), fromYear: rangeMatch[2], toMonth: rangeMatch[3].trim(), toYear: rangeMatch[4], toPresent: false };
  }
  const singleMatch = date.match(/^(.+?)\s+(\d{4})$/);
  if (singleMatch) {
    return { fromMonth: singleMatch[1].trim(), fromYear: singleMatch[2], toMonth: "", toYear: "", toPresent: false };
  }
  return { fromMonth: "", fromYear: "", toMonth: "", toYear: "", toPresent: false };
}

/* ── Types ──────────────────────────────────────────────────────────────── */

type Session = {
  id: string;
  year: number;
  amount: number;
  availableClasses: string[];
};

type PreviousSchoolRow = { id: string; schoolName: string; date: string };

/* ── Shared select class ────────────────────────────────────────────────── */

/* text-base on mobile prevents iOS Safari zoom-on-focus (< 16px triggers it),
   md:text-sm restores the design size on larger screens */
const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground md:text-sm";

/* ── Section wrapper ─────────────────────────────────────────────────────── */

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 border-b border-border pb-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

export function NewApplicationForm({ sessions }: { sessions: Session[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [cameraPreviewOpen, setCameraPreviewOpen] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [previousSchools, setPreviousSchools] = useState<PreviousSchoolRow[]>([]);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolNameInput, setSchoolNameInput] = useState("");
  const [schoolFromMonth, setSchoolFromMonth] = useState("");
  const [schoolFromYear, setSchoolFromYear] = useState("");
  const [schoolToMonth, setSchoolToMonth] = useState("");
  const [schoolToYear, setSchoolToYear] = useState("");
  const [schoolToPresent, setSchoolToPresent] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");

  const activeSessionId = sessions[0]?.id ?? "";
  const lgaOptions = selectedState ? (LGAS_BY_STATE[selectedState] ?? []) : [];
  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId]
  );
  const classOptions = selectedSession?.availableClasses ?? [];

  /* ── Previous schools helpers ─────────────────────────────────────────── */

  function addOrUpdateSchool() {
    const name = schoolNameInput.trim();
    const date = formatSchoolPeriod(schoolFromMonth, schoolFromYear, schoolToMonth, schoolToYear, schoolToPresent);
    if (!name || !date) return;
    if (editingSchoolId) {
      setPreviousSchools((prev) =>
        prev.map((p) =>
          p.id === editingSchoolId ? { ...p, schoolName: name, date } : p
        )
      );
      setEditingSchoolId(null);
    } else {
      setPreviousSchools((prev) => [
        ...prev,
        { id: crypto.randomUUID(), schoolName: name, date },
      ]);
    }
    setSchoolNameInput("");
    setSchoolFromMonth("");
    setSchoolFromYear("");
    setSchoolToMonth("");
    setSchoolToYear("");
    setSchoolToPresent(false);
    setSchoolModalOpen(false);
  }

  function openEditSchool(row: PreviousSchoolRow) {
    setEditingSchoolId(row.id);
    setSchoolNameInput(row.schoolName);
    const parsed = parseSchoolPeriod(row.date);
    setSchoolFromMonth(parsed.fromMonth);
    setSchoolFromYear(parsed.fromYear);
    setSchoolToMonth(parsed.toMonth);
    setSchoolToYear(parsed.toYear);
    setSchoolToPresent(parsed.toPresent);
    setSchoolModalOpen(true);
  }

  function deleteSchool(id: string) {
    setPreviousSchools((prev) => prev.filter((p) => p.id !== id));
    if (editingSchoolId === id) {
      setEditingSchoolId(null);
      setSchoolModalOpen(false);
      setSchoolNameInput("");
      setSchoolFromMonth("");
      setSchoolFromYear("");
      setSchoolToMonth("");
      setSchoolToYear("");
      setSchoolToPresent(false);
    }
  }

  const schoolDateValid =
    !!schoolNameInput.trim() &&
    !!schoolFromMonth &&
    !!schoolFromYear &&
    (schoolToPresent || (!!schoolToMonth && !!schoolToYear));

  useEffect(() => {
    if (!editingSchoolId && schoolModalOpen) {
      setSchoolNameInput("");
      setSchoolFromMonth("");
      setSchoolFromYear("");
      setSchoolToMonth("");
      setSchoolToYear("");
      setSchoolToPresent(false);
    }
  }, [schoolModalOpen, editingSchoolId]);

  /* ── Cloudinary upload helper ────────────────────────────────────────── */

  async function handlePhotoSelected(dataUrl: string) {
    // Show preview immediately (base64), then swap for cloud URL when available
    setPhotoUrl(dataUrl);
    setPhotoUploading(true);
    try {
      const result = await uploadPhoto(dataUrl);
      if (!("error" in result)) {
        setPhotoUrl(result.url);
      }
      // If there is an error, keep the local preview and log silently.
      // We avoid surfacing low-level storage errors to parents.
    } finally {
      setPhotoUploading(false);
    }
  }

  /* ── Form submit ─────────────────────────────────────────────────────── */

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const sessionId = activeSessionId;
    const firstName = (
      form.elements.namedItem("firstName") as HTMLInputElement
    ).value.trim();
    const lastName = (
      form.elements.namedItem("lastName") as HTMLInputElement
    ).value.trim();
    const middleName =
      (form.elements.namedItem("middleName") as HTMLInputElement)?.value?.trim() ??
      "";
    const wardDob = (form.elements.namedItem("wardDob") as HTMLInputElement)
      .value;
    const wardGender = (
      form.elements.namedItem("wardGender") as HTMLSelectElement
    ).value;
    const selectedClass =
      (
        form.elements.namedItem("class") as HTMLSelectElement
      )?.value?.trim() ?? "";
    const stateOfOrigin =
      (
        form.elements.namedItem("stateOfOrigin") as HTMLSelectElement
      )?.value?.trim() ?? "";
    const lga =
      (form.elements.namedItem("lga") as HTMLSelectElement)?.value?.trim() ?? "";
    const nationality =
      (
        form.elements.namedItem("nationality") as HTMLSelectElement
      )?.value?.trim() ?? "";
    const religion =
      (
        form.elements.namedItem("religion") as HTMLSelectElement
      )?.value?.trim() ?? "";
    const medicalInfo =
      (
        form.elements.namedItem("medicalInfo") as HTMLInputElement
      )?.value?.trim() ?? "";

    if (!sessionId || !firstName || !lastName || !wardDob || !wardGender) {
      setError(
        "Please fill in all required fields: first name, last name, date of birth, and gender."
      );
      setLoading(false);
      return;
    }
    if (!selectedClass && classOptions.length > 0) {
      setError("Please select a class.");
      setLoading(false);
      return;
    }
    if (classOptions.length === 0) {
      setError("No classes configured for this session.");
      setLoading(false);
      return;
    }

    const result = await createApplication(sessionId, {
      firstName,
      lastName,
      middleName: middleName || undefined,
      wardDob,
      wardGender,
      selectedClass: selectedClass || classOptions[0],
      stateOfOrigin: stateOfOrigin || undefined,
      lga: lga || undefined,
      nationality: nationality || undefined,
      religion: religion || undefined,
      medicalInfo: medicalInfo || undefined,
      photoUrl: photoUrl || undefined,
      previousSchools: previousSchools.map((p) => ({
        schoolName: p.schoolName,
        date: p.date,
      })),
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.applicationId) setApplicationId(result.applicationId);
    setLoading(false);
    toast.success("Application submitted successfully");
    setShowSuccessDialog(true);
  }

  /* ── Camera helpers ──────────────────────────────────────────────────── */

  function stopCameraStream() {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }

  function openCameraPreview() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      toast.error("Camera not supported on this device");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        cameraStreamRef.current = stream;
        setCameraPreviewOpen(true);
      })
      .catch(() => toast.error("Could not access camera. Check permissions."));
  }

  const setCameraVideoRef = useCallback((node: HTMLVideoElement | null) => {
    cameraVideoRef.current = node;
    if (!node) return;
    const stream = cameraStreamRef.current;
    if (stream) {
      node.srcObject = stream;
      node.play().catch(() => {});
    }
  }, []);

  function confirmCameraCapture() {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth) {
      toast.error("Wait for the camera to load fully");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stopCameraStream();
    setCameraPreviewOpen(false);
    setCapturedDataUrl(dataUrl);
    setShowRetakeModal(true);
  }

  function handleRetake() {
    setCapturedDataUrl(null);
    setShowRetakeModal(false);
    openCameraPreview();
  }

  async function handleUsePhoto() {
    if (!capturedDataUrl) return;
    await handlePhotoSelected(capturedDataUrl);
    setCapturedDataUrl(null);
    setShowRetakeModal(false);
  }

  function closeCameraPreview() {
    stopCameraStream();
    setCameraPreviewOpen(false);
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <>
      {/* ── Camera preview dialog ───────────────────────────────────────── */}
      <Dialog
        open={cameraPreviewOpen}
        onOpenChange={(open) => {
          if (!open) closeCameraPreview();
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 p-4 sm:p-6">
          <DialogTitle>Take applicant photo</DialogTitle>
          <DialogDescription>
            Position the applicant in the frame, then tap Capture.
          </DialogDescription>
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted">
            <video
              ref={setCameraVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              aria-label="Live camera preview"
            />
            {/* Corner guides */}
            <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-dashed border-white/40" />
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={closeCameraPreview}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmCameraCapture}
              className="w-full gap-2 sm:w-auto"
            >
              <Camera className="size-4" />
              Capture Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Retake / use photo modal ────────────────────────────────────── */}
      <Dialog
        open={showRetakeModal && !!capturedDataUrl}
        onOpenChange={(open) => {
          if (!open) {
            setShowRetakeModal(false);
            setCapturedDataUrl(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 p-4 sm:p-6">
          <DialogTitle>Review photo</DialogTitle>
          <DialogDescription>
            Keep this photo or retake it.
          </DialogDescription>
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted">
            {capturedDataUrl && (
              <img
                src={capturedDataUrl}
                alt="Captured applicant photo"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleRetake}
              className="w-full sm:w-auto"
            >
              Retake
            </Button>
            <Button
              type="button"
              onClick={handleUsePhoto}
              className="w-full gap-2 sm:w-auto"
            >
              Use This Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Previous school dialog ──────────────────────────────────────── */}
      <Dialog open={schoolModalOpen} onOpenChange={setSchoolModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {editingSchoolId ? "Edit school" : "Add previous school"}
          </DialogTitle>
          <DialogDescription>
            Enter the school name and the period attended (month and year).
          </DialogDescription>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="modalSchoolName">School name</Label>
              <Input
                id="modalSchoolName"
                value={schoolNameInput}
                onChange={(e) => setSchoolNameInput(e.target.value)}
                placeholder="e.g. Lagos Primary School"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label>Period attended</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">From (month)</span>
                  <select
                    value={schoolFromMonth}
                    onChange={(e) => setSchoolFromMonth(e.target.value)}
                    className={selectCls}
                    aria-label="From month"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">From (year)</span>
                  <select
                    value={schoolFromYear}
                    onChange={(e) => setSchoolFromYear(e.target.value)}
                    className={selectCls}
                    aria-label="From year"
                  >
                    <option value="">Year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">To (month)</span>
                  <select
                    value={schoolToMonth}
                    onChange={(e) => setSchoolToMonth(e.target.value)}
                    className={selectCls}
                    aria-label="To month"
                    disabled={schoolToPresent}
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">To (year)</span>
                  <select
                    value={schoolToYear}
                    onChange={(e) => setSchoolToYear(e.target.value)}
                    className={selectCls}
                    aria-label="To year"
                    disabled={schoolToPresent}
                  >
                    <option value="">Year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={schoolToPresent}
                  onChange={(e) => setSchoolToPresent(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span>Still attending (Present)</span>
              </label>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setSchoolModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={addOrUpdateSchool}
              disabled={!schoolDateValid}
              className="w-full sm:w-auto"
            >
              {editingSchoolId ? "Save changes" : "Add school"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Success dialog ──────────────────────────────────────────────── */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent showCloseButton={false}>
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="size-7 text-emerald-500" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Application submitted!
              </DialogTitle>
              <DialogDescription className="mt-1.5">
                Your application has been received. Review your details and
                complete payment to confirm.
              </DialogDescription>
            </div>

            {/* Amount due */}
            {selectedSession && (
              <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Amount due</p>
                <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-primary">
                  ₦{selectedSession.amount.toLocaleString("en-NG")}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedSession.year} enrollment fee
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/">
                <Clock className="size-4" />
                Pay Later
              </Link>
            </Button>
            <Button asChild className="gap-2 font-semibold">
              <Link href={applicationId ? `/applicant/${applicationId}/preview` : "/"}>
                <CreditCard className="size-4" />
                Review &amp; Pay
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Main form ───────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Submitting your application…
              </p>
            </div>
          </div>
        )}

        {/* Session info banner */}
        {selectedSession && (
          <div className="mb-6 flex flex-col gap-1 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
            <GraduationCap className="size-4 shrink-0 text-primary" />
            <div className="flex-1 text-sm">
              <span className="font-semibold text-foreground">
                {selectedSession.year} Enrollment Session
              </span>
              <span className="ml-0 block text-muted-foreground sm:ml-2 sm:inline">
                — Application fee:{" "}
                <span className="font-semibold text-foreground">
                  ₦{selectedSession.amount.toLocaleString("en-NG")}
                </span>
              </span>
            </div>
            <input type="hidden" name="sessionId" value={activeSessionId} />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          {/* ── Section 1: Photo ─────────────────────────────────────────── */}
          <FormSection
            icon={ImagePlus}
            title="Applicant Photo"
            description="Upload a clear passport-style photo of the applicant."
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {photoUrl ? (
                /* Photo preview */
                <div className="flex flex-col items-start gap-2">
                  <div className="group relative">
                    <img
                      src={photoUrl}
                      alt="Applicant"
                      className="h-28 w-28 rounded-xl border border-border object-cover shadow-sm"
                    />
                    {/* Upload spinner overlay */}
                    {photoUploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-black/50">
                        <Loader2 className="size-6 animate-spin text-white" />
                        <span className="text-[10px] font-semibold text-white">
                          Uploading…
                        </span>
                      </div>
                    )}
                    {/* Desktop hover overlay (only when not uploading) */}
                    {!photoUploading && (
                    <div className="absolute inset-0 hidden items-center justify-center gap-1.5 rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-foreground shadow hover:bg-white"
                        title="Replace photo"
                      >
                        <Upload className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-destructive shadow hover:bg-white"
                        title="Remove photo"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Upload zone */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <ImagePlus className="size-6" />
                  <span className="text-[10px] font-medium">Upload</span>
                </button>
              )}

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload applicant photo"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = () =>
                        handlePhotoSelected(r.result as string);
                      r.readAsDataURL(file);
                    }
                    e.target.value = "";
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-3.5" />
                    {photoUrl ? "Replace photo" : "Upload photo"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={openCameraPreview}
                  >
                    <Camera className="size-3.5" />
                    Use camera
                  </Button>
                  {photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setPhotoUrl(null)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {photoUploading
                    ? "Uploading to cloud storage…"
                    : "Accepted: JPG, PNG · Max 5 MB · Passport-style preferred"}
                </p>
              </div>
            </div>
          </FormSection>

          {/* ── Section 2: Class ─────────────────────────────────────────── */}
          {classOptions.length > 0 && (
            <FormSection
              icon={GraduationCap}
              title="Class Selection"
              description="Choose the class your ward is applying for."
            >
              <div className="max-w-xs space-y-1.5">
                <Label htmlFor="class">
                  Class <span className="text-destructive">*</span>
                </Label>
                <select
                  id="class"
                  name="class"
                  required
                  aria-label="Class"
                  className={selectCls}
                >
                  <option value="">Select class…</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </FormSection>
          )}

          {/* ── Section 3: Applicant name ────────────────────────────────── */}
          <FormSection
            icon={User}
            title="Applicant's Full Name"
            description="Enter the applicant's legal name."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="middleName" className="flex items-center gap-1">
                  Middle Name
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="middleName"
                  name="middleName"
                  type="text"
                  placeholder="Middle name"
                  className="h-10"
                />
              </div>
            </div>
          </FormSection>

          {/* ── Section 4: Personal info ─────────────────────────────────── */}
          <FormSection
            icon={User}
            title="Personal Information"
            description="Basic personal details about the applicant."
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="wardDob">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="wardDob"
                    name="wardDob"
                    type="date"
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wardGender">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="wardGender"
                    name="wardGender"
                    required
                    aria-label="Gender"
                    className={selectCls}
                  >
                    <option value="">Select gender…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </FormSection>

          {/* ── Section 5: Origin & background ───────────────────────────── */}
          <FormSection
            icon={MapPin}
            title="Origin & Background"
            description="State, local government, nationality, and religion."
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="stateOfOrigin">State of Origin</Label>
                  <select
                    id="stateOfOrigin"
                    name="stateOfOrigin"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedLga("");
                    }}
                    className={selectCls}
                    aria-label="State of origin"
                  >
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lga">Local Government Area</Label>
                  <select
                    id="lga"
                    name="lga"
                    value={selectedLga}
                    onChange={(e) => setSelectedLga(e.target.value)}
                    className={selectCls}
                    aria-label="Local government area"
                    disabled={!selectedState}
                  >
                    <option value="">Select LGA…</option>
                    {lgaOptions.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nationality">Nationality</Label>
                  <select
                    id="nationality"
                    name="nationality"
                    className={selectCls}
                    aria-label="Nationality"
                  >
                    <option value="">Select nationality…</option>
                    {NATIONALITIES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="religion">Religion</Label>
                  <select
                    id="religion"
                    name="religion"
                    className={selectCls}
                    aria-label="Religion"
                  >
                    <option value="">Select religion…</option>
                    {RELIGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </FormSection>

          {/* ── Section 6: Medical ──────────────────────────────────────── */}
          <FormSection
            icon={Stethoscope}
            title="Medical Information"
            description="Any known health conditions, allergies, or disabilities."
          >
            <div className="space-y-1.5">
              <Label htmlFor="medicalInfo">
                Known conditions or allergies
                <span className="ml-1 text-xs text-muted-foreground">
                  (Optional)
                </span>
              </Label>
              <Input
                id="medicalInfo"
                name="medicalInfo"
                type="text"
                placeholder="e.g. Asthma, peanut allergy — or type 'None'"
                className="h-10"
              />
            </div>
          </FormSection>

          {/* ── Section 7: Previous schools ──────────────────────────────── */}
          <FormSection
            icon={School}
            title="Previous Schools"
            description="List schools the applicant has previously attended, if any."
          >
            <div className="space-y-3">
              {previousSchools.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
                  <School className="size-7 text-muted-foreground/50" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    No schools added yet
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Click &quot;Add school&quot; to add a previous school.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {previousSchools.map((row, i) => (
                    <div
                      key={row.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {row.schoolName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.date}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEditSchool(row)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Edit school"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSchool(row.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove school"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setEditingSchoolId(null);
                  setSchoolModalOpen(true);
                }}
              >
                <Plus className="size-3.5" />
                Add school
              </Button>
            </div>
          </FormSection>

          {/* ── Error ───────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Fee notice ──────────────────────────────────────────────── */}
          {selectedSession && (
            <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-start">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>
                After submitting, you&apos;ll be redirected to pay the application
                fee of{" "}
                <span className="font-semibold text-foreground">
                  ₦{selectedSession.amount.toLocaleString("en-NG")}
                </span>{" "}
                to confirm your application.
              </span>
            </div>
          )}

          {/* ── Submit ──────────────────────────────────────────────────── */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading || photoUploading}
              className="gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
