import { register } from "./register";
import { updateFrameMembershipOfSelectedElements } from "@excalidraw/element";
import { getSelectedElements } from "../scene";
import { getNonDeletedElements } from "@excalidraw/element";
import { CaptureUpdateAction } from "@excalidraw/element";
import type { Radians } from "@excalidraw/math";

export const actionRotateLeft90 = register({
  name: "rotateLeft90",
  label: "labels.rotateLeft90",
  trackEvent: { category: "element" },
  perform: (elements, appState, _, app) => {
    const selectedElements = getSelectedElements(
      getNonDeletedElements(elements),
      appState,
      {
        includeBoundTextElement: true,
        includeElementsInFrames: true,
      },
    );
    
    selectedElements.forEach((element) => {
      app.scene.mutateElement(element, {
        angle: ((element.angle - Math.PI / 2) % (2 * Math.PI)) as Radians,
      });
    });

    return {
      elements: updateFrameMembershipOfSelectedElements(
        selectedElements,
        appState,
        app,
      ),
      appState,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});

export const actionRotateRight90 = register({
  name: "rotateRight90",
  label: "labels.rotateRight90",
  trackEvent: { category: "element" },
  perform: (elements, appState, _, app) => {
    const selectedElements = getSelectedElements(
      getNonDeletedElements(elements),
      appState,
      {
        includeBoundTextElement: true,
        includeElementsInFrames: true,
      },
    );
    
    selectedElements.forEach((element) => {
      app.scene.mutateElement(element, {
        angle: ((element.angle + Math.PI / 2) % (2 * Math.PI)) as Radians,
      });
    });

    return {
      elements: updateFrameMembershipOfSelectedElements(
        selectedElements,
        appState,
        app,
      ),
      appState,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});
