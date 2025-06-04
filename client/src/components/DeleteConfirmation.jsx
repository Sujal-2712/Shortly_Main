import React from 'react'
import { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./../components/ui/dialog";
import { Button } from './ui/button';
import  apiClient  from "./../api/index";

import { useNavigate } from 'react-router-dom';
const DeleteConfirmation = ({ url, userAuth, API_URL, open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const deleteURL = async () => {
    setLoading(true);

    const res = await apiClient.delete(`/delete-url/${url._id}`);

    if (res.success && res.status === 200) {
      toast.success(res.message || "URL Deleted Successfully!");
      setOpen(false);
      navigate("/dashboard"); 
    } else {
      toast.error(res.message || "Failed to delete URL.");
      console.error("Delete error:", res);
    }
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      

      {/* Dialog content */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this URL? This action cannot be undone.
          </p>
        </DialogHeader>

        <DialogFooter>
          {/* Cancel button */}
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>

          {/* Confirm delete */}
          <Button variant="destructive" onClick={deleteURL} disabled={loading}>
            {loading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmation
