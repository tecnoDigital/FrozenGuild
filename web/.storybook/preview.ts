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
    }
  }
};

export default preview;
