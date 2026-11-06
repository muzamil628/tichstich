import React, { useState } from 'react';
import { Product, Order, OrderStatus, ProductCategory, Model3DType, TryOnType } from '../types';
import { INITIAL_PRODUCTS, saveStoredProducts, saveStoredOrders } from '../data/initialProducts';
import {
  Lock,
  Unlock,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Truck,
  DollarSign,
  ArrowLeft,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onUpdateProducts: (updated: Product[]) => void;
  onUpdateOrders: (updated: Order[]) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  onUpdateProducts,
  onUpdateOrders,
  onClose,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('atelier_mono_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'analytics'>('inventory');

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Add/Edit Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Adding / Editing Product
  const [formData, setFormData] = useState({
    name: '',
    category: 'Clothes' as ProductCategory,
    price: 120,
    originalPrice: 150,
    stock: 20,
    sku: '',
    sizes: 'S, M, L, XL',
    colors: 'Chalk White:#F4F4F5, Ash Grey:#D4D4D8, Pitch Black:#18181B',
    image: '/src/assets/images/minimal_hoodie_white_1793871978766.jpg',
    model3dType: 'hoodie' as Model3DType,
    tryonType: 'upper_body' as TryOnType,
    description: '',
    details: 'Heavyweight premium fabric\nEthically handcrafted\nReinforced seams',
    tags: 'New Arrival, Essential',
    inStock: true,
  });

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Credential check required by user: username: admin, password: abc*,#xyz123
    if (usernameInput === 'admin' && passwordInput === 'abc*,#xyz123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('atelier_mono_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Check username and password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('atelier_mono_admin_auth');
  };

  // Quick Stock Adjustment
  const handleStockAdjust = (productId: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock, inStock: newStock > 0 };
      }
      return p;
    });
    onUpdateProducts(updated);
    saveStoredProducts(updated);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product from the store catalog?')) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
      saveStoredProducts(updated);
    }
  };

  // Open Edit Product
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      stock: p.stock,
      sku: p.sku,
      sizes: p.sizes.join(', '),
      colors: p.colors.map((c) => `${c.name}:${c.hex}`).join(', '),
      image: p.image,
      model3dType: p.model3dType || 'hoodie',
      tryonType: p.tryonType,
      description: p.description,
      details: p.details.join('\n'),
      tags: p.tags.join(', '),
      inStock: p.inStock,
    });
    setIsAddModalOpen(true);
  };

  // Open Add Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Clothes',
      price: 120,
      originalPrice: 150,
      stock: 20,
      sku: `MONO-CUS-${Math.floor(10 + Math.random() * 90)}`,
      sizes: 'S, M, L, XL',
      colors: 'Chalk White:#F4F4F5, Ash Grey:#D4D4D8, Pitch Black:#18181B',
      image: '/src/assets/images/minimal_hoodie_white_1793871978766.jpg',
      model3dType: 'hoodie',
      tryonType: 'upper_body',
      description: 'Minimalist luxury tailoring designed with architectural lines and premium organic textiles.',
      details: 'Custom heavyweight weave\nPre-shrunk finish\nMinimalist tonal hardware',
      tags: 'New Arrival, Essential',
      inStock: true,
    });
    setIsAddModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse colors: "Name:Hex, Name2:Hex2"
    const parsedColors = formData.colors.split(',').map((c) => {
      const [name, hex] = c.split(':');
      return {
        name: (name || 'Natural').trim(),
        hex: (hex || '#CCCCCC').trim(),
      };
    });

    const parsedSizes = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const parsedDetails = formData.details.split('\n').map((d) => d.trim()).filter(Boolean);
    const parsedTags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingProduct) {
      // Update
      const updated = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice),
            stock: Number(formData.stock),
            sku: formData.sku,
            sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
            colors: parsedColors.length > 0 ? parsedColors : [{ name: 'Default', hex: '#E4E4E7' }],
            image: formData.image,
            model3dType: formData.model3dType,
            tryonType: formData.tryonType,
            description: formData.description,
            details: parsedDetails,
            tags: parsedTags,
            inStock: Number(formData.stock) > 0,
          };
        }
        return p;
      });
      onUpdateProducts(updated);
      saveStoredProducts(updated);
    } else {
      // Create new product
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stock: Number(formData.stock),
        sku: formData.sku,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['One Size'],
        colors: parsedColors.length > 0 ? parsedColors : [{ name: 'Default', hex: '#E4E4E7' }],
        image: formData.image,
        model3dType: formData.model3dType,
        tryonType: formData.tryonType,
        description: formData.description,
        details: parsedDetails,
        tags: parsedTags,
        inStock: Number(formData.stock) > 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [newProduct, ...products];
      onUpdateProducts(updated);
      saveStoredProducts(updated);
    }

    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  // Update Order Status
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    onUpdateOrders(updated);
    saveStoredOrders(updated);
  };

  // Reset to initial demo catalog
  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog to the default showcase products?')) {
      onUpdateProducts(INITIAL_PRODUCTS);
      saveStoredProducts(INITIAL_PRODUCTS);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'All') return true;
    return o.status === orderStatusFilter;
  });

  // Analytics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  // -------------------------------------------------------------
  // RENDER: LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 font-display">
              TICHSTICH · Admin Portal
            </h2>
            <p className="text-xs text-neutral-500">
              Enter authorized administrator credentials to manage products, inventory, and customer orders.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Back to Store
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Authenticate & Enter
              </button>
            </div>
          </form>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-[11px] text-neutral-500 text-center">
            Authorized admin key: <code className="font-mono text-neutral-700">admin / abc*,#xyz123</code>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-100 animate-in fade-in duration-200">
      
      {/* Top Admin Navigation Bar */}
      <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Return to Storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Storefront</span>
          </button>
          <div className="h-4 w-px bg-neutral-200" />
          <h1 className="text-base font-bold text-neutral-900 font-display flex items-center gap-2">
            <span>TICHSTICH</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
              Admin & Inventory
            </span>
          </h1>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
        </div>

        {/* Admin Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        
        {/* ========================================================
            TAB 1: INVENTORY MANAGEMENT
           ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Total SKUs</span>
                <span className="text-xl font-bold text-neutral-900 tabular-nums">{products.length} Items</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">In-Stock Units</span>
                <span className="text-xl font-bold text-neutral-900 tabular-nums">{totalStockUnits} Units</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Low Stock Alerts</span>
                <span className={`text-xl font-bold tabular-nums ${lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-900'}`}>
                  {lowStockCount} Products
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider block">Catalog Value</span>
                <span className="text-xl font-bold text-neutral-900 tabular-nums">${totalInventoryValue.toLocaleString()}</span>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by title or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="All">All Categories</option>
                  <option value="Girls 3pc & 2pc">Girls 3pc & 2pc</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Shawls & Wraps">Shawls & Wraps</option>
                  <option value="Bags">Bags</option>
                  <option value="Caps & Headwear">Caps & Headwear</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleResetCatalog}
                  className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                  title="Reload default demo clothes and items"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Demo Products</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Try-On Mirror</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-md border border-neutral-200 bg-neutral-100 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-neutral-900 block leading-tight">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-neutral-600">{p.category}</span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-neutral-900 tabular-nums">
                        ${p.price}
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-neutral-400 line-through text-[11px] ml-1.5">
                            ${p.originalPrice}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium tabular-nums ${
                            p.stock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : p.stock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}
                          </span>

                          {/* Quick adjust buttons */}
                          <div className="flex items-center border border-neutral-200 rounded">
                            <button
                              onClick={() => handleStockAdjust(p.id, -1)}
                              className="px-1.5 py-0.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleStockAdjust(p.id, 5)}
                              className="px-1.5 py-0.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                              title="Add 5 to stock"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded uppercase font-mono">
                          {p.tryonType}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No products found matching your filters.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: CUSTOMER ORDERS MANAGEMENT
           ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-700">Filter Status:</span>
                <div className="flex items-center gap-1">
                  {['All', 'pending', 'processing', 'shipped', 'delivered'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                        orderStatusFilter === st
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-xs text-neutral-500 tabular-nums">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            </div>

            <div className="space-y-4">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
                  
                  {/* Order Head */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 font-display">
                          Order #{ord.orderNumber}
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-500">
                          {new Date(ord.date).toLocaleDateString()} at {new Date(ord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 font-mono">
                        Tracking: {ord.trackingNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Payment Method Badge */}
                      <span className="text-xs font-medium px-2.5 py-1 rounded bg-neutral-100 text-neutral-800">
                        {ord.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Verified)'}
                      </span>

                      {/* Status Selector */}
                      <select
                        value={ord.status}
                        onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as OrderStatus)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ord.status === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : ord.status === 'processing'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Delivery Address & Shipping Instructions */}
                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/70 space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                        Customer & Shipping Destination
                      </span>
                      <p className="font-semibold text-neutral-900">
                        {ord.deliveryInfo.fullName} · {ord.deliveryInfo.phone}
                      </p>
                      <p className="text-neutral-600">
                        {ord.deliveryInfo.email}
                      </p>
                      <p className="text-neutral-700">
                        {ord.deliveryInfo.addressLine1} {ord.deliveryInfo.suiteOrApt ? `, ${ord.deliveryInfo.suiteOrApt}` : ''}, {ord.deliveryInfo.city}, {ord.deliveryInfo.postalCode}, {ord.deliveryInfo.country}
                      </p>

                      {/* Prominent Specific Shipping Instructions Box */}
                      {ord.deliveryInfo.shippingInstructions ? (
                        <div className="mt-2 p-2 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-900">
                          <strong className="block text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                            Specific Shipping Instructions:
                          </strong>
                          "{ord.deliveryInfo.shippingInstructions}"
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-400 italic pt-1">
                          No specific shipping instructions provided.
                        </p>
                      )}
                    </div>

                    {/* Ordered Items Summary */}
                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/70 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                        Ordered Items ({ord.items.length})
                      </span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {ord.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between">
                            <span className="text-neutral-800">
                              {it.quantity}x {it.product.name} ({it.selectedSize})
                            </span>
                            <span className="font-semibold tabular-nums text-neutral-900">
                              ${it.product.price * it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-neutral-200 flex items-center justify-between font-bold text-neutral-900">
                        <span>Total Paid / Due:</span>
                        <span className="tabular-nums">${ord.total}</span>
                      </div>
                    </div>

                  </div>

                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="p-12 text-center text-neutral-500 text-xs bg-white rounded-xl border border-neutral-200">
                  No orders found in this category.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 3: ANALYTICS OVERVIEW
           ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Store Revenue</span>
                <h3 className="text-3xl font-bold text-neutral-900 tabular-nums font-display">
                  ${totalRevenue.toLocaleString()}
                </h3>
                <p className="text-xs text-neutral-400">Across {orders.length} total customer orders</p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Items Dispatched</span>
                <h3 className="text-3xl font-bold text-neutral-900 tabular-nums font-display">
                  {totalItemsSold} Items
                </h3>
                <p className="text-xs text-neutral-400">Average order basket: ${(totalRevenue / Math.max(1, orders.length)).toFixed(0)}</p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Warehouse Inventory</span>
                <h3 className="text-3xl font-bold text-neutral-900 tabular-nums font-display">
                  {totalStockUnits} Units
                </h3>
                <p className="text-xs text-neutral-400">{lowStockCount} items currently require restock</p>
              </div>
            </div>

            {/* Quick tips & ready for business notice */}
            <div className="p-5 bg-white rounded-xl border border-neutral-200 space-y-2">
              <h4 className="text-sm font-semibold text-neutral-900">
                Ready for Live Business Operations
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                You can add, edit, or delete products anytime from the Inventory tab. The store supports Three.js procedural 3D model viewing for 5 product silhouettes (Hoodie, Shawl, Bag, Cap, Relaxed Tee) as well as AI-powered virtual camera try-on. All orders automatically log customer delivery instructions and payment methods.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================
          MODAL: ADD OR EDIT PRODUCT
         ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900 font-display">
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sculptural Heavyweight Cashmere Shawl"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="Girls 3pc & 2pc">Girls 3pc & 2pc</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Shawls & Wraps">Shawls & Wraps</option>
                    <option value="Bags">Bags</option>
                    <option value="Caps & Headwear">Caps & Headwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Compare-at / Original Price ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Inventory Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    3D Model Silhoutte *
                  </label>
                  <select
                    value={formData.model3dType}
                    onChange={(e) => setFormData({ ...formData, model3dType: e.target.value as Model3DType })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="shawl">3D Cashmere Shawl / 3pc Drape</option>
                    <option value="hoodie">3D Hoodie / Knit Sweater</option>
                    <option value="tee">3D Minimalist Relaxed Tee / 2pc Tunic</option>
                    <option value="bag">3D Structured Tote Bag</option>
                    <option value="cap">3D Tailored Wool Cap</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Image Asset URL *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/src/assets/images/... or web URL"
                      className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  {/* Quick image picker presets */}
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-500 flex-wrap">
                    <span>Preset images:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '/src/assets/images/girls_3pc_luxury_suit_1793882263521.jpg' })}
                      className="hover:underline text-neutral-900 font-medium"
                    >
                      Girls 3pc Suit
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '/src/assets/images/girls_2pc_minimal_coord_1793882263872.jpg' })}
                      className="hover:underline text-neutral-900 font-medium"
                    >
                      Girls 2pc Co-ord
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '/src/assets/images/girls_3pc_embroidered_set_1793882266333.jpg' })}
                      className="hover:underline text-neutral-900 font-medium"
                    >
                      Girls 3pc Embroidered
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '/src/assets/images/minimal_hoodie_white_1793871978766.jpg' })}
                      className="hover:underline text-neutral-800"
                    >
                      Hoodie
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '/src/assets/images/cashmere_shawl_grey_1793871978037.jpg' })}
                      className="hover:underline text-neutral-800"
                    >
                      Shawl
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '/src/assets/images/structured_leather_tote_1793871978391.jpg' })}
                      className="hover:underline text-neutral-800"
                    >
                      Bag
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '/src/assets/images/minimal_tailored_cap_1793871978780.jpg' })}
                      className="hover:underline text-neutral-800"
                    >
                      Cap
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Available Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="XS, S, M, L, XL"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Colors (Name:Hex, separated by comma)
                  </label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="White:#FFFFFF, Grey:#A1A1AA"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Craftsmanship Specs & Material Bullet Points (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                  />
                </div>

              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
