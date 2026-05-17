"use client";

import { Fragment } from "react";

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
  return (
    <Flex className="gap-3 pt-2" asChild>
      <ul>
        {steps.map((step, index) => (
          <Fragment key={step.value}>
            {index > 0 && <MenuStepSeparator />}
            <Text variant="menu_step_buy" asChild>
              <li>{step.name}</li>
            </Text>
          </Fragment>
        ))}
      </ul>
    </Flex>
  );
};

export { MenuStepBuy };
