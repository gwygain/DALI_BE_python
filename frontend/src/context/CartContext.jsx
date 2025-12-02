import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart({ product_id: productId, quantity });
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await cartAPI.updateCartItem(productId, quantity);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await fetchCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], subtotal: 0, total: 0 });
    } catch (error) {
      throw error;
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchCart();
  }, []);

  const value = {
    cart,
    loading,
    cartCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
