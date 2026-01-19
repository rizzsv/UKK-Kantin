'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    nama_siswa: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@student.com',
    telp: '+62 812 3456 7890',
    alamat: 'Jl. Example Street No. 123, Malang',
    kelas: '12 RPL 1',
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  });

  const handleSave = () => {
    // Implement save logic with API
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-xl text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                  <Image
                    src={profile.foto}
                    alt={profile.nama_siswa}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                {isEditing && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">{profile.nama_siswa}</h2>
                <p className="text-gray-600 mb-2">@{profile.username}</p>
                <p className="text-sm text-blue-600 font-semibold">{profile.kelas}</p>
              </div>

              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                variant={isEditing ? 'primary' : 'outline'}
                size="md"
              >
                {isEditing ? (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                ) : (
                  'Edit Profile'
                )}
              </Button>
            </div>

            {/* Information Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.nama_siswa}
                    onChange={(e) => setProfile({ ...profile, nama_siswa: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.nama_siswa}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.telp}
                    onChange={(e) => setProfile({ ...profile, telp: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.telp}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.alamat}
                    onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profile.alamat}</p>
                )}
              </div>
            </div>

            {/* Additional Actions */}
            {isEditing && (
              <div className="mt-8 flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">24</div>
            <p className="text-gray-600 font-medium">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">18</div>
            <p className="text-gray-600 font-medium">Completed</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">6</div>
            <p className="text-gray-600 font-medium">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
