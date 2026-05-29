'use client';

import { ColorControl, RangeControl } from '@molecules';
import { AtomImage, Button, Flex, Grid } from '@atoms';
import { PATTERNS, usePatternStore } from '@store';

const StepDesign = () => {
  const { partPatterns, patternOpacity, patternColor, setPatternForAll, setPatternOpacity, setPatternColor } = usePatternStore();

  const activePatterUrl = partPatterns.front;

  return (
    <Flex variant="step_design">
      <Grid variant="select_parts">
        <Button variant="select_none" title="Nessuno" data-active={activePatterUrl === null} onClick={() => setPatternForAll(null)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8" />
            <line x1="4" y1="4" x2="16" y2="16" />
          </svg>
          Nessuno
        </Button>
        {PATTERNS.map((pattern) => {
          const isActive = activePatterUrl === pattern.url;
          return (
            <Button key={pattern.id} variant="select_part" title={pattern.label} data-active={isActive} onClick={() => setPatternForAll(pattern.url)}>
              <AtomImage src={pattern.url} alt={pattern.label} />
            </Button>
          );
        })}
      </Grid>
      {activePatterUrl && <ColorControl activeColor={patternColor} onSelect={setPatternColor} label="Colore design" />}
      {activePatterUrl && (
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
