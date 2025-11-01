import { mainnet } from "thirdweb/chains";
import { resolveAddress, resolveName } from "thirdweb/extensions/ens";
import { getAddress, isAddress } from "thirdweb/utils";
import { client } from "./thirdweb";

const nameToAddressCache = new Map<string, string | null>();
const addressToNameCache = new Map<string, string | null>();

export async function resolveENS(
  nameOrAddress: string,
): Promise<{ ensName: string | null; address: string | null }> {
  if (isAddress(nameOrAddress)) {
    const address = getAddress(nameOrAddress);
    let name: string | null = addressToNameCache.get(address) ?? null;

    if (!name) {
      try {
        name = await resolveName({
          client,
          address,
          resolverChain: mainnet,
        });
      } catch (error) {
        console.error("*** Error resolving name:", error);
        return {
          ensName: null,
          address: null,
        };
      }
      addressToNameCache.set(address, name);
    }
    return {
      ensName: name,
      address: nameOrAddress,
    };
  }

  let address: string | null = nameToAddressCache.get(nameOrAddress) ?? null;
  if (!address) {
    try {
      address = await resolveAddress({
        client,
        name: nameOrAddress,
        resolverChain: mainnet,
      });
    } catch (error) {
      console.error("*** Error resolving address:", error);
      return {
        ensName: null,
        address: null,
      };
    }
  }

  // if we are unable to resolve the address, return null
  if (!address) {
    return {
      ensName: null,
      address: null,
    };
  }

  if (address) {
    address = getAddress(address);
    nameToAddressCache.set(nameOrAddress, address);
    addressToNameCache.set(address, nameOrAddress);
  }

  return {
    ensName: nameOrAddress,
    address: address,
  };
}
