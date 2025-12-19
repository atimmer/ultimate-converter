"use client";

import { useMemo, useSyncExternalStore } from "react";
import { SuggestionForm } from "./SuggestionForm";
import CopyButton from "./CopyButton";
import {
  alwaysPossibleModules,
  modules,
  resolveAlwaysPossible,
  resolveConversion,
  resolveConversions,
} from "../conversions";
import type { OutputRow } from "../conversions/types";
import { cn } from "../lib/utils";

type OmniConverterProps = {
  biasModuleId?: string;
  preferredAlwaysModuleId?: string;
  intro?: React.ReactNode;
  defaultValue?: string;
};

const INPUT_PARAM = "input";
const PINNED_PARAM = "pinned";
const SEARCH_EVENT = "cu:search";

const parsePinnedParam = (value: string | null) => {
  if (!value) return null;
  const trimmed = value
    .split(",")
    .map((entry) => entry.trim())
    .find(Boolean);
  return trimmed ?? null;
};

const useSearchString = () =>
  useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange();
      window.addEventListener("popstate", handler);
      window.addEventListener(SEARCH_EVENT, handler);
      return () => {
        window.removeEventListener("popstate", handler);
        window.removeEventListener(SEARCH_EVENT, handler);
      };
    },
    () => window.location.search,
    () => "",
  );

const ResultRows = ({ rows }: { rows: OutputRow[] }) => (
  <dl className="space-y-4">
    {rows.map((row) => (
      <div
        key={row.label}
        className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3"
      >
        <div className="space-y-1 sm:flex-1">
          <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {row.label}
          </dt>
          <dd className="whitespace-pre-wrap font-mono text-lg text-slate-900">
            {row.value}
          </dd>
          {row.hint ? (
            <p className="text-xs text-slate-500">{row.hint}</p>
          ) : null}
        </div>
        <div className="flex items-start justify-end gap-2 sm:ml-auto">
          <CopyButton text={row.copy ?? row.value} label="Copy" />
          {row.value !== (row.copy ?? row.value) ? (
            <CopyButton text={row.value} label="Copy with unit" />
          ) : null}
        </div>
      </div>
    ))}
  </dl>
);

export default function OmniConverter({
  biasModuleId,
  preferredAlwaysModuleId,
  intro,
  defaultValue,
}: OmniConverterProps) {
  const search = useSearchString();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const inputParam = searchParams.get(INPUT_PARAM);
  const pinnedParam = searchParams.get(PINNED_PARAM);
  const input = inputParam ?? defaultValue ?? "";
  const focusedModuleId = parsePinnedParam(pinnedParam);

  const updateSearch = (updates: { input?: string; pinned?: string | null }) => {
    const params = new URLSearchParams(searchParams);
    if (updates.input !== undefined) {
      params.set(INPUT_PARAM, updates.input);
    }
    if (updates.pinned !== undefined) {
      if (updates.pinned) {
        params.set(PINNED_PARAM, updates.pinned);
      } else {
        params.delete(PINNED_PARAM);
      }
    }
    const nextSearch = params.toString();
    if (nextSearch === searchParams.toString()) return;
    const nextUrl = nextSearch.length > 0 ? `?${nextSearch}` : "";
    window.history.replaceState(null, "", nextUrl);
    window.dispatchEvent(new Event(SEARCH_EVENT));
  };

  const trimmedInput = useMemo(() => input.trim(), [input]);

  const resolutions = useMemo(
    () => resolveConversions(input, modules, { biasModuleId }),
    [input, biasModuleId],
  );

  // Backwards compatibility with existing UX assumptions (e.g. helper text).
  const resolution =
    resolutions[0] ?? resolveConversion(input, modules, { biasModuleId });

  const alwaysPreferredId = preferredAlwaysModuleId ?? biasModuleId;

  const alwaysPossibleResolutions = useMemo(
    () =>
      resolveAlwaysPossible(input, alwaysPossibleModules, {
        preferredModuleId: alwaysPreferredId,
      }),
    [input, alwaysPreferredId],
  );

  const pinnedResolution = useMemo(
    () =>
      focusedModuleId
        ? resolutions.find(
            (resolutionItem) => resolutionItem.module.id === focusedModuleId,
          ) ?? null
        : null,
    [focusedModuleId, resolutions],
  );

  const helperText = useMemo(() => {
    if (trimmedInput.length === 0) {
      return "Paste a supported value to get started.";
    }

    if (!resolution) {
      return "That input is not recognized yet. You can suggest the expected result.";
    }

    const extra = resolutions
      .slice(1)
      .map((r) => r.module.label)
      .join(", ");
    return extra.length > 0
      ? `Detected ${resolution.module.label} (also: ${extra}). See conversions below.`
      : `Detected ${resolution.module.label}. See conversions below.`;
  }, [resolution, resolutions, trimmedInput]);

  return (
    <div className="space-y-8">
      {intro ? <div className="text-base text-slate-600">{intro}</div> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="omni-input"
            className="text-sm font-medium text-slate-700"
          >
            Input
          </label>
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Auto-detects format
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <textarea
            id="omni-input"
            autoFocus
            spellCheck={false}
            value={input}
            onChange={(event) =>
              updateSearch({ input: event.target.value, pinned: null })
            }
            placeholder="#c044ff, 70 kg, 90 km/h, 2.5 kW, 1000 N, eyJhbGciOi..."
            className="h-40 w-full resize-y rounded-2xl border-0 bg-transparent p-6 text-base font-medium text-slate-900 outline-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p className="text-sm text-slate-500">{helperText}</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Results
          </h2>
          {resolutions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {resolutions.map((r) => (
                <button
                  type="button"
                  key={r.module.id}
                  onClick={() =>
                    updateSearch({
                      pinned:
                        focusedModuleId === r.module.id ? null : r.module.id,
                    })
                  }
                  aria-pressed={focusedModuleId === r.module.id}
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                    focusedModuleId === r.module.id
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : r.module.id === resolutions[0]?.module.id
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {r.module.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {resolutions.length > 0 ? (
          <div className="space-y-4">
            {pinnedResolution ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                    Pinned
                  </span>
                  <span className="text-xs text-slate-500">
                    Click the tag again to unpin
                  </span>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const hasHighlight = Boolean(pinnedResolution.payload.highlight);
                    const highlightOnly =
                      hasHighlight && pinnedResolution.payload.rows.length === 0;

                    return (
                      <div
                        key={pinnedResolution.module.id}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {pinnedResolution.module.label}
                          </span>
                          <span className="text-xs text-slate-500">Pinned</span>
                        </div>

                        {highlightOnly ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            {pinnedResolution.payload.highlight}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                              hasHighlight && "sm:grid-cols-[auto_1fr]",
                            )}
                          >
                            {hasHighlight ? (
                              <div className="flex items-start justify-center sm:justify-start">
                                {pinnedResolution.payload.highlight}
                              </div>
                            ) : null}
                            <div className="space-y-6">
                              <ResultRows rows={pinnedResolution.payload.rows} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : null}

            {pinnedResolution ? (
              <div className="pt-2">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Detected order
                </div>
              </div>
            ) : null}

            {resolutions
              .filter(
                (resolutionItem) =>
                  !pinnedResolution ||
                  resolutionItem.module.id !== pinnedResolution.module.id,
              )
              .map((r) => {
                const hasHighlight = Boolean(r.payload.highlight);
                const highlightOnly =
                  hasHighlight && r.payload.rows.length === 0;

                return (
                  <div key={r.module.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {r.module.label}
                      </span>
                      {r.module.id === resolutions[0]?.module.id ? (
                        <span className="text-xs text-slate-500">Top match</span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Also matches
                        </span>
                      )}
                    </div>

                    {highlightOnly ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        {r.payload.highlight}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                          hasHighlight && "sm:grid-cols-[auto_1fr]",
                        )}
                      >
                        {hasHighlight ? (
                          <div className="flex items-start justify-center sm:justify-start">
                            {r.payload.highlight}
                          </div>
                        ) : null}
                        <div className="space-y-6">
                          <ResultRows rows={r.payload.rows} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            <SuggestionForm
              input={input}
              variant="inline"
              title="Need another output?"
            />
          </div>
        ) : trimmedInput.length > 0 ? (
          <SuggestionForm input={input} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Paste any supported value to see conversions here.
          </div>
        )}
      </section>

      {trimmedInput.length > 0 ? (
        <section className="space-y-4 border-t border-slate-200 pt-8">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Always-on converters
            </h2>
            <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Works on any input
            </span>
          </div>

          {alwaysPossibleResolutions.length > 0 ? (
            <div className="space-y-4">
              {alwaysPossibleResolutions.map((result) => (
                <div
                  key={result.module.id}
                  className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {result.module.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        Always available
                      </span>
                    </div>
                  </div>
                  <ResultRows rows={result.payload.rows} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              These converters are ready for any text you enter.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
