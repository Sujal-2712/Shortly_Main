import { Copy, Trash, Download, BarChart3, Globe, Monitor, Calendar } from "lucide-react";
import React, { useContext, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import DeleteConfirmation from "./DeleteConfirmation";
import { UserContext } from "../App";
import { API_URL,API_URL_REDIRECT } from "../../config";

const LinkCard = ({ url, fetchUrls }) => {
  const { userAuth } = useContext(UserContext);
 const [open, setOpen] = useState(false);
  const DownloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = `${url?.title || "QR_Code"}.png`;

    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };
  // Process analytics data
  const analytics = url.analytics || {};
  const totalClicks = analytics.totalClicks || url.clicks?.length || 0;
  
  return (
    <div className="border p-4 bg-slate-800 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* QR Code Image */}
        <div className="flex-shrink-0">
          <img
            src={url.qr}
            alt="qr code"
            className="w-32 h-32 lg:w-36 lg:h-36 object-contain ring-2 ring-blue-500 rounded-lg"
          />
        </div>

        {/* URL Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/link/${url._id}`} className="block">
            <h3 className="text-xl lg:text-2xl font-bold hover:underline cursor-pointer truncate">
              {url.title}
            </h3>
            <p className="text-lg lg:text-xl text-blue-400 font-bold hover:underline cursor-pointer break-all">
              {API_URL_REDIRECT?.replace(/^https?:\/\//, '')}/{url.short_url}
            </p>
            <p className="text-sm lg:text-base text-gray-300 hover:underline cursor-pointer break-all">
              {url.original_url}
            </p>
          </Link>
          
          {/* Stats Row */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              {totalClicks} clicks
            </Badge>
            {analytics.uniqueCountries > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {analytics.uniqueCountries} countries
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(url?.createdAt).toLocaleDateString()}
            </Badge>
            <Badge variant={url.is_active ? "default" : "destructive"}>
              {url.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            className="text-blue-500 hover:bg-blue-500/20"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(`${API_URL}/${url.short_url}`);
              toast.success("Copied to Clipboard!!");
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            className="text-blue-500 hover:bg-blue-500/20"
            size="sm"
            onClick={DownloadImage}
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Delete URL */}
          <Button
            variant="ghost"
            onClick={() => setOpen(true)}
            className="text-red-500 hover:bg-red-500/20"
            size="sm"
          >
            <Trash className="w-4 h-4" />
          </Button>

           <DeleteConfirmation url={url} userAuth={userAuth} API_URL={API_URL} open={open} setOpen={setOpen}/>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;