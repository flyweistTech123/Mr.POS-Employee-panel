import { useNavigate } from "react-router-dom";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { trainingSteps } from "@/walkthrough/steps";
import ChefLogo from "@/assets/chef.svg";

const TrainingPage = () => {
  const navigate = useNavigate();
  const orderTrainingCompleted = useWalkthroughStore(
    (s) => s.completedTrainings.order,
  );
  const startTraining = useWalkthroughStore((s) => s.startTraining);

  const start = () => {
    startTraining("order", trainingSteps);
    navigate(trainingSteps[0].page);
  };

  return (
    <div className="w-full p-4 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Employee Training</h1>
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative flex flex-col items-end">
          <button
            className={`training-tooltip p-4 mb-82 rounded-xl border-t-0 rounded-br-none relative z-20 ${
              orderTrainingCompleted
                ? "bg-green-200 text-green-800"
                : "bg-primary-gradient-light"
            }`}
            onClick={start}
          >
            {orderTrainingCompleted ? (
              "Training completed - tap to start again"
            ) : (
              <>
                Tap here!
                <br />
                Let&apos;s Start the Training
              </>
            )}
          </button>
        </div>
        <img src={ChefLogo} alt="Chef-logo" />
      </div>
    </div>
  );
};

export default TrainingPage;