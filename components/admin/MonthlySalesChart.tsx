'use client';

interface MonthlySale {
  month: string;
  revenue: number;
  orders: number;
}

interface MonthlySalesChartProps {
  data: MonthlySale[];
}

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  const maxRevenue = Math.max(1, ...data.map((d) => d.revenue));
  const maxOrders = Math.max(1, ...data.map((d) => d.orders));

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Monthly sales (last 12 months)
      </h3>
      <div className="flex h-64 items-end gap-1">
        {data.map((item) => (
          <div
            key={item.month}
            className="group relative flex flex-1 flex-col items-center gap-1"
          >
            <div className="flex w-full flex-1 items-end justify-center gap-0.5">
              <div
                className="w-full max-w-[45%] rounded-t transition-opacity group-hover:opacity-90"
                style={{
                  height: `${(item.revenue / maxRevenue) * 100}%`,
                  minHeight: item.revenue > 0 ? '4px' : 0,
                  backgroundColor: '#8b5cf6',
                }}
                title={`Revenue: $${item.revenue.toFixed(2)}`}
              />
              <div
                className="w-full max-w-[45%] rounded-t transition-opacity group-hover:opacity-90"
                style={{
                  height: `${(item.orders / maxOrders) * 100}%`,
                  minHeight: item.orders > 0 ? '4px' : 0,
                  backgroundColor: '#0ea5e9',
                }}
                title={`Orders: ${item.orders}`}
              />
            </div>
            <span className="w-full truncate text-center text-xs text-gray-500 dark:text-gray-400">
              {item.month}
            </span>
            <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden min-w-[120px] -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-left shadow-lg group-hover:block dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.month}
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                Revenue: ${item.revenue.toFixed(2)}
              </p>
              <p className="text-xs text-sky-600 dark:text-sky-400">
                Orders: {item.orders}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-[#8b5cf6]" aria-hidden />
          Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-[#0ea5e9]" aria-hidden />
          Orders
        </span>
      </div>
    </div>
  );
}
