import type { ReactNode } from "react";

const widths = {
  form: "max-w-[672px]",
  login: "max-w-[472px]",
  community: "max-w-[1260px]",
  discussion: "max-w-[1260px]",
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
      tabIndex={-1}
      className={`mx-auto w-full px-4 pt-4 pb-[100px] outline-none md:pt-6 md:pb-24 ${widths[width]} ${className}`}
    >
      {children}
    </main>
  );
}
