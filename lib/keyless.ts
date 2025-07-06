import { KeylessAccount } from '@aptos-labs/ts-sdk';

/**
 * Store the KeylessAccount in localStorage
 */
export const storeKeylessAccount = (account: KeylessAccount): void =>
  localStorage.setItem("@aptos/account", encodeKeylessAccount(account));

/**
 * Retrieve the KeylessAccount from localStorage if it exists
 */
export const getLocalKeylessAccount = (): KeylessAccount | undefined => {
  try {
    const encodedAccount = localStorage.getItem("@aptos/account");
    return encodedAccount ? decodeKeylessAccount(encodedAccount) : undefined;
  } catch (error) {
    console.warn(
      "Failed to decode account from localStorage",
      error
    );
    return undefined;
  }
};

/**
 * Stringify the KeylessAccount to be stored in localStorage
 */
export const encodeKeylessAccount = (account: KeylessAccount): string =>
  JSON.stringify(account, (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    if (e instanceof KeylessAccount)
      return { __type: "KeylessAccount", data: e.bcsToBytes() };
    return e;
  });

/**
 * Parse the KeylessAccount from a string
 */
export const decodeKeylessAccount = (encodedAccount: string): KeylessAccount =>
  JSON.parse(encodedAccount, (_, e) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    if (e && e.__type === "KeylessAccount")
      return KeylessAccount.fromBytes(e.data);
    return e;
  });

/**
 * Clear the KeylessAccount from localStorage
 */
export const clearKeylessAccount = (): void => {
  localStorage.removeItem("@aptos/account");
};

/**
 * Parse JWT from URL fragment or query parameters
 * Handles different OIDC redirect formats
 */
export const parseJWTFromURL = (url: string): string | null => {
  try {
    const urlObject = new URL(url);
    
    // Try to get JWT from URL fragment first (most common)
    if (urlObject.hash) {
      const fragment = urlObject.hash.substring(1);
      const params = new URLSearchParams(fragment);
      const idToken = params.get('id_token');
      if (idToken) {
        console.log("Found JWT in URL fragment");
        return idToken;
      }
    }
    
    // Try to get JWT from query parameters (fallback)
    const idToken = urlObject.searchParams.get('id_token');
    if (idToken) {
      console.log("Found JWT in query parameters");
      return idToken;
    }
    
    // Try to get JWT from access_token (some OIDC providers)
    const accessToken = urlObject.searchParams.get('access_token');
    if (accessToken) {
      console.log("Found access_token, using as JWT");
      return accessToken;
    }
    
    // Debug: log the URL structure
    console.log("URL structure:", {
      href: urlObject.href,
      hash: urlObject.hash,
      search: urlObject.search,
      searchParams: Object.fromEntries(urlObject.searchParams.entries())
    });
    
    return null;
  } catch (error) {
    console.error("Error parsing JWT from URL:", error);
    return null;
  }
}; 