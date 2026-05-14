type TodoStatsProps = {
  total: number;
  active: number;
  completion: number;
};

export function TodoStats({ total, active, completion }: TodoStatsProps) {
  return (
    <div className='grid grid-cols-3 gap-3 text-center sm:min-w-96'>
      <Stat
        label='Total'
        value={total}
      />
      <Stat
        label='Active'
        value={active}
      />
      <Stat
        label='Done'
        value={`${completion}%`}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className='rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm'>
      <p className='text-2xl font-semibold text-slate-950'>{value}</p>
      <p className='mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500'>{label}</p>
    </div>
  );
}
