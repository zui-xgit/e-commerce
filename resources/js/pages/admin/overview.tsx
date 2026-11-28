import { Head } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatProductPrice } from '@/lib/admin-products';
import admin from '@/routes/admin';
import type { Currency } from '@/types/site-settings';

type DailyPoint = {
    date: string;
    label: string;
    orders: number;
    value: number;
    placed: number;
    confirmed: number;
    cancelled: number;
};

type TopProduct = {
    title: string;
    units: number;
    value: number;
};

type OverviewProps = {
    window: {
        days: number;
        from: string;
        to: string;
    };
    stats: {
        orders: number;
        pending: number;
        processed: number;
        cancelled: number;
        orderValue: number;
        averageOrderValue: number;
    };
    series: DailyPoint[];
    topProducts: TopProduct[];
};

const countFormatter = new Intl.NumberFormat('en-TZ', {
    maximumFractionDigits: 0,
});
const compactCountFormatter = new Intl.NumberFormat('en-TZ', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

function formatCount(value: number): string {
    return countFormatter.format(value);
}

function formatCompactMoney(value: number, currency: Currency): string {
    return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

const orderChartConfig = {
    orders: { label: 'Orders', color: 'var(--chart-1)' },
    value: { label: 'Order value', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const fulfillmentChartConfig = {
    placed: { label: 'Placed', color: 'var(--chart-1)' },
    confirmed: { label: 'Confirmed', color: 'var(--chart-3)' },
    cancelled: { label: 'Cancelled', color: 'var(--muted-foreground)' },
} satisfies ChartConfig;

const productChartConfig = {
    units: { label: 'Units sold', color: 'var(--chart-2)' },
} satisfies ChartConfig;

function StatCell({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <div className="min-w-0 bg-card px-4 py-4 sm:px-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
    );
}

function TooltipLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex w-full items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground tabular-nums">
                {value}
            </span>
        </div>
    );
}

function ChartEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex h-[240px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/20 px-6 text-center">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="max-w-sm text-xs text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

export default function Overview({
    window: windowInfo,
    stats,
    series,
    topProducts,
}: OverviewProps) {
    const { site_name: siteName, currency } = useSiteSettings();

    const hasOrders = stats.orders > 0;
    const hasFulfillment = series.some(
        (point) =>
            point.placed > 0 || point.confirmed > 0 || point.cancelled > 0,
    );
    const hasProducts = topProducts.length > 0;

    return (
        <>
            <Head title="Overview" />

            <div className="w-full space-y-4">
                <header className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-semibold tracking-tight">
                            Overview
                        </h1>
                        <p className="text-sm text-pretty text-muted-foreground">
                            A {windowInfo.days}-day view of orders, fulfillment
                            and product demand.
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">
                            {windowInfo.days} days
                        </span>{' '}
                        · {siteName}
                    </p>
                </header>

                <Card className="gap-0 overflow-hidden py-0">
                    <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
                        <StatCell
                            label="Orders"
                            value={formatCount(stats.orders)}
                            hint="Placed in window"
                        />
                        <StatCell
                            label="Pending"
                            value={formatCount(stats.pending)}
                            hint="Awaiting confirmation now"
                        />
                        <StatCell
                            label="Processed"
                            value={formatCount(stats.processed)}
                            hint="Processed in window"
                        />
                        <StatCell
                            label="Cancelled"
                            value={formatCount(stats.cancelled)}
                            hint="Cancelled in window"
                        />
                        <StatCell
                            label="Order value"
                            value={formatCompactMoney(
                                stats.orderValue,
                                currency,
                            )}
                            hint="Placed in window"
                        />
                        <StatCell
                            label="Avg order"
                            value={formatProductPrice(
                                stats.averageOrderValue,
                                currency,
                            )}
                            hint="Per order in window"
                        />
                    </div>
                </Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="border-b px-5 py-4">
                        <CardTitle className="text-base">
                            Orders & order value
                        </CardTitle>
                        <CardDescription>
                            Orders placed from {windowInfo.from} to{' '}
                            {windowInfo.to}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 pt-4 pb-4 sm:px-5">
                        {!hasOrders ? (
                            <ChartEmptyState
                                title="No orders in this window"
                                description="Order volume and value will appear here as soon as a checkout is placed."
                            />
                        ) : (
                            <ChartContainer
                                id="orders-value"
                                config={orderChartConfig}
                                className="aspect-auto h-[280px] w-full"
                            >
                                <ComposedChart
                                    data={series}
                                    margin={{
                                        top: 8,
                                        right: 8,
                                        bottom: 0,
                                        left: 0,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        interval="preserveStartEnd"
                                        minTickGap={24}
                                    />
                                    <YAxis
                                        yAxisId="orders"
                                        tickLine={false}
                                        axisLine={false}
                                        width={36}
                                        tickFormatter={(value: number) =>
                                            compactCountFormatter.format(value)
                                        }
                                    />
                                    <YAxis
                                        yAxisId="value"
                                        orientation="right"
                                        tickLine={false}
                                        axisLine={false}
                                        width={52}
                                        tickFormatter={(value: number) =>
                                            formatCompactMoney(value, currency)
                                        }
                                    />
                                    <ChartTooltip
                                        cursor={{ fill: 'var(--muted)' }}
                                        content={
                                            <ChartTooltipContent
                                                formatter={(value, name) => (
                                                    <TooltipLine
                                                        label={String(name)}
                                                        value={
                                                            name ===
                                                            'Order value'
                                                                ? formatCompactMoney(
                                                                      Number(
                                                                          value,
                                                                      ),
                                                                      currency,
                                                                  )
                                                                : formatCount(
                                                                      Number(
                                                                          value,
                                                                      ),
                                                                  )
                                                        }
                                                    />
                                                )}
                                            />
                                        }
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar
                                        yAxisId="orders"
                                        dataKey="orders"
                                        name="Orders"
                                        fill="var(--color-orders)"
                                        radius={[3, 3, 0, 0]}
                                        maxBarSize={18}
                                    />
                                    <Line
                                        yAxisId="value"
                                        type="monotone"
                                        dataKey="value"
                                        name="Order value"
                                        stroke="var(--color-value)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </ComposedChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b px-5 py-4">
                            <CardTitle className="text-base">
                                Fulfillment activity
                            </CardTitle>
                            <CardDescription>
                                Placed, confirmed and cancelled by day
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 pt-4 pb-4 sm:px-5">
                            {!hasFulfillment ? (
                                <ChartEmptyState
                                    title="No fulfillment activity yet"
                                    description="Confirmation and cancellation events will appear here as orders move through the queue."
                                />
                            ) : (
                                <ChartContainer
                                    id="fulfillment"
                                    config={fulfillmentChartConfig}
                                    className="aspect-auto h-[240px] w-full"
                                >
                                    <BarChart
                                        data={series}
                                        margin={{
                                            top: 8,
                                            right: 4,
                                            bottom: 0,
                                            left: 0,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            interval="preserveStartEnd"
                                            minTickGap={24}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            width={36}
                                            allowDecimals={false}
                                        />
                                        <ChartTooltip
                                            cursor={{ fill: 'var(--muted)' }}
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(
                                                        value,
                                                        name,
                                                    ) => (
                                                        <TooltipLine
                                                            label={String(name)}
                                                            value={formatCount(
                                                                Number(value),
                                                            )}
                                                        />
                                                    )}
                                                />
                                            }
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="placed"
                                            name="Placed"
                                            fill="var(--color-placed)"
                                            radius={[3, 3, 0, 0]}
                                            maxBarSize={12}
                                        />
                                        <Bar
                                            dataKey="confirmed"
                                            name="Confirmed"
                                            fill="var(--color-confirmed)"
                                            radius={[3, 3, 0, 0]}
                                            maxBarSize={12}
                                        />
                                        <Bar
                                            dataKey="cancelled"
                                            name="Cancelled"
                                            fill="var(--color-cancelled)"
                                            radius={[3, 3, 0, 0]}
                                            maxBarSize={12}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b px-5 py-4">
                            <CardTitle className="text-base">
                                Top products
                            </CardTitle>
                            <CardDescription>
                                Units sold in the last {windowInfo.days} days
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 pt-4 pb-4 sm:px-5">
                            {!hasProducts ? (
                                <ChartEmptyState
                                    title="No product sales in this window"
                                    description="The best-selling products will appear here once orders include items."
                                />
                            ) : (
                                <ChartContainer
                                    id="top-products"
                                    config={productChartConfig}
                                    className="aspect-auto h-[240px] w-full"
                                >
                                    <BarChart
                                        data={topProducts}
                                        layout="vertical"
                                        margin={{
                                            top: 8,
                                            right: 16,
                                            bottom: 0,
                                            left: 0,
                                        }}
                                    >
                                        <CartesianGrid horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="title"
                                            tickLine={false}
                                            axisLine={false}
                                            width={104}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                    formatter={(
                                                        value,
                                                        _name,
                                                        item,
                                                    ) => {
                                                        const product =
                                                            item?.payload as
                                                                | TopProduct
                                                                | undefined;

                                                        return (
                                                            <div className="grid gap-1.5">
                                                                <div className="font-medium">
                                                                    {product?.title ??
                                                                        'Product'}
                                                                </div>
                                                                <TooltipLine
                                                                    label="Units sold"
                                                                    value={formatCount(
                                                                        Number(
                                                                            value,
                                                                        ),
                                                                    )}
                                                                />
                                                                <TooltipLine
                                                                    label="Order value"
                                                                    value={formatCompactMoney(
                                                                        product?.value ??
                                                                            0,
                                                                        currency,
                                                                    )}
                                                                />
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="units"
                                            name="Units sold"
                                            fill="var(--color-units)"
                                            radius={[0, 3, 3, 0]}
                                            maxBarSize={20}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Overview.layout = {
    breadcrumbs: [
        {
            title: 'Overview',
            href: admin.overview(),
        },
    ],
};
