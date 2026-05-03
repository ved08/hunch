import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "./Text";
import { Button } from "./Button";
import { colors, radii, space } from "../theme/index";
import { formatUsd, formatPercent, truncatePubkey } from "../utils/format";
import { usdToNative } from "../utils/native-amount";
import { buildBet, submitBet, type Side, type DepositMint } from "../api/bet";
import { useWallet } from "../wallet/provider";
import { useBroadcasts } from "../store/broadcasts";

export type BetSheetHandle = {
  open: (args: { marketId: string; marketQuestion: string; side: Side; priceHint: string | null }) => void;
  close: () => void;
};

type Stage = "form" | "submitting" | "success" | "error";

type Target = {
  marketId: string;
  marketQuestion: string;
  side: Side;
  priceHint: string | null;
};

const QUICK_AMOUNTS = [5, 25, 100];

export const BetSheet = forwardRef<BetSheetHandle>(function BetSheet(_, ref) {
  const sheetRef = useRef<BottomSheet>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [amount, setAmount] = useState<string>("5");
  const [mint, setMint] = useState<DepositMint>("USDC");
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);

  const wallet = useWallet();
  const addBroadcast = useBroadcasts((s) => s.add);
  const queryClient = useQueryClient();

  const snapPoints = useMemo(() => ["65%", "85%"], []);

  useImperativeHandle(ref, () => ({
    open: (t) => {
      setTarget(t);
      setAmount("5");
      setMint("USDC");
      setStage("form");
      setError(null);
      setTxSig(null);
      sheetRef.current?.expand();
    },
    close: () => sheetRef.current?.close(),
  }));

  const usdValue = Number(amount) || 0;
  const priceNum = target?.priceHint ? parseFloat(target.priceHint) : null;
  const normalizedPrice =
    priceNum != null ? (priceNum > 1 ? priceNum / 100 : priceNum) : null;
  const potentialPayout =
    normalizedPrice && normalizedPrice > 0
      ? usdValue / normalizedPrice
      : null;

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.6}
    />
  );

  async function placeBet() {
    if (!target) return;
    if (!wallet.pubkey) {
      await wallet.connect();
      if (!wallet.pubkey) return;
    }
    setStage("submitting");
    setError(null);
    try {
      const amountNative = usdToNative(usdValue);
      const entryPriceNative = usdToNative(normalizedPrice ?? 0);
      const build = await buildBet({
        marketId: target.marketId,
        side: target.side,
        amountNative,
        depositMint: mint,
        walletAddress: wallet.pubkey.toBase58(),
      });

      let sig: string;
      if (wallet.isDemo) {
        // Backend integration verified by /bet/build above. Skip signing +
        // /bet/submit since the demo wallet can't sign a real tx.
        sig = `demo-${build.orderPubkey.slice(0, 16)}`;
      } else {
        const signed = await wallet.signTransaction(build.unsignedTx);
        const submitted = await submitBet({
          signedTx: signed,
          marketId: target.marketId,
          side: target.side,
          amountNative,
          entryPriceNative,
          depositMint: mint,
          orderPubkey: build.orderPubkey,
          walletAddress: wallet.pubkey.toBase58(),
        });
        sig = submitted.sig;
      }

      setTxSig(sig);
      if (wallet.isDemo) {
        addBroadcast({
          id: build.orderPubkey,
          marketId: target.marketId,
          marketQuestion: target.marketQuestion,
          side: target.side,
          amountUsd: usdValue,
          depositMint: mint,
          txSig: sig,
          orderPubkey: build.orderPubkey,
          walletAddress: wallet.pubkey.toBase58(),
          createdAt: new Date().toISOString(),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setStage("success");
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError((err as Error)?.message ?? "Something went wrong");
      setStage("error");
    }
  }

  async function copySig() {
    if (!txSig) return;
    await Clipboard.setStringAsync(txSig).catch(() => {});
    Alert.alert("Copied", "Transaction signature copied to clipboard.");
  }

  const sideAccent = target?.side === "YES" ? colors.yes : colors.no;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.bg}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.content}>
        {target == null ? null : (
          <>
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.sideBadge,
                  {
                    backgroundColor:
                      target.side === "YES" ? colors.yesSoft : colors.noSoft,
                    borderColor: sideAccent,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  family="sansSemibold"
                  style={{ color: sideAccent, letterSpacing: 1.5 }}
                >
                  TAKE {target.side}
                </Text>
              </View>
              {target.priceHint ? (
                <Text variant="footnote" family="mono" tone="fgMuted">
                  @ {formatPercent(target.priceHint)}
                </Text>
              ) : null}
            </View>

            <Text
              variant="headline"
              family="serif"
              numberOfLines={3}
              style={{ marginTop: space.md }}
            >
              {target.marketQuestion}
            </Text>

            {stage === "form" || stage === "submitting" ? (
              <>
                <View style={styles.amountWrap}>
                  <Text variant="title" family="mono" tone="fgFaint">
                    $
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ""))}
                    keyboardType="decimal-pad"
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={colors.fgFaint}
                    selectionColor={colors.fg}
                    editable={stage === "form"}
                  />
                </View>

                <View style={styles.chipRow}>
                  {QUICK_AMOUNTS.map((a) => (
                    <Pressable
                      key={a}
                      onPress={() => setAmount(String(a))}
                      style={({ pressed }) => [
                        styles.chip,
                        amount === String(a) && styles.chipActive,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text
                        variant="footnote"
                        family="mono"
                        tone={amount === String(a) ? "fg" : "fgMuted"}
                      >
                        ${a}
                      </Text>
                    </Pressable>
                  ))}
                  <View style={styles.mintToggle}>
                    {(["USDC", "JUPUSD"] as const).map((m) => (
                      <Pressable
                        key={m}
                        onPress={() => setMint(m)}
                        style={[
                          styles.mintOption,
                          mint === m && styles.mintOptionActive,
                        ]}
                      >
                        <Text
                          variant="caption"
                          family={mint === m ? "sansSemibold" : "sansMedium"}
                          tone={mint === m ? "fg" : "fgMuted"}
                        >
                          {m}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {potentialPayout != null ? (
                  <View style={styles.quoteRow}>
                    <Text variant="footnote" family="sans" tone="fgMuted">
                      If {target.side} resolves, you'd receive
                    </Text>
                    <Text variant="body" family="mono" tone="fg">
                      {formatUsd(potentialPayout)}
                    </Text>
                  </View>
                ) : null}

                {wallet.error ? (
                  <Text variant="footnote" tone="danger" style={{ marginTop: space.sm }}>
                    {wallet.error}
                  </Text>
                ) : null}

                <Button
                  label={
                    !wallet.pubkey
                      ? "Connect wallet"
                      : stage === "submitting"
                        ? "Placing hunch…"
                        : "Place hunch"
                  }
                  loading={stage === "submitting" || wallet.isConnecting}
                  disabled={usdValue <= 0}
                  onPress={placeBet}
                  size="lg"
                  style={{ marginTop: space.xl }}
                />
              </>
            ) : null}

            {stage === "success" ? (
              <View style={styles.successWrap}>
                <Text variant="display" family="serifItalic" tone="accent">
                  {wallet.isDemo ? "Dry run." : "Broadcast."}
                </Text>
                <Text
                  variant="callout"
                  family="sans"
                  tone="fgMuted"
                  style={{ marginTop: space.sm, textAlign: "center" }}
                >
                  {wallet.isDemo
                    ? `Backend built an order for ${formatUsd(usdValue)} on ${target.side}. Signing was skipped (demo mode).`
                    : `Your ${target.side} hunch for ${formatUsd(usdValue)} is on-chain.`}
                </Text>
                <Pressable onPress={copySig} style={styles.sigChip}>
                  <Text variant="footnote" family="mono" tone="fg">
                    {txSig ? truncatePubkey(txSig, 6, 6) : ""}
                  </Text>
                  <Text variant="caption" family="sans" tone="fgMuted">
                    tap to copy
                  </Text>
                </Pressable>
                <Button
                  label="Done"
                  variant="ghost"
                  onPress={() => sheetRef.current?.close()}
                  style={{ marginTop: space.lg }}
                />
              </View>
            ) : null}

            {stage === "error" ? (
              <View style={styles.successWrap}>
                <Text variant="headline" family="serif" tone="danger">
                  It didn't go through
                </Text>
                <Text
                  variant="footnote"
                  family="sans"
                  tone="fgMuted"
                  style={{ marginTop: space.sm, textAlign: "center" }}
                >
                  {error}
                </Text>
                <Button
                  label="Try again"
                  onPress={() => setStage("form")}
                  style={{ marginTop: space.lg }}
                />
              </View>
            ) : null}
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  bg: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  handle: {
    backgroundColor: colors.border,
    width: 36,
  },
  content: {
    padding: space.xl,
    paddingBottom: space.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideBadge: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: space.xl,
    paddingVertical: space.lg,
  },
  amountInput: {
    fontSize: 48,
    color: colors.fg,
    fontFamily: "GeistMono_400Regular",
    minWidth: 100,
    padding: 0,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.fg,
    backgroundColor: colors.surface,
  },
  mintToggle: {
    flexDirection: "row",
    marginLeft: "auto",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: 2,
  },
  mintOption: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  mintOptionActive: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  quoteRow: {
    marginTop: space.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  successWrap: {
    alignItems: "center",
    paddingVertical: space.xl,
  },
  sigChip: {
    marginTop: space.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    gap: 2,
  },
});
