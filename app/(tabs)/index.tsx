import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/assets/constants/data";
import { icons } from "@/assets/constants/icons";
import images from "@/assets/constants/images";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import "@/global.css";
import { posthog, posthogLogger } from '@/libs/posthog';
import { formatCurrency } from "@/libs/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const handleSubscriptionDetailsToggle = (subscription: Subscription) => {
    const expanded = expandedSubscriptionId !== subscription.id;

    const action = expanded ? 'expanded' : 'collapsed';

    posthogLogger.info('subscription_details_toggled', {
      subscription_id: subscription.id,
      subscription_category: subscription.category!,
      billing_interval: subscription.billing.toLowerCase(),
      action,
    });
    posthog?.capture('subscription_details_toggled', {
      subscription_id: subscription.id,
      subscription_category: subscription.category!,
      billing_interval: subscription.billing.toLowerCase(),
      action,
    });
    setExpandedSubscriptionId(expanded ? subscription.id : null);
  };

  const handleSubscriptionCreate = (subscription: Subscription) => {
    const subscriptionCount = subscriptions.length + 1;
    const eventProperties = {
      subscription_id: subscription.id,
      subscription_category: subscription.category || 'Other',
      billing_interval: subscription.billing.toLowerCase(),
      status: subscription.status || 'active',
      subscription_count: subscriptionCount,
    };

    posthogLogger.info('subscription_created', eventProperties);
    posthog?.capture('subscription_created', eventProperties);
    setSubscriptions((currentSubscriptions) => [subscription, ...currentSubscriptions]);
    setExpandedSubscriptionId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
                className="home-add-icon items-center justify-center"
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Image source={icons.add} className="size-full" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>

                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (<UpcomingSubscriptionCard {...item} />)}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No uppcoming renewals yet.</Text>} />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={
              expandedSubscriptionId === item.id
            }
            onPress={() => handleSubscriptionDetailsToggle(item)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">No Subscriptions yet.</Text>}
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={handleSubscriptionCreate}
      />
    </SafeAreaView>
  );
}