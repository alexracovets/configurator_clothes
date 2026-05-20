"use client";

import { Flex } from "@atoms";
import { useStepsStore } from "@store";

import { orbitFlag } from "../ConfiguratorCanvas/CanvasControl/ViewControls/orbitFlag";
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
    <Flex variant="aside_configurator" asChild>
      <aside
        style={{ maxHeight: "calc(100vh - 180px)" }}
        onPointerEnter={() => (orbitFlag.enabled = false)}
        onPointerLeave={() => (orbitFlag.enabled = true)}
      >
        <Flex className="flex-col items-start shrink-0">
          <AsideName name={data.name} min_buy={data.min_buy} id={data.id} />
          <AsidePrice
            price={data.price}
            bounus_count={data.bounus_count}
            bonus_discount={data.bonus_discount}
          />
        </Flex>
        {StepPanel && (
          <div className="w-full overflow-y-scroll pr-1">
            <StepPanel />
          </div>
        )}
      </aside>
    </Flex>
  );
};

export { AsideConfigurator };
