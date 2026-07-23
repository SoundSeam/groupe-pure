import type { CSSProperties, HTMLAttributes } from "react";

type GoogleMapsElementProps = HTMLAttributes<HTMLElement> & {
  style?: CSSProperties & Record<`--${string}`, string | number>;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "gmp-place-attribution": GoogleMapsElementProps & {
        "dark-scheme-color"?: string;
        "light-scheme-color"?: string;
      };
      "gmp-place-content-config": GoogleMapsElementProps;
      "gmp-place-details-compact": GoogleMapsElementProps & {
        orientation?: "horizontal" | "vertical";
        ref?: (element: HTMLElement | null) => void;
        "truncation-preferred"?: boolean;
      };
      "gmp-place-details-place-request": GoogleMapsElementProps & {
        place?: string;
      };
      "gmp-place-rating": GoogleMapsElementProps;
    }
  }
}
