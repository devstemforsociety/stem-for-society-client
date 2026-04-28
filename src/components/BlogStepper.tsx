import { Stepper } from "@mantine/core";
import { ReactNode } from "react";
import { useBlogStepper } from "../lib/hooks";

interface BlogStepperProps {
  step1Content: ReactNode;
  step2Content: ReactNode;
  step3Content: ReactNode;
}

const BlogStepper: React.FC<BlogStepperProps> = ({
  step1Content,
  step2Content,
  step3Content,
}) => {
  const { active, setActive } = useBlogStepper();

  return (
    <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
      <Stepper.Step
        label="Enter Details"
        description="Required Blog author details"
      >
        <div>{step1Content}</div>
      </Stepper.Step>
      <Stepper.Step
        label="Write Blog"
        disabled={active < 1}
        description="Write your blog"
      >
        <div>{step2Content}</div>
      </Stepper.Step>
      <Stepper.Step
        label="Upload Blog"
        description="Finalize and submit"
        disabled={active < 2}
      >
        <div>{step3Content}</div>
      </Stepper.Step>
    </Stepper>
  );
};

export default BlogStepper;
