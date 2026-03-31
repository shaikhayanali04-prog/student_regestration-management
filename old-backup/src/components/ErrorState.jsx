export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-red-600 px-3 py-2 text-white"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
