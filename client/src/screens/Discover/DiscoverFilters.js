import { TouchableOpacity, Text, ScrollView } from "react-native"

const CATEGORIES = [
  { id: "top-rated", label: "⭐ Top Rated", value: "top-rated" },
  { id: "hidden-gems", label: "💎 Hidden Gems", value: "hidden-gems" },
  { id: "nearby", label: "📍 Near Me", value: "nearby" },
]

export const DiscoverFilters = ({ selectedCategory, onCategoryChange }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3 border-b border-gray-200">
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          className={`mr-3 px-4 py-2 rounded-full border ${
            selectedCategory === category.value ? "bg-primary border-primary" : "bg-white border-gray-300"
          }`}
          onPress={() => onCategoryChange(selectedCategory === category.value ? null : category.value)}
        >
          <Text
            className={selectedCategory === category.value ? "text-white font-semibold" : "text-gray-700 font-medium"}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}
