import React from "react";
import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import { colors, fonts, scale } from "../theme/index";

type Variant =
  | "display"
  | "title"
  | "headline"
  | "body"
  | "callout"
  | "footnote"
  | "caption";
type Family = "serif" | "serifItalic" | "sans" | "sansMedium" | "sansSemibold" | "mono" | "monoMedium";
type Tone = "fg" | "fgMuted" | "fgFaint" | "yes" | "no" | "accent" | "danger";

type Props = TextProps & {
  variant?: Variant;
  family?: Family;
  tone?: Tone;
  align?: TextStyle["textAlign"];
  weight?: TextStyle["fontWeight"];
};

const variantSize: Record<Variant, number> = {
  display: scale.display,
  title: scale.title,
  headline: scale.headline,
  body: scale.body,
  callout: scale.callout,
  footnote: scale.footnote,
  caption: scale.caption,
};

const variantLineHeight: Record<Variant, number> = {
  display: scale.display * 1.1,
  title: scale.title * 1.15,
  headline: scale.headline * 1.25,
  body: scale.body * 1.4,
  callout: scale.callout * 1.4,
  footnote: scale.footnote * 1.4,
  caption: scale.caption * 1.35,
};

export function Text({
  variant = "body",
  family = "sans",
  tone = "fg",
  align,
  weight,
  style,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        {
          color: colors[tone],
          fontFamily: fonts[family],
          fontSize: variantSize[variant],
          lineHeight: variantLineHeight[variant],
          textAlign: align,
          fontWeight: weight,
        },
        style,
      ]}
    />
  );
}
