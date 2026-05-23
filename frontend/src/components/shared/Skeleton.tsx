import clsx from "clsx";

interface Props {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width = "w-full", height = "h-4" }: Props) {
  return <div className={clsx("skeleton", width, height, className)} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <Skeleton height="h-5" width="w-1/3" />
      <Skeleton height="h-8" />
      <Skeleton height="h-3" width="w-2/3" />
    </div>
  );
}
