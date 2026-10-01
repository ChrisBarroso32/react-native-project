import { icons } from "@/assets/constants/icons";
import type { ImageSourcePropType } from "react-native";
import { Image, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
    siAnthropic,
    siApple,
    siApplemusic,
    siClaude,
    siCrunchyroll,
    siDropbox,
    siFigma,
    siGithub,
    siGoogle,
    siGooglecloud,
    siNetflix,
    siNotion,
    siParamountplus,
    siPerplexity,
    siSpotify,
    siYoutube,
    siZoom,
    type SimpleIcon,
} from "simple-icons";

const simpleBrandIcons: Record<string, SimpleIcon> = {
    spotify: siSpotify,
    netflix: siNetflix,
    youtube: siYoutube,
    anthropic: siAnthropic,
    claude: siClaude,
    apple: siApple,
    applemusic: siApplemusic,
    notion: siNotion,
    figma: siFigma,
    github: siGithub,
    dropbox: siDropbox,
    google: siGoogle,
    googlecloud: siGooglecloud,
    paramountplus: siParamountplus,
    crunchyroll: siCrunchyroll,
    perplexity: siPerplexity,
    zoom: siZoom,
};

const assetBrandIcons: Record<string, ImageSourcePropType> = {
    adobe: icons.adobe,
    canva: icons.canva,
    openai: icons.openai,
};

const normalizeBrandName = (name: string) => name.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
const brandNamesBySpecificity = Object.keys(simpleBrandIcons).sort((left, right) => right.length - left.length);
const assetNamesBySpecificity = Object.keys(assetBrandIcons).sort((left, right) => right.length - left.length);

interface SubscriptionIconProps {
    name: string;
    fallback: ImageSourcePropType;
    size?: "default" | "compact";
}

export default function SubscriptionIcon({ name, fallback, size = "default" }: SubscriptionIconProps) {
    const normalizedName = normalizeBrandName(name);
    const brandName = brandNamesBySpecificity.find((brand) => normalizedName.includes(brand));
    const brandIcon = brandName ? simpleBrandIcons[brandName] : undefined;
    const isCompact = size === "compact";

    if (brandIcon) {
        return (
            <View className={isCompact ? "size-10 items-center justify-center rounded-lg bg-white/60" : "sub-icon items-center justify-center rounded-lg bg-white"}>
                <Svg width={isCompact ? 22 : 34} height={isCompact ? 22 : 34} viewBox="0 0 24 24" accessibilityLabel={`${brandIcon.title} logo`}>
                    <Path d={brandIcon.path} fill={`#${brandIcon.hex}`} />
                </Svg>
            </View>
        );
    }

    const assetName = assetNamesBySpecificity.find((brand) => normalizedName.includes(brand));
    const imageSource = assetName ? assetBrandIcons[assetName] : fallback;

    return <Image source={imageSource} className={isCompact ? "size-10 rounded-lg" : "sub-icon"} resizeMode="contain" />;
}