/**
 * Grit & Grace — story + lookbook types
 * Ties collections, blog, products, and lookbook into one narrative.
 */

export type StoryChapter =
  | "storm"
  | "grace"
  | "grit"
  | "social"
  | "giving"
  | "lookbook";

export interface StoryBeat {
  chapter: StoryChapter;
  /** Short label for nav / breadcrumbs */
  label: string;
  /** Page title */
  title: string;
  /** 1–2 sentence strip for collection heroes */
  short: string;
  /** Longer body paragraphs for story panels */
  body: string[];
  scripture?: string;
  /** Optional rotating phrases (Social already uses this pattern) */
  phrases?: string[];
  /** Link into the shop for this chapter */
  shopHref?: string;
  shopLabel?: string;
  /** Related blog slug(s) */
  journalSlugs?: string[];
  /** Product map keys from printfulMap for this chapter */
  productKeys?: string[];
  /** Accent for UI (matches existing brand colors) */
  accent?: string;
}

export interface LookbookLook {
  id: string;
  chapter: Exclude<StoryChapter, "storm" | "giving" | "lookbook">;
  title: string;
  /** One-line story caption under the image */
  caption: string;
  /** Primary image: local path preferred, else Printful URL */
  image: string;
  /** Optional second angle */
  imageAlt?: string;
  /** Printful sync_product_id */
  productId: string;
  productTitle: string;
  /** Optional scripture or phrase */
  line?: string;
}

export interface JournalPostMeta {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  chapter: StoryChapter;
}
