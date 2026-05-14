type EmptyStateProps = {
  title: string;
  detail: string;
  tone?: 'neutral' | 'error';
};

export function EmptyState({ title, detail, tone = 'neutral' }: EmptyStateProps) {
  return (
    <div className='grid min-h-72 place-items-center p-8 text-center'>
      <div>
        <p className={`text-lg font-semibold ${tone === 'error' ? 'text-red-700' : 'text-slate-950'}`}>{title}</p>
        <p className='mt-2 max-w-sm text-sm leading-6 text-slate-500'>{detail}</p>
      </div>
    </div>
  );
}
