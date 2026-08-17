import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useOffersStore } from '../../store/userOffersStore';

export function JobTypeFilter() {
  const { jobTypes, selectedJobType, fetchJobTypes, setJobTypeFilter } = useOffersStore();

  useEffect(() => {
    if (jobTypes.length === 0) {
      fetchJobTypes();
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          onPress={() => setJobTypeFilter(null)}
          style={[
            styles.filterChip,
            selectedJobType === null ? styles.filterChipSelected : styles.filterChipDefault,
          ]}
        >
          <Text
            style={selectedJobType === null ? styles.filterTextSelected : styles.filterTextDefault}
          >
            Todos
          </Text>
        </Pressable>

        {jobTypes.map((type) => {
          const isSelected = selectedJobType === type.key;

          return (
            <Pressable
              key={type.id}
              onPress={() => setJobTypeFilter(type.key)}
              style={[
                styles.filterChip,
                isSelected ? styles.filterChipSelected : styles.filterChipDefault,
              ]}
            >
              <Text style={isSelected ? styles.filterTextSelected : styles.filterTextDefault}>
                {type.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  filterChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterTextDefault: {
    color: '#4B5563',
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});