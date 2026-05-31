import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerManagement from '../components/config/CustomerManagement';
import ProgramTypeManagement from '../components/config/ProgramTypeManagement';
import IssueTypeManagement from '../components/config/IssueTypeManagement';

export default function AgentDashboard({ onViewTicket, initialTab = 'queue' }) {
  const { user, token, API_URL } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    status: { open: 0, assigned: 0, resolved: 0 },
    priority: { low: 0, medium: 0, high: 0 },
    category: {},
    module: {},
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab); // 'queue', 'my-tasks', 'all', 'config'
  const [configSubTab, setConfigSubTab] = useState('members'); // 'members', 'categories', 'modules', 'companies', 'positions', 'roles', 'errortypes'
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter for 'all' tab
  const [claimLoadingId, setClaimLoadingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, customerFilter]);

  // Members state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingMemberData, setEditingMemberData] = useState({ role: '', custNum: '' });

  // Configuration management state
  const [configCategories, setConfigCategories] = useState([]);
  const [configModules, setConfigModules] = useState([]);
  const [configCustomers, setConfigCustomers] = useState([]);
  const [configErrorTypes, setConfigErrorTypes] = useState([]);
  const [newErrId, setNewErrId] = useState('');
  const [newErrDesc, setNewErrDesc] = useState('');
  const [newErrRemark, setNewErrRemark] = useState('');
  const [editingErrId, setEditingErrId] = useState(null);
  const [editingErrDesc, setEditingErrDesc] = useState('');
  const [editingErrRemark, setEditingErrRemark] = useState('');
    const [configRoles, setConfigRoles] = useState([]);
  const [configLoading, setConfigLoading] = useState(false);
  
  const [newCatName, setNewCatName] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState(null);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState('');

  const [newModName, setNewModName] = useState('');
  const [editingModuleName, setEditingModuleName] = useState(null);
  const [editingModuleNewName, setEditingModuleNewName] = useState('');
            
  const [newPosName, setNewPosName] = useState('');
  const [editingPosId, setEditingPosId] = useState(null);
  const [editingPosName, setEditingPosName] = useState('');
  
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleBase, setNewRoleBase] = useState('customer');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [editingRoleBase, setEditingRoleBase] = useState('');
  
  const [configError, setConfigError] = useState('');
  const [configSuccess, setConfigSuccess] = useState('');

  const fetchConfigData = async () => {
    try {
      setConfigError('');
      const catRes = await fetch(`${API_URL}/tickets/config/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const catData = await catRes.json();
      if (catRes.ok) setConfigCategories(catData);

      const modRes = await fetch(`${API_URL}/tickets/config/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const modData = await modRes.json();
      if (modRes.ok) setConfigModules(modData);

      const custRes = await fetch(`${API_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const custData = await custRes.json();
      if (custRes.ok) setConfigCustomers(custData);

      const errRes = await fetch(`${API_URL}/tickets/config/error-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const errData = await errRes.json();
      if (errRes.ok) setConfigErrorTypes(errData);


      const rolesRes = await fetch(`${API_URL}/tickets/config/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rolesData = await rolesRes.json();
      if (rolesRes.ok) setConfigRoles(rolesData);
    } catch (err) {
      console.error('Error fetching config data:', err);
      setConfigError('ไม่สามารถโหลดข้อมูลโครงสร้างระบบงานได้');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all tickets
      const ticketsResponse = await fetch(`${API_URL}/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!ticketsResponse.ok) throw new Error('Failed to fetch ticket queue.');
      const ticketsData = await ticketsResponse.json();
      setTickets(ticketsData);

      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/tickets/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch config data too
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!token) return;
    setMembersLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setMembersLoading(false);
    }
  };


  const handleAddErrorType = async (e) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);
    try {
      const response = await fetch(`${API_URL}/tickets/config/error-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ error_id: newErrId, description: newErrDesc, remark: newErrRemark })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add error type');
      
      setConfigSuccess(`เพิ่มประเภทข้อผิดพลาด "${newErrId}" สำเร็จ`);
      setNewErrId('');
      setNewErrDesc('');
      setNewErrRemark('');
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleUpdateErrorType = async (id) => {
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);
    try {
      const response = await fetch(`${API_URL}/tickets/config/error-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: editingErrDesc, remark: editingErrRemark })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update error type');
      
      setConfigSuccess(`อัปเดตประเภทข้อผิดพลาด สำเร็จ`);
      setEditingErrId(null);
      setEditingErrDesc('');
      setEditingErrRemark('');
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDeleteErrorType = async (id) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบประเภทข้อผิดพลาด "${id}"?`)) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);
    try {
      const response = await fetch(`${API_URL}/tickets/config/error-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete error type');
      
      setConfigSuccess(`ลบประเภทข้อผิดพลาด "${id}" สำเร็จ`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add category');

      setNewCatName('');
      setConfigSuccess(`เพิ่มหมวดหมู่ช่วยเหลือ "${data.name}" เรียบร้อยแล้ว`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleUpdateCategory = async (name) => {
    if (!editingCategoryNewName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/categories/${name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newName: editingCategoryNewName.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update category');

      setConfigSuccess(`อัปเดตหมวดหมู่ช่วยเหลือ สำเร็จ`);
      setEditingCategoryName(null);
      setEditingCategoryNewName('');
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDeleteCategory = async (name) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ช่วยเหลือ "${name}"?`)) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/categories/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete category');

      setConfigSuccess(`ลบหมวดหมู่ช่วยเหลือ "${name}" สำเร็จ`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newModName.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add module');

      setNewModName('');
      setConfigSuccess(`เพิ่มระบบงานโมดูล "${data.name}" เรียบร้อยแล้ว`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleUpdateModule = async (name) => {
    if (!editingModuleNewName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/modules/${name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newName: editingModuleNewName.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update module');

      setConfigSuccess(`อัปเดตระบบงาน สำเร็จ`);
      setEditingModuleName(null);
      setEditingModuleNewName('');
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDeleteModule = async (name) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบระบบงานโมดูล "${name}"?`)) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/modules/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete module');

      setConfigSuccess(`ลบระบบงานโมดูล "${name}" สำเร็จ`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newRoleName.trim(), base_role: newRoleBase })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add role');

      setNewRoleName('');
      setNewRoleBase('customer');
      setConfigSuccess(`เพิ่มสิทธิ์ "${data.name}" เรียบร้อยแล้ว`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleUpdateRole = async (id, newName, newBase) => {
    if (!newName.trim()) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName.trim(), base_role: newBase })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update role');

      setEditingRoleId(null);
      setEditingRoleName('');
      setEditingRoleBase('');
      setConfigSuccess(`อัปเดตสิทธิ์เป็น "${data.name}" สำเร็จ`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleDeleteRole = async (id, name) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบสิทธิ์ "${name}"?`)) return;
    setConfigError('');
    setConfigSuccess('');
    setConfigLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets/config/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete role');

      setConfigSuccess(`ลบสิทธิ์ "${name}" สำเร็จ`);
      await fetchConfigData();
    } catch (err) {
      console.error(err);
      setConfigError(err.message);
    } finally {
      setConfigLoading(false);
    }
  };



  useEffect(() => {
    if (token) {
      fetchData();
      fetchMembers();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'config' && configSubTab === 'members') {
      fetchMembers();
    }
  }, [activeTab, configSubTab]);

  useEffect(() => {
    if (configSuccess || configError) {
      const timer = setTimeout(() => {
        setConfigSuccess('');
        setConfigError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [configSuccess, configError]);

  const handleClaimTicket = async (ticketId) => {
    setClaimLoadingId(ticketId);
    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to claim ticket.');
      }

      // Reload
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setClaimLoadingId(null);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/users/${editingMemberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingMemberData)
      });
      
      if (res.ok) {
        setEditingMemberId(null);
        setEditingMemberData({ role: '', custNum: '' });
        fetchMembers();
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update member.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveMember = async (memberId) => {
    try {
      const res = await fetch(`${API_URL}/auth/users/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_verified: true })
      });
      
      if (res.ok) {
        fetchMembers();
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve member.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกคนนี้? การลบจะทำให้ตั๋วและข้อความแชทประสานงานของสมาชิกคนนี้ทั้งหมดถูกลบออกจากระบบอย่างถาวร!')) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/users/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchMembers();
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete member.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter lists based on tab
  const filteredByCustomerTickets = customerFilter === 'all' 
    ? tickets 
    : tickets.filter(t => t.cust_num === customerFilter);

  const unassignedTickets = filteredByCustomerTickets.filter(t => t.status === 'open');
  const myAssignedTickets = filteredByCustomerTickets.filter(t => t.status === 'assigned' && t.agent_id === user.id);
  const resolvedTickets = filteredByCustomerTickets.filter(t => t.status === 'resolved');
  const agents = members.filter(m => (m.role || '').toLowerCase() === 'agent');
  
  // For 'all' tab, apply statusFilter
  const displayedAllTickets = filteredByCustomerTickets.filter(t => statusFilter === 'all' || t.status === statusFilter);

  // Pagination calculations for active tab
  let activeList = [];
  if (activeTab === 'queue') activeList = unassignedTickets;
  else if (activeTab === 'my-tasks') activeList = myAssignedTickets;
  else if (activeTab === 'all') activeList = displayedAllTickets;

  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActiveList = activeList.slice(startIndex, startIndex + itemsPerPage);

  // Stats helper variables
  const openCount = filteredByCustomerTickets.filter(t => t.status === 'open').length;
  const assignedCount = filteredByCustomerTickets.filter(t => t.status === 'assigned').length;
  const resolvedCount = filteredByCustomerTickets.filter(t => t.status === 'resolved').length;
  const totalCount = filteredByCustomerTickets.length;

  // Percentage calculations for dynamic chart bars
  const getPercent = (value) => {
    if (totalCount === 0) return '0%';
    return `${Math.round((value / totalCount) * 100)}%`;
  };

  return (
    <div className="main-content">
      {/* Toast Notification Popup */}
      {(configSuccess || configError) && (
        <div className="glass-toast-container">
          <div className={`glass-toast ${configSuccess ? 'success' : 'error'}`}>
            <span>{configSuccess ? configSuccess : configError}</span>
            <button 
              className="glass-toast-close" 
              onClick={() => {
                setConfigSuccess('');
                setConfigError('');
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title-gradient">ระบบควบคุมการบริการผู้ใช้</h1>
          <p className="subtitle-text" style={{ marginBottom: 0 }}>ยินดีต้อนรับกลับมา, {user.display_role || 'Agent'} {user.name} | จัดการและดูแลสถิติปัญหาของลูกค้า</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {activeTab !== 'config' && (
            <select 
              className="glass-input" 
              value={customerFilter} 
              onChange={(e) => setCustomerFilter(e.target.value)}
              style={{ margin: 0, width: 'auto', minWidth: '150px' }}
            >
              <option value="all">ลูกค้าทั้งหมด (All Customers)</option>
              {configCustomers.map(c => (
                <option key={c.id} value={c.cust_num}>{c.cust_num} - {c.cust_name}</option>
              ))}
            </select>
          )}
          <button className="btn btn-secondary" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            🔄 รีเฟรชข้อมูล
          </button>
        </div>
      </div>

      {/* Stats display */}
      {activeTab !== 'config' && (
        <div className="stats-grid">
        <div 
          className={`glass-card stat-card glow-cyan ${statusFilter === 'open' && activeTab === 'all' ? 'selected' : ''}`} 
          style={{ '--card-border-color': 'var(--accent-cyan)', cursor: 'pointer', transform: statusFilter === 'open' && activeTab === 'all' ? 'scale(1.02)' : 'none', border: statusFilter === 'open' && activeTab === 'all' ? '2px solid var(--accent-cyan)' : '' }}
          onClick={() => { setActiveTab('all'); setStatusFilter('open'); }}
        >
          <div className="stat-info">
            <span className="stat-label">เคสรอลูกเรือเคลม</span>
            <span className="stat-value">{openCount}</span>
          </div>
          <span className="stat-icon">📥</span>
        </div>
        <div 
          className={`glass-card stat-card glow-purple ${statusFilter === 'assigned' && activeTab === 'all' ? 'selected' : ''}`} 
          style={{ '--card-border-color': 'var(--accent-purple)', cursor: 'pointer', transform: statusFilter === 'assigned' && activeTab === 'all' ? 'scale(1.02)' : 'none', border: statusFilter === 'assigned' && activeTab === 'all' ? '2px solid var(--accent-purple)' : '' }}
          onClick={() => { setActiveTab('all'); setStatusFilter('assigned'); }}
        >
          <div className="stat-info">
            <span className="stat-label">กำลังดำเนินการ</span>
            <span className="stat-value">{assignedCount}</span>
          </div>
          <span className="stat-icon">⚡</span>
        </div>
        <div 
          className={`glass-card stat-card glow-cyan ${statusFilter === 'resolved' && activeTab === 'all' ? 'selected' : ''}`} 
          style={{ '--card-border-color': 'var(--status-resolved)', cursor: 'pointer', transform: statusFilter === 'resolved' && activeTab === 'all' ? 'scale(1.02)' : 'none', border: statusFilter === 'resolved' && activeTab === 'all' ? '2px solid var(--status-resolved)' : '' }}
          onClick={() => { setActiveTab('all'); setStatusFilter('resolved'); }}
        >
          <div className="stat-info">
            <span className="stat-label">แก้ไขเสร็จสิ้นแล้ว</span>
            <span className="stat-value">{resolvedCount}</span>
          </div>
          <span className="stat-icon">🥇</span>
        </div>
        <div 
          className={`glass-card stat-card glow-purple ${statusFilter === 'all' && activeTab === 'all' ? 'selected' : ''}`} 
          style={{ '--card-border-color': '#e2e8f0', cursor: 'pointer', transform: statusFilter === 'all' && activeTab === 'all' ? 'scale(1.02)' : 'none', border: statusFilter === 'all' && activeTab === 'all' ? '2px solid #94a3b8' : '' }}
          onClick={() => { setActiveTab('all'); setStatusFilter('all'); }}
        >
          <div className="stat-info">
            <span className="stat-label">เคสทั้งหมดในระบบ</span>
            <span className="stat-value">{totalCount}</span>
          </div>
          <span className="stat-icon">📈</span>
        </div>
        </div>
      )}

      {/* Main Board Content split */}
      <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr' }}>
        {/* Left Side: Ticket Queues */}
        <div className="tickets-container">
          {/* Tab Navigation */}
          {activeTab !== 'config' && (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
              onClick={() => setActiveTab('queue')}
              className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1.25rem', borderRadius: '30px', fontSize: '0.85rem' }}
            >
              📥 เคสที่ยังไม่ได้ถูกรับ ({unassignedTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`btn ${activeTab === 'my-tasks' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1.25rem', borderRadius: '30px', fontSize: '0.85rem' }}
            >
              ⚡ เคสที่ฉันรับผิดชอบ ({myAssignedTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('workloads')}
              className={`btn ${activeTab === 'workloads' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1.25rem', borderRadius: '30px', fontSize: '0.85rem' }}
            >
              👥 เคสในมือเจ้าหน้าที่ ({members.filter(m => m.role === 'agent').length})
            </button>
              <button
                onClick={() => { setActiveTab('all'); setStatusFilter('all'); }}
                className={`btn ${activeTab === 'all' && statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1.25rem', borderRadius: '30px', fontSize: '0.85rem' }}
              >
                📋 เคสทั้งหมดในระบบ ({totalCount})
              </button>
            </div>
          )}

          {error && (
            <div className="alert-box alert-error">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>กำลังโหลดคำขอในระบบ...</p>
            </div>
          ) : (
            <>
              {/* RENDERING QUEUE */}
              {activeTab === 'queue' && (
                unassignedTickets.length === 0 ? (
                  <div className="glass-card empty-state">
                    <span className="empty-icon">🥳</span>
                    <h3>ยอดเยี่ยม! คิวว่างเปล่า</h3>
                    <p>ไม่มีตั๋วคงเหลือรอกดเคลมในระบบขณะนี้ คุณสามารถรอหรือตรวจสอบเคสที่รับผิดชอบอยู่</p>
                  </div>
                ) : (
                  <>
                    {paginatedActiveList.map(ticket => (
                      <div key={ticket.id} className="glass-card ticket-card interactive glow-cyan">
                        <div className="ticket-main">
                          <div className="ticket-header">
                            <span className="ticket-id">{ticket.ticket_number || '#' + String(ticket.id).padStart(3, '0')}</span>
                            <span className="badge badge-status-open">• รอยืนยัน</span>
                            <span className="badge badge-category">{ticket.category}</span>
                            <span className="badge badge-module">🧩 {ticket.module}</span>
                            <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                              💻 {ticket.program_type || 'Standard'}
                            </span>
                            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                              🐛 {ticket.issue_type || 'Technical'}
                            </span>
                            <span className={`badge badge-priority-${ticket.priority}`}>
                              {ticket.priority === 'low' ? 'ต่ำ' :
                               ticket.priority === 'medium' ? 'ปานกลาง' : 'สูง !!'}
                            </span>
                          </div>
                          <h3 className="ticket-title" onClick={() => onViewTicket(ticket.id)}>{ticket.title}</h3>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {ticket.description}
                          </p>
                          <div className="ticket-meta">
                            <span className="meta-item">
                              👤 ลูกค้า: {ticket.user_name || ticket.customer_name} ({ticket.actual_customer_name || ticket.user_cust_num || ticket.customer_cust_num || '-'})
                              
                            </span>
                            <span className="meta-item">🗓️ ส่งตั๋วเมื่อ: {new Date(ticket.created_at).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="ticket-actions">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleClaimTicket(ticket.id)}
                            disabled={claimLoadingId === ticket.id}
                          >
                            {claimLoadingId === ticket.id ? 'กำลังรับเรื่อง...' : '📥 รับเคสดูแล'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )
              )}

              {/* RENDERING MY TASKS */}
              {activeTab === 'my-tasks' && (
                myAssignedTickets.length === 0 ? (
                  <div className="glass-card empty-state">
                    <span className="empty-icon">🛋️</span>
                    <h3>คุณไม่มีเคสที่ค้างคาอยู่</h3>
                    <p>คุณยังไม่ได้กดเคลมตั๋วในระบบเลย หรือทุกเคสที่รับดูแลได้แก้ไขเสร็จสิ้นไปแล้ว</p>
                    <button className="btn btn-secondary" onClick={() => setActiveTab('queue')} style={{ marginTop: '0.5rem' }}>
                      ไปที่หน้าเคสที่ยังไม่ได้ถูกรับ
                    </button>
                  </div>
                ) : (
                  <>
                    {paginatedActiveList.map(ticket => (
                      <div key={ticket.id} className="glass-card ticket-card interactive glow-purple">
                        <div className="ticket-main">
                          <div className="ticket-header">
                            <span className="ticket-id">{ticket.ticket_number || '#' + String(ticket.id).padStart(3, '0')}</span>
                            <span className="badge badge-status-assigned">• กำลังดูแล</span>
                            <span className="badge badge-category">{ticket.category}</span>
                            <span className="badge badge-module">🧩 {ticket.module}</span>
                            <span className={`badge badge-priority-${ticket.priority}`}>
                              {ticket.priority === 'low' ? 'ต่ำ' :
                               ticket.priority === 'medium' ? 'ปานกลาง' : 'สูง !!'}
                            </span>
                            {ticket.agent_id === user.id && (
                              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                                ⚡ เคสนี้ฉันเป็นคนดูแล
                              </span>
                            )}
                          </div>
                          <h3 className="ticket-title" onClick={() => onViewTicket(ticket.id)}>{ticket.title}</h3>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {ticket.description}
                          </p>
                          <div className="ticket-meta">
                            <span className="meta-item">
                              👤 ลูกค้า: {ticket.user_name || ticket.customer_name} ({ticket.actual_customer_name || ticket.user_cust_num || ticket.customer_cust_num || '-'})
                              
                            </span>
                            <span className="meta-item">🗓️ ส่งเมื่อ: {new Date(ticket.created_at).toLocaleDateString('th-TH')}</span>
                          </div>
                        </div>
                        <div className="ticket-actions">
                          <button className="btn btn-secondary" onClick={() => onViewTicket(ticket.id)}>
                            คุย & อัปเดตเคส
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem' }}>
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )
              )}

              {/* RENDERING ALL TICKETS ARCHIVE */}
              {activeTab === 'all' && (
                displayedAllTickets.length === 0 ? (
                  <div className="glass-card empty-state">
                    <span className="empty-icon">📁</span>
                    <h3>ไม่พบเคสที่ตรงตามเงื่อนไข</h3>
                    <p>ไม่มีเคสในระบบที่ตรงกับการกรองข้อมูลปัจจุบัน</p>
                  </div>
                ) : (
                  <>
                    {paginatedActiveList.map(ticket => (
                      <div key={ticket.id} className="glass-card ticket-card interactive">
                        <div className="ticket-main">
                          <div className="ticket-header">
                            <span className="ticket-id">{ticket.ticket_number || '#' + String(ticket.id).padStart(3, '0')}</span>
                            <span className={`badge ${
                              ticket.status === 'open' ? 'badge-status-open' :
                              ticket.status === 'assigned' ? 'badge-status-assigned' : 'badge-status-resolved'
                            }`}>
                              {ticket.status === 'open' ? '• รอยืนยัน' :
                               ticket.status === 'assigned' ? '• กำลังดูแล' : '• เสร็จสิ้น'}
                            </span>
                            <span className="badge badge-category">{ticket.category}</span>
                            <span className="badge badge-module">🧩 {ticket.module}</span>
                            <span className={`badge badge-priority-${ticket.priority}`}>
                              {ticket.priority === 'low' ? 'ต่ำ' :
                               ticket.priority === 'medium' ? 'ปานกลาง' : 'สูง !!'}
                            </span>
                            {ticket.agent_id === user.id && (
                              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                                ⚡ เคสนี้ฉันเป็นคนดูแล
                              </span>
                            )}
                          </div>
                          <h3 className="ticket-title" onClick={() => onViewTicket(ticket.id)}>{ticket.title}</h3>
                          <div className="ticket-meta">
                            <span className="meta-item">
                              👤 ลูกค้า: {ticket.user_name || ticket.customer_name} ({ticket.actual_customer_name || ticket.user_cust_num || ticket.customer_cust_num || '-'})
                              
                            </span>
                            {ticket.agent_name ? (
                              <span 
                                className="meta-item" 
                                style={{ 
                                  color: ticket.agent_id === user.id ? 'var(--accent-purple)' : '#6366f1', 
                                  fontWeight: ticket.agent_id === user.id ? 700 : 400 
                                }}
                              >
                                👤 ผู้ดูแล: {ticket.agent_name} {ticket.agent_id === user.id && ' (คุณดูแลอยู่ ⚡)'}
                              </span>
                            ) : (
                              <span className="meta-item" style={{ color: '#64748b' }}>
                                👤 ผู้ดูแล: ยังไม่มีเจ้าหน้าที่รับเคส
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ticket-actions">
                          <button className="btn btn-secondary" onClick={() => onViewTicket(ticket.id)}>
                            ดูรายละเอียด
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )
              )}

              {/* Pagination Controls for ticket lists */}
              {(activeTab === 'queue' || activeTab === 'my-tasks' || activeTab === 'all') && activeList.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>แสดงหน้าละ:</span>
                    <select 
                      className="glass-input" 
                      value={itemsPerPage} 
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      style={{ margin: 0, padding: '0.25rem 1rem', fontSize: '0.85rem', width: 'auto', minWidth: '80px', borderRadius: '6px' }}
                    >
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', margin: 0, borderRadius: '6px' }}
                      >
                        ◀ ก่อนหน้า
                      </button>
                      <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                        หน้า {currentPage} จาก {totalPages}
                      </span>
                      <button 
                        className="btn btn-secondary" 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', margin: 0, borderRadius: '6px' }}
                      >
                        ถัดไป ▶
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'workloads' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="section-header" style={{ marginBottom: '0.5rem' }}>
                    <h2 className="section-title">
                      <span>👥</span> รายการสรุปงานและเคสในความดูแลของเจ้าหน้าที่
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>มีเจ้าหน้าที่ทั้งหมด {agents.length} คน</span>
                  </div>

                  {agents.length === 0 ? (
                    <div className="glass-card empty-state">
                      <span className="empty-icon">👥</span>
                      <h3>ไม่พบข้อมูลเจ้าหน้าที่ในระบบ</h3>
                      <p>ระบบขัดข้องหรือไม่พบผู้ใช้ที่มีสิทธิ์เป็นเจ้าหน้าที่ (Agent) ขณะนี้</p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      {agents.map(agent => {
                        const isSelf = agent.id === user.id;
                        const claimedTickets = agent.assigned_tickets || [];
                        const activeClaimed = claimedTickets.filter(t => t.status !== 'resolved');

                        return (
                          <div
                            key={agent.id}
                            className="glass-card"
                            style={{
                              padding: '1.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1.25rem',
                              border: isSelf ? '1.5px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                              boxShadow: isSelf ? '0 8px 30px var(--accent-purple-glow)' : '0 8px 24px var(--glass-shadow)',
                              position: 'relative'
                            }}
                          >
                            {/* Agent Header Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {/* Initial avatar with nice HSL gradient */}
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: isSelf
                                  ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))'
                                  : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                              }}>
                                {agent.name.charAt(0).toUpperCase()}
                              </div>

                              <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                                    {agent.name}
                                  </span>
                                  {isSelf && (
                                    <span style={{
                                      background: 'rgba(139, 92, 246, 0.12)',
                                      border: '1px solid rgba(139, 92, 246, 0.25)',
                                      color: 'var(--accent-purple)',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '12px'
                                    }}>
                                      ✨ นี่คือคุณ
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>
                                  {agent.email}
                                </div>
                              </div>
                            </div>

                            {/* Company and Position Info */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.75rem',
                              background: 'rgba(0, 0, 0, 0.02)',
                              padding: '0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              textAlign: 'left'
                            }}>

                              <div>
                                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>ตำแหน่งงาน</span>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{agent.position || '-'}</span>
                              </div>
                            </div>

                            {/* Workload Indicator Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                              <span style={{ color: '#475569', fontWeight: 500 }}>ระดับภาระงานในมือ:</span>
                              {activeClaimed.length === 0 ? (
                                <span style={{
                                  background: 'rgba(16, 185, 129, 0.1)',
                                  border: '1px solid rgba(16, 185, 129, 0.25)',
                                  color: 'var(--status-resolved)',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem'
                                }}>
                                  🟢 ว่างพร้อมเคสใหม่
                                </span>
                              ) : activeClaimed.length <= 2 ? (
                                <span style={{
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  border: '1px solid rgba(99, 102, 241, 0.25)',
                                  color: 'var(--accent-purple)',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem'
                                }}>
                                  ⚡ ดูแลอยู่ {activeClaimed.length} เคส
                                </span>
                              ) : (
                                <span style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.25)',
                                  color: '#ef4444',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem'
                                }}>
                                  🔥 งานหนาแน่น ({activeClaimed.length} เคส)
                                </span>
                              )}
                            </div>

                            {/* Claimed Cases list */}
                            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontWeight: 700,
                                borderBottom: '1px solid var(--glass-border)',
                                paddingBottom: '0.25rem'
                              }}>
                                เคสที่กำลังดูแลช่วยเหลืออยู่:
                              </span>

                              {activeClaimed.length === 0 ? (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                  (ไม่มีเคสค้างคาที่ต้องจัดการ)
                                </span>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
                                  {activeClaimed.map(t => (
                                    <div
                                      key={t.id}
                                      onClick={() => onViewTicket(t.id)}
                                      style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.35rem 0.6rem',
                                        background: 'rgba(255,255,255,0.5)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '10px',
                                        fontSize: '0.78rem',
                                        color: '#1e293b',
                                        fontWeight: 500,
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 6px rgba(0, 75, 181, 0.01)'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                                        e.currentTarget.style.transform = 'scale(1.015)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                      }}
                                      title={`คลิกเพื่อเปิดคุยประสานงาน: ${t.title}`}
                                    >
                                      <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: 'var(--status-assigned)'
                                      }}></span>
                                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-purple)', flexShrink: 0 }}>
                                        {t.ticket_number || '#' + String(t.id).padStart(3, '0')}
                                      </span>
                                      <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        flexGrow: 1
                                      }}>
                                        {t.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            
            {/* CONFIG SECTION RENDERED AS MAIN VIEW FOR ADMINS */}
            {user.role === 'admin' && activeTab === 'config' && (
              <div style={{ marginTop: '0', paddingTop: '0' }}>
                <h2 style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #a855f7, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem', fontWeight: 700 }}>
                  ⚙️ จัดการระบบ (System Configuration)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '2rem', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '1rem', width: '100%' }}>
                  
                  {/* SIDEBAR MENU (RIGHT SIDE) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.5)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--glass-border)', width: '260px', flexShrink: 0 }}>
                    <h3 style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>หมวดหมู่ข้อมูล</h3>
                    <button
                      onClick={() => setConfigSubTab('members')}
                      className={`btn ${configSubTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      👥 จัดการสมาชิก ({members.length})
                    </button>
                    <button
                      onClick={() => setConfigSubTab('categories')}
                      className={`btn ${configSubTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      🏷️ หมวดหมู่ช่วยเหลือ
                    </button>
                    <button
                      onClick={() => setConfigSubTab('errortypes')}
                      className={`btn ${configSubTab === 'errortypes' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      ⚠️ ประเภท Error
                    </button>
                    <button
                      onClick={() => setConfigSubTab('modules')}
                      className={`btn ${configSubTab === 'modules' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      🧩 ระบบงาน (Modules)
                    </button>
                    <button
                      onClick={() => setConfigSubTab('programtypes')}
                      className={`btn ${configSubTab === 'programtypes' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      💻 ประเภทโปรแกรม
                    </button>
                    <button
                      onClick={() => setConfigSubTab('issuetypes')}
                      className={`btn ${configSubTab === 'issuetypes' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      🐛 ประเภทปัญหา
                    </button>

                    <button
                      onClick={() => setConfigSubTab('roles')}
                      className={`btn ${configSubTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      🔑 สิทธิ์ (Roles)
                    </button>
                    <button
                      onClick={() => setConfigSubTab('customers')}
                      className={`btn ${configSubTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                    >
                      🤝 ลูกค้า (Customers)
                    </button>
                  </div>

                  {/* MAIN CONTENT (LEFT SIDE) */}
                  <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* RENDERING INTERNAL METADATA VIEW */}
                  {configSubTab === 'errortypes' && (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        ⚠️ จัดการประเภทข้อผิดพลาด (Error Types)
                      </h3>

                      <form onSubmit={handleAddErrorType} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="Error ID (เช่น C, H, PC)"
                          value={newErrId}
                          onChange={(e) => setNewErrId(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 1, minWidth: '150px' }}
                        />
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="รายละเอียด (Description)"
                          value={newErrDesc}
                          onChange={(e) => setNewErrDesc(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 2, minWidth: '250px' }}
                        />
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="หมายเหตุ (Remark)"
                          value={newErrRemark}
                          onChange={(e) => setNewErrRemark(e.target.value)}
                          disabled={configLoading}
                          style={{ margin: 0, flex: 2, minWidth: '200px' }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={configLoading || !newErrId.trim() || !newErrDesc.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
                          ➕ เพิ่มข้อมูล
                        </button>
                      </form>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '15%' }}>Error ID</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '35%' }}>Description</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '35%' }}>Remark</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '15%' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {configErrorTypes.length === 0 ? (
                              <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูล</td>
                              </tr>
                            ) : (
                              configErrorTypes.map(err => (
                                <tr key={err.error_id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{err.error_id}</td>
                                  
                                  <td style={{ padding: '1rem 0.75rem' }}>
                                    {editingErrId === err.error_id ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingErrDesc}
                                        onChange={(e) => setEditingErrDesc(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      err.description
                                    )}
                                  </td>
                                  
                                  <td style={{ padding: '1rem 0.75rem' }}>
                                    {editingErrId === err.error_id ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingErrRemark}
                                        onChange={(e) => setEditingErrRemark(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      err.remark || '-'
                                    )}
                                  </td>

                                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                    {editingErrId === err.error_id ? (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button type="button" className="btn btn-primary" onClick={() => handleUpdateErrorType(err.error_id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>💾</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                          setEditingErrId(null);
                                          setEditingErrDesc('');
                                          setEditingErrRemark('');
                                        }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>❌</button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                          onClick={() => {
                                            setEditingErrId(err.error_id);
                                            setEditingErrDesc(err.description);
                                            setEditingErrRemark(err.remark || '');
                                          }}
                                          disabled={configLoading}
                                        >
                                          ✏️ แก้ไข
                                        </button>
                                        <button
                                          className="btn btn-danger"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                          onClick={() => handleDeleteErrorType(err.error_id)}
                                          disabled={configLoading}
                                        >
                                          🗑️ ลบ
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {configSubTab === 'programtypes' && (
                    <ProgramTypeManagement />
                  )}

                  {configSubTab === 'issuetypes' && (
                    <IssueTypeManagement />
                  )}
                  
                  {configSubTab === 'customers' && <CustomerManagement />}
                  {configSubTab === 'members' && (
                    members.length === 0 ? (
                      <div className="glass-card empty-state">
                        <span className="empty-icon">👥</span>
                        <h3>ไม่มีสมาชิกในระบบ</h3>
                        <p>ระบบเกิดข้อผิดพลาดในการโหลดข้อมูลสมาชิก</p>
                      </div>
                    ) : (
                      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto', textAlign: 'left' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#0f172a', minWidth: '700px' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap', width: '80px' }}>ID</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Name</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>CustNum</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Email</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Role</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>Status</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Joined</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map(member => {
                              const isSelf = member.id === user.id;
                              return (
                                <tr 
                                  key={member.id} 
                                  style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.035)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <td style={{ padding: '1rem 0.75rem', fontFamily: 'monospace', fontWeight: 500, color: '#475569', whiteSpace: 'nowrap' }}>
                                    #{String(member.id).padStart(3, '0')}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                    {member.name} {isSelf && <span style={{ color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 600 }}> (คุณ)</span>}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem', color: '#475569', whiteSpace: 'nowrap' }}>
                                    {editingMemberId === member.id ? (
                                      <select
                                        className="glass-input"
                                        value={editingMemberData.custNum || ''}
                                        onChange={(e) => setEditingMemberData({...editingMemberData, custNum: e.target.value})}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', width: '200px', fontSize: '0.85rem' }}
                                      >
                                        <option value="">-- ไม่ระบุ (None) --</option>
                                        {configCustomers.map(c => (
                                          <option key={c.id} value={c.cust_num}>{c.cust_num} - {c.cust_name}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      member.cust_num || '-'
                                    )}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem', color: '#475569', whiteSpace: 'nowrap' }}>
                                    {member.email}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    {editingMemberId === member.id ? (
                                      <select
                                        className="glass-input"
                                        value={editingMemberData.role}
                                        onChange={(e) => setEditingMemberData({...editingMemberData, role: e.target.value})}
                                        style={{ margin: 0, padding: '0.25rem', fontSize: '0.85rem' }}
                                        disabled={isSelf}
                                        title={isSelf ? "ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้" : ""}
                                      >
                                        {configRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                      </select>
                                    ) : (
                                      <span className={`badge-role`} style={{ display: 'inline-block', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {member.role || 'customer'}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    {member.is_verified ? (
                                      <span className="badge badge-status-resolved" style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600 }} title="อนุมัติแล้ว">
                                        ✅
                                      </span>
                                    ) : (
                                      <span className="badge" style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.3)' }} title="รออนุมัติ">
                                        ⏳
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                    {new Date(member.created_at).toLocaleDateString('th-TH')}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                                    {editingMemberId === member.id ? (
                                      <>
                                        <button className="btn btn-primary" onClick={handleUpdateMember} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}>
                                          💾 เซฟ
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setEditingMemberId(null)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}>
                                          ❌ ยกเลิก
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {!member.is_verified && (
                                          <button
                                            className="btn"
                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px', whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff' }}
                                            onClick={() => handleApproveMember(member.id)}
                                          >
                                            ✅ อนุมัติ
                                          </button>
                                        )}
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px', whiteSpace: 'nowrap' }}
                                          onClick={() => {
                                            setEditingMemberId(member.id);
                                            setEditingMemberData({ position: member.position || '', role: member.role || 'customer' });
                                          }}
                                        >
                                          ✏️ แก้ไข
                                        </button>
                                        <button
                                          className="btn btn-danger"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px', whiteSpace: 'nowrap' }}
                                          onClick={() => handleDeleteMember(member.id)}
                                          disabled={isSelf}
                                        >
                                          🗑️ ลบ
                                        </button>
                                      </>
                                    )}
                                  </td>

                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {configSubTab === 'categories' && (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        🏷️ จัดการหมวดหมู่ช่วยเหลือ (Categories)
                      </h3>

                      <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="ชื่อหมวดหมู่ช่วยเหลือ เช่น Hardware"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={configLoading || !newCatName.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
                          ➕ เพิ่มหมวดหมู่
                        </button>
                      </form>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Category Name</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '120px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {configCategories.length === 0 ? (
                              <tr>
                                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูลหมวดหมู่</td>
                              </tr>
                            ) : (
                              configCategories.map(cat => (
                                <tr key={cat.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                                    {editingCategoryName === cat.name ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingCategoryNewName}
                                        onChange={(e) => setEditingCategoryNewName(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      cat.name
                                    )}
                                  </td>
                                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                    {editingCategoryName === cat.name ? (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button className="btn btn-primary" onClick={() => handleUpdateCategory(cat.name)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                          💾 บันทึก
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => { setEditingCategoryName(null); setEditingCategoryNewName(''); }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                          ❌ ยกเลิก
                                        </button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                          onClick={() => {
                                            setEditingCategoryName(cat.name);
                                            setEditingCategoryNewName(cat.name);
                                          }}
                                          disabled={configLoading}
                                        >
                                          ✏️ แก้ไข
                                        </button>
                                        <button
                                          className="btn btn-danger"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                          onClick={() => handleDeleteCategory(cat.name)}
                                          disabled={configLoading || configCategories.length <= 1}
                                        >
                                          🗑️ ลบ
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {configSubTab === 'modules' && (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        🧩 จัดการระบบงานโมดูล (Modules)
                      </h3>

                      <form onSubmit={handleAddModule} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="ชื่อระบบงานโมดูล เช่น Purchasing"
                          value={newModName}
                          onChange={(e) => setNewModName(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={configLoading || !newModName.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
                          ➕ เพิ่มระบบงาน
                        </button>
                      </form>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Module Name</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '120px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {configModules.length === 0 ? (
                              <tr>
                                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูลระบบงาน</td>
                              </tr>
                            ) : (
                              configModules.map(mod => (
                                <tr key={mod.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                                    {editingModuleName === mod.name ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingModuleNewName}
                                        onChange={(e) => setEditingModuleNewName(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      mod.name
                                    )}
                                  </td>
                                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                    {editingModuleName === mod.name ? (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button className="btn btn-primary" onClick={() => handleUpdateModule(mod.name)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                          💾 บันทึก
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => { setEditingModuleName(null); setEditingModuleNewName(''); }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                          ❌ ยกเลิก
                                        </button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                          onClick={() => {
                                            setEditingModuleName(mod.name);
                                            setEditingModuleNewName(mod.name);
                                          }}
                                          disabled={configLoading}
                                        >
                                          ✏️ แก้ไข
                                        </button>
                                        <button
                                          className="btn btn-danger"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                          onClick={() => handleDeleteModule(mod.name)}
                                          disabled={configLoading || configModules.length <= 1}
                                        >
                                          🗑️ ลบ
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {configSubTab === 'roles' && (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        🔑 จัดการสิทธิ์ (Roles)
                      </h3>

                      <form onSubmit={handleAddRole} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="ชื่อ Role"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          disabled={configLoading}
                          required
                          style={{ margin: 0, flex: 1, minWidth: '200px' }}
                        />
                        <select
                          className="glass-input"
                          value={newRoleBase}
                          onChange={(e) => setNewRoleBase(e.target.value)}
                          disabled={configLoading}
                          style={{ margin: 0, width: '200px' }}
                        >
                          <option value="customer">สิทธิ์: Customer</option>
                          <option value="agent">สิทธิ์: Agent</option>
                          <option value="admin">สิทธิ์: Admin</option>
                        </select>
                        <button type="submit" className="btn btn-primary" disabled={configLoading || !newRoleName.trim()} style={{ padding: '0.75rem 2rem', whiteSpace: 'nowrap' }}>
                          ➕ เพิ่ม Role
                        </button>
                      </form>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#0f172a' }}>
                          <thead>
                            <tr style={{ borderBottom: '2.5px solid var(--glass-border)', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(0, 0, 0, 0.015)' }}>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Role Name</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'left', width: '200px' }}>Base Permission</th>
                              <th style={{ padding: '1rem 0.75rem', textAlign: 'center', width: '200px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {configRoles.length === 0 ? (
                              <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>ยังไม่มีข้อมูลสิทธิ์</td>
                              </tr>
                            ) : (
                              configRoles.map(role => (
                                <tr key={role.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 75, 181, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>
                                    {editingRoleId === role.id ? (
                                      <input
                                        type="text"
                                        className="glass-input"
                                        value={editingRoleName}
                                        onChange={(e) => setEditingRoleName(e.target.value)}
                                        autoFocus
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      />
                                    ) : (
                                      role.name
                                    )}
                                  </td>
                                  <td style={{ padding: '1rem 0.75rem' }}>
                                    {editingRoleId === role.id ? (
                                      <select
                                        className="glass-input"
                                        value={editingRoleBase}
                                        onChange={(e) => setEditingRoleBase(e.target.value)}
                                        style={{ margin: 0, padding: '0.25rem 0.5rem', fontSize: '0.95rem', width: '100%' }}
                                      >
                                        <option value="customer">Customer</option>
                                        <option value="agent">Agent</option>
                                        <option value="admin">Admin</option>
                                      </select>
                                    ) : (
                                      <span className={`badge-role`} style={{ display: 'inline-block', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {role.base_role}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                    {editingRoleId === role.id ? (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button className="btn btn-primary" onClick={() => handleUpdateRole(role.id, editingRoleName, editingRoleBase)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                                          💾
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => {
                                          setEditingRoleId(null);
                                          setEditingRoleName('');
                                          setEditingRoleBase('');
                                        }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                                          ❌
                                        </button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                          onClick={() => {
                                            setEditingRoleId(role.id);
                                            setEditingRoleName(role.name);
                                            setEditingRoleBase(role.base_role);
                                          }}
                                          disabled={configLoading}
                                        >
                                          ✏️ แก้ไข
                                        </button>
                                        <button
                                          className="btn btn-danger"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                          onClick={() => handleDeleteRole(role.id, role.name)}
                                          disabled={configLoading || ['Customer', 'Agent', 'Admin'].includes(role.name)}
                                          title={['Customer', 'Agent', 'Admin'].includes(role.name) ? "ไม่สามารถลบ Role พื้นฐานของระบบได้" : ""}
                                        >
                                          🗑️ ลบ
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
