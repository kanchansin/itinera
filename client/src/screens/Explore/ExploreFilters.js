import { TouchableOpacity, Text, ScrollView } from "react-native"

const FILTER_OPTIONS = [
  { id: "trending", label: "🔥 Trending", value: "trending" },
  { id: "recent", label: "⏰ Recent", value: "recent" },
  { id: "popular", label: "⭐ Popular", value: "popular" },
]

export const ExploreFilters = ({ selectedFilter, onFilterChange }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3 border-b border-gray-200">
      {FILTER_OPTIONS.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          className={`mr-3 px-4 py-2 rounded-full border ${
            selectedFilter === filter.value ? "bg-primary border-primary" : "bg-white border-gray-300"
          }`}
          onPress={() => onFilterChange(selectedFilter === filter.value ? null : filter.value)}
        >
          <Text className={selectedFilter === filter.value ? "text-white font-semibold" : "text-gray-700 font-medium"}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}
