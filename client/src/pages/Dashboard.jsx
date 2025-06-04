import React, { useContext, useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners'
import apiClient from './../api/index';
import { Input } from './../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../components/ui/card';
import { Filter, LucideSplitSquareHorizontal } from 'lucide-react';

import LinkCard from "./../components/LinkCard"
import CreateLink from '@/components/CreateLink';
const Dashboard = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0 });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const fetchURLs = async () => {
    setLoading(true);

    const res = await apiClient.get('/url/user-urls');
    if (res.success && res.data) {
      const result = res.data.data;
      const urlsData = result.urls || result || [];
      setLinks(urlsData);
      if (result.pagination) {
        setPagination(result.pagination);
      }

      const totalLinks = urlsData.length;
      const totalClicks = urlsData.reduce((acc, url) => {
        if (url.analytics?.totalClicks !== undefined) {
          return acc + url.analytics.totalClicks;
        }
        return acc + (url.clicks?.length || 0);
      }, 0);

      setStats({
        totalLinks,
        totalClicks,
      });
    } else {
      console.error("Error fetching URLs:", res.message);
    }

    setLoading(false);
  };
  useEffect(() => {
    fetchURLs();
  }, []);

  // Filter links based on search query
  const filteredLinks = links.filter((link) =>
    link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.original_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.short_url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='flex flex-col gap-8 px-5'>
      {/* Loader */}
      {loading && <BarLoader width={"100%"} color='#36d7b7' />}

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {stats.totalLinks}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {stats.totalClicks}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {links.filter(link => link.is_active).length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Clicks/Link</CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground">
              {stats.totalLinks > 0 ? Math.round(stats.totalClicks / stats.totalLinks * 100) / 100 : 0}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-extrabold'>My Links</h1>
        <CreateLink links={links} setLinks={setLinks} fetchURLs={fetchURLs}/>
      </div>
      <div className='relative'>
        <Input
          type="text"
          placeholder="Filter by title, URL, or short code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        <Filter className='absolute top-2 right-2 p-1 h-6 w-6 text-gray-400' />
      </div>

      {/* Pagination Info */}
      {pagination.totalUrls && (
        <div className="text-sm text-gray-600">
          Showing {filteredLinks.length} of {pagination.totalUrls} links
          {pagination.totalPages > 1 && (
            <span> • Page {pagination.currentPage} of {pagination.totalPages}</span>
          )}
        </div>
      )}

      {/* Display filtered links */}
      <div className="space-y-4">
        {filteredLinks.length > 0 ? (
          filteredLinks.map((url, index) => (
            <LinkCard key={url._id || index} url={url} fetchUrls={fetchURLs} />
          ))
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                {searchQuery ? 'No links found matching your search.' : 'No links created yet.'}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;