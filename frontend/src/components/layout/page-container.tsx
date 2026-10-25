import type { ReactNode } from "react";

const widths = {
  form: "max-w-[850px]",
  community: "max-w-7xl",
  discussion: "max-w-[1150px]",
};

export default function PageContainer({
  width = "form",
  className = "",
  children,
}: {
  width?: keyof typeof widths;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main
      id="main"
      className={`mx-auto w-full px-4 pt-[25px] pb-15 md:px-6 md:pt-[30px] ${widths[width]} ${className}`}
    >
      {children}
    </main>
  );
}
