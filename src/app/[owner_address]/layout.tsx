import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { isAddress } from "thirdweb";
import { PageHeader } from "@/components/page-header";

interface OwnerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ owner_address: string }>;
}

export default async function OwnerLayout(props: OwnerLayoutProps) {
  const params = await props.params;

  // Resolve ENS name or address to address
  const ownerIdentifier = params.owner_address;

  // // If resolution fails, show 404
  if (!isAddress(ownerIdentifier)) {
    notFound();
  }

  return (
    <ViewTransition>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Header */}
        <PageHeader />

        {/* Main Content */}
        {props.children}
      </div>
    </ViewTransition>
  );
}
