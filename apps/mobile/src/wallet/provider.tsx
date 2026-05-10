import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NativeModules, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { PublicKey, VersionedTransaction, Transaction } from "@solana/web3.js";
import { Buffer } from "buffer";
import { WALLET_ENABLED, DEMO_WALLET_ADDRESS } from "../config/flags";

const PUBKEY_KEY = "hunch.wallet.pubkey";
const AUTH_TOKEN_KEY = "hunch.wallet.authToken";
const APP_IDENTITY = {
  name: "hunch",
  uri: "https://hunch.fun",
};
const CLUSTER =
  (process.env.EXPO_PUBLIC_SOLANA_CLUSTER as "mainnet-beta" | "devnet") ??
  "mainnet-beta";

type WalletState = {
  pubkey: PublicKey | null;
  isMwaAvailable: boolean;
  isDemo: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (base64Tx: string) => Promise<string>;
};

const WalletContext = createContext<WalletState | null>(null);

type MwaModule = typeof import("@solana-mobile/mobile-wallet-adapter-protocol-web3js");

function loadMwa(): MwaModule | null {
  if (!WALLET_ENABLED) return null;
  if (Platform.OS !== "android") return null;
  // Only require the module if the native TurboModule is registered in the
  // binary. In Expo Go it isn't, and the package's top-level getEnforcing
  // call would crash the app.
  if (!NativeModules.SolanaMobileWalletAdapter) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@solana-mobile/mobile-wallet-adapter-protocol-web3js");
  } catch {
    return null;
  }
}

function pubkeyFromBase64(address: string): PublicKey {
  return new PublicKey(Buffer.from(address, "base64"));
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const mwa = useMemo(() => loadMwa(), []);
  const isDemo = !WALLET_ENABLED;
  const [pubkey, setPubkey] = useState<PublicKey | null>(
    isDemo ? new PublicKey(DEMO_WALLET_ADDRESS) : null
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (isDemo) return;
    let cancelled = false;
    (async () => {
      const [storedPub, storedToken] = await Promise.all([
        SecureStore.getItemAsync(PUBKEY_KEY).catch(() => null),
        SecureStore.getItemAsync(AUTH_TOKEN_KEY).catch(() => null),
      ]);
      if (cancelled) return;
      authTokenRef.current = storedToken;
      if (storedPub) {
        try {
          setPubkey(new PublicKey(storedPub));
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  const connect = useCallback(async () => {
    setError(null);
    if (isDemo) return; // already "connected" to demo pubkey
    if (!mwa) {
      setError(
        Platform.OS === "android"
          ? "Wallet adapter isn't in this build. Run `bun run android` from apps/mobile to build a dev client (Expo Go can't load native modules)."
          : "Mobile Wallet Adapter is Android-only. Use Seeker or any Android phone with a Solana wallet installed."
      );
      return;
    }
    setIsConnecting(true);
    try {
      const result = await mwa.transact(async (wallet) => {
        return wallet.authorize({ cluster: CLUSTER, identity: APP_IDENTITY });
      });
      const account = result.accounts[0];
      if (!account) throw new Error("No account returned from wallet");
      const pk = pubkeyFromBase64(account.address);
      setPubkey(pk);
      authTokenRef.current = result.auth_token;
      await Promise.all([
        SecureStore.setItemAsync(PUBKEY_KEY, pk.toBase58()),
        SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.auth_token),
      ]);
    } catch (err) {
      setError((err as Error)?.message ?? "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [mwa, isDemo]);

  const disconnect = useCallback(async () => {
    if (isDemo) return;
    authTokenRef.current = null;
    setPubkey(null);
    await Promise.all([
      SecureStore.deleteItemAsync(PUBKEY_KEY).catch(() => {}),
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {}),
    ]);
  }, [isDemo]);

  const signTransaction = useCallback(
    async (base64Tx: string): Promise<string> => {
      if (isDemo) {
        throw new Error("DEMO_MODE_NO_SIGN");
      }
      if (!mwa) {
        throw new Error("Wallet adapter unavailable (requires dev client on Android)");
      }
      const bytes = Buffer.from(base64Tx, "base64");
      const isVersioned = (() => {
        try {
          VersionedTransaction.deserialize(bytes);
          return true;
        } catch {
          return false;
        }
      })();

      const tx: VersionedTransaction | Transaction = isVersioned
        ? VersionedTransaction.deserialize(bytes)
        : Transaction.from(bytes);

      // Snapshot pre-filled partial signatures (e.g. Jupiter's session keypair
      // in slot 1) so we can restore them if the wallet drops them while
      // adding the user's signature.
      const preSigs: Array<{ idx: number; signature: Uint8Array }> = [];
      if (tx instanceof VersionedTransaction) {
        tx.signatures.forEach((sig, idx) => {
          if (sig.some((b) => b !== 0)) {
            preSigs.push({ idx, signature: new Uint8Array(sig) });
          }
        });
      }

      const signedBytes = await mwa.transact(async (wallet) => {
        const token = authTokenRef.current;
        if (token) {
          try {
            const reauth = await wallet.reauthorize({
              auth_token: token,
              identity: APP_IDENTITY,
            });
            authTokenRef.current = reauth.auth_token;
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, reauth.auth_token).catch(
              () => {}
            );
          } catch {
            const fresh = await wallet.authorize({
              cluster: CLUSTER,
              identity: APP_IDENTITY,
            });
            authTokenRef.current = fresh.auth_token;
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, fresh.auth_token).catch(
              () => {}
            );
          }
        } else {
          const fresh = await wallet.authorize({
            cluster: CLUSTER,
            identity: APP_IDENTITY,
          });
          authTokenRef.current = fresh.auth_token;
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, fresh.auth_token).catch(
            () => {}
          );
        }

        const [signed] = await wallet.signTransactions({ transactions: [tx] });
        if (!signed) throw new Error("Signing returned no transaction");

        if (signed instanceof VersionedTransaction) {
          // Restore any partial sigs the wallet may have zeroed out.
          for (const { idx, signature } of preSigs) {
            const current = signed.signatures[idx];
            if (!current || current.every((b) => b === 0)) {
              signed.signatures[idx] = signature;
            }
          }
          const required = signed.message.header.numRequiredSignatures;
          for (let i = 0; i < required; i++) {
            const s = signed.signatures[i];
            if (!s || s.every((b) => b === 0)) {
              const signer =
                signed.message.staticAccountKeys[i]?.toBase58() ?? `slot ${i}`;
              throw new Error(
                `Wallet returned tx with missing signature at slot ${i} (${signer}). Try a different wallet.`
              );
            }
          }
        }
        return signed.serialize();
      });

      return Buffer.from(signedBytes).toString("base64");
    },
    [mwa, isDemo]
  );

  const value: WalletState = {
    pubkey,
    isMwaAvailable: Boolean(mwa),
    isDemo,
    isConnecting,
    error,
    connect,
    disconnect,
    signTransaction,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
