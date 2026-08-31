/**
 * Standalone content validator.
 *
 * Loads every ROM, release and guide from content/ through the same
 * Zod-validated pipeline the site uses. Exits non-zero with a clear,
 * file-anchored error report when anything is malformed.
 *
 * Run directly:   npm run validate-content
 * (also runs automatically before `npm run build`)
 */
import {
  getAllGuides,
  getAllKernelReleases,
  getAllKernels,
  getAllRoms,
  getHubStats,
} from "../src/lib/content";

function main() {
  const roms = getAllRoms();
  const kernels = getAllKernels();
  const kernelReleases = getAllKernelReleases();
  const guides = getAllGuides();
  const stats = getHubStats();
  const releases = roms.reduce((sum, rom) => sum + rom.releaseCount, 0);

  console.log("Content validation passed.");
  console.log(`  ${roms.length} ROM${roms.length === 1 ? "" : "s"}`);
  console.log(`  ${releases} release${releases === 1 ? "" : "s"}`);
  console.log(`  ${kernels.length} kernel${kernels.length === 1 ? "" : "s"}`);
  console.log(
    `  ${kernelReleases.length} kernel release${
      kernelReleases.length === 1 ? "" : "s"
    }`
  );
  console.log(`  ${guides.length} guide${guides.length === 1 ? "" : "s"}`);

  for (const rom of roms) {
    const latest = rom.latest
      ? `latest ${rom.latest.version} (${rom.latest.releaseDate})`
      : "no releases";
    console.log(`  • ${rom.slug}: ${rom.releaseCount} release${rom.releaseCount === 1 ? "" : "s"}, ${latest}`);
  }

  for (const kernel of kernels) {
    const latest = kernel.latest
      ? `latest ${kernel.latest.version} (${kernel.latest.releaseDate})`
      : "no releases";
    console.log(
      `  • ${kernel.slug}: ${kernel.releaseCount} release${
        kernel.releaseCount === 1 ? "" : "s"
      }, ${latest}`
    );
  }

  void stats;
}

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
