import Link from "next/link";

type ConsumerShellNavProps = {
  developerEnabled: boolean;
};

const consumerItems = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/activity", label: "Activity" },
] as const;

export function ConsumerShellNav({ developerEnabled }: ConsumerShellNavProps): React.ReactElement {
  return (
    <>
      <nav aria-label="Consumer navigation">
        <ul className="flex flex-col gap-1 text-sm font-semibold">
          {consumerItems.map((item) => (
            <li key={item.href}>
              <Link
                className="block rounded-xl px-3 py-2.5 text-ink-2 transition-colors hover:bg-coral-tint hover:text-coral-deep"
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6 border-t border-line pt-5">
        <p className="px-3 text-xs font-semibold text-ink-3">Build with KailoPay</p>
        <Link
          className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:bg-lilac-tint hover:text-lilac-deep"
          href={developerEnabled ? "/developer" : "/profile"}
        >
          Developer Mode
        </Link>
      </div>
    </>
  );
}
