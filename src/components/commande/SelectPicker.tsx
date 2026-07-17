// Picker personnalisé (dropdown)
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export interface PickerItem {
  label: string;
  value: string;
  subtitle?: string;
}

interface SelectPickerProps {
  label: string;
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  searchable?: boolean;
}

export const SelectPicker: React.FC<SelectPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = 'Sélectionner...',
  required = false,
  error,
  searchable = false,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedItem = items.find(i => i.value === selectedValue);

  const filteredItems = searchText.trim()
    ? items.filter(
        i =>
          i.label.toLowerCase().includes(searchText.toLowerCase()) ||
          (i.subtitle || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : items;

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
    setSearchText('');
  };

  const handleClear = () => {
    onValueChange('');
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, { color: theme.text }]}>
        {label} {required && <Text style={{ color: theme.danger }}>*</Text>}
      </Text>

      {/* Sélecteur */}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: theme.surfaceVariant,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectorText,
            { color: selectedItem ? theme.text : theme.textTertiary },
          ]}
          numberOfLines={1}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <View style={styles.selectorRight}>
          {selectedValue ? (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          ) : null}
          <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
        </View>
      </TouchableOpacity>

      {/* Erreur */}
      {error && (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
            activeOpacity={1}
          >
            {/* En-tête modal */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.divider }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Recherche */}
            {searchable && items.length > 5 && (
              <View style={[styles.searchContainer, { borderBottomColor: theme.divider }]}>
                <Ionicons name="search" size={18} color={theme.textTertiary} />
                <Text style={[styles.searchInput, { color: theme.text }]}>
                  {searchText || 'Rechercher...'}
                </Text>
              </View>
            )}

            {/* Liste */}
            <ScrollView style={styles.itemList} bounces={false}>
              {filteredItems.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                  Aucun résultat
                </Text>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = item.value === selectedValue;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.item,
                        { borderBottomColor: theme.divider },
                        isSelected && { backgroundColor: theme.primaryLight },
                        index === filteredItems.length - 1 && styles.lastItem,
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <View style={styles.itemLeft}>
                        <Text
                          style={[
                            styles.itemLabel,
                            { color: isSelected ? theme.primary : theme.text },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.subtitle && (
                          <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  itemList: {
    maxHeight: 400,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 30,
    fontSize: 14,
  },
});