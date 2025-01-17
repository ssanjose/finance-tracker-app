'use client'

import React, { useEffect } from 'react';
import { Label, Pie, PieChart, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { Category, Transaction } from '@/lib/db/db.model';
import { CategoryService } from '@/services/category.service';
import { formatCurrency } from '@/lib/format/formatCurrency';
import { useSelectedDateRangeContext } from '@/hooks/use-selecteddaterange-context';
import { SelectedDateRange } from '@/services/analytics/props/date-range.props';
import { TransactionAnalyticsService } from '@/services/analytics/transaction.analytics.service';

const totalTransactionChartConfig = {
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-1))",
  },
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig


interface BaseRadioChartSummaryProps {
  className?: string;
  transactions?: Transaction[] | undefined;
  selectedDateRange?: SelectedDateRange;
}

interface ExpenseIncomeRadioChartProps extends BaseRadioChartSummaryProps {
  categories: Category[] | undefined;
}

interface TransactionChartSummaryProps {
  className?: string;
}

const DayString = (selectedDateRange: SelectedDateRange | undefined) => {
  if (selectedDateRange === SelectedDateRange.DAY) {
    return " today";
  } else if (selectedDateRange === SelectedDateRange.WEEK) {
    return " this past week";
  } else if (selectedDateRange === SelectedDateRange.MONTH) {
    return " this month";
  } else {
    return " this year";
  }
}

const TransactionChartSummary = ({ className }: TransactionChartSummaryProps) => {
  const selectedDateRange = useSelectedDateRangeContext();
  const [transactions, setTransactions] = React.useState<Transaction[] | undefined>(undefined);
  const categories = useLiveQuery(async () => await CategoryService.getAllCategories())

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await TransactionAnalyticsService.getTransactionsByDateRange({ dateRange: selectedDateRange });
      if (isMounted) setTransactions(data);
    })();

    return () => { isMounted = false; }
  }, [selectedDateRange])

  return (
    <div className={cn("", className)}>
      <div className="w-full md:w-full h-full flex flex-col md:flex-row max-h-none md:max-h-72 gap-4 *>*:bg-background">
        <Card className="flex justify-items-center items-center w-full shadow-xs border-0">
          <TotalTransactionRadioChart
            transactions={transactions}
            selectedDateRange={selectedDateRange}
          />
        </Card>
        <Card className="flex items-center w-full shadow-xs border-0">
          <IncomeTransactionChart
            transactions={transactions}
            categories={categories}
            selectedDateRange={selectedDateRange}
          />
        </Card>
        <Card className="flex items-center w-full shadow-xs border-0">
          <ExpenseTransactionChart
            transactions={transactions}
            categories={categories}
            selectedDateRange={selectedDateRange}
          />
        </Card>
      </div>
    </div>
  )
};

/**
 * Display a radial bar chart of total transactions, with a breakdown of income and expenses
 * @param className The class name to apply to the chart
 * @param transactions The transactions to display
 * @param selectedDateRange The date range to filter transactions by
 * @returns A radial bar chart of total transactions
 */
const TotalTransactionRadioChart = ({ transactions, selectedDateRange }: BaseRadioChartSummaryProps) => {
  const [expenseData, incomeData] = transactions?.reduce((acc, tx) => {
    if (tx.type === 0) acc[0] += 1
    else acc[1] += 1
    return acc
  }, [0, 0]) || [0, 0];
  const totalTxData = [{ income: incomeData, expense: expenseData }]

  return (
    <ChartContainer
      config={totalTransactionChartConfig}
      className="mx-auto aspect-square h-full w-full max-w-[210px]"
    >
      <RadialBarChart
        cy={"63%"}
        data={totalTxData}
        endAngle={180}
        innerRadius={80}
        outerRadius={130}
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0)}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {transactions?.length}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-muted-foreground"
                    >
                      Transactions {DayString(selectedDateRange)}

                    </tspan>
                  </text>
                )
              }
            }}
          />
        </PolarRadiusAxis>
        <RadialBar
          dataKey="expense"
          fill="var(--color-expense)"
          stackId="a"
          cornerRadius={5}
          className="stroke-transparent stroke-2"
        />
        <RadialBar
          dataKey="income"
          stackId="a"
          cornerRadius={5}
          fill="var(--color-income)"
          className="stroke-transparent stroke-2"
        />
      </RadialBarChart>
    </ChartContainer>
  )
}

/**
 * Display a pie chart of income transactions, with a breakdown of categories
 * @param className The class name to apply to the chart
 * @param transactions The transactions to display
 * @returns A pie chart of income transactions
 */
const IncomeTransactionChart = ({ transactions, selectedDateRange }: ExpenseIncomeRadioChartProps) => {
  const [incomeTransactions, setIncomeTransactions] = React.useState<Transaction[] | undefined>(undefined);
  const categories = useLiveQuery(async () => await CategoryService.getAllCategories())

  const incomeTransactionChartData = categories ? categories.map((category) => {
    return {
      category: category.name,
      value: incomeTransactions?.filter(tx => tx.categoryId === category.id).reduce((acc, tx) => acc + tx.amount, 0) || 0,
      fill: category.color,
    }
  }) : [];

  const incomeTransactionChartConfig = categories ? categories.reduce((acc, category) => {
    acc[category.name] = {
      label: category.name,
      color: category.color,
    };
    return acc;
  }, {} as ChartConfig) : {};

  useEffect(() => {
    if (!transactions) return;

    let isMounted = true;
    if (isMounted) setIncomeTransactions(transactions.filter((tx) => tx.type === 1));

    return () => { isMounted = false };
  }, [transactions])

  if (incomeTransactions === undefined || incomeTransactions.length === 0)
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[210px]">
        <h4 className="my-auto h-fit text-center text-xl md:text-sm lg:text-lg tracking-tight text-muted-foreground p-2">
          No income received for {DayString(selectedDateRange)}
        </h4>
      </div>
    )

  return (
    <ChartContainer
      config={incomeTransactionChartConfig}
      className="mx-auto aspect-square h-full w-full max-w-[210px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={incomeTransactionChartData}
          dataKey="value"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
          cy={"50%"}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {
                        formatCurrency(incomeTransactions?.reduce((acc, tx) => {
                          return acc + (tx.amount);
                        }, 0) || 0)
                      }
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground"
                    >
                      Income recieved
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>

    </ChartContainer>
  )
}

/**
 * Display a pie chart of expense transactions, with a breakdown of categories
 * @param className The class name to apply to the chart
 * @param transactions The transactions to display
 * @returns A pie chart of expense transactions
 */
const ExpenseTransactionChart = ({ transactions, selectedDateRange }: ExpenseIncomeRadioChartProps) => {
  const [expenseTransactions, setExpenseTransactions] = React.useState<Transaction[] | undefined>(undefined);
  const categories = useLiveQuery(async () => await CategoryService.getAllCategories())

  const expenseTransactionChartData = categories ? categories.map((category) => {
    return {
      category: category.name,
      value: expenseTransactions?.filter(tx => tx.categoryId === category.id).reduce((acc, tx) => acc + tx.amount, 0) || 0,
      fill: category.color,
    }
  }) : [];

  const expenseTransactionChartConfig = categories ? categories.reduce((acc, category) => {
    acc[category.name] = {
      label: category.name,
      color: category.color,
    };
    return acc;
  }, {} as ChartConfig) : {};

  useEffect(() => {
    if (!transactions) return;

    let isMounted = true;
    if (isMounted) setExpenseTransactions(transactions.filter((tx) => tx.type === 0));

    return () => { isMounted = false };
  }, [transactions])

  if (expenseTransactions === undefined || expenseTransactions.length === 0)
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[210px]">
        <h4 className="my-auto h-fit text-center text-xl md:text-sm lg:text-lg tracking-tight text-muted-foreground p-2">
          No expenses for {DayString(selectedDateRange)}
        </h4>
      </div>
    )

  return (
    <ChartContainer
      config={expenseTransactionChartConfig}
      className="mx-auto aspect-square h-full w-full max-w-[210px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={expenseTransactionChartData}
          dataKey="value"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {
                        formatCurrency(expenseTransactions?.reduce((acc, tx) => {
                          return acc + (tx.amount);
                        }, 0) || 0)
                      }
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Expenses made
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export default TransactionChartSummary;