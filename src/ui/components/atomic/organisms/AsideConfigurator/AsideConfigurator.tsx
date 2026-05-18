"use client";

import { Flex } from "@atoms";
import { useStepsStore } from "@store";

import { orbitFlag } from "../ConfiguratorCanvas/CanvasControl/ViewControls/orbitFlag";
import { AsidePrice } from "./AsidePrice";
import { AsideName } from "./AsideName";
import { StepDesign } from "./steps";

const STEP_PANELS = [
  StepDesign,
  null, // StepColor
  null, // StepShading
  null, // StepName
  null, // StepNumber
  null, // StepLogo
];

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
    <aside
      className="absolute left-0 top-0 h-full w-[334px] min-h-0 z-1 pointer-events-auto"
      onPointerEnter={() => {
        orbitFlag.enabled = false;
      }}
      onPointerLeave={() => {
        orbitFlag.enabled = true;
      }}
    >
      <Flex className="flex-col items-start">
        <AsideName name={data.name} min_buy={data.min_buy} id={data.id} />
        <AsidePrice
          price={data.price}
          bounus_count={data.bounus_count}
          bonus_discount={data.bonus_discount}
        />
        {StepPanel && <StepPanel />}
      </Flex>
    </aside>
  );
};

export { AsideConfigurator };
