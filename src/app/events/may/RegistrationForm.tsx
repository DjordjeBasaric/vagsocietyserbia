"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { useFormStatus } from "react-dom";
import {
  submitEventRegistration,
  type RegistrationActionState,
} from "@/app/actions/registration-actions";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const initialState: RegistrationActionState = { ok: false, message: "" };
const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  carModel: "",
  country: "",
  city: "",
  additionalInfo: "",
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const { language } = useLanguage();
  return (
    <button
      type="submit"
      className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || disabled}
    >
      {pending ? t("event.form.submitting", language) : t("event.form.submit", language)}
    </button>
  );
}

function FloatingField({
  id,
  label,
  name,
  type = "text",
  disabled,
  required = true,
  value,
  onChange,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (nextValue: string) => void;
}) {
  const hasValue = value && value.trim().length > 0;
  
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        className="field peer"
        placeholder=" "
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 bg-white dark:bg-black px-1 text-sm text-slate-400 dark:text-slate-500 transition-all ${
          hasValue
            ? "-top-2 text-xs text-slate-500 dark:text-slate-400"
            : "top-3 text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500 dark:peer-focus:text-slate-400"
        }`}
      >
        <span>{label}</span>
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
    </div>
  );
}

export function RegistrationForm() {
  const { language } = useLanguage();
  const [state, formAction] = React.useActionState(
    submitEventRegistration,
    initialState
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompressing, setIsCompressing] = React.useState(false);

  type PreviewImage = { id: string; url: string };
  const [previews, setPreviews] = React.useState<PreviewImage[]>([]);
  const [filesSelected, setFilesSelected] = React.useState<File[]>([]);
  const [formValues, setFormValues] = React.useState(initialValues);

  const minImages = 3;
  const maxImages = 5;

  React.useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    // Allow retry after an error response.
    if (!state.ok && state.message) {
      setIsSubmitting(false);
    }
  }, [state.ok, state.message]);

  const syncInputFiles = React.useCallback((files: File[]) => {
    const input = fileInputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    input.files = dt.files;
  }, []);

  React.useEffect(() => {
    if (!state.ok) return;
    // Success: show modal and reset form for next submission.
    setShowSuccess(true);
    setIsSubmitting(false);

    // Clear text fields
    setFormValues(initialValues);

    // Clear files + previews
    setFilesSelected([]);
    setPreviews((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    syncInputFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const t = window.setTimeout(() => setShowSuccess(false), 2500);
    return () => window.clearTimeout(t);
  }, [state.ok, syncInputFiles]);

  const buildId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;
  const dedupeKey = (file: File) => `${file.name}-${file.lastModified}`;

  const compressImage = React.useCallback(async (file: File): Promise<File> => {
    // Skip unsupported/undesired types (best-effort compression)
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    // Keep GIF/SVG/HEIC as-is (canvas conversion would break/unsupported)
    if (
      type.includes("gif") ||
      type.includes("svg") ||
      type.includes("heic") ||
      type.includes("heif") ||
      name.endsWith(".heic") ||
      name.endsWith(".heif") ||
      name.endsWith(".gif") ||
      name.endsWith(".svg")
    ) {
      return file;
    }

    if (!type.startsWith("image/")) return file;

    const maxDim = 1600;
    const quality = 0.78;

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const targetW = Math.max(1, Math.round(bitmap.width * scale));
      const targetH = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      ctx.drawImage(bitmap, 0, 0, targetW, targetH);
      bitmap.close?.();

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (!blob) return file;

      // If compression didn't help, keep original
      if (blob.size >= file.size) return file;

      const baseName = file.name?.replace(/\.[^.]+$/, "") || "image";
      const outName =
        type === "image/jpeg" || type === "image/jpg"
          ? file.name
          : `${baseName}.jpg`;

      return new File([blob], outName, {
        type: "image/jpeg",
        lastModified: file.lastModified,
      });
    } catch {
      return file;
    }
  }, []);

  const compressImages = React.useCallback(
    async (files: File[]): Promise<File[]> => {
      if (!files.length) return [];
      const out: File[] = [];
      for (const f of files) out.push(await compressImage(f));
      return out;
    },
    [compressImage]
  );

  const isAllowedImage = React.useCallback((file: File) => {
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    const isJpeg =
      type === "image/jpeg" ||
      type === "image/jpg" ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg");
    const isPng = type === "image/png" || name.endsWith(".png");
    const isHeic =
      type === "image/heic" ||
      type === "image/heif" ||
      name.endsWith(".heic") ||
      name.endsWith(".heif");
    return isJpeg || isPng || isHeic;
  }, []);

  const rebuildPreviews = React.useCallback((files: File[]) => {
    setPreviews((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return files.map((file) => ({
        id: buildId(file),
        url: URL.createObjectURL(file),
      }));
    });
  }, []);

  const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const pickedOriginal = Array.from(event.target.files ?? []).filter((file) => {
      if (file.size <= 0) return false;
      return isAllowedImage(file);
    });

    // reset so selecting same file again can trigger change
    event.target.value = "";

    if (!pickedOriginal.length) return;

    setIsCompressing(true);
    try {
      const pickedCompressed = await compressImages(pickedOriginal);

      // Allow adding more files across multiple picks.
      const nextMap = new Map<string, File>();
      for (const file of filesSelected) nextMap.set(dedupeKey(file), file);
      for (let i = 0; i < pickedCompressed.length; i++) {
        const originalKey = dedupeKey(pickedOriginal[i]!);
        nextMap.set(originalKey, pickedCompressed[i]!);
      }

      const nextFiles = Array.from(nextMap.values()).slice(0, maxImages);

      setFilesSelected(nextFiles);
      rebuildPreviews(nextFiles);
      syncInputFiles(nextFiles);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeFile = (id: string) => {
    const nextFiles = filesSelected.filter((file) => buildId(file) !== id);
    setFilesSelected(nextFiles);
    rebuildPreviews(nextFiles);
    syncInputFiles(nextFiles);
  };

  const isImageCountValid =
    filesSelected.length >= minImages && filesSelected.length <= maxImages;

  const areRequiredFieldsFilled =
    formValues.fullName.trim().length > 0 &&
    formValues.email.trim().length > 0 &&
    formValues.phone.trim().length > 0 &&
    formValues.carModel.trim().length > 0 &&
    formValues.country.trim().length > 0 &&
    formValues.city.trim().length > 0;

  // Osiguraj da su fajlovi sinhronizovani sa input elementom
  React.useEffect(() => {
    syncInputFiles(filesSelected);
  }, [filesSelected, syncInputFiles]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }
    if (!isImageCountValid || !areRequiredFieldsFilled) {
      event.preventDefault();
      return;
    }

    // Immediately lock to avoid double-click submits before pending flips.
    setIsSubmitting(true);
    
    // Osiguraj da su fajlovi sinhronizovani pre submit-a (dodatna provera)
    if (fileInputRef.current) {
      syncInputFiles(filesSelected);
      
      // Debug: proveri da li su fajlovi pravilno dodati
      const inputFiles = fileInputRef.current.files;
      console.log("[Form] Files in input before submit:", inputFiles?.length);
      if (inputFiles) {
        Array.from(inputFiles).forEach((file, index) => {
          console.log(`[Form] File ${index}:`, file.name, file.size);
        });
      }
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="mt-8 space-y-6"
    >
      <input type="hidden" name="language" value={language} />

      {showSuccess ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-white">
              {t("event.form.success.title", language)}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("event.form.success.message", language)}
            </p>
            <button
              type="button"
              className="button-primary mt-4 w-full"
              onClick={() => setShowSuccess(false)}
            >
              {t("event.form.success.ok", language)}
            </button>
          </div>
        </div>
      ) : null}

      {state.ok ? (
        <div className="glass-panel rounded-3xl p-6">
          <p className="section-subtitle">{t("event.form.successBanner.title", language)}</p>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
            {t("event.form.successBanner.message", language)}
          </p>
        </div>
      ) : null}

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("event.form.step1", language)}</p>
        <h3 className="mt-2 text-xl text-slate-900 dark:text-white">{t("event.form.step1Title", language)}</h3>
        <div className="mt-4 grid gap-4">
          <FloatingField
            id="fullName"
            name="fullName"
            label={t("event.form.fields.fullName", language)}
            disabled={isSubmitting}
            value={formValues.fullName}
            onChange={(fullName) => setFormValues((prev) => ({ ...prev, fullName }))}
          />
          <FloatingField
            id="email"
            name="email"
            type="email"
            label={t("event.form.fields.email", language)}
            disabled={isSubmitting}
            value={formValues.email}
            onChange={(email) => setFormValues((prev) => ({ ...prev, email }))}
          />
          <FloatingField
            id="phone"
            name="phone"
            type="tel"
            label={t("event.form.fields.phone", language)}
            disabled={isSubmitting}
            value={formValues.phone}
            onChange={(phone) => setFormValues((prev) => ({ ...prev, phone }))}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FloatingField
              id="country"
              name="country"
              label={t("event.form.fields.country", language)}
              disabled={isSubmitting}
              value={formValues.country}
              onChange={(country) => setFormValues((prev) => ({ ...prev, country }))}
            />
            <FloatingField
              id="city"
              name="city"
              label={t("event.form.fields.city", language)}
              disabled={isSubmitting}
              value={formValues.city}
              onChange={(city) => setFormValues((prev) => ({ ...prev, city }))}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("event.form.step2", language)}
        </p>
        <h3 className="mt-2 text-xl text-slate-900 dark:text-white">
          {t("event.form.step2Title", language)}
        </h3>
        <div className="mt-4 grid gap-4">
          <FloatingField
            id="carModel"
            name="carModel"
            label={t("event.form.fields.carModel", language)}
            disabled={isSubmitting}
            value={formValues.carModel}
            onChange={(carModel) => setFormValues((prev) => ({ ...prev, carModel }))}
          />
          <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black px-4 py-3">
            <p className="text-sm text-slate-900 dark:text-white">
              {t("event.form.fields.trailer", language)}
            </p>
            <label className="relative inline-flex items-center">
              <input
                id="arrivingWithTrailer"
                type="checkbox"
                name="arrivingWithTrailer"
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-black/20 bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/25 dark:bg-black"
                disabled={isSubmitting}
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-0 top-0 h-6 w-6 p-[3px] text-black opacity-0 transition-opacity peer-checked:opacity-100 dark:text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </label>
          </div>
          <div className="relative">
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="textarea peer h-28"
              placeholder=" "
              disabled={isSubmitting}
              value={formValues.additionalInfo}
              onChange={(event) => setFormValues((prev) => ({ ...prev, additionalInfo: event.target.value }))}
            />
            <label
              htmlFor="additionalInfo"
              className={`pointer-events-none absolute left-4 bg-white dark:bg-black px-1 text-sm text-slate-400 dark:text-slate-500 transition-all ${
                formValues.additionalInfo && formValues.additionalInfo.trim().length > 0
                  ? "-top-2 text-xs text-slate-500 dark:text-slate-400"
                  : "top-3 text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500 dark:peer-focus:text-slate-400"
              }`}
            >
              {t("event.form.fields.additionalInfo", language)}
            </label>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("event.form.step3", language)}
        </p>
        <h3 className="mt-2 text-xl text-slate-900 dark:text-white">
          {t("event.form.step3Title", language)}
        </h3>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 dark:border-white/10 bg-slate-50 dark:bg-slate-900 px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-black text-lg text-slate-600 dark:text-slate-300">
            +
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {t("event.form.images.add", language)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isCompressing
              ? t("event.form.images.compressing", language)
              : filesSelected.length
              ? `${filesSelected.length} / ${maxImages} ${t("event.form.images.selected", language)}`
              : t("event.form.images.formats", language, { min: minImages, max: maxImages })}
          </p>
          <input
            type="file"
            name="carImages"
            accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
            multiple
            className="hidden"
            disabled={isSubmitting || isCompressing}
            ref={fileInputRef}
            onChange={handleFilesChange}
          />
        </label>

        <ImagePreviewGrid
          previews={previews}
          hasSelection={filesSelected.length > 0}
          submitted={false}
          canRemove={!isSubmitting}
          onRemove={removeFile}
        />

        {!isImageCountValid ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {t("event.form.images.required", language, { min: minImages, max: maxImages })}
          </p>
        ) : null}
      </div>

      {state.message ? <p className="feedback">{state.message}</p> : null}

      <div className="flex justify-center pb-20 md:pb-12">
        <SubmitButton
          disabled={
            isSubmitting ||
            !isImageCountValid ||
            !areRequiredFieldsFilled
          }
        />
      </div>
    </form>
  );
}

function ImagePreviewGrid({
  previews,
  hasSelection,
  submitted,
  canRemove,
  onRemove,
}: {
  previews: Array<{ id: string; url: string }>;
  hasSelection: boolean;
  submitted: boolean;
  canRemove: boolean;
  onRemove: (id: string) => void;
}) {
  const { pending } = useFormStatus();
  const { language } = useLanguage();

  if (!hasSelection) return null;

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {previews.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black"
          >
            <img
              src={item.url}
              alt=""
              className="h-16 w-full object-cover"
            />

            {canRemove && !pending ? (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={language === "sr" ? "Ukloni fotografiju" : "Remove photo"}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white"
              >
                {language === "sr" ? "Ukloni" : "Remove"}
              </button>
            ) : null}

            {pending ? (
              <div className="absolute inset-0 grid place-items-center bg-black/30">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              </div>
            ) : null}

            {submitted && !pending ? (
              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-900">
                  {language === "sr" ? "Poslato" : "Sent"}
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {pending
          ? language === "sr"
            ? "Otpremanje fotografija..."
            : "Uploading photos..."
          : language === "sr"
          ? "Fotografije su spremne za slanje."
          : "Photos are ready to send."}
      </p>
    </div>
  );
}
