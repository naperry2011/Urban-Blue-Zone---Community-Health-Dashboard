'use client';

import React, { useState } from 'react';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: 'link' | 'document' | 'video' | 'event' | 'program';
  url?: string;
  downloadUrl?: string;
  location?: string;
  schedule?: string;
  contact?: string;
  cost?: string;
  capacity?: number;
  enrolled?: number;
  tags?: string[];
}

interface ResourceCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  items: ResourceItem[];
  className?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  description,
  icon,
  color,
  bgColor,
  items,
  className = ''
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter items based on search and type
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link': return '🔗';
      case 'document': return '📄';
      case 'video': return '🎥';
      case 'event': return '📅';
      case 'program': return '🏃';
      default: return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'link': return 'Website';
      case 'document': return 'Document';
      case 'video': return 'Video';
      case 'event': return 'Event';
      case 'program': return 'Program';
      default: return 'Resource';
    }
  };

  const handleItemAction = (item: ResourceItem) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`${bgColor} p-6`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">{icon}</div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${color} mb-2`}>{title}</h3>
            <p className="text-gray-700">{description}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span>{items.length} resources available</span>
              <span>•</span>
              <span>Updated daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="program">Programs</option>
              <option value="event">Events</option>
              <option value="link">Websites</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Items */}
      <div className="p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No resources found</h4>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'No resources are currently available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedItem === item.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            {item.location && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">📍 Location:</span>
                                <span className="text-sm text-gray-600">{item.location}</span>
                              </div>
                            )}
                            {item.schedule && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">🕒 Schedule:</span>
                                <span className="text-sm text-gray-600">{item.schedule}</span>
                              </div>
                            )}
                            {item.contact && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">📞 Contact:</span>
                                <span className="text-sm text-gray-600">{item.contact}</span>
                              </div>
                            )}
                            {item.cost && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">💰 Cost:</span>
                                <span className="text-sm text-gray-600">{item.cost}</span>
                              </div>
                            )}
                            {item.capacity && item.enrolled !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">👥 Enrollment:</span>
                                <span className="text-sm text-gray-600">
                                  {item.enrolled} / {item.capacity} participants
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(item.enrolled / item.capacity) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {(item.url || item.downloadUrl) && (
                        <button
                          onClick={() => handleItemAction(item)}
                          className={`px-4 py-2 ${color} bg-white border-2 border-current rounded-lg hover:bg-current hover:text-white transition-colors text-sm font-medium`}
                        >
                          {item.type === 'document' ? 'Download' :
                           item.type === 'video' ? 'Watch' :
                           item.type === 'event' ? 'Register' :
                           item.type === 'program' ? 'Join' : 'View'}
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        {expandedItem === item.id ? 'Less' : 'More'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Quick Stats */}
      <div className={`${bgColor} p-4 border-t border-gray-100`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className={`text-lg font-bold ${color}`}>
              {items.filter(i => i.type === 'program').length}
            </div>
            <div className="text-xs text-gray-600">Programs</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${color}`}>
              {items.filter(i => i.type === 'event').length}
            </div>
            <div className="text-xs text-gray-600">Events</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${color}`}>
              {items.filter(i => i.type === 'document').length}
            </div>
            <div className="text-xs text-gray-600">Guides</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${color}`}>
              {items.filter(i => i.type === 'link').length}
            </div>
            <div className="text-xs text-gray-600">Links</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;