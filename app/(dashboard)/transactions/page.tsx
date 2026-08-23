import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
};

export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Placeholder: see <code>features/transactions</code>.
      </p>
    </div>
  );
}
