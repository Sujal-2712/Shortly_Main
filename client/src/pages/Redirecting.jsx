
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BarLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const Redirecting = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLongurl = async () => {
      setLoading(true);

      const res = await apiClient.get(`/get-long-url/${id}`);
      if (res.success && res.data?.original_url) {
        window.location.href = res.data.original_url;
      } else {
        toast.error(res.message || 'Failed to fetch the long URL. Please try again later.');
        console.error('Error fetching long URL:', res);
      }
      setLoading(false);
    };  
    fetchLongurl();
  }, [id]);

  return (
    <div>
      {loading ? (
        <>
          <BarLoader width={"100%"} color='36d7b7' />
          <br />
          <span className='font-bold text-2xl'>Redirecting.....</span>
        </>
      ) : null}
    </div>
  );
};

export default Redirecting;
