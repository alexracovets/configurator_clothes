"use client";

import { Fragment } from "react";

import { useSlidingIndicator } from "@hooks";
import { useStepsStore } from "@store";
import { MenuStepSeparator } from "./MenuStepSeparator";
import { Flex, Text } from "@atoms";

const steps = [
  {
    name: "design",
    value: "design",
  },
  {
    name: "colore",
    value: "color",
  },
  {
    name: "sfumatura",
    value: "shading",
  },
  {
    name: "nome",
    value: "name",
  },
  {
    name: "numero",
    value: "number",
  },
  {
    name: "logo",
    value: "logo",
  },
];

const MenuStepBuy = () => {
  const { currentStep, setStep } = useStepsStore();
  const { wrapperRef, getItemRef, indicator } =
    useSlidingIndicator(currentStep);

  return (
    <div ref={wrapperRef} className="relative w-fit pt-2">
      <Flex className="gap-3" asChild>
        <ul>
          {steps.map((step, index) => (
            <Fragment key={step.value}>
              {index > 0 && (
                <MenuStepSeparator isActive={index <= currentStep} />
              )}
              <li ref={getItemRef(index)} onClick={() => setStep(index)}>
                <Text
                  data-active={index <= currentStep}
                  variant="menu_step_buy"
                  asChild
                >
                  <span>{step.name}</span>
                </Text>
              </li>
            </Fragment>
          ))}
        </ul>
      </Flex>
      <Text
        variant="menu_step_buy_line"
        asChild
        style={{ left: indicator.left, width: indicator.width }}
      >
        <span />
      </Text>
    </div>
  );
};

export { MenuStepBuy };
