'use client';

import { useEffect } from 'react';

import { ColorControl, RangeControl } from '@molecules';
import { AtomImage, Button, Flex, Grid } from '@atoms';
import { useActivePatternState, useGarmentStore, usePatternStore } from '@store';
import { preloadSvgTextures, useGarmentPatterns } from '@hooks';

const StepDesign = () => {
  const patterns = useGarmentPatterns();
  const activeGarment = useGarmentStore((s) => s.activeGarment);
  const { patternUrl, patternOpacity, patternColor } = useActivePatternState();
  const { setPattern, setPatternOpacity, setPatternColor } = usePatternStore();

  useEffect(() => {
    preloadSvgTextures(patterns.map((p) => p.url));
  }, [patterns, activeGarment]);

  return (
    <Flex variant="step_design">
      <Grid variant="select_parts">
        <Button variant="select_none" title="Nessuno" data-active={patternUrl === null} onClick={() => setPattern(null)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8" />
            <line x1="4" y1="4" x2="16" y2="16" />
          </svg>
          Nessuno
        </Button>
        {patterns.map((pattern) => {
          const isActive = patternUrl === pattern.url;
          return (
            <Button key={pattern.id} variant="select_part" title={pattern.label} data-active={isActive} onClick={() => setPattern(pattern.url)}>
              <AtomImage src={pattern.url} alt={pattern.label} />
            </Button>
          );
        })}
      </Grid>
      {patternUrl && <ColorControl activeColor={patternColor} onSelect={setPatternColor} label="Colore design" />}
      {patternUrl && (
        <RangeControl
          value={Math.round(patternOpacity * 100)}
          onChange={(val: number) => setPatternOpacity(val / 100)}
          min={0}
          max={100}
          unit="%"
          label="Trasparenza"
        />
      )}
    </Flex>
  );
};

export { StepDesign };
