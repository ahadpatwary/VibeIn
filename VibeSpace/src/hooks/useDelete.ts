'use client';
import { useState } from 'react';

export const useDelete = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const deleteItem = async (model: 'User' | 'Card', id: string | undefined) => {
    
    if (!id || !model) {
      setMessage('Model or ID is missing');
      return;
    }

    try {

      setLoading(true);
      const res = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, id }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Deleted successfully');
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      setMessage('Error while deleting');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { deleteItem, message, loading };
};