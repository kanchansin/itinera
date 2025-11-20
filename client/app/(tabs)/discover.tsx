import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2; // 20px padding left + 20px padding right + 12px gap

const travelCategories = [
  {
    id: 1,
    name: "Beaches",
    icon: "🌊",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    count: 45,
    gradient: ['#06beb6', '#48b1bf']
  },
  {
    id: 2,
    name: "Hill Stations",
    icon: "🏔️",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    count: 67,
    gradient: ['#667eea', '#764ba2']
  },
  {
    id: 3,
    name: "Cities",
    icon: "🏙️",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80",
    count: 38,
    gradient: ['#f093fb', '#f5576c']
  },
  {
    id: 4,
    name: "Wellness",
    icon: "🧘",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
    count: 29,
    gradient: ['#4facfe', '#00f2fe']
  },
  {
    id: 5,
    name: "Culture",
    icon: "🎭",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
    count: 52,
    gradient: ['#fa709a', '#fee140']
  },
  {
    id: 6,
    name: "Wildlife",
    icon: "🦁",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
    count: 34,
    gradient: ['#30cfd0', '#330867']
  },
  {
    id: 7,
    name: "Food Tours",
    icon: "🍜",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    count: 41,
    gradient: ['#fdbb2d', '#22c1c3']
  },
  {
    id: 8,
    name: "Road Trips",
    icon: "🚗",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    count: 56,
    gradient: ['#ee0979', '#ff6a00']
  }
];

const regions = [
  {
    id: 1,
    name: "North India",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    places: 128
  },
  {
    id: 2,
    name: "South India",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    places: 156
  },
  {
    id: 3,
    name: "North-East India",
    image: "https://images.unsplash.com/photo-1562979314-bee7453e911c?w=800&q=80",
    places: 87
  },
  {
    id: 4,
    name: "International",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    places: 243
  }
];

const curatedCollections = [
  {
    id: 1,
    title: "Best Monsoon Trips 🍃",
    subtitle: "Embrace the rain",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
    count: 24
  },
  {
    id: 2,
    title: "Budget-Friendly Under ₹5,000",
    subtitle: "Travel without breaking the bank",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    count: 32
  },
  {
    id: 3,
    title: "Perfect 2-Day Road Trips",
    subtitle: "Weekend escapes",
    image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=80",
    count: 18
  },
  {
    id: 4,
    title: "Luxury Escapes",
    subtitle: "Indulge yourself",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    count: 15
  },
  {
    id: 5,
    title: "Slow Travel Picks",
    subtitle: "Take your time",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
    count: 21
  }
];

const popularDestinations = [
  {
    id: 1,
    name: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    country: "India",
    trending: true
  },
  {
    id: 2,
    name: "Manali",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    country: "India",
    trending: false
  },
  {
    id: 3,
    name: "Jaipur",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
    country: "India",
    trending: true
  },
  {
    id: 4,
    name: "Kerala Backwaters",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    country: "India",
    trending: false
  },
  {
    id: 5,
    name: "Rishikesh",
    image: "https://images.unsplash.com/photo-1626509653291-18d9845ab6c8?w=800&q=80",
    country: "India",
    trending: true
  },
  {
    id: 6,
    name: "Udaipur",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09f?w=800&q=80",
    country: "India",
    trending: false
  }
];

const eventBasedDiscovery = [
  {
    id: 1,
    title: "Winter Festivals",
    icon: "❄️",
    image: "https://images.unsplash.com/photo-1483086431886-3590a88317fe?w=800&q=80",
    month: "Dec - Feb"
  },
  {
    id: 2,
    title: "Summer Treks",
    icon: "⛰️",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    month: "May - Jul"
  },
  {
    id: 3,
    title: "Cherry Blossom Spots",
    icon: "🌸",
    image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80",
    month: "Mar - Apr"
  },
  {
    id: 4,
    title: "Music Events",
    icon: "🎵",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    month: "Year-round"
  }
];

const CategoryCard = ({ category }: { category: typeof travelCategories[0] }) => (
  <TouchableOpacity style={styles.categoryCard}>
    <Image source={{ uri: category.image }} style={styles.categoryImage} />
    <LinearGradient colors={[category.gradient[0] || '#000', category.gradient[1] || '#fff', 'rgba(0,0,0,0.3)']} style={styles.categoryGradient} />
    <View style={styles.categoryContent}>
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.categoryCount}>{category.count} destinations</Text>
    </View>
  </TouchableOpacity>
);

const RegionCard = ({ region }: { region: typeof regions[0] }) => (
  <TouchableOpacity style={styles.regionCard}>
    <Image source={{ uri: region.image }} style={styles.regionImage} />
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.regionGradient} />
    <View style={styles.regionContent}>
      <Text style={styles.regionName}>{region.name}</Text>
      <Text style={styles.regionPlaces}>{region.places} places</Text>
    </View>
  </TouchableOpacity>
);

const CollectionCard = ({ collection }: { collection: typeof curatedCollections[0] }) => (
  <TouchableOpacity style={styles.collectionCard}>
    <Image source={{ uri: collection.image }} style={styles.collectionImage} />
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.collectionGradient} />
    <View style={styles.collectionContent}>
      <Text style={styles.collectionTitle}>{collection.title}</Text>
      <Text style={styles.collectionSubtitle}>{collection.subtitle}</Text>
      <View style={styles.collectionBadge}>
        <Text style={styles.collectionCount}>{collection.count} trips</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const PopularDestinationCard = ({ destination }: { destination: typeof popularDestinations[0] }) => (
  <TouchableOpacity style={styles.popularCard}>
    <Image source={{ uri: destination.image }} style={styles.popularImage} />
    {destination.trending && (
      <View style={styles.trendingBadge}>
        <Ionicons name="trending-up" size={12} color="#fff" />
        <Text style={styles.trendingText}>Trending</Text>
      </View>
    )}
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.popularGradient} />
    <View style={styles.popularContent}>
      <Text style={styles.popularName}>{destination.name}</Text>
      <Text style={styles.popularCountry}>{destination.country}</Text>
    </View>
  </TouchableOpacity>
);

const EventCard = ({ event }: { event: typeof eventBasedDiscovery[0] }) => (
  <TouchableOpacity style={styles.eventCard}>
    <Image source={{ uri: event.image }} style={styles.eventImage} />
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.eventGradient} />
    <View style={styles.eventContent}>
      <Text style={styles.eventIcon}>{event.icon}</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventMonth}>{event.month}</Text>
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: boolean }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <TouchableOpacity>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    )}
  </View>
);

const DiscoverTab = () => {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Browse all travel possibilities</Text>
        </View>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map-outline" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'regions' && styles.tabActive]}
          onPress={() => setActiveTab('regions')}
        >
          <Text style={[styles.tabText, activeTab === 'regions' && styles.tabTextActive]}>Regions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'collections' && styles.tabActive]}
          onPress={() => setActiveTab('collections')}
        >
          <Text style={[styles.tabText, activeTab === 'collections' && styles.tabTextActive]}>Collections</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'categories' && (
          <>
            <SectionHeader title="Travel Categories" subtitle="Explore by interest" />
            <View style={styles.categoryGrid}>
              {travelCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>

            <SectionHeader title="Popular Destinations" subtitle="Trending this month" action />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {popularDestinations.map((destination) => (
                <PopularDestinationCard key={destination.id} destination={destination} />
              ))}
            </ScrollView>

            <SectionHeader title="Event-Based Discovery" subtitle="Plan around experiences" />
            <View style={styles.eventGrid}>
              {eventBasedDiscovery.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>
          </>
        )}

        {activeTab === 'regions' && (
          <>
            <SectionHeader title="Browse by Region" subtitle="Discover by location" />
            <View style={styles.regionGrid}>
              {regions.map((region) => (
                <RegionCard key={region.id} region={region} />
              ))}
            </View>

            <View style={styles.mapCard}>
              <View style={styles.mapCardContent}>
                <Ionicons name="location" size={32} color="#667eea" />
                <Text style={styles.mapCardTitle}>Near You</Text>
                <Text style={styles.mapCardText}>Discover destinations around you</Text>

                <TouchableOpacity style={styles.mapCardButton}>
                  <Text style={styles.mapCardButtonText}>View Map</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {activeTab === 'collections' && (
          <>
            <SectionHeader title="Curated Collections" subtitle="Handpicked journeys" />
            {curatedCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
              <Text style={styles.infoText}>
                Collections are carefully curated by travel experts and our community
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#666' },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  tabActive: { backgroundColor: '#1a1a1a' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#666' },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#667eea' },
  categoryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 20, 
    gap: 12,
    justifyContent: 'space-between'
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  categoryImage: { width: '100%', height: '100%', position: 'absolute' },
  categoryGradient: { position: 'absolute', width: '100%', height: '100%' },
  categoryContent: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  categoryName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  categoryCount: { fontSize: 12, color: '#fff', opacity: 0.9 },

  horizontalScroll: { paddingHorizontal: 20, gap: 12 },
  popularCard: {
    width: 140,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  popularImage: { width: '100%', height: '100%', position: 'absolute' },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    zIndex: 1,
  },
  trendingText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  popularGradient: { position: 'absolute', width: '100%', height: '100%' },
  popularContent: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  popularName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  popularCountry: { fontSize: 11, color: '#fff', opacity: 0.9 },

  eventGrid: { paddingHorizontal: 20, gap: 12 },
  eventCard: {
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  eventImage: { width: '100%', height: '100%', position: 'absolute' },
  eventGradient: { position: 'absolute', width: '100%', height: '100%' },
  eventContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  eventIcon: { fontSize: 40, marginBottom: 8 },
  eventTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4, textAlign: 'center' },
  eventMonth: { fontSize: 13, color: '#fff', opacity: 0.9 },

  regionGrid: { paddingHorizontal: 20, gap: 12 },
  regionCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  regionImage: { width: '100%', height: '100%', position: 'absolute' },
  regionGradient: { position: 'absolute', width: '100%', height: '100%' },
  regionContent: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  regionName: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  regionPlaces: { fontSize: 14, color: '#fff', opacity: 0.9 },

  mapCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  mapCardContent: { alignItems: 'center' },
  mapCardTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginTop: 12, marginBottom: 8 },
  mapCardText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  mapCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#667eea',
    borderRadius: 16,
  },
  mapCardButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  collectionCard: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  collectionImage: { width: '100%', height: '100%', position: 'absolute' },
  collectionGradient: { position: 'absolute', width: '100%', height: '100%' },
  collectionContent: { flex: 1, justifyContent: 'flex-end', padding: 24 },
  collectionTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 6 },
  collectionSubtitle: { fontSize: 15, color: '#fff', opacity: 0.9, marginBottom: 16 },
  collectionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
  },
  collectionCount: { fontSize: 12, fontWeight: '600', color: '#fff' },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 18 },
});

export default DiscoverTab;
