import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Edit2, ChevronLeft, MapPin, DollarSign, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { servicesApi, categoriesApi } from '../src/services/api';
import { useAuthStore } from '../src/store/useAuthStore';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';

export default function ManageServicesScreen() {
    const { token } = useAuthStore();
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [price, setPrice] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLng, setLocationLng] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const providerId = useAuthStore.getState().user?.id || useAuthStore.getState().user?._id;
            const params: any = {};
            if (providerId) params.providerId = providerId;

            const [servicesRes, categoriesRes] = await Promise.all([
                servicesApi.findAll(params),
                categoriesApi.findAll(),
            ]);
            setServices(servicesRes.data);
            setCategories(categoriesRes.data);
        } catch (error: any) {
            console.error('Error fetching services data:', error);
            if (error.response) console.error('Response data:', error.response.data);
        } finally {
            setLoading(false);
        }
    };

    const handleUseMyLocation = async () => {
        try {
            setFetchingLocation(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to detect your location.');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            setLocationLat(loc.coords.latitude);
            setLocationLng(loc.coords.longitude);
            setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
            Alert.alert('Location Detected', 'Coordinates have been set based on your current position.');
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Could not detect location. Please enter manually.');
        } finally {
            setFetchingLocation(false);
        }
    };

    const handleSaveService = async () => {
        const missingFields = [];
        if (!selectedCategory) missingFields.push('Category');
        if (!price.trim()) missingFields.push('Price');
        if (!name.trim()) missingFields.push('Name');
        if (!location.trim()) missingFields.push('Location');
        if (!phone.trim()) missingFields.push('Phone');
        if (!email.trim()) missingFields.push('Email');

        if (missingFields.length > 0) {
            Alert.alert('Missing Info', `Please provide: ${missingFields.join(', ')}`);
            return;
        }

        if (isNaN(Number(price))) {
            Alert.alert('Invalid Price', 'Please enter a valid numeric price.');
            return;
        }

        try {
            setSaving(true);
            const serviceData: any = {
                categoryId: selectedCategory._id || selectedCategory.id,
                price: Number(price),
                name: name.trim(),
                location: location.trim(),
                phone: phone.trim(),
                email: email.trim(),
                description: description.trim(),
            };

            if (locationLat !== null) serviceData.locationLat = locationLat;
            if (locationLng !== null) serviceData.locationLng = locationLng;

            if (editingService) {
                await servicesApi.update(editingService._id || editingService.id, serviceData, token!);
                Alert.alert('Success', 'Service updated successfully!');
            } else {
                await servicesApi.create(serviceData, token!);
                Alert.alert('Success', 'Service added successfully!');
            }

            setModalVisible(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Error saving service:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                Alert.alert('Error', error.response.data.message || 'Failed to save service.');
            } else {
                Alert.alert('Error', 'Failed to save service. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (service: any) => {
        setEditingService(service);
        setSelectedCategory(service.category);
        setPrice(service.price.toString());
        setName(service.name || '');
        setLocation(service.location || '');
        setPhone(service.phone || '');
        setEmail(service.email || '');
        setDescription(service.description || '');
        setLocationLat(service.locationLat || null);
        setLocationLng(service.locationLng || null);
        setModalVisible(true);
    };

    const handleDelete = (service: any) => {
        Alert.alert(
            'Delete Service',
            `Are you sure you want to remove ${service.category?.name || 'this service'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await servicesApi.remove(service._id || service.id, token!);
                            fetchData();
                        } catch (error) {
                            console.error('Error deleting service:', error);
                            Alert.alert('Error', 'Failed to delete service.');
                        }
                    }
                },
            ]
        );
    };

    const resetForm = () => {
        setEditingService(null);
        setSelectedCategory(null);
        setPrice('');
        setName('');
        setLocation('');
        setPhone('');
        setEmail('');
        setDescription('');
        setLocationLat(null);
        setLocationLng(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Services</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.intro}>
                    <Text style={styles.introTitle}>Your Service Offerings</Text>
                    <Text style={styles.introSubtitle}>Define the services you provide and your hourly rates.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={styles.loader} />
                ) : services.length === 0 ? (
                    <Card glassy style={styles.emptyCard}>
                        <Briefcase size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>You haven't listed any services yet.</Text>
                        <Button
                            title="Add Your First Service"
                            variant="primary"
                            style={styles.emptyButton}
                            onPress={() => setModalVisible(true)}
                        />
                    </Card>
                ) : (
                    <View style={styles.servicesList}>
                        {services.map((service: any) => (
                            <Card key={service.id || service._id} style={styles.serviceCard}>
                                <View style={styles.serviceRow}>
                                    <View style={styles.categoryIconContainer}>
                                        <Text style={styles.categoryIcon}>{service.category?.icon || '🛠️'}</Text>
                                    </View>
                                    <View style={styles.serviceInfo}>
                                        <Text style={styles.serviceCategoryName}>{service.category?.name || 'Category'}</Text>
                                        <Text style={styles.servicePrice}>${service.price}<Text style={styles.priceUnit}>/hr</Text></Text>
                                    </View>
                                    <View style={styles.serviceActions}>
                                        <TouchableOpacity
                                            style={styles.actionIconButton}
                                            onPress={() => handleEdit(service)}
                                        >
                                            <Edit2 size={18} color={COLORS.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionIconButton}
                                            onPress={() => handleDelete(service)}
                                        >
                                            <Trash2 size={18} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Card>
                        ))}

                        <Button
                            title="Add New Service"
                            variant="outline"
                            icon={<Plus size={20} color={COLORS.primary} />}
                            onPress={() => {
                                resetForm();
                                setModalVisible(true);
                            }}
                            style={styles.addMoreButton}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Add Service Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'New Service'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <Text style={styles.label}>Select Category</Text>
                            <View style={styles.categoryGrid}>
                                {categories.map((cat: any) => (
                                    <TouchableOpacity
                                        key={cat.id || cat._id}
                                        style={[
                                            styles.categoryChip,
                                            selectedCategory?._id === cat._id && styles.categoryChipActive
                                        ]}
                                        onPress={() => setSelectedCategory(cat)}
                                    >
                                        <Text style={styles.categoryChipEmoji}>{cat.icon || '🛠️'}</Text>
                                        <Text style={[
                                            styles.categoryChipText,
                                            (selectedCategory?._id === cat._id || selectedCategory?.id === cat.id) && styles.categoryChipTextActive
                                        ]}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Input
                                label="Hourly Rate ($)"
                                placeholder="e.g. 50"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                icon={<DollarSign size={20} color={COLORS.textMuted} />}
                            />

                            <Input
                                label="Service Display Name"
                                placeholder="e.g. Expert Plumbing"
                                value={name}
                                onChangeText={setName}
                            />

                            <View style={styles.locationInputContainer}>
                                <Input
                                    label="Service Location"
                                    placeholder="e.g. Dhaka, Bangladesh"
                                    value={location}
                                    onChangeText={setLocation}
                                    icon={<MapPin size={20} color={COLORS.textMuted} />}
                                    style={{ flex: 1 }}
                                />
                                <TouchableOpacity
                                    style={styles.locationPickerBtn}
                                    onPress={handleUseMyLocation}
                                    disabled={fetchingLocation}
                                >
                                    {fetchingLocation ? (
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                    ) : (
                                        <MapPin size={20} color={locationLat ? COLORS.success : COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                            {locationLat && (
                                <Text style={styles.locationStatus}>
                                    ✓ Pin dropped at {locationLat.toFixed(4)}, {locationLng?.toFixed(4)}
                                </Text>
                            )}

                            <Input
                                label="Contact Phone"
                                placeholder="e.g. +880123456789"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />

                            <Input
                                label="Contact Email"
                                placeholder="e.g. contact@service.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Input
                                label="Description (Optional)"
                                placeholder="Describe your expertise in this area..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                style={styles.textArea}
                            />

                            <Button
                                title={editingService ? "Update Service" : "List Service"}
                                loading={saving}
                                onPress={handleSaveService}
                                style={styles.submitButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    intro: {
        marginVertical: SPACING.xl,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    introSubtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    servicesList: {
        width: '100%',
    },
    serviceCard: {
        marginBottom: SPACING.md,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    categoryIcon: {
        fontSize: 24,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceCategoryName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 2,
    },
    priceUnit: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    serviceActions: {
        flexDirection: 'row',
    },
    actionIconButton: {
        padding: 8,
        marginLeft: 4,
    },
    addMoreButton: {
        marginTop: SPACING.md,
    },
    emptyCard: {
        padding: SPACING.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    emptyButton: {
        width: '100%',
    },
    loader: {
        marginTop: SPACING.xxl,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    modalForm: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
        marginBottom: SPACING.lg,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceSubtle,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: RADIUS.md,
        margin: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryChipActive: {
        backgroundColor: COLORS.primarySubtle,
        borderColor: COLORS.primary,
    },
    categoryChipEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    categoryChipTextActive: {
        color: COLORS.primary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    locationInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    locationPickerBtn: {
        width: 56,
        height: 56,
        backgroundColor: COLORS.surfaceSubtle,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    locationStatus: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '600',
        marginTop: -SPACING.sm,
        marginBottom: SPACING.md,
        marginLeft: 4,
    },
});
