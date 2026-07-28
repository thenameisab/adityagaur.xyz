import { Composition } from "remotion";
import { PlateProbe } from "./probe/PlateProbe";

/**
 * Every composition the site renders assets from is registered here.
 * Today that is one throwaway probe — see PlateProbe for why.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PlateProbe"
        component={PlateProbe}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
