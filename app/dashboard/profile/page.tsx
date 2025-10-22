'use client';

import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '@/lib/api/employeeService';
import { EmployeeDTO, User, AddressModel, EmployeeModel } from '@/lib/api/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Utility function to transform null fields to empty strings, preserving non-null values
const transformNullToEmpty = <T extends object>(obj: T): T => {
  const transformed = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (key === 'addresses' && Array.isArray(value)) {
        // Deduplicate addresses by unique fields
        const uniqueAddresses = Array.from(
          new Map(
            value.map((addr: AddressModel) => {
              const addressKey = `${addr.houseNo}-${addr.streetName}-${addr.city}-${addr.state}-${addr.country}-${addr.pincode}-${addr.addressType}`;
              return [addressKey, { ...addr, addressId: addr.addressId || uuidv4() }];
            })
          ).values()
        );
        return [key, uniqueAddresses];
      }
      return [key, typeof value === 'string' && value === null ? '' : value];
    })
  ) as T;
  return transformed;
};

// Validate address to prevent incomplete submissions
const isValidAddress = (address: AddressModel): boolean => {
  return (
    !!address.houseNo &&
    !!address.streetName &&
    !!address.city &&
    !!address.state &&
    !!address.country &&
    !!address.pincode &&
    !!address.addressType
  );
};

// Deduplicate addresses before submission
const deduplicateAddresses = (addresses: AddressModel[]): AddressModel[] => {
  console.log('🧩 Deduplicating addresses, input:', JSON.stringify(addresses, null, 2));
  const uniqueAddresses = Array.from(
    new Map(
      addresses.map((addr) => {
        const addressWithId = {
          ...addr,
          addressId: addr.addressId || uuidv4(),
        };
        const addressKey = `${addr.houseNo}-${addr.streetName}-${addr.city}-${addr.state}-${addr.country}-${addr.pincode}-${addr.addressType}`;
        return [addressKey, addressWithId];
      })
    ).values()
  ).filter(isValidAddress);
  console.log('🧩 Deduplicated addresses:', JSON.stringify(uniqueAddresses, null, 2));
  return uniqueAddresses;
};

const ProfilePage = () => {
  const { state: { user } } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<EmployeeDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeDTO>({
    employeeId: '',
    firstName: '',
    lastName: '',
    personalEmail: '',
    companyEmail: '',
    contactNumber: '',
    alternateContactNumber: '',
    gender: '',
    maritalStatus: '',
    numberOfChildren: 0,
    dateOfBirth: '',
    employeePhotoUrl: '',
    designation: 'INTERN',
    dateOfJoining: '',
    rateCard: 0,
    availableLeaves: 0,
    employmentType: 'FULLTIME',
    currency: 'INR',
    companyId: '',
    accountNumber: '',
    accountHolderName: '',
    bankName: '',
    ifscCode: '',
    branchName: '',
    panNumber: '',
    aadharNumber: '',
    clientId: '',
    clientName: '',
    reportingManagerId: '',
    reportingManagerName: '',
    panCardUrl: '',
    aadharCardUrl: '',
    bankPassbookUrl: '',
    tenthCftUrl: '',
    interCftUrl: '',
    degreeCftUrl: '',
    postGraduationCftUrl: '',
    addresses: [],
    status: '',
    createdAt: '',
    updatedAt: '',
  });
  const [updating, setUpdating] = useState(false);
  const [addresses, setAddresses] = useState<AddressModel[]>([]);

  // Fetch employee profile
  const fetchProfile = useCallback(async () => {
    if (!user || user.role !== 'EMPLOYEE') {
      setError('User not authenticated or not an employee.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await employeeService.getEmployeeById();
      console.log('🧩 Profile fetched:', JSON.stringify(response, null, 2));
      if (!response || !response.employeeId) {
        throw new Error('Invalid or empty response from getEmployeeById');
      }
      const transformedProfile = transformNullToEmpty(response);
      setProfile(transformedProfile);
      setFormData(transformedProfile);
      setAddresses(transformedProfile.addresses || []);
      console.log('🧩 Profile state updated:', JSON.stringify(transformedProfile, null, 2));
    } catch (err: any) {
      console.error('❌ Error fetching profile:', err);
      setError(err.message || 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update employee profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !user) {
      setError('User or form data missing.');
      setUpdating(false);
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Fetch current profile to get existing addresses
      const currentProfile = await employeeService.getEmployeeById();
      console.log('🧩 Current profile before update:', JSON.stringify(currentProfile, null, 2));
      const currentAddresses = currentProfile?.addresses || [];

      // Merge and deduplicate addresses
      const mergedAddresses = deduplicateAddresses([...currentAddresses, ...addresses]);
      if (mergedAddresses.length === 0 && addresses.length > 0) {
        setError('All addresses must have complete details.');
        setUpdating(false);
        return;
      }

      const employeeData: EmployeeModel = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        personalEmail: formData.personalEmail,
        companyEmail: formData.companyEmail,
        contactNumber: formData.contactNumber,
        alternateContactNumber: formData.alternateContactNumber,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        numberOfChildren: formData.numberOfChildren,
        dateOfBirth: formData.dateOfBirth,
        dateOfJoining: formData.dateOfJoining,
        designation: formData.designation,
        employmentType: formData.employmentType,
        currency: formData.currency || 'INR',
        rateCard: formData.rateCard,
        panNumber: formData.panNumber,
        aadharNumber: formData.aadharNumber,
        clientId: formData.clientId,
        reportingManagerId: formData.reportingManagerId,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        branchName: formData.branchName,
        employeePhotoUrl: formData.employeePhotoUrl,
        panCardUrl: formData.panCardUrl,
        aadharCardUrl: formData.aadharCardUrl,
        bankPassbookUrl: formData.bankPassbookUrl,
        tenthCftUrl: formData.tenthCftUrl,
        interCftUrl: formData.interCftUrl,
        degreeCftUrl: formData.degreeCftUrl,
        postGraduationCftUrl: formData.postGraduationCftUrl,
        addresses: mergedAddresses,
      };

      console.log('🧩 Sending update payload:', JSON.stringify(employeeData, null, 2));
      const updateResponse = await employeeService.updateEmployee(employeeData);
      console.log('🧩 Update response:', JSON.stringify(updateResponse, null, 2));

      if (updateResponse?.flag && updateResponse?.response && updateResponse.response.employeeId) {
        const transformedProfile = transformNullToEmpty(updateResponse.response);
        setProfile(transformedProfile);
        setFormData(transformedProfile);
        setAddresses(transformedProfile.addresses || []);
        setSuccessMessage('Profile updated successfully!');
        console.log('🧩 Profile state updated after update:', JSON.stringify(transformedProfile, null, 2));
      } else {
        console.warn('⚠️ Update response incomplete, fetching latest profile');
        await fetchProfile();
        setSuccessMessage('Profile updated, refreshed data.');
      }
      setEditing(false);
    } catch (err: any) {
      console.error('❌ Error updating profile:', JSON.stringify(err, null, 2));
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle address changes
  const addAddress = () => {
    const newAddress: AddressModel = {
      addressId: uuidv4(),
      houseNo: '',
      streetName: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      addressType: '',
    };
    setAddresses(prev => [...prev, newAddress]);
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress],
    }));
  };

  const updateAddress = (index: number, field: keyof AddressModel, value: string) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    setAddresses(updatedAddresses);
    setFormData(prev => ({
      ...prev,
      addresses: updatedAddresses,
    }));
  };

  const removeAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
    setFormData(prev => ({
      ...prev,
      addresses: updatedAddresses,
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return dateString
      ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Not specified';
  };

  useEffect(() => {
    if (user && user.role === 'EMPLOYEE') {
      fetchProfile();
    } else {
      router.push('/auth/login');
    }
  }, [user, fetchProfile, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <button onClick={fetchProfile} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-600">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div className="p-6">
          {successMessage && (
            <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
              <p>{successMessage}</p>
            </div>
          )}
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Email</label>
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    pattern="[0-9]{10}"
                    title="Contact number must be 10 digits"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Contact</label>
                  <input
                    type="tel"
                    name="alternateContactNumber"
                    value={formData.alternateContactNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    pattern="[0-9]{10}"
                    title="Alternate contact number must be 10 digits"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Children</label>
                  <input
                    type="number"
                    name="numberOfChildren"
                    value={formData.numberOfChildren || 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <select
                    name="designation"
                    value={formData.designation || 'INTERN'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  >
                    <option value="">Select Designation</option>
                    {[
                      'INTERN',
                      'TRAINEE',
                      'ASSOCIATE_ENGINEER',
                      'SOFTWARE_ENGINEER',
                      'SENIOR_SOFTWARE_ENGINEER',
                      'LEAD_ENGINEER',
                      'TEAM_LEAD',
                      'TECHNICAL_ARCHITECT',
                      'REPORTING_MANAGER',
                      'DELIVERY_MANAGER',
                      'DIRECTOR',
                      'VP_ENGINEERING',
                      'CTO',
                      'HR',
                      'FINANCE',
                      'OPERATIONS',
                    ].map(d => (
                      <option key={d} value={d}>{d.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType || 'FULLTIME'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  >
                    <option value="">Select Type</option>
                    <option value="FULLTIME">Full-time</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="FREELANCER">Freelancer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency || 'INR'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate Card</label>
                  <input
                    type="number"
                    name="rateCard"
                    value={formData.rateCard || 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    pattern="[A-Z0-9]{10}"
                    title="PAN number must be 10 alphanumeric characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    pattern="[0-9]{12}"
                    title="Aadhaar number must be 12 digits"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    pattern="[A-Z0-9]{11}"
                    title="IFSC code must be 11 alphanumeric characters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Photo URL</label>
                  <input
                    type="text"
                    name="employeePhotoUrl"
                    value={formData.employeePhotoUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card URL</label>
                  <input
                    type="text"
                    name="panCardUrl"
                    value={formData.panCardUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card URL</label>
                  <input
                    type="text"
                    name="aadharCardUrl"
                    value={formData.aadharCardUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Passbook URL</label>
                  <input
                    type="text"
                    name="bankPassbookUrl"
                    value={formData.bankPassbookUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">10th Certificate URL</label>
                  <input
                    type="text"
                    name="tenthCftUrl"
                    value={formData.tenthCftUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">12th Certificate URL</label>
                  <input
                    type="text"
                    name="interCftUrl"
                    value={formData.interCftUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree Certificate URL</label>
                  <input
                    type="text"
                    name="degreeCftUrl"
                    value={formData.degreeCftUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post-Graduation Certificate URL</label>
                  <input
                    type="text"
                    name="postGraduationCftUrl"
                    value={formData.postGraduationCftUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Addresses</label>
                {addresses.length > 0 ? (
                  addresses.map((address, index) => (
                    <div
                      key={address.addressId || `address-${index}`}
                      className="border border-gray-200 rounded-md p-4 mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Address {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeAddress(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">House No</label>
                          <input
                            type="text"
                            value={address.houseNo || ''}
                            onChange={(e) => updateAddress(index, 'houseNo', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Street Name</label>
                          <input
                            type="text"
                            value={address.streetName || ''}
                            onChange={(e) => updateAddress(index, 'streetName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                          <input
                            type="text"
                            value={address.city || ''}
                            onChange={(e) => updateAddress(index, 'city', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                          <input
                            type="text"
                            value={address.state || ''}
                            onChange={(e) => updateAddress(index, 'state', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                          <input
                            type="text"
                            value={address.country || ''}
                            onChange={(e) => updateAddress(index, 'country', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">PIN Code</label>
                          <input
                            type="text"
                            value={address.pincode || ''}
                            onChange={(e) => updateAddress(index, 'pincode', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Address Type</label>
                          <select
                            value={address.addressType || ''}
                            onChange={(e) => updateAddress(index, 'addressType', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="PERMANENT">Permanent</option>
                            <option value="TEMPORARY">Temporary</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No addresses available.</p>
                )}
                <button
                  type="button"
                  onClick={addAddress}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition duration-300"
                >
                  Add Address
                </button>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setAddresses(profile.addresses || []);
                    setFormData(profile);
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-300"
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <p className="text-gray-900">{`${profile.firstName || 'Not specified'} ${profile.lastName || 'Not specified'}`}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                    <p className="text-gray-900">{formatDate(profile.dateOfBirth || '')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                    <p className="text-gray-900">{profile.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Marital Status</label>
                    <p className="text-gray-900">{profile.maritalStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Number of Children</label>
                    <p className="text-gray-900">{profile.numberOfChildren ?? 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Personal Email</label>
                    <p className="text-gray-900">{profile.personalEmail || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Company Email</label>
                    <p className="text-gray-900">{profile.companyEmail || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                    <p className="text-gray-900">{profile.contactNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Alternate Contact</label>
                    <p className="text-gray-900">{profile.alternateContactNumber || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Employment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Designation</label>
                    <p className="text-gray-900">{profile.designation?.replace('_', ' ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Date of Joining</label>
                    <p className="text-gray-900">{formatDate(profile.dateOfJoining || '')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Employment Type</label>
                    <p className="text-gray-900">{profile.employmentType || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Client</label>
                    <p className="text-gray-900">{profile.clientName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Reporting Manager</label>
                    <p className="text-gray-900">{profile.reportingManagerName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Available Leaves</label>
                    <p className="text-gray-900">{profile.availableLeaves ?? 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Bank Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                    <p className="text-gray-900">{profile.bankName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                    <p className="text-gray-900">{profile.accountNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">IFSC Code</label>
                    <p className="text-gray-900">{profile.ifscCode || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Account Holder</label>
                    <p className="text-gray-900">{profile.accountHolderName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Branch Name</label>
                    <p className="text-gray-900">{profile.branchName || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">PAN Card</label>
                    <a href={profile.panCardUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {profile.panCardUrl ? 'View Document' : 'Not Available'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Aadhaar Card</label>
                    <a href={profile.aadharCardUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {profile.aadharCardUrl ? 'View Document' : 'Not Available'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bank Passbook</label>
                    <a href={profile.bankPassbookUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {profile.bankPassbookUrl ? 'View Document' : 'Not Available'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">10th Certificate</label>
                    <a href={profile.tenthCftUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {profile.tenthCftUrl ? 'View Document' : 'Not Available'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">12th Certificate</label>
                    <a href={profile.interCftUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {profile.interCftUrl ? 'View Document' : 'Not Available'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Degree Certificate</label>
                    <a href={profile.degreeCftUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {profile.degreeCftUrl ? 'View Document' : 'Not Available'}
                    </a>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Post-Graduation Certificate</label>
                    <a href={profile.postGraduationCftUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                      {profile.postGraduationCftUrl ? 'View Document' : 'Not Available'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Addresses</h2>
                {profile.addresses && profile.addresses.length > 0 ? (
                  profile.addresses.map((address, index) => (
                    <div
                      key={address.addressId || `address-${index}`}
                      className="border border-gray-200 rounded-md p-4 mb-4"
                    >
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Address {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">House No:</span>
                          <p className="text-gray-900">{address.houseNo || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Street:</span>
                          <p className="text-gray-900">{address.streetName || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">City:</span>
                          <p className="text-gray-900">{address.city || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">State:</span>
                          <p className="text-gray-900">{address.state || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Country:</span>
                          <p className="text-gray-900">{address.country || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">PIN Code:</span>
                          <p className="text-gray-900">{address.pincode || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Address Type:</span>
                          <p className="text-gray-900">{address.addressType || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No addresses available.</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;