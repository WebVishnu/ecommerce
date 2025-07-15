"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Edit,
  Trash2,
  Search,
  Filter,
  FileText,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface DraftProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  model: string;
  stock: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  draftSavedAt: string;
  createdAt: string;
  description?: string;
}

export default function AdminDraftsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchDrafts();
    }
  }, [isAdmin]);

  // Redirect if not admin
  if (!isAdmin) {
    router.push('/');
    return null;
  }

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/drafts');
      const data = await response.json();
      
      if (data.success) {
        setDrafts(data.data.drafts);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || draft.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handlePublishDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to publish this draft? This will make it visible to customers.')) {
      return;
    }

    try {
      setPublishingId(draftId);
      const response = await fetch('/api/products/drafts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draftId }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the draft from the list
        setDrafts(drafts.filter(d => d._id !== draftId));
      } else {
        alert(data.message || 'Failed to publish draft');
      }
    } catch (error) {
      console.error('Error publishing draft:', error);
      alert('Failed to publish draft');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${draftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrafts(drafts.filter(d => d._id !== draftId));
      } else {
        alert('Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionStatus = (draft: DraftProduct) => {
    const requiredFields = [
      draft.name,
      draft.description,
      draft.price,
      draft.category,
      draft.brand,
      draft.model,
      draft.stock !== undefined
    ];
    
    const completedFields = requiredFields.filter(field => 
      field !== undefined && field !== null && field !== '' && field !== 0
    );
    
    const completionPercentage = (completedFields.length / requiredFields.length) * 100;
    
    if (completionPercentage === 100) {
      return { status: 'complete', percentage: 100, color: 'text-green-600' };
    } else if (completionPercentage >= 70) {
      return { status: 'almost', percentage: completionPercentage, color: 'text-yellow-600' };
    } else {
      return { status: 'incomplete', percentage: completionPercentage, color: 'text-red-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Draft Products
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your draft products before publishing
              </p>
            </div>
            
            <Link
              href="/admin/add-product"
              className="flex items-center gap-2 bg-[#b91c1c] text-white px-4 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
            >
              <FileText className="w-4 h-4" />
              Create New Draft
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="automotive">Automotive</option>
                <option value="inverter">Inverter</option>
                <option value="solar">Solar</option>
                <option value="ups">UPS</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600 flex items-center">
              {filteredDrafts.length} of {drafts.length} drafts
            </div>
          </div>
        </div>

        {/* Drafts Grid */}
        {filteredDrafts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts found</h3>
            <p className="text-gray-600 mb-6">
              {drafts.length === 0 
                ? "You don't have any draft products yet." 
                : "No drafts match your search criteria."
              }
            </p>
            <Link
              href="/admin/add-product"
              className="inline-flex items-center gap-2 bg-[#b91c1c] text-white px-4 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
            >
              <FileText className="w-4 h-4" />
              Create Your First Draft
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrafts.map((draft) => {
              const completion = getCompletionStatus(draft);
              return (
                <div key={draft._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    {draft.images.length > 0 ? (
                      <Image
                        src={draft.images[0]}
                        alt={draft.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Draft
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate flex-1">
                        {draft.name || 'Untitled Product'}
                      </h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Brand:</span>
                        <span>{draft.brand || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Category:</span>
                        <span className="capitalize">{draft.category || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Price:</span>
                        <span>₹{draft.price || 0}</span>
                      </div>
                    </div>

                    {/* Completion Status */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion</span>
                        <span className={completion.color}>
                          {Math.round(completion.percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            completion.status === 'complete' ? 'bg-green-500' :
                            completion.status === 'almost' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${completion.percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Last Saved */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <Clock className="w-3 h-3" />
                      <span>Last saved: {formatDate(draft.draftSavedAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/add-product?draft=${draft._id}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Link>
                      
                      {completion.status === 'complete' ? (
                        <button
                          onClick={() => handlePublishDraft(draft._id)}
                          disabled={publishingId === draft._id}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {publishingId === draft._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {publishingId === draft._id ? 'Publishing...' : 'Publish'}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-1 bg-gray-400 text-white px-3 py-2 rounded-md text-sm cursor-not-allowed"
                          title="Complete all required fields to publish"
                        >
                          <AlertCircle className="w-3 h-3" />
                          Incomplete
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteDraft(draft._id)}
                        className="flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 