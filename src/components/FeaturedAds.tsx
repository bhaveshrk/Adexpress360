import { useAds } from '../contexts/AdsContext';
import { AdCard } from './AdCard';

export function FeaturedAds() {
    const { getFeaturedAds } = useAds();
    const featuredAds = getFeaturedAds();

    if (featuredAds.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredAds.map(ad => (
                <AdCard key={ad.id} ad={ad} />
            ))}
        </div>
    );
}
