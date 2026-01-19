import { useState, useEffect } from 'react';
import { apiClient, MenuItem, Order } from './api';

export function useMenuItems(type: 'food' | 'beverage' | 'all' = 'all') {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        let foodItems: MenuItem[] = [];
        let beverageItems: MenuItem[] = [];

        if (type === 'food' || type === 'all') {
          foodItems = await apiClient.getFoodMenu();
        }
        if (type === 'beverage' || type === 'all') {
          beverageItems = await apiClient.getBeverageMenu();
        }

        setItems([...foodItems, ...beverageItems]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type]);

  return { items, loading, error };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOrdersByStatus('dimasak');
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refetch: fetchOrders };
}
