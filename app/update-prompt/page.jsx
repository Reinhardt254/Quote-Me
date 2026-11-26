import { Suspense } from "react";
import EditPrompt from "./form";

const UpdatePromptPage = () => {
  return (
    <Suspense fallback={<p className="desc">Loading post...</p>}>
      <EditPrompt />
    </Suspense>
  );
};

export default UpdatePromptPage;
