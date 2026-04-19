"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProgressBar from "./progress-bar";
import { Progress, ProgressBarContainer, ProgressMeter } from "./progress";

interface Props {
  numberOfSteps: number;
  step?: number;
  setStemp?: React.Dispatch<React.SetStateAction<number>>;
}

const StepperProgress = ({ step, setStemp, numberOfSteps }: Props) => {
  const [stepNum, setStepNum] = useState(0);
  const currStep = step || stepNum;
  console.log(currStep);
  function handlePrevStep() {
    if (currStep > 0) {
      setStepNum((step) => step - 1);
      setStemp?.((step) => step - 1);
    }
  }

  function handleNextStep() {
    if (currStep < numberOfSteps) {
      setStepNum((step) => step + 1);
      setStemp?.((step) => step + 1);
    }
  }

  return (
    <div className=" flex items-center justify-between gap-5">
      <Button
        onClick={handlePrevStep}
        size="sm"
        variant="secondary"
        disabled={currStep === 0}
      >
        <ChevronLeft />{" "}
      </Button>
      <div className=" space-y-5 flex-1">
        <div className=" bg-background     rounded-md p-5 ">
          <ProgressBar value={currStep} maxValue={numberOfSteps} />
        </div>
        <div className=" bg-background     rounded-md p-5 flex-1">
          <Progress value={currStep} maxValue={numberOfSteps}>
            <ProgressBarContainer>
              <ProgressMeter
                className={` ${currStep === 3 && "bg-purple-900"} `}
              />
            </ProgressBarContainer>
          </Progress>
        </div>
      </div>

      <Button
        onClick={handleNextStep}
        size="sm"
        variant="secondary"
        disabled={currStep === numberOfSteps}
      >
        <ChevronRight />
      </Button>
    </div>
  );
};

export default StepperProgress;
