import { VALUE_PROPS } from '@/lib/site';

export default function ValueProps() {
  return (
    <section className="border-b border-line" aria-label="Why Glasshouse">
      <div className="u-container grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {VALUE_PROPS.map((p, i) => (
          <div key={p.title} className="py-10 md:px-10 md:py-14 md:first:pl-0 md:last:pr-0">
            <p className="text-xs tabular-nums text-ink-300">0{i + 1}</p>
            <h3 className="mt-5 text-[1.0625rem]">{p.title}</h3>
            <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-500">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
