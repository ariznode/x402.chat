import "server-only";

import { createThirdwebClient } from "thirdweb";

export const serverClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
});
