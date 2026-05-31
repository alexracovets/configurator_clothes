'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { RangeControl } from '@molecules';
import { AtomImage, Flex, Text } from '@atoms';
import { useLogoStore } from '@store';
import {
  LOGO_ACCEPTED_INPUT,
  LOGO_MAX_FILE_SIZE,
  LOGO_SUPPORTED_LABEL,
  LogoFileError,
  logoFileToDisplayUrl,
  preloadLogoDisplayUrl,
  warmupGhostscriptWorker,
  yieldToMain,
} from '@utils';
import type { LogoInstance } from '@types';

interface LogoListItemProps {
  inst: LogoInstance;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleVisible: (visible: boolean) => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<Omit<LogoInstance, 'id' | 'position' | 'isDefault'>>) => void;
}

const LogoListItem = ({ inst, expanded, onToggleExpand, onToggleVisible, onRemove, onUpdate }: LogoListItemProps) => (
  <div className="border border-input-border rounded-[8px] overflow-hidden bg-white">
    <div className="flex items-center gap-3 p-3">
      <div className="w-14 h-14 border border-input-border rounded-[6px] overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
        {inst.src ? (
          <AtomImage src={inst.src} alt="logo" width={56} height={56} className="object-contain w-full h-full" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          type="button"
          aria-label={inst.visible ? 'Nascondi logo' : 'Mostra logo'}
          onClick={() => onToggleVisible(!inst.visible)}
          className={['relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0', inst.visible ? 'bg-black' : 'bg-gray-300'].join(' ')}
        >
          <span
            className={[
              'absolute left-0 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
              inst.visible ? 'translate-x-5' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 text-sm font-inter text-default hover:text-destructive transition-colors cursor-pointer px-1"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h3.066a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Elimina
        </button>

        <button
          type="button"
          aria-label="Impostazioni logo"
          onClick={onToggleExpand}
          className="p-1 text-default hover:text-active transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={['transition-transform', expanded ? 'rotate-90' : ''].join(' ')}>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    {expanded && (
      <div className="px-3 pb-3 pt-0 border-t border-input-border">
        <RangeControl
          label="Dimensione"
          value={Math.round((inst.scale ?? 1) * 100)}
          onChange={(v) => onUpdate({ scale: v / 100 })}
          min={20}
          max={300}
          unit="%"
        />
      </div>
    )}
  </div>
);

interface LogoUploadZoneProps {
  disabled: boolean;
  onUpload: (src: string) => void;
}

const LogoUploadZone = ({ disabled, onUpload }: LogoUploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file || disabled || loading) return;
      setLoading(true);
      setError(null);
      try {
        const src = await logoFileToDisplayUrl(file);
        await preloadLogoDisplayUrl(src);
        await yieldToMain();
        onUpload(src);
      } catch (err) {
        setError(err instanceof LogoFileError ? err.message : 'Impossibile caricare il file');
      } finally {
        setLoading(false);
      }
    },
    [disabled, loading, onUpload],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && !loading && fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && !loading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !loading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          'flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-[8px] transition-colors text-center',
          disabled || loading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : dragOver
              ? 'border-active bg-active/5 cursor-pointer'
              : 'border-input-border hover:border-active/60 hover:bg-gray-50/80 cursor-pointer',
        ].join(' ')}
      >
        {loading ? (
          <Text className="text-sm font-inter text-gray-500">Conversione in corso…</Text>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-gray-400">
              <path d="M16 21V11M11 16l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 21v2a3 3 0 003 3h14a3 3 0 003-3v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex flex-col gap-1">
              <Text className="text-sm font-inter font-medium text-default">Trascina qui il tuo logo o il tuo design grafico</Text>
              <Text className="text-xs font-inter text-gray-500">oppure fai clic qui per caricare un elemento</Text>
              <Text className="text-xs font-inter text-gray-400 mt-1">(Dimensione massima del file: {Math.round(LOGO_MAX_FILE_SIZE / (1024 * 1024))} MB)</Text>
              <Text className="text-xs font-inter text-gray-400">Formati supportati: {LOGO_SUPPORTED_LABEL}</Text>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={LOGO_ACCEPTED_INPUT}
          className="hidden"
          disabled={disabled || loading}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {error && <Text className="text-xs font-inter text-destructive">{error}</Text>}
    </div>
  );
};

const StepLogo = () => {
  useEffect(() => {
    warmupGhostscriptWorker();
  }, []);

  const instances = useLogoStore(({ instances }) => instances);
  const userInstances = useMemo(() => instances.filter((i) => !i.isDefault), [instances]);
  const addUserLogo = useLogoStore(({ addUserLogo }) => addUserLogo);
  const canAddUserLogo = useLogoStore(({ canAddUserLogo }) => canAddUserLogo);
  const updateInstance = useLogoStore(({ updateInstance }) => updateInstance);
  const removeInstance = useLogoStore(({ removeInstance }) => removeInstance);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleUpload = useCallback(
    (src: string) => {
      if (!canAddUserLogo()) return;
      addUserLogo(src);
    },
    [addUserLogo, canAddUserLogo],
  );

  return (
    <Flex variant="step_design" className="gap-5">
      <Text variant="configurator_part_label" className="text-sm">
        Inserisci il numero di loghi desiderato
      </Text>

      {userInstances.length > 0 && (
        <div className="flex flex-col gap-2">
          {userInstances.map((inst) => (
            <LogoListItem
              key={inst.id}
              inst={inst}
              expanded={expandedId === inst.id}
              onToggleExpand={() => setExpandedId((prev) => (prev === inst.id ? null : inst.id))}
              onToggleVisible={(visible) => updateInstance(inst.id, { visible })}
              onRemove={() => removeInstance(inst.id)}
              onUpdate={(patch) => updateInstance(inst.id, patch)}
            />
          ))}
        </div>
      )}

      <LogoUploadZone disabled={!canAddUserLogo()} onUpload={handleUpload} />

      <div className="flex items-center gap-3 p-4 border border-input-border rounded-[8px] bg-gray-50/60 cursor-not-allowed opacity-70">
        <div className="w-10 h-10 rounded-[6px] bg-white border border-input-border flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 14l3-4 2 2 3-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <Text className="text-sm font-inter text-gray-500">Seleziona un logo dalla libreria di spized</Text>
      </div>
    </Flex>
  );
};

export { StepLogo };
