import { HOME_SUBSCRIPTIONS } from "@/assets/constants/data";
import SubscriptionCard from "@/components/SubscriptionCard";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
    const [query, setQuery] = useState("");
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredSubscriptions = HOME_SUBSCRIPTIONS.filter((subscription) =>
        [subscription.name, subscription.category, subscription.plan, subscription.paymentMethod, subscription.status]
            .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)),
    );

    return (
        <SafeAreaView className="flex-1 bg-background px-5 pt-5">
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(subscription) => subscription.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => setExpandedSubscriptionId((currentId) =>
                            currentId === item.id ? null : item.id,
                        )}
                    />
                )}
                ItemSeparatorComponent={() => <View className="h-3" />}
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-30"
                ListHeaderComponent={(
                    <View className="mb-5 gap-4">
                        <View className="flex-row items-end justify-between">
                            <Text className="font-sans-bold text-3xl text-primary">Subscriptions</Text>
                            <Text className="font-sans-semibold text-sm text-black/60">
                                {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? "result" : "results"}
                            </Text>
                        </View>
                        <View className="min-h-14 flex-row items-center rounded-xl border border-border bg-card px-4">
                            <TextInput
                                accessibilityLabel="Search subscriptions"
                                className="flex-1 py-3 font-sans-medium text-base text-primary"
                                placeholder="Search subscriptions"
                                placeholderTextColor="#737373"
                                returnKeyType="search"
                                value={query}
                                onChangeText={setQuery}
                                autoCorrect={false}
                            />
                            {query.length > 0 ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Clear search"
                                    className="px-2 py-3"
                                    onPress={() => setQuery("")}
                                >
                                    <Text className="font-sans-semibold text-sm text-primary">Clear</Text>
                                </Pressable>
                            ) : null}
                        </View>
                    </View>
                )}
                ListEmptyComponent={(
                    <Text className="py-8 text-center font-sans-medium text-base text-black/60">
                        No subscriptions match your search.
                    </Text>
                )}
            />
        </SafeAreaView>
    );
}