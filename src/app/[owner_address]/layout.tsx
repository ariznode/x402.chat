import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { isAddress } from "thirdweb";

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

  return <ViewTransition>{props.children}</ViewTransition>;
}
