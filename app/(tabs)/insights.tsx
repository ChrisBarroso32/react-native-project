import { HOME_SUBSCRIPTIONS } from "@/assets/constants/data";
import { icons } from "@/assets/constants/icons";
import { colors } from "@/assets/constants/theme";
import SubscriptionIcon from "@/components/SubscriptionIcon";
import { formatCurrency } from "@/libs/utils";
import dayjs, { type Dayjs } from "dayjs";
import { router } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthlyCharge {
    subscription: Subscription;
    dueDate: Dayjs;
}

function getMonthlyCharges(subscriptions: Subscription[], month: Dayjs): MonthlyCharge[] {
    return subscriptions.flatMap((subscription) => {
        if ((subscription.status && subscription.status !== "active") || !subscription.renewalDate) {
            return [];
        }

        const renewalDate = dayjs(subscription.renewalDate);
        if (!renewalDate.isValid()) return [];

        const startDate = subscription.startDate ? dayjs(subscription.startDate) : renewalDate;
        if (!startDate.isValid() || startDate.isAfter(month.endOf("month"))) return [];

        const isYearly = (subscription.frequency || subscription.billing).toLowerCase() === "yearly";
        if (isYearly) {
            const monthsSinceRenewal = month.startOf("month").diff(renewalDate.startOf("month"), "month");
            if (monthsSinceRenewal < 0 || monthsSinceRenewal % 12 !== 0) return [];
        }

        const dueDate = month
            .date(Math.min(renewalDate.date(), month.daysInMonth()))
            .hour(renewalDate.hour())
            .minute(renewalDate.minute());

        if (dueDate.isBefore(startDate)) return [];
        return [{ subscription, dueDate }];
    });
}

function Insights() {
    const [selectedMonth, setSelectedMonth] = useState(dayjs("2026-03-01"));
    const charges = getMonthlyCharges(HOME_SUBSCRIPTIONS, selectedMonth);
    const previousCharges = getMonthlyCharges(HOME_SUBSCRIPTIONS, selectedMonth.subtract(1, "month"));
    const monthlySpend = charges.reduce((total, charge) => total + charge.subscription.price, 0);
    const previousSpend = previousCharges.reduce((total, charge) => total + charge.subscription.price, 0);
    const spendChange = previousSpend === 0
        ? (monthlySpend === 0 ? 0 : 100)
        : Math.round(((monthlySpend - previousSpend) / previousSpend) * 100);
    const dailySpend = weekdays.map((label, index) => {
        const amount = charges.reduce((total, charge) => {
            const weekdayIndex = (charge.dueDate.day() + 6) % 7;
            return total + (weekdayIndex === index ? charge.subscription.price : 0);
        }, 0);
        return { label, amount };
    });
    const maxDailySpend = Math.max(...dailySpend.map((day) => day.amount), 0);
    const chartScale = Math.max(10, Math.ceil(maxDailySpend / 10) * 10);
    const chartTicks = [chartScale, chartScale * 0.75, chartScale * 0.5, chartScale * 0.25, 0];
    const peakDayIndex = dailySpend.findIndex((day) => day.amount === maxDailySpend && maxDailySpend > 0);
    const sortedCharges = [...charges].sort((left, right) => left.dueDate.valueOf() - right.dueDate.valueOf());

    const openSubscriptions = () => router.push("/(tabs)/subscriptions");
    const openSubscription = (id: string) => router.push({
        pathname: "/(tabs)/subscriptions/[id]",
        params: { id },
    });

    return (
        <SafeAreaView className="flex-1 bg-background px-5">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-30"
            >
                <View className="mb-5 mt-2 flex-row items-center justify-between">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Back to home"
                        className="size-11 items-center justify-center rounded-full border border-border"
                        onPress={() => router.replace("/(tabs)")}
                    >
                        <Image source={icons.back} resizeMode="contain" className="size-5" />
                    </Pressable>
                    <Text className="font-sans-bold text-base text-primary">Monthly Insights</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="View all subscriptions"
                        className="size-11 items-center justify-center rounded-full border border-border"
                        onPress={openSubscriptions}
                    >
                        <Text className="font-sans-bold text-lg text-primary">•••</Text>
                    </Pressable>
                </View>

                <View className="mb-2 flex-row items-center justify-between">
                    <Text className="font-sans-bold text-base text-primary">Upcoming</Text>
                    <Pressable
                        accessibilityRole="button"
                        className="rounded-full border border-border bg-card px-3 py-1"
                        onPress={openSubscriptions}
                    >
                        <Text className="font-sans-semibold text-xs text-primary">View all</Text>
                    </Pressable>
                </View>

                <View className="rounded-2xl bg-muted p-4">
                    <View className="flex-row">
                        <View className="mr-3 h-32 justify-between pb-1">
                            {chartTicks.map((tick, index) => (
                                <Text key={`${tick}-${index}`} className="text-[9px] font-sans-medium text-muted-foreground">
                                    {Math.round(tick)}
                                </Text>
                            ))}
                        </View>
                        <View className="relative h-32 flex-1 justify-between">
                            {chartTicks.slice(0, -1).map((tick, index) => (
                                <View
                                    key={`${tick}-${index}`}
                                    className="absolute left-0 right-0 border-t border-dashed border-primary/10"
                                    style={{ top: `${index * 25}%` }}
                                />
                            ))}
                            <View className="h-full flex-row items-end justify-between">
                                {dailySpend.map((day, index) => {
                                    const barHeight = day.amount > 0 ? Math.max(6, (day.amount / chartScale) * 94) : 0;
                                    return (
                                        <View key={day.label} className="h-full flex-1 items-center justify-end">
                                            {index === peakDayIndex ? (
                                                <View
                                                    className="absolute z-10 rounded-md bg-accent px-1.5 py-0.5"
                                                    style={{ bottom: barHeight + 5 }}
                                                >
                                                    <Text className="text-[9px] font-sans-bold text-white">
                                                        {formatCurrency(day.amount).replace(/\.00$/, "")}
                                                    </Text>
                                                </View>
                                            ) : null}
                                            <View
                                                className="w-2.5 rounded-full"
                                                style={{ height: barHeight, backgroundColor: index === peakDayIndex ? colors.accent : colors.primary }}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                    <View className="ml-7 mt-2 flex-row justify-between">
                        {weekdays.map((day) => (
                            <Text key={day} className="flex-1 text-center text-[9px] font-sans-medium text-muted-foreground">
                                {day}
                            </Text>
                        ))}
                    </View>
                </View>

                <View className="mt-3 flex-row items-center justify-between rounded-2xl border border-border bg-card p-4">
                    <View className="flex-1">
                        <Text className="font-sans-semibold text-sm text-primary">Expenses</Text>
                        <View className="mt-1 flex-row items-center gap-1">
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Previous month"
                                className="size-7 items-center justify-center rounded-full"
                                onPress={() => setSelectedMonth((month) => month.subtract(1, "month"))}
                            >
                                <Text className="font-sans-bold text-base text-primary">‹</Text>
                            </Pressable>
                            <Text className="font-sans-medium text-xs text-muted-foreground">
                                {selectedMonth.format("MMMM YYYY")}
                            </Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Next month"
                                className="size-7 items-center justify-center rounded-full"
                                onPress={() => setSelectedMonth((month) => month.add(1, "month"))}
                            >
                                <Text className="font-sans-bold text-base text-primary">›</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="font-sans-bold text-base text-primary">-{formatCurrency(monthlySpend)}</Text>
                        <Text className="font-sans-medium text-xs" style={{ color: spendChange > 0 ? colors.accent : colors.success }}>
                            {spendChange > 0 ? "+" : ""}{spendChange}% vs last month
                        </Text>
                    </View>
                </View>

                <View className="mb-2 mt-5 flex-row items-center justify-between">
                    <Text className="font-sans-bold text-base text-primary">History</Text>
                    <Pressable
                        accessibilityRole="button"
                        className="rounded-full border border-border bg-card px-3 py-1"
                        onPress={openSubscriptions}
                    >
                        <Text className="font-sans-semibold text-xs text-primary">View all</Text>
                    </Pressable>
                </View>

                {sortedCharges.length > 0 ? sortedCharges.map(({ subscription, dueDate }, index) => (
                    <Pressable
                        key={`${subscription.id}-${dueDate.format("YYYY-MM")}`}
                        accessibilityRole="button"
                        className="mb-2 flex-row items-center justify-between rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: subscription.color || (index % 2 === 0 ? colors.subscription : colors.muted) }}
                        onPress={() => openSubscription(subscription.id)}
                    >
                        <View className="min-w-0 flex-1 flex-row items-center gap-3">
                            <SubscriptionIcon name={subscription.name} fallback={subscription.icon} size="compact" />
                            <View className="min-w-0 flex-1">
                                <Text numberOfLines={1} className="font-sans-bold text-sm text-primary">{subscription.name}</Text>
                                <Text className="mt-0.5 text-[10px] font-sans-medium text-muted-foreground">
                                    {dueDate.format("MMMM D, h:mm A")}
                                </Text>
                            </View>
                        </View>
                        <View className="ml-2 items-end">
                            <Text className="font-sans-bold text-sm text-primary">{formatCurrency(subscription.price)}</Text>
                            <Text className="text-[10px] font-sans-medium text-muted-foreground">
                                per {(subscription.frequency || subscription.billing).toLowerCase().replace("ly", "")}
                            </Text>
                        </View>
                    </Pressable>
                )) : (
                    <View className="rounded-xl border border-border bg-card px-4 py-6">
                        <Text className="text-center font-sans-medium text-sm text-muted-foreground">
                            No subscription payments this month.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

export default Insights;