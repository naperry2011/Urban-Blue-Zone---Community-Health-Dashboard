'use client';

import React, { useState } from 'react';
import ResourceCard from '../../components/ResourceCard';
import CommunityMap from '../../components/CommunityMap';

// Mock data for resources
const walkingGroupsData = [
  {
    id: 'wg-001',
    title: 'Morning Power Walkers',
    description: 'Join our energetic morning walking group for a 3-mile loop through the neighborhood parks.',
    type: 'program' as const,
    location: 'Blue Zone Community Center',
    schedule: 'Monday, Wednesday, Friday 7:00 AM',
    contact: 'Sarah Johnson - (555) 123-4567',
    cost: 'Free',
    capacity: 20,
    enrolled: 15,
    tags: ['Morning', 'Beginner Friendly', 'Social']
  },
  {
    id: 'wg-002',
    title: 'Sunset Strollers',
    description: 'Relaxed evening walks with optional mindfulness exercises and social time.',
    type: 'program' as const,
    location: 'Heritage Park Trail',
    schedule: 'Tuesday, Thursday 6:00 PM',
    contact: 'Mike Chen - (555) 234-5678',
    cost: 'Free',
    capacity: 25,
    enrolled: 18,
    tags: ['Evening', 'Mindfulness', 'All Levels']
  },
  {
    id: 'wg-003',
    title: 'Nordic Walking Workshop',
    description: 'Learn proper Nordic walking technique with poles for full-body workout benefits.',
    type: 'event' as const,
    location: 'Community Center',
    schedule: 'Saturday, Oct 28 10:00 AM',
    contact: 'Lisa Anderson - (555) 345-6789',
    cost: '$15 (includes pole rental)',
    capacity: 12,
    enrolled: 8,
    tags: ['Workshop', 'Equipment Provided', 'Technique']
  },
  {
    id: 'wg-004',
    title: 'Walking Safety Guide',
    description: 'Comprehensive guide covering safe walking routes, weather considerations, and proper footwear.',
    type: 'document' as const,
    downloadUrl: '/resources/walking-safety-guide.pdf',
    tags: ['Safety', 'Beginner', 'Reference']
  },
  {
    id: 'wg-005',
    title: 'Local Walking Trails Map',
    description: 'Interactive map showing all walking trails in the Blue Zone community with difficulty ratings.',
    type: 'link' as const,
    url: 'https://maps.bluezone.community/walking-trails',
    tags: ['Maps', 'Trails', 'Navigation']
  }
];

const stressManagementData = [
  {
    id: 'sm-001',
    title: 'Mindfulness Meditation Circle',
    description: 'Weekly guided meditation sessions focusing on stress reduction and mental clarity.',
    type: 'program' as const,
    location: 'Wellness Center - Room 2B',
    schedule: 'Wednesdays 5:30 PM',
    contact: 'Dr. Maria Rodriguez - (555) 456-7890',
    cost: '$10 per session',
    capacity: 15,
    enrolled: 12,
    tags: ['Meditation', 'Weekly', 'Guided']
  },
  {
    id: 'sm-002',
    title: 'Stress-Free Cooking Workshop',
    description: 'Learn to prepare healthy, simple meals that reduce stress and boost energy.',
    type: 'event' as const,
    location: 'Community Kitchen',
    schedule: 'Saturday, Nov 4 2:00 PM',
    contact: 'Chef Tony Kim - (555) 567-8901',
    cost: '$25 (includes ingredients)',
    capacity: 10,
    enrolled: 7,
    tags: ['Cooking', 'Nutrition', 'Hands-on']
  },
  {
    id: 'sm-003',
    title: 'Breathing Techniques Video Series',
    description: '10-part video series teaching various breathing exercises for stress management.',
    type: 'video' as const,
    url: 'https://wellness.bluezone.community/breathing-series',
    tags: ['Video Series', 'Self-Paced', 'Techniques']
  },
  {
    id: 'sm-004',
    title: 'Stress Management Workbook',
    description: 'Interactive workbook with exercises, tracking sheets, and coping strategies.',
    type: 'document' as const,
    downloadUrl: '/resources/stress-management-workbook.pdf',
    tags: ['Workbook', 'Interactive', 'Self-Help']
  },
  {
    id: 'sm-005',
    title: 'Crisis Support Hotline',
    description: '24/7 support line staffed by trained counselors for immediate stress and anxiety help.',
    type: 'link' as const,
    url: 'tel:+15558889999',
    contact: '(555) 888-9999',
    cost: 'Free',
    tags: ['24/7', 'Crisis Support', 'Professional']
  }
];

const nutritionGuidesData = [
  {
    id: 'ng-001',
    title: 'Blue Zone Nutrition Program',
    description: 'Comprehensive 8-week program teaching the nutritional principles of Blue Zone communities.',
    type: 'program' as const,
    location: 'Education Center',
    schedule: 'Thursdays 6:00 PM (8 weeks)',
    contact: 'Nutritionist Emma Wilson - (555) 678-9012',
    cost: '$120 for full program',
    capacity: 20,
    enrolled: 16,
    tags: ['8-Week Program', 'Evidence-Based', 'Group Setting']
  },
  {
    id: 'ng-002',
    title: 'Plant-Based Meal Planning Workshop',
    description: 'Learn to plan, shop for, and prepare delicious plant-based meals on any budget.',
    type: 'event' as const,
    location: 'Community Kitchen',
    schedule: 'Saturday, Nov 11 1:00 PM',
    contact: 'Chef Anna Martinez - (555) 789-0123',
    cost: '$30 (includes meal)',
    capacity: 15,
    enrolled: 11,
    tags: ['Plant-Based', 'Meal Planning', 'Budget-Friendly']
  },
  {
    id: 'ng-003',
    title: 'Seasonal Eating Guide',
    description: 'Month-by-month guide to eating seasonally with local produce recommendations and recipes.',
    type: 'document' as const,
    downloadUrl: '/resources/seasonal-eating-guide.pdf',
    tags: ['Seasonal', 'Local Produce', 'Recipes']
  },
  {
    id: 'ng-004',
    title: 'Healthy Recipes Database',
    description: 'Searchable database of 500+ healthy recipes with nutritional information and Blue Zone ratings.',
    type: 'link' as const,
    url: 'https://recipes.bluezone.community',
    tags: ['Recipes', 'Database', 'Nutritional Info']
  },
  {
    id: 'ng-005',
    title: 'Nutrition Label Reading Workshop',
    description: 'Learn to decode nutrition labels and make informed food choices at the grocery store.',
    type: 'event' as const,
    location: 'Community Center',
    schedule: 'Saturday, Nov 18 10:00 AM',
    contact: 'Dietitian John Parker - (555) 890-1234',
    cost: '$15',
    capacity: 25,
    enrolled: 19,
    tags: ['Education', 'Grocery Shopping', 'Label Reading']
  }
];

const communityProgramsData = [
  {
    id: 'cp-001',
    title: 'Intergenerational Storytelling Circle',
    description: 'Monthly gathering where community members of all ages share stories and wisdom.',
    type: 'program' as const,
    location: 'Heritage Hall',
    schedule: 'First Saturday of each month 3:00 PM',
    contact: 'Margaret Foster - (555) 901-2345',
    cost: 'Free',
    capacity: 40,
    enrolled: 28,
    tags: ['Monthly', 'All Ages', 'Community Building']
  },
  {
    id: 'cp-002',
    title: 'Community Garden Project',
    description: 'Collaborative organic gardening with shared harvests and educational workshops.',
    type: 'program' as const,
    location: 'Community Garden (5th & Oak)',
    schedule: 'Saturdays 9:00 AM',
    contact: 'Green Thumb Committee - (555) 012-3456',
    cost: '$25 seasonal fee',
    capacity: 50,
    enrolled: 42,
    tags: ['Gardening', 'Organic', 'Educational']
  },
  {
    id: 'cp-003',
    title: 'Volunteer Opportunities Fair',
    description: 'Connect with local organizations and find meaningful volunteer opportunities in your community.',
    type: 'event' as const,
    location: 'Community Center Main Hall',
    schedule: 'Saturday, Dec 2 10:00 AM - 2:00 PM',
    contact: 'Volunteer Coordinator - (555) 123-4567',
    cost: 'Free',
    tags: ['Volunteering', 'Community Service', 'Networking']
  },
  {
    id: 'cp-004',
    title: 'Blue Zone Community Guidelines',
    description: 'Official handbook covering community values, programs, and ways to get involved.',
    type: 'document' as const,
    downloadUrl: '/resources/community-guidelines.pdf',
    tags: ['Guidelines', 'Community Values', 'Getting Started']
  },
  {
    id: 'cp-005',
    title: 'Social Events Calendar',
    description: 'Interactive calendar with all upcoming community events, social gatherings, and celebrations.',
    type: 'link' as const,
    url: 'https://calendar.bluezone.community',
    tags: ['Calendar', 'Events', 'Social']
  },
  {
    id: 'cp-006',
    title: 'Skill Sharing Network',
    description: 'Platform to offer your skills or learn from others in the community.',
    type: 'link' as const,
    url: 'https://skills.bluezone.community',
    tags: ['Skill Sharing', 'Learning', 'Community Exchange']
  }
];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Resources', icon: '📋', count: walkingGroupsData.length + stressManagementData.length + nutritionGuidesData.length + communityProgramsData.length },
    { id: 'walking', name: 'Walking Groups', icon: '🚶', count: walkingGroupsData.length },
    { id: 'stress', name: 'Stress Management', icon: '😌', count: stressManagementData.length },
    { id: 'nutrition', name: 'Nutrition Guides', icon: '🥗', count: nutritionGuidesData.length },
    { id: 'community', name: 'Community Programs', icon: '👥', count: communityProgramsData.length }
  ];

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Resources</h1>
        <p className="mt-2 text-sm text-gray-600">
          Discover programs, guides, and community connections to support your Blue Zone lifestyle
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Community Map */}
      <div className="mb-8">
        <CommunityMap height={300} />
      </div>

      {/* Resource Cards */}
      <div className="space-y-8">
        {/* Walking Groups */}
        {(selectedCategory === 'all' || selectedCategory === 'walking') && (
          <ResourceCard
            title="Walking Groups"
            description="Join community walking groups to stay active, meet neighbors, and explore local trails together."
            icon="🚶‍♀️"
            color="text-green-700"
            bgColor="bg-green-50"
            items={walkingGroupsData}
          />
        )}

        {/* Stress Management */}
        {(selectedCategory === 'all' || selectedCategory === 'stress') && (
          <ResourceCard
            title="Stress Management Resources"
            description="Tools, techniques, and programs to help you manage stress and improve mental well-being."
            icon="😌"
            color="text-purple-700"
            bgColor="bg-purple-50"
            items={stressManagementData}
          />
        )}

        {/* Nutrition Guides */}
        {(selectedCategory === 'all' || selectedCategory === 'nutrition') && (
          <ResourceCard
            title="Nutrition Guides"
            description="Learn about Blue Zone nutrition principles, plant-based eating, and healthy meal planning."
            icon="🥗"
            color="text-orange-700"
            bgColor="bg-orange-50"
            items={nutritionGuidesData}
          />
        )}

        {/* Community Programs */}
        {(selectedCategory === 'all' || selectedCategory === 'community') && (
          <ResourceCard
            title="Community Programs"
            description="Connect with your neighbors through social programs, volunteer opportunities, and shared activities."
            icon="👥"
            color="text-blue-700"
            bgColor="bg-blue-50"
            items={communityProgramsData}
          />
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Community Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
            <div className="text-sm text-gray-600">Active Participants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">25</div>
            <div className="text-sm text-gray-600">Weekly Programs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
            <div className="text-sm text-gray-600">Resources Available</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Involved Today!</h3>
        <p className="text-gray-600 mb-6">
          Ready to start your Blue Zone journey? Contact our Community Coordinator to learn more about programs and get personalized recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            📞 Contact Coordinator
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            📅 Schedule Visit
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Community Coordinator: Jennifer Walsh • (555) 234-5678 • jennifer@bluezone.community
        </div>
      </div>
    </div>
  );
}