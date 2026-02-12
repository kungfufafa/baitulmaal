import { View, Pressable, Image, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMemberPrayers, useAmenMutation } from '@/hooks/useBaitulMaal';

export default function SocialPrayerFeed() {
    const { data: prayers, isLoading } = useMemberPrayers();
    const amenMutation = useAmenMutation();
    const [likedPrayers, setLikedPrayers] = useState<Set<string>>(new Set());

    const handleLike = (id: string) => {
        const isLiked = likedPrayers.has(id);
        
        setLikedPrayers(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(id);
            else next.add(id);
            return next;
        });

        amenMutation.mutate(id);
    };

    if (isLoading) {
        return <ActivityIndicator size="small" color="#fbbf24" className="py-4" />;
    }

    return (
        <View className="px-4 py-4 mb-4">
             <View className="flex flex-row items-center gap-2 mb-4">
                <View className="w-1 h-5 bg-primary rounded-full" />
                <Text className="text-foreground font-semibold text-lg font-poppins">Titip Doa Bersama</Text>
            </View>
            
            <View className="gap-3">
                {prayers?.map((prayer) => {
                     const isLiked = likedPrayers.has(prayer.id);
                     const timeAgo = formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true, locale: id });
                     
                     return (
                        <View key={prayer.id} className="bg-white/10 rounded-xl p-4 border border-white/5">
                            <View className="flex-row items-center gap-3 mb-3">
                                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center overflow-hidden border border-white/10">
                                    {prayer.user.avatarUrl ? (
                                        <Image source={{ uri: prayer.user.avatarUrl }} className="w-full h-full" />
                                    ) : (
                                        <MaterialCommunityIcons name="account" size={20} color="white" />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-medium font-poppins text-sm">
                                        {prayer.isAnonymous ? 'Hamba Allah' : prayer.user.name}
                                    </Text>
                                    <Text className="text-white/40 text-xs font-poppins">
                                        {timeAgo}
                                    </Text>
                                </View>
                                <Pressable className="bg-white/5 px-2 py-1 rounded-full">
                                    <MaterialCommunityIcons name="dots-horizontal" size={16} color="rgba(255,255,255,0.5)" />
                                </Pressable>
                            </View>

                            <Text className="text-white/90 font-poppins text-sm leading-6 mb-4">
                                {prayer.content}
                            </Text>

                            <View className="flex-row items-center justify-between border-t border-white/5 pt-3">
                                <View className="flex-row items-center gap-1">
                                    <MaterialCommunityIcons name="heart" size={14} color="#fbbf24" />
                                    <Text className="text-amber-400 text-xs font-medium">
                                        {prayer.likesCount} Orang mengaminkan
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => handleLike(prayer.id)}
                                    className={cn(
                                        "flex-row items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95",
                                        isLiked ? "bg-amber-400" : "bg-emerald-800/50 border border-emerald-700"
                                    )}
                                >
                                    <MaterialCommunityIcons 
                                        name={isLiked ? "hands-pray" : "hands-pray"} 
                                        size={16} 
                                        color={isLiked ? "#064e3b" : "#fff"} 
                                    />
                                    <Text className={cn(
                                        "font-medium text-xs font-poppins",
                                        isLiked ? "text-emerald-900" : "text-white"
                                    )}>
                                        {isLiked ? 'Aamiin' : 'Aamiinkan'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                })}
            </View>

            <Pressable className="mt-4 flex-row items-center justify-center gap-2 py-3 bg-white/5 rounded-xl border border-dashed border-white/20 active:bg-white/10">
                <MaterialCommunityIcons name="pencil-plus" size={18} color="#fbbf24" />
                <Text className="text-amber-400 font-medium text-sm font-poppins">Tulis Doa Anda</Text>
            </Pressable>
        </View>
    );
}
