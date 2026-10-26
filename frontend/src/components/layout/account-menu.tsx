"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/forum/byline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LogoutItem() {
  const { pending } = useFormStatus();
  return (
    <DropdownMenuItem
      asChild
      disabled={pending}
      // Keep the form mounted until its submit action has been dispatched.
      onSelect={(event) => event.preventDefault()}
    >
      <button type="submit" disabled={pending} className="w-full text-left">
        {pending ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </DropdownMenuItem>
  );
}

export default function AccountMenu({ username }: { username: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-[3px] pr-2.5 pl-[3px] shadow-sm"
          aria-label="Mon compte"
        >
          <Avatar name={username} size="sm" />
          <span className="hidden max-w-[150px] truncate text-[13px] font-semibold text-secondary md:inline">
            {username}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[270px] max-w-[calc(100vw_-_16px)]">
        <DropdownMenuLabel>{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logout}>
          <LogoutItem />
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
