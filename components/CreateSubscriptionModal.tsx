import { icons } from "@/assets/constants/icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

const categories = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Cloud",
    "Music",
    "Other",
] as const;

type Category = (typeof categories)[number];
type Frequency = "Monthly" | "Yearly";

const categoryColors: Record<Category, string> = {
    Entertainment: "#f2b8a2",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#f5c542",
    Productivity: "#b8e8d0",
    Cloud: "#a8d8ea",
    Music: "#d7e8a8",
    Other: "#f6eecf",
};

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
    visible,
    onClose,
    onCreate,
}: CreateSubscriptionModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [category, setCategory] = useState<Category>("Entertainment");
    const [nameTouched, setNameTouched] = useState(false);
    const [priceTouched, setPriceTouched] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const normalizedPrice = Number(price.trim().replace(",", "."));
    const nameIsValid = name.trim().length > 0;
    const priceIsValid = price.trim().length > 0 && Number.isFinite(normalizedPrice) && normalizedPrice > 0;
    const formIsValid = nameIsValid && priceIsValid;

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Entertainment");
        setNameTouched(false);
        setPriceTouched(false);
        setHasSubmitted(false);
    };

    const handleCreate = () => {
        setHasSubmitted(true);
        if (!formIsValid) return;

        const start = dayjs();
        const subscription: Subscription = {
            id: `subscription-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: name.trim(),
            price: normalizedPrice,
            frequency,
            category,
            status: "active",
            startDate: start.toISOString(),
            renewalDate: start.add(1, frequency === "Monthly" ? "month" : "year").toISOString(),
            icon: icons.wallet,
            billing: frequency,
            color: categoryColors[category],
        };

        onCreate(subscription);
        resetForm();
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View className="modal-overlay justify-end">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close new subscription form"
                    className="absolute inset-0"
                    onPress={onClose}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="w-full"
                >
                    <View className="modal-container overflow-hidden">
                        <View className="modal-header">
                            <Text className="modal-title">New Subscription</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                                className="modal-close"
                                onPress={onClose}
                            >
                                <Text className="modal-close-text">×</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="modal-body">
                                <View className="auth-field">
                                    <Text className="auth-label">Name</Text>
                                    <TextInput
                                        accessibilityLabel="Subscription name"
                                        className={clsx("auth-input", (nameTouched || hasSubmitted) && !nameIsValid && "auth-input-error")}
                                        value={name}
                                        onChangeText={setName}
                                        onBlur={() => setNameTouched(true)}
                                        placeholder="e.g. Spotify Premium"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        returnKeyType="next"
                                    />
                                    {(nameTouched || hasSubmitted) && !nameIsValid ? (
                                        <Text className="auth-error">Name is required.</Text>
                                    ) : null}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Price</Text>
                                    <TextInput
                                        accessibilityLabel="Subscription price"
                                        className={clsx("auth-input", (priceTouched || hasSubmitted) && !priceIsValid && "auth-input-error")}
                                        value={price}
                                        onChangeText={setPrice}
                                        onBlur={() => setPriceTouched(true)}
                                        placeholder="0.00"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        keyboardType="decimal-pad"
                                    />
                                    {(priceTouched || hasSubmitted) && !priceIsValid ? (
                                        <Text className="auth-error">Enter a price greater than zero.</Text>
                                    ) : null}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Frequency</Text>
                                    <View className="picker-row">
                                        {(["Monthly", "Yearly"] as const).map((option) => {
                                            const isSelected = frequency === option;
                                            return (
                                                <Pressable
                                                    key={option}
                                                    accessibilityRole="radio"
                                                    accessibilityState={{ selected: isSelected }}
                                                    className={clsx("picker-option", isSelected && "picker-option-active")}
                                                    onPress={() => setFrequency(option)}
                                                >
                                                    <Text className={clsx("picker-option-text", isSelected && "picker-option-text-active")}>
                                                        {option}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Category</Text>
                                    <View className="category-scroll">
                                        {categories.map((option) => {
                                            const isSelected = category === option;
                                            return (
                                                <Pressable
                                                    key={option}
                                                    accessibilityRole="radio"
                                                    accessibilityState={{ selected: isSelected }}
                                                    className={clsx("category-chip", isSelected && "category-chip-active")}
                                                    onPress={() => setCategory(option)}
                                                >
                                                    <Text className={clsx("category-chip-text", isSelected && "category-chip-text-active")}>
                                                        {option}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                <Pressable
                                    accessibilityRole="button"
                                    className={clsx("auth-button", !formIsValid && "auth-button-disabled")}
                                    disabled={!formIsValid}
                                    onPress={handleCreate}
                                >
                                    <Text className="auth-button-text">Add Subscription</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}