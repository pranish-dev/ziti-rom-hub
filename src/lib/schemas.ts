import { z } from "zod";

/**
 * Zod schemas for all Git-backed content.
 *
 * Content is validated at load time; the production build fails with a
 * clear, per-file error when anything is malformed. Objects are `.strict()`
 * so typos in frontmatter keys are caught instead of silently dropped.
 *
 * YAML quirk handled here: an empty frontmatter value (`official_site:`)
 * parses as `null`, and an indented-but-empty one as `""`. Both are treated
 * as "field not set" so editors can clear optional fields without breaking
 * the build — required fields then fail with a clean "is required" message.
 */

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const VERSION_DIR_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Treat YAML null / empty / whitespace-only strings as "not provided". */
function emptyToUndefined(value: unknown): unknown {
  if (value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

/** Wrap a field so cleared frontmatter values behave like missing ones. */
function field<T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T> {
  return z.preprocess(emptyToUndefined, schema);
}

const isoDate = field(
  z
    .string({ required_error: "is required" })
    .regex(ISO_DATE_RE, "must be a valid ISO date (YYYY-MM-DD)")
    .refine((value) => {
      const [y, m, d] = value.split("-").map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return (
        !Number.isNaN(date.getTime()) &&
        date.getUTCFullYear() === y &&
        date.getUTCMonth() === m - 1 &&
        date.getUTCDate() === d
      );
    }, "must be a valid calendar date")
);

const urlField = z
  .string()
  .url("must be a valid URL (include https://)");

export const linkSchema = z
  .object({
    label: field(z.string({ required_error: "is required" }).min(1, "label cannot be empty")),
    url: field(urlField),
  })
  .strict();

export const romSchema = z
  .object({
    name: field(
      z.string({ required_error: "is required" }).min(1, "cannot be empty")
    ),
    slug: field(
      z
        .string({ required_error: "is required" })
        .min(1)
        .regex(SLUG_RE, "slug must be kebab-case (lowercase letters, digits, hyphens)")
    ),
    codename: field(z.string({ required_error: "is required" }).min(1).default("ziti")),
    device: field(
      z
        .string({ required_error: "is required" })
        .min(1)
        .default("OnePlus Nord CE 3 5G")
    ),
    maintainer: field(
      z.string({ required_error: "is required" }).min(1, "cannot be empty")
    ),
    maintainer_telegram: field(urlField.optional()),
    android_base: field(
      z.string({ required_error: "is required" }).min(1, "cannot be empty")
    ),
    support: field(
      z
        .enum(["official", "unofficial"], {
          errorMap: () => ({
            message: "must be either 'official' or 'unofficial'",
          }),
        })
        .default("unofficial")
    ),
    official_site: field(urlField.optional()),
    github: field(urlField.optional()),
    links: field(z.array(linkSchema).default([])),
    description: field(
      z
        .string({ required_error: "is required" })
        .min(1, "cannot be empty")
    ),
  })
  .strict();

export const downloadsSchema = z
  .object({
    primary: field(urlField.optional()),
    mirror: field(urlField.optional()),
    recovery: field(urlField.optional()),
    changelog: field(urlField.optional()),
  })
  .strict();

export const requirementsSchema = z
  .object({
    firmware: field(z.string().min(1).optional()),
    arb: field(z.string().min(1).optional()),
  })
  .strict();

export const releaseSchema = z
  .object({
    version: field(
      z.string({ required_error: "is required" }).min(1, "cannot be empty")
    ),
    release_date: isoDate,
    android: field(
      z.string({ required_error: "is required" }).min(1, "cannot be empty")
    ),
    qpr: field(z.string().min(1).optional()),
    build: field(
      z.enum(["normal", "hotfix"], {
        errorMap: () => ({
          message: "must be either 'normal' or 'hotfix'",
        }),
      })
    ).default("normal"),
    build_type: field(z.array(field(z.string().min(1))).default([])),
    maintainer: field(z.string().min(1).optional()),
    maintainer_telegram: field(urlField.optional()),
    downloads: field(downloadsSchema.default({})),
    requirements: field(requirementsSchema.default({})),
    warnings: field(z.array(field(z.string().min(1))).default([])),
    clean_flash: field(z.boolean().default(false)),
    backup_required: field(z.boolean().default(false)),
    features: field(z.array(field(z.string().min(1))).default([])),
    credits: field(z.array(field(z.string().min(1))).default([])),
  })
  .strict();

export const guideSchema = z
  .object({
    title: field(
      z.string({ required_error: "is required" }).min(1, "cannot be empty")
    ),
    description: field(z.string().min(1).optional()),
    order: field(z.coerce.number().int().nonnegative().default(50)),
  })
  .strict();

/** Format a Zod failure as a human-readable, file-anchored error block. */
export function formatContentError(
  kind: string,
  filePath: string,
  error: z.ZodError
): string {
  const issues = error.issues.map((issue) => {
    const fieldPath = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `  • ${fieldPath}${issue.message}`;
  });
  return [
    `Invalid ${kind} metadata:`,
    "",
    filePath,
    "",
    ...issues,
  ].join("\n");
}
