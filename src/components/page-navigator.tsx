"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveENS } from "../lib/ens";

export function PageNavigator() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNavigate = async () => {
    if (!input.trim()) {
      setError("Please enter an address or ENS name");
      return;
    }

    setIsResolving(true);
    setError(null);

    try {
      // First, resolve the input (ENS name or address) to an address
      const ens = await resolveENS(input);

      if (!ens.address) {
        setError("Invalid address or ENS name");
        setIsResolving(false);
        return;
      }

      // Navigate to the preferred identifier
      router.push(`/${ens.address}`);
      setIsResolving(false);
    } catch {
      setError("Failed to resolve address or ENS name");
      setIsResolving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNavigate();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Enter wallet address or ENS name..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isResolving}
            className="pl-9"
          />
        </div>
        <Button
          onClick={handleNavigate}
          disabled={isResolving || !input.trim()}
          className="gap-2"
        >
          {isResolving ? "Resolving..." : "Go to Page"}
          {!isResolving && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
