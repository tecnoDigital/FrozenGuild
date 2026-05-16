import type { Preview } from "@storybook/react-vite";
import "../src/styles/reset.css";
import "../src/styles/tokens.css";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    viewport: {
      viewports: {
        iphoneSe: {
          name: "iPhone SE",
          styles: { width: "375px", height: "667px" },
          type: "mobile"
        },
        iphone14: {
          name: "iPhone 14",
          styles: { width: "390px", height: "844px" },
          type: "mobile"
        },
        ipadMini: {
          name: "iPad Mini",
          styles: { width: "768px", height: "1024px" },
          type: "tablet"
        },
        laptop: {
          name: "Laptop 1366x768",
          styles: { width: "1366px", height: "768px" },
          type: "desktop"
        },
        fhd: {
          name: "Desktop 1920x1080",
          styles: { width: "1920px", height: "1080px" },
          type: "desktop"
        }
      }
    }
  }
};

export default preview;
