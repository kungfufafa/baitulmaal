import { Redirect } from 'expo-router';

export default function DonasiPlaceholder() {
    return <Redirect href={{ pathname: '/donation/flow', params: { category: 'sedekah' } }} />;
}
