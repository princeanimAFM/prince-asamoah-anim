"use client";
// Shown instead of a blank "Application error" page when something goes wrong in the app.
import { useEffect } from "react";
import { Notice, PageHeader } from "@/components/ui";
import { isNewVersion } from "@/lib/errors";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const newVersion = isNewVersion(error);
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader title="Something went wrong" />
      <div className="flex max-w-xl flex-col gap-4">
        <Notice tone="warn">
          {newVersion
            ? "RMR Hub was updated while this page was open, so it couldn't save. Reload to get the new version, then check whether your change was saved before trying again."
            : "That didn't work. Reload the page and check whether your change was saved before trying again."}
        </Notice>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
          {!newVersion && (
            <button type="button" className="btn-secondary" onClick={reset}>
              Try again
            </button>
          )}
        </div>
        {error.digest && <p className="text-xs text-grey">Error reference: {error.digest}</p>}
      </div>
    </>
  );
}
