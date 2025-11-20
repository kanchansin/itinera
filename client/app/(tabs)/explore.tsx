import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const mockHeroData = {
  title: "Weekend in Coorg",
  subtitle: "Coffee estates, waterfalls, and misty hills await you",
  image: "https://images.unsplash.com/photo-1529057299613-a565b7ce93aa?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  aiCurated: true,
  tags: ["Mountains", "Nature", "Weekend"]
};

const mockCategories = [
  { id: 1, name: "Mountains", icon: "⛰️" },
  { id: 2, name: "Beach", icon: "🏖️" },
  { id: 3, name: "Urban", icon: "🏙️" },
  { id: 4, name: "Food", icon: "🍜" },
  { id: 5, name: "Culture", icon: "🎭" },
  { id: 6, name: "Weekend", icon: "📅" },
  { id: 7, name: "Adventure", icon: "🧗" },
  { id: 8, name: "Relaxation", icon: "🧘" }
];

const mockGuidePosts = [
  {
    id: 1,
    title: "Hampi Heritage Trail",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    tags: ["Culture", "History", "3 Days"],
    aiCurated: true,
    author: "Priya Kumar",
    duration: "3 days",
    stops: 8
  },
  {
    id: 2,
    title: "Gokarna Beach Hopping",
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800&q=80",
    tags: ["Beach", "Relaxation", "Weekend"],
    aiCurated: false,
    author: "Rahul Sharma",
    duration: "2 days",
    stops: 5
  },
  {
    id: 3,
    title: "Bangalore Food Crawl",
    image: "https://images.unsplash.com/photo-1554978991-33ef7f31d658?w=800&q=80",
    tags: ["Food", "Urban", "1 Day"],
    aiCurated: true,
    author: "Anita Desai",
    duration: "1 day",
    stops: 12
  },
  {
    id: 4,
    title: "Chikmagalur Coffee Circuit",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    tags: ["Mountains", "Nature", "Weekend"],
    aiCurated: true,
    author: "Vikram Reddy",
    duration: "2 days",
    stops: 6
  },
  {
    id: 5,
    title: "Mysore Palace & Gardens",
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80",
    tags: ["Culture", "Architecture", "1 Day"],
    aiCurated: false,
    author: "Meera Iyer",
    duration: "1 day",
    stops: 4
  },
  {
    id: 6,
    title: "Kabini Wildlife Safari",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
    tags: ["Adventure", "Wildlife", "Weekend"],
    aiCurated: true,
    author: "Arjun Nair",
    duration: "2 days",
    stops: 3
  }
];

const fetchExploreData = async (page = 1) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    hero: mockHeroData,
    categories: mockCategories,
    posts: mockGuidePosts.map(post => ({
      ...post,
      id: post.id + (page - 1) * 6
    }))
  };
};

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonContent}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonTags}>
        <View style={styles.skeletonTag} />
        <View style={styles.skeletonTag} />
      </View>
    </View>
  </View>
);

interface HeroData {
  title: string;
  subtitle: string;
  image: string;
  aiCurated: boolean;
  tags: string[];
}

const HeroRecommendationCard = ({ data }: { data: HeroData | null }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!data) return null;

  return (
    <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}>
      <Image source={{ uri: data.image }} style={styles.heroImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
        style={styles.heroGradient}
      />
      
      <View style={styles.heroContent}>
        {data.aiCurated && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#7c3aed" />
            <Text style={styles.aiBadgeText}>AI-curated</Text>
          </View>
        )}
        
        <Text style={styles.heroSubtitle}>Your Next Trip?</Text>
        <Text style={styles.heroTitle}>{data.title}</Text>
        <Text style={styles.heroDescription}>{data.subtitle}</Text>
        
        <View style={styles.heroTags}>
          {data.tags.map((tag, index) => (
            <View key={index} style={styles.heroTag}>
              <Text style={styles.heroTagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>View Trip</Text>
          <Ionicons name="trending-up" size={16} color="#1a1a1a" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface GuidePost {
  id: number;
  title: string;
  image: string;
  tags: string[];
  aiCurated: boolean;
  author: string;
  duration: string;
  stops: number;
}

const CategoryChipsRow = ({ categories, selected, onSelect }: { categories: Category[]; selected: number | null; onSelect: (id: number) => void }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesScroll}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selected === category.id && styles.categoryChipActive
          ]}
          onPress={() => onSelect(category.id)}
        >
          {selected === category.id ? (
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryChipGradient}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryNameActive}>{category.name}</Text>
            </LinearGradient>
          ) : (
            <>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const GuidePostCard = ({ post, index }: { post: typeof mockGuidePosts[0]; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.guideCard, { opacity: fadeAnim }]}>
      <View style={styles.guideImageContainer}>
        <Image source={{ uri: post.image }} style={styles.guideImage} />
        
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => setIsSaved(!isSaved)}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={isSaved ? "#7c3aed" : "#666"}
          />
        </TouchableOpacity>
        
        {post.aiCurated && (
          <View style={styles.aiMiniBadge}>
            <Ionicons name="sparkles" size={10} color="#fff" />
          </View>
        )}
      </View>
      
      <View style={styles.guideContent}>
        <Text style={styles.guideTitle}>{post.title}</Text>
        
        <View style={styles.guideTags}>
          {post.tags.map((tag, idx) => (
            <View key={idx} style={styles.guideTag}>
              <Text style={styles.guideTagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.guideMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{post.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{post.stops} stops</Text>
          </View>
        </View>
        
        <View style={styles.guideAuthor}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {post.author.charAt(0)}
            </Text>
          </View>
          <Text style={styles.authorName}>{post.author}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const ExplorePage = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [posts, setPosts] = useState<typeof mockGuidePosts>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const data = await fetchExploreData(1);
      setHeroData(data.hero);
      setCategories(data.categories);
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || page >= 3) return;
    
    setLoadingMore(true);
    try {
      const data = await fetchExploreData(page + 1);
      setPosts(prev => [...prev, ...data.posts]);
      setPage(prev => prev + 1);
      if (page >= 2) setHasMore(false);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.heroSection}>
        <HeroRecommendationCard data={heroData} />
      </View>

      <View style={styles.categoriesSection}>
        <CategoryChipsRow
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Discover Trips</Text>
        <Text style={styles.feedSubtitle}>Curated journeys from our community</Text>
      </View>
    </>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <Text style={styles.loadingText}>Loading more trips...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} />
          ))}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => <GuidePostCard post={item} index={index} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    paddingBottom: 100,
  },
  columnWrapper: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 400,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  aiBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
    marginBottom: 16,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  heroTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  heroTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  categoriesSection: {
    paddingVertical: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    marginRight: 12,
  },
  categoryChipActive: {
    borderColor: 'transparent',
    padding: 0,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryNameActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  feedHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  feedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  feedSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  guideCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  guideImageContainer: {
    height: 160,
    position: 'relative',
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiMiniBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContent: {
    padding: 12,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },
  guideTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  guideTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  guideTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  guideMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  guideAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonImage: {
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonTags: {
    flexDirection: 'row',
    gap: 6,
  },
  skeletonTag: {
    width: 50,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  loadingMore: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ExplorePage;