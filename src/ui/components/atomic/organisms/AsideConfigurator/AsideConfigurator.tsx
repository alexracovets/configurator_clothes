"use client";

import { Flex, Grid } from "@atoms";
import { ScrollArea } from "@shared";
import { useStepsStore } from "@store";

import { AsidePrice } from "./AsidePrice";
import { AsideName } from "./AsideName";
import { StepDesign, StepColor, StepSfumatura } from "@molecules";

const STEP_PANELS = [StepDesign, StepColor, StepSfumatura, null, null, null];

const AsideConfigurator = () => {
  const { currentStep } = useStepsStore();

  const data = {
    name: "Maglia Federer",
    min_buy: 5,
    bounus_count: 25,
    bonus_discount: 10,
    price: 100,
    id: 0,
  };

  const StepPanel = STEP_PANELS[currentStep];

  return (
    <Grid
      variant="aside_configurator"
      asChild
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <aside>
        <Flex className="flex-col items-start shrink-0">
          <AsideName name={data.name} min_buy={data.min_buy} id={data.id} />
          <AsidePrice
            price={data.price}
            bounus_count={data.bounus_count}
            bonus_discount={data.bonus_discount}
          />
        </Flex>
        {StepPanel && (
          <Flex variant="aside_configurator_content">
            <ScrollArea>
              <StepPanel />
            </ScrollArea>
          </Flex>
        )}
      </aside>
    </Grid>
  );
};

export { AsideConfigurator };
