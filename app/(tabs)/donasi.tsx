import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function DonasiPlaceholder() {
    const router = useRouter();

    useEffect(() => {
        router.replace({ pathname: '/donation/flow', params: { category: 'sedekah' } });
    }, [router]);

    return null;
}
