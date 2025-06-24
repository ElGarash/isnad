import {
  DEFAULT_OG_DIMENSIONS,
  DEFAULT_OG_IMAGE,
  ERROR_MESSAGES,
} from "./constants";
import { Metadata } from "next";

interface BaseMetadataOptions {
  title: string;
  description: string;
  ogImagePath?: string;
  type?: "website" | "article";
}

export function generateBaseMetadata({
  title,
  description,
  ogImagePath = DEFAULT_OG_IMAGE,
  type = "website",
}: BaseMetadataOptions): Metadata {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_METADATA_BASE!);

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImagePath,
          ...DEFAULT_OG_DIMENSIONS,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImagePath],
    },
  };
}

export function generateNotFoundMetadata(
  errorKey: keyof typeof ERROR_MESSAGES,
): Metadata {
  const error = ERROR_MESSAGES[errorKey];
  return generateBaseMetadata({
    title: error.title,
    description: error.description,
  });
}
