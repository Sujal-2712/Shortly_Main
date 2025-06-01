import React, { useContext, useState, useEffect } from 'react';
import { API_URL ,API_URL_REDIRECT} from './../../config';

import { BeatLoader } from 'react-spinners';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from './../App';
import toast from 'react-hot-toast';
import DeleteConfirmation from './../components/DeleteConfirmation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './../components/ui/card';
import apiClient from './../api/index';
import { Button } from './../components/ui/button';
import { Copy, Download, LinkIcon, Trash } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const LinkPage = () => {
  const { userAuth } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [url, setUrlData] = useState(null);
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Color schemes for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const RADIAN = Math.PI / 180;

  // Helper functions to format data for charts
  const formatDataForBarChart = (data) => {
    return Object.entries(data).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  };

  const formatDataForPieChart = (data) => {
    return Object.entries(data).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  };

  const formatDailyData = (data) => {
    return Object.entries(data).map(([date, clicks]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: clicks
    }));
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  useEffect(() => {
    fetchLongurl();
  }, [userAuth]);
  const fetchLongurl = async () => {
    setLoading(true);

    const res = await apiClient.get(`/url/get/${id}`);

    if (res.success) {
      setUrlData(res.data?.data);
    } else {
      toast.error(res.message || 'Failed to fetch URL data.');
      console.error('Error fetching URL:', res);
    }

    setLoading(false);
  };

  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = `${url?.title || 'QR_Code'}.png`;

    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };
  const link = url ? (url?.custom_url || url?.short_url) : '';

  if (!userAuth.access_token) {
    navigate('/');
    return null;
  }

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <BeatLoader size={"100%"} color='36d7b7' />
        </div>
      ) : (
        <div className="container mx-auto p-5">
          {url && (
            <div className="flex flex-col sm:flex-row justify-between">
              <div className="flex flex-col gap-5 items-start rounded-lg sm:w-2/5">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-300 capitalize hover:underline cursor-pointer">
                  {url.title}
                </h3>
                <a
                  href={`${API_URL_REDIRECT}/${link}`}
                  target='_blank'
                  rel="noopener noreferrer"
                  className="text-lg sm:text-xl text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  {API_URL_REDIRECT}/{link}
                </a>
                <a
                  href={url.original_url}
                  target='_blank'
                  rel="noopener noreferrer"
                  className="flex items-end text-md text-gray-600"
                >
                  <LinkIcon className="mr-2" />
                  {url?.original_url}
                </a>
                <span className="text-xl text-gray-500">
                  <span className='font-bold text-slate-100'>Created On : </span>
                  {new Date(url?.createdAt).toLocaleString()}
                </span>

                {/* Status and Expiry Info */}
                <div className="flex flex-col gap-2">
                  <span className="text-lg text-gray-500">
                    <span className='font-bold text-slate-100'>Status : </span>
                    <span className={url.is_active ? 'text-green-500' : 'text-red-500'}>
                      {url.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                  {url.expires_at && (
                    <span className="text-lg text-gray-500">
                      <span className='font-bold text-slate-100'>Expires : </span>
                      {new Date(url.expires_at).toLocaleString()}
                    </span>
                  )}
                  {url.tags && url.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className='font-bold text-slate-100'>Tags : </span>
                      {url.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="ghost"
                    className="text-blue-500 hover:bg-blue-500 text-lg py-3 px-6"
                    onClick={() => {
                      navigator.clipboard.writeText(`${API_URL}/${link}`);
                      toast.success("Copied to Clipboard!");
                    }}
                  >
                    <Copy style={{ width: '22px', height: '22px' }} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-blue-500 hover:bg-blue-500 text-lg py-3 px-6"
                    onClick={downloadImage}
                  >
                    <Download style={{ width: '22px', height: '22px' }} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setOpen(true)}
                    className="text-red-800 hover:bg-red-500 text-lg py-3 px-6"
                  >
                    <Trash style={{ width: '22px', height: '22px' }} />
                  </Button>
                </div>

                <img
                  src={url?.qr}
                  alt="QR Code"
                  className="mt-6 w-4/5 rounded-lg ring ring-blue-500 p-1 object-contain"
                />
              </div>
              <DeleteConfirmation url={url} userAuth={userAuth} API_URL={API_URL} open={open} setOpen={setOpen} />
              <div className="sm:w-3/5 space-y-6">
                {/* Summary Statistics */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-300">Analytics Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{url.analytics?.totalClicks || 0}</div>
                        <div className="text-xs text-gray-600">Total Clicks</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {url.analytics?.clicksByCity ? Object.keys(url.analytics.clicksByCity).length : 0}
                        </div>
                        <div className="text-xs text-gray-600">Cities</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {url.analytics?.clicksByBrowser ? Object.keys(url.analytics.clicksByBrowser).length : 0}
                        </div>
                        <div className="text-xs text-gray-600">Browsers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* City Analytics - Bar Chart */}
                  {url.analytics?.clicksByCity && Object.keys(url.analytics.clicksByCity).length > 0 && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Clicks by City</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={formatDataForBarChart(url.analytics.clicksByCity)}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                              dataKey="name"
                              fontSize={12}
                              tick={{ fill: '#666' }}
                            />
                            <YAxis fontSize={12} tick={{ fill: '#666' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar
                              dataKey="value"
                              fill="#00C49F"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Browser Analytics - Pie Chart */}
                  {url.analytics?.clicksByBrowser && Object.keys(url.analytics.clicksByBrowser).length > 0 && (
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">Browser Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={formatDataForPieChart(url.analytics.clicksByBrowser)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {formatDataForPieChart(url.analytics.clicksByBrowser).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recent Activity - Compact View */}
                {url.analytics?.recentClicks && url.analytics.recentClicks.length > 0 && (
                  <Card className="">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {url.analytics.recentClicks.slice(0, 5).map((click, index) => (
                          <div key={click._id || index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {click.city.toUpperCase()} ({click.country.toUpperCase()})
                                </span>
                                <span className="text-xs bg-blue-900 dark:bg-blue-900 px-2 py-1 rounded">
                                  {click.browser}
                                </span>
                                <span className="text-xs bg-green-900 dark:bg-green-900 px-2 py-1 rounded">
                                  {click.device}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(click.timestamp).toLocaleString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </div>
                          </div>
                        ))}
                        {url.analytics.recentClicks.length > 5 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            +{url.analytics.recentClicks.length - 5} more clicks
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkPage;