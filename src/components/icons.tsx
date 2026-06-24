import { Blueprint, Bulldozer, CraneTower } from "@phosphor-icons/react/ssr";

type ServiceIconProps = {
  service: "architecture" | "construction" | "excavation";
  className?: string;
};

export function ServiceIcon({ service, className }: ServiceIconProps) {
  const iconClassName = className ?? "h-28 w-28 text-white sm:h-32 sm:w-32";

  if (service === "architecture") {
    return <Blueprint aria-hidden="true" className={iconClassName} weight="thin" />;
  }

  if (service === "construction") {
    return <CraneTower aria-hidden="true" className={iconClassName} weight="thin" />;
  }

  return <Bulldozer aria-hidden="true" className={iconClassName} weight="thin" />;
}

export function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3 fill-current"
      viewBox="0 0 576 512"
    >
      <path d="M316.9 18.6 385 156.2l151.9 22.1c26.2 3.8 36.7 36.1 17.7 54.6L444.7 340l25.9 151.3c4.5 26.1-23 46-46.4 33.7L288 453.4 151.8 525c-23.4 12.3-50.9-7.6-46.4-33.7L131.3 340 21.4 232.9c-19-18.5-8.5-50.8 17.7-54.6L191 156.2 259.1 18.6c11.7-23.8 45-23.8 57.8 0z" />
    </svg>
  );
}
